"use client";

import PropTypes from "prop-types";
import { useEffect } from "react";
// @mui
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Drawer from "@mui/material/Drawer";
import { alpha } from "@mui/material/styles";
// hooks
import { useResponsive } from "@/app/(RSAdmin)/admin/hooks//use-responsive";
// hooks
import { useMockedUser } from "@/app/(RSAdmin)/admin/hooks//use-mocked-user";
// components
import Logo from "@/app/(RSAdmin)/admin/common/logo";
import Scrollbar from "@/app/(RSAdmin)/admin/common/scrollbar";
import { usePathname } from "@/app/(RSAdmin)/admin/routes/hook";
import { NavSectionVertical } from "@/app/(RSAdmin)/admin/common/nav-section";
//
import { NAV } from "../config-layout";
import { useNavData } from "./config-navigation";
import { NavToggleButton } from "../_common";
import { useTheme } from "@mui/material/styles";
import { useAuth } from "@/lib/auth-context";

// ----------------------------------------------------------------------

export default function NavVertical({ openNav, onCloseNav }) {
  const { user } = useAuth();

  const pathname = usePathname();

  const lgUp = useResponsive("up", "lg");
  const theme = useTheme();

  const navData = useNavData();

  useEffect(() => {
    if (openNav) {
      onCloseNav();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const renderContent = (
    <Scrollbar
      sx={{
        height: 1,
        "& .simplebar-content": {
          height: 1,
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          py: 3,
          px: 2,
          borderBottom: `1px solid ${alpha('#FFFFFF', 0.06)}`,
        }}
      >
        <Logo sx={{ mt: 0, ml: 0, mb: 0 }} />
      </Box>

      <NavSectionVertical
        data={navData}
        config={{
          currentRole: user?.Admin?.role || "admin",
        }}
      />

      <Box sx={{ flexGrow: 1 }} />
    </Scrollbar>
  );

  const sidebarStyles = {
    height: 1,
    position: "fixed",
    width: NAV.W_VERTICAL,
    background: `linear-gradient(180deg, #0A1628 0%, #060B14 100%)`,
    borderRight: `1px solid ${alpha('#FFFFFF', 0.06)}`,
  };

  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV.W_VERTICAL },
      }}
    >
      {lgUp ? (
        <Stack sx={sidebarStyles}>
          {renderContent}
        </Stack>
      ) : (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          PaperProps={{
            sx: {
              width: NAV.W_VERTICAL,
              background: `linear-gradient(180deg, #0A1628 0%, #060B14 100%)`,
              borderRight: `1px solid ${alpha('#FFFFFF', 0.06)}`,
            },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </Box>
  );
}

NavVertical.propTypes = {
  onCloseNav: PropTypes.func,
  openNav: PropTypes.bool,
};
