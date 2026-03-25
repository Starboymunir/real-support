import PropTypes from 'prop-types';
import { alpha } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import { useResponsive } from '@/app/(RSAdmin)/admin/hooks//use-responsive';
import Iconify from '@/components/iconify/iconify';
import { HEADER, NAV } from '../config-layout';
import {
  Searchbar,
  AccountPopover,
} from '../_common';

export default function Header({ onOpenNav }) {
  const lgUp = useResponsive('up', 'lg');

  return (
    <AppBar
      sx={{
        height: HEADER.H_MOBILE,
        zIndex: 1100,
        backgroundColor: '#070D18',
        borderBottom: `1px solid ${alpha('#FFFFFF', 0.04)}`,
        boxShadow: 'none',
        ...(lgUp && {
          width: `calc(100% - ${NAV.W_VERTICAL + 1}px)`,
          height: HEADER.H_DESKTOP,
        }),
      }}
    >
      <Toolbar
        sx={{
          height: 1,
          px: { xs: 2, lg: 3 },
          gap: 1,
        }}
      >
        {!lgUp && (
          <IconButton onClick={onOpenNav} sx={{ color: alpha('#F0F4F8', 0.7) }}>
            <Iconify icon="solar:hamburger-menu-line-duotone" width={22} />
          </IconButton>
        )}

        <Searchbar />

        <Box sx={{ flexGrow: 1 }} />

        <Stack direction="row" alignItems="center" spacing={1}>
          <AccountPopover />
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

Header.propTypes = {
  onOpenNav: PropTypes.func,
};
