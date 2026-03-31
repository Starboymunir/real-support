"use client";

import ThemeProvider from "@/app/(RSAdmin)/admin/theme";
import { ReactNode } from "react";

// Global styles — only lightweight essentials
import "simplebar-react/dist/simplebar.min.css";

// Components
import { SettingsProvider } from "@/app/(RSAdmin)/admin/common/settings";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider as MuiLocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import SnackbarProvider from "@/app/(RSAdmin)/admin/common/snackbar/snackbar-provider";

// Layout Component
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <MuiLocalizationProvider dateAdapter={AdapterDateFns}>
      <SettingsProvider
        defaultSettings={{
          themeMode: "dark",
          themeDirection: "ltr",
          themeContrast: "default",
          themeLayout: "vertical",
          themeColorPresets: "default",
          themeStretch: false,
        }}
      >
        <ThemeProvider>
          <SnackbarProvider>
            {children}
          </SnackbarProvider>
        </ThemeProvider>
      </SettingsProvider>
    </MuiLocalizationProvider>
  );
}
