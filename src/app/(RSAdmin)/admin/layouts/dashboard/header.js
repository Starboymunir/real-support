import PropTypes from 'prop-types';
// @mui
import { useTheme, alpha } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
// theme
import { bgBlur } from '@/app/(RSAdmin)/admin/theme/css';
// hooks
import { useOffSetTop } from '@/app/(RSAdmin)/admin/hooks//use-off-set-top';
import { useResponsive } from '@/app/(RSAdmin)/admin/hooks//use-responsive';
// components
import Logo from '@/app/(RSAdmin)/admin/common/logo';
import SvgColor from '@/app/(RSAdmin)/admin/common/svg-color';
import Iconify from '@/components/iconify/iconify';
import { useSettingsContext } from '@/app/(RSAdmin)/admin/common/settings';
//
import { HEADER, NAV } from '../config-layout';
import {
  Searchbar,
  AccountPopover,
} from '../_common';

// ----------------------------------------------------------------------

export default function Header({ onOpenNav }) {
  const theme = useTheme();

  const settings = useSettingsContext();

  const isNavHorizontal = settings.themeLayout === 'horizontal';

  const isNavMini = settings.themeLayout === 'mini';

  const lgUp = useResponsive('up', 'lg');

  const offset = useOffSetTop(HEADER.H_DESKTOP);

  const offsetTop = offset && !isNavHorizontal;

  const renderContent = (
    <>
      {!lgUp && (
        <IconButton onClick={onOpenNav} sx={{ color: '#F0F4F8' }}>
          <Iconify icon="solar:hamburger-menu-line-duotone" width={24} />
        </IconButton>
      )}

      {lgUp && (
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              bgcolor: alpha('#00E676', 0.08),
              border: `1px solid ${alpha('#00E676', 0.15)}`,
            }}
          >
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#00E676' }} />
            <Typography variant="caption" sx={{ color: '#00E676', fontWeight: 600, letterSpacing: 0.5 }}>
              ADMIN PANEL
            </Typography>
          </Box>
        </Stack>
      )}

      <Box sx={{ flexGrow: 1 }} />

      <Searchbar />

      <Stack
        direction="row"
        alignItems="center"
        spacing={{ xs: 0.5, sm: 1.5 }}
      >
        <AccountPopover />
      </Stack>
    </>
  );

  return (
    <AppBar
      sx={{
        height: HEADER.H_MOBILE,
        zIndex: theme.zIndex.appBar + 1,
        backdropFilter: 'blur(24px) saturate(160%)',
        backgroundColor: alpha('#060B14', 0.85),
        borderBottom: `1px solid ${alpha('#FFFFFF', 0.06)}`,
        boxShadow: `0 4px 30px ${alpha('#000000', 0.15)}`,
        transition: theme.transitions.create(['height', 'background-color'], {
          duration: theme.transitions.duration.shorter,
        }),
        ...(lgUp && {
          width: `calc(100% - ${NAV.W_VERTICAL + 1}px)`,
          height: HEADER.H_DESKTOP,
          ...(offsetTop && {
            height: HEADER.H_DESKTOP_OFFSET,
            backgroundColor: alpha('#060B14', 0.95),
          }),
          ...(isNavHorizontal && {
            width: 1,
            height: HEADER.H_DESKTOP_OFFSET,
          }),
          ...(isNavMini && {
            width: `calc(100% - ${NAV.W_MINI + 1}px)`,
          }),
        }),
      }}
    >
      <Toolbar
        sx={{
          height: 1,
          px: { xs: 2, lg: 5 },
        }}
      >
        {renderContent}
      </Toolbar>
    </AppBar>
  );
}

Header.propTypes = {
  onOpenNav: PropTypes.func,
};
