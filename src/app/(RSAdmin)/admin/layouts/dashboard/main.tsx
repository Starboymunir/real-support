import Box from '@mui/material/Box';
import { useResponsive } from '@/app/(RSAdmin)/admin/hooks//use-responsive';
import { HEADER, NAV } from '../config-layout';

// ----------------------------------------------------------------------

const SPACING = 8;

export default function Main({ children, sx, ...other }: { children: any; sx?: object }) {
  // const settings = useSettingsContext();

  const lgUp = useResponsive('up', 'lg');


  // if (isNavHorizontal) {
  //   return (
  //     <Box
  //       component="main"
  //       sx={{
  //         minHeight: 1,
  //         display: 'flex',
  //         flexDirection: 'column',
  //         pt: `${HEADER.H_MOBILE + 24}px`,
  //         pb: 10,
  //         ...(lgUp && {
  //           pt: `${HEADER.H_MOBILE * 2 + 40}px`,
  //           pb: 15,
  //         }),
  //       }}
  //     >
  //       {children}
  //     </Box>
  //   );
  // }

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        minHeight: 1,
        display: 'flex',
        flexDirection: 'column',
        py: `${HEADER.H_MOBILE + SPACING}px`,
        ...(lgUp && {
          px: 2,
          py: `${HEADER.H_DESKTOP + SPACING}px`,
          width: `calc(100% - ${NAV.W_VERTICAL}px)`,
          // ...(isNavMini && {
          //   width: `calc(100% - ${NAV.W_MINI}px)`,
          // }),
        }),
        ...sx,
      }}
      {...other}
    >
      {children}
    </Box>
  );
}