'use client';

import PropTypes from 'prop-types';
// i18n – side-effect import initialises react-i18next before any useTranslation() call
import './i18n';
// @mui
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider as MuiLocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

// ----------------------------------------------------------------------

export default function LocalizationProvider({ children }) {
  return <MuiLocalizationProvider dateAdapter={AdapterDateFns}>{children}</MuiLocalizationProvider>;
}

LocalizationProvider.propTypes = {
  children: PropTypes.node,
};
