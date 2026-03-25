import Box from '@mui/material/Box';
import { useResponsive } from '@/app/(RSAdmin)/admin/hooks//use-responsive';
import { HEADER, NAV } from '../config-layout';

const SPACING = 8;

export default function Main({ children, sx, ...other }: { children: any; sx?: object }) {
  const lgUp = useResponsive('up', 'lg');

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        minHeight: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0A0F1A',
        py: `${HEADER.H_MOBILE + SPACING}px`,
        px: 1.5,
        ...(lgUp && {
          px: 3,
          py: `${HEADER.H_DESKTOP + SPACING}px`,
          width: `calc(100% - ${NAV.W_VERTICAL}px)`,
        }),
        ...sx,
      }}
      {...other}
    >
      {children}
    </Box>
  );
}