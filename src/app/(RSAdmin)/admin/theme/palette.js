import { alpha } from '@mui/material/styles';

// ----------------------------------------------------------------------

// SETUP COLORS

const GREY = {
  0: '#FFFFFF',
  100: '#F0F4F8',
  200: '#E2E8F0',
  300: '#CBD5E1',
  400: '#94A3B8',
  500: '#64748B',
  600: '#475569',
  700: '#334155',
  800: '#1E293B',
  900: '#0F172A',
};

const PRIMARY = {
  lighter: '#1A3A5C',
  light: '#1A3A5C',
  main: '#0D2137',
  dark: '#060F1A',
  darker: '#030810',
  contrastText: '#FFFFFF',
};

const SECONDARY = {
  lighter: '#B9F6CA',
  light: '#69F0AE',
  main: '#00E676',
  dark: '#00C853',
  darker: '#00A844',
  contrastText: '#0D2137',
};

const INFO = {
  lighter: '#E0F7FA',
  light: '#40C4FF',
  main: '#00B0FF',
  dark: '#0091EA',
  darker: '#01579B',
  contrastText: '#FFFFFF',
};

const SUCCESS = {
  lighter: '#B9F6CA',
  light: '#69F0AE',
  main: '#00E676',
  dark: '#00C853',
  darker: '#00A844',
  contrastText: '#0D2137',
};

const WARNING = {
  lighter: '#FFF9C4',
  light: '#FFF176',
  main: '#FFD600',
  dark: '#F9A825',
  darker: '#F57F17',
  contrastText: GREY[800],
};

const ERROR = {
  lighter: '#FFCDD2',
  light: '#FF5252',
  main: '#FF1744',
  dark: '#D50000',
  darker: '#B71C1C',
  contrastText: '#FFFFFF',
};

const COMMON = {
  common: {
    black: '#000000',
    white: '#FFFFFF',
  },
  primary: PRIMARY,
  secondary: SECONDARY,
  info: INFO,
  success: SUCCESS,
  warning: WARNING,
  error: ERROR,
  grey: GREY,
  divider: alpha(GREY[500], 0.2),
  action: {
    hover: alpha(GREY[500], 0.08),
    selected: alpha(GREY[500], 0.16),
    disabled: alpha(GREY[500], 0.8),
    disabledBackground: alpha(GREY[500], 0.24),
    focus: alpha(GREY[500], 0.24),
    hoverOpacity: 0.08,
    disabledOpacity: 0.48,
  },
};

export function palette(mode) {
  const light = {
    ...COMMON,
    mode: 'light',
    text: {
      primary: GREY[800],
      secondary: GREY[600],
      disabled: GREY[500],
    },
    background: {
      paper: '#FFFFFF',
      default: '#FFFFFF',
      neutral: GREY[200],
    },
    action: {
      ...COMMON.action,
      active: GREY[600],
    },
  };

  const dark = {
    ...COMMON,
    mode: 'dark',
    text: {
      primary: '#F0F4F8',
      secondary: '#94A3B8',
      disabled: '#475569',
    },
    background: {
      paper: '#0F1F35',
      default: '#060B14',
      neutral: alpha(GREY[500], 0.12),
    },
    action: {
      ...COMMON.action,
      active: GREY[400],
    },
  };

  return mode === 'light' ? light : dark;
}
