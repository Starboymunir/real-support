"use client";

import { useMemo, useState, Suspense } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import AdminChatView from "./_components/AdminChatView";
import AdminDirectMessages from "./_components/AdminDirectMessages";
import AdminBroadcasts from "./_components/AdminBroadcasts";
import Loader from "@/components/loader";
import Iconify from "@/components/iconify/iconify";

const CHAT_SECTIONS = [
  {
    key: "support",
    title: "Support",
    subtitle: "Messages created from the rider and driver support pages.",
    icon: "solar:chat-round-dots-bold-duotone",
  },
  {
    key: "dm",
    title: "Direct Messages",
    subtitle: "Open a one-to-one chat with any driver or rider.",
    icon: "solar:chat-line-bold-duotone",
  },
  {
    key: "channels",
    title: "Channels",
    subtitle: "Broadcast updates to drivers, riders, or everyone.",
    icon: "solar:soundwave-bold-duotone",
  },
] as const;

export default function ChatPage() {
  const [activeSection, setActiveSection] = useState<(typeof CHAT_SECTIONS)[number]["key"]>("support");

  const activeView = useMemo(() => {
    if (activeSection === "dm") return <AdminDirectMessages />;
    if (activeSection === "channels") return <AdminBroadcasts />;
    return <AdminChatView />;
  }, [activeSection]);

  return (
    <Box sx={{ height: "calc(100vh - 80px)", display: "flex", flexDirection: "column", gap: 2 }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
        {CHAT_SECTIONS.map((section) => {
          const isActive = activeSection === section.key;
          return (
            <Box
              key={section.key}
              onClick={() => setActiveSection(section.key)}
              sx={{
                flex: 1,
                p: 2,
                borderRadius: 2,
                cursor: "pointer",
                border: `1px solid ${isActive ? alpha("#00E676", 0.35) : alpha("#FFFFFF", 0.06)}`,
                bgcolor: isActive ? alpha("#00E676", 0.08) : alpha("#FFFFFF", 0.02),
                transition: "all 0.15s ease",
                "&:hover": { bgcolor: isActive ? alpha("#00E676", 0.1) : alpha("#FFFFFF", 0.04) },
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: isActive ? alpha("#00E676", 0.14) : alpha("#FFFFFF", 0.04),
                    color: isActive ? "#00E676" : alpha("#F0F4F8", 0.5),
                    flexShrink: 0,
                  }}
                >
                  <Iconify icon={section.icon} width={22} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle2" sx={{ color: isActive ? "#F0F4F8" : alpha("#F0F4F8", 0.75), fontSize: 14, fontWeight: 700 }}>
                    {section.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: alpha("#F0F4F8", 0.45), fontSize: 11, lineHeight: 1.5 }}>
                    {section.subtitle}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          );
        })}
      </Stack>

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <Suspense fallback={<Loader />}>
          {activeView}
        </Suspense>
      </Box>
    </Box>
  );
}
