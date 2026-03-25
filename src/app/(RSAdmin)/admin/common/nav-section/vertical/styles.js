import { alpha, styled } from '@mui/material/styles';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListSubheader from '@mui/material/ListSubheader';
import ListItemButton from '@mui/material/ListItemButton';

export const StyledItem = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== 'active',
})(({ active, depth, config, theme }) => {
  const subItem = depth !== 1;
  const deepSubItem = depth > 2;

  return {
    padding: config.itemPadding,
    marginBottom: config.itemGap,
    borderRadius: config.itemRadius,
    minHeight: config.itemRootHeight,
    color: alpha('#F0F4F8', 0.55),
    transition: 'all 0.15s ease',
    '&:hover': {
      color: '#F0F4F8',
      backgroundColor: alpha('#FFFFFF', 0.04),
    },
    ...(active && {
      color: '#00E676',
      backgroundColor: alpha('#00E676', 0.08),
      '&:hover': {
        backgroundColor: alpha('#00E676', 0.12),
      },
    }),
    ...(subItem && {
      minHeight: config.itemSubHeight,
      ...(active && {
        color: '#F0F4F8',
        backgroundColor: 'transparent',
        '&:hover': {
          backgroundColor: alpha('#FFFFFF', 0.04),
        },
      }),
    }),
    ...(deepSubItem && {
      paddingLeft: theme.spacing(depth),
    }),
  };
});

export const StyledIcon = styled(ListItemIcon)(({ size }) => ({
  width: size,
  height: size,
  alignItems: 'center',
  justifyContent: 'center',
}));

export const StyledDotIcon = styled('span')(({ active }) => ({
  width: 4,
  height: 4,
  borderRadius: '50%',
  backgroundColor: alpha('#F0F4F8', 0.25),
  transition: 'all 0.15s ease',
  ...(active && {
    transform: 'scale(2)',
    backgroundColor: '#00E676',
  }),
}));

export const StyledSubheader = styled(ListSubheader)(({ config, theme }) => ({
  ...theme.typography.overline,
  fontSize: 10,
  letterSpacing: 1.2,
  cursor: 'pointer',
  display: 'inline-flex',
  padding: config.itemPadding,
  paddingTop: theme.spacing(2.5),
  marginBottom: 2,
  paddingBottom: theme.spacing(0.75),
  color: alpha('#F0F4F8', 0.3),
  backgroundColor: 'transparent',
  transition: 'color 0.15s ease',
  '&:hover': {
    color: alpha('#F0F4F8', 0.5),
  },
}));
