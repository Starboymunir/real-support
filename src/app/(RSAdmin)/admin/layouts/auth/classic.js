import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// hooks
import { useResponsive } from '@/app/(RSAdmin)/admin/hooks//use-responsive';

// ----------------------------------------------------------------------

export default function AuthClassicLayout({ children, title }) {
  const upMd = useResponsive('up', 'md');

  const renderContent = (
    <Stack
      sx={{
        width: 1,
        mx: 'auto',
        maxWidth: 480,
        px: { xs: 3, md: 6 },
        py: { xs: 8, md: 0 },
        justifyContent: 'center',
        minHeight: '100vh',
      }}
    >
      {children}
    </Stack>
  );

  const renderSection = (
    <Box
      sx={{
        flexGrow: 1,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Background image */}
      <Box
        component="img"
        alt=""
        src="/images/auth/london-night.jpg"
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      {/* Dark gradient overlay */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(7,13,24,0.92) 0%, rgba(10,15,26,0.80) 50%, rgba(0,230,118,0.15) 100%)',
        }}
      />

      {/* Content over the image */}
      <Stack
        alignItems="center"
        justifyContent="center"
        spacing={4}
        sx={{ position: 'relative', zIndex: 1, px: 6 }}
      >
        {/* Logo */}
        <Box
          component="img"
          alt="One App"
          src="/assets/logo.png"
          sx={{ width: 120, height: 120, objectFit: 'contain' }}
        />

        <Typography
          variant="h3"
          sx={{
            color: '#fff',
            textAlign: 'center',
            fontWeight: 700,
            maxWidth: 400,
          }}
        >
          {title || 'One App Admin'}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: 'rgba(255,255,255,0.6)',
            textAlign: 'center',
            maxWidth: 360,
            lineHeight: 1.7,
          }}
        >
          Manage your fleet, drivers, and riders from one powerful dashboard.
        </Typography>

        {/* Decorative accent line */}
        <Box
          sx={{
            width: 60,
            height: 4,
            borderRadius: 2,
            background: 'linear-gradient(90deg, #00E676, #00C853)',
          }}
        />
      </Stack>
    </Box>
  );

  return (
    <Stack
      component="main"
      direction="row"
      sx={{
        minHeight: '100vh',
        bgcolor: '#070D18',
      }}
    >
      {upMd && renderSection}

      {renderContent}
    </Stack>
  );
}

AuthClassicLayout.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string,
};
