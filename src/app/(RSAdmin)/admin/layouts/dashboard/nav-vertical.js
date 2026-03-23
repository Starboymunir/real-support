"use client";

import PropTypes from "prop-types";
import { useEffect } from "react";
// @mui
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Drawer from "@mui/material/Drawer";
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
import { useTheme } from "next-themes";
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
      <div className="flex justify-center">
        <Logo sx={{ mt: 3, ml: 4, mb: 1 }} />
      </div>

      <NavSectionVertical
        data={navData}
        config={{
          currentRole: user?.Admin?.role || "admin",
        }}
      />

      <Box sx={{ flexGrow: 1 }} />
    </Scrollbar>
  );

  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV.W_VERTICAL },
      }}
    >
      {/* <NavToggleButton /> */}

      {lgUp ? (
        <Stack
          sx={{
            height: 1,
            position: "fixed",
            width: NAV.W_VERTICAL,
            borderRight: (theme) => `dashed 1px ${theme.palette.divider}`,
          }}
        >
          {renderContent}
        </Stack>
      ) : (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          PaperProps={{
            sx: {
              width: NAV.W_VERTICAL,
              backgroundColor: theme?.palette?.background?.default,
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
