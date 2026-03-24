"use client";

import ThemeProvider from "@/app/(RSAdmin)/admin/theme";
import { ReactNode } from "react";

// Global styles
import "simplebar-react/dist/simplebar.min.css";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import "mapbox-gl/dist/mapbox-gl.css";
import "react-quill/dist/quill.snow.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "react-lazy-load-image-component/src/effects/blur.css";

// Components
import MotionLazy from "@/app/(RSAdmin)/admin/common/animate/motion-lazy";
import { SettingsProvider } from "@/app/(RSAdmin)/admin/common/settings";
import { LocalizationProvider } from "./admin/locales";
import SnackbarProvider from "@/app/(RSAdmin)/admin/common/snackbar/snackbar-provider";

// Layout Component
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <LocalizationProvider>
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
            <MotionLazy>
              {children}
            </MotionLazy>
          </SnackbarProvider>
        </ThemeProvider>
      </SettingsProvider>
    </LocalizationProvider>
  );
}
