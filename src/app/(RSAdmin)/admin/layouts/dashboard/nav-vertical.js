"use client";

import PropTypes from "prop-types";
import { useEffect } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Drawer from "@mui/material/Drawer";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import { useResponsive } from "@/app/(RSAdmin)/admin/hooks//use-responsive";
import Logo from "@/app/(RSAdmin)/admin/common/logo";
import Scrollbar from "@/app/(RSAdmin)/admin/common/scrollbar";
import { usePathname } from "@/app/(RSAdmin)/admin/routes/hook";
import { NavSectionVertical } from "@/app/(RSAdmin)/admin/common/nav-section";
import { NAV } from "../config-layout";
import { useNavData } from "./config-navigation";
import { useAuth } from "@/lib/auth-context";

export default function NavVertical({ openNav, onCloseNav }) {
  const { admin } = useAuth();
  const pathname = usePathname();
  const lgUp = useResponsive("up", "lg");
  const navData = useNavData();

  useEffect(() => {
    if (openNav) {
      onCloseNav();
    }
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
      {/* Logo + Brand */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          py: 2.5,
          px: 2.5,
          borderBottom: `1px solid ${alpha('#FFFFFF', 0.04)}`,
        }}
      >
        <Logo sx={{ mt: 0, ml: 0, mb: 0 }} />
        <Box>
          <Typography
            variant="subtitle2"
            sx={{ color: '#F0F4F8', fontWeight: 700, lineHeight: 1.2 }}
          >
            One App
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: alpha('#F0F4F8', 0.35), fontSize: 10, letterSpacing: 0.5 }}
          >
            ADMIN
          </Typography>
        </Box>
      </Box>

      <NavSectionVertical
        data={navData}
        config={{
          currentRole: admin?.role || "admin",
        }}
      />

      <Box sx={{ flexGrow: 1 }} />

      {/* Bottom user info */}
      <Box
        sx={{
          px: 2.5,
          py: 2,
          borderTop: `1px solid ${alpha('#FFFFFF', 0.04)}`,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              bgcolor: alpha('#00E676', 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 700,
              color: '#00E676',
            }}
          >
            {(admin?.firstName?.[0] || 'A').toUpperCase()}
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="caption"
              sx={{ color: '#F0F4F8', fontWeight: 600, display: 'block', lineHeight: 1.3 }}
              noWrap
            >
              {admin?.firstName || 'Admin'} {admin?.lastName || ''}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: alpha('#F0F4F8', 0.35), fontSize: 10 }}
              noWrap
            >
              {admin?.role?.replace('_', ' ') || 'Admin'}
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Scrollbar>
  );

  const sidebarBg = '#070D18';

  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV.W_VERTICAL },
      }}
    >
      {lgUp ? (
        <Stack
          sx={{
            height: 1,
            position: "fixed",
            width: NAV.W_VERTICAL,
            backgroundColor: sidebarBg,
            borderRight: `1px solid ${alpha('#FFFFFF', 0.04)}`,
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
              backgroundColor: sidebarBg,
              borderRight: `1px solid ${alpha('#FFFFFF', 0.04)}`,
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
