"use client";

import { useState, Suspense } from "react";
import { Box, Tab, Tabs, Typography, Stack } from "@mui/material";
import { alpha } from "@mui/material/styles";
import AdminChatView from "./_components/AdminChatView";
import AdminDirectMessages from "./_components/AdminDirectMessages";
import AdminBroadcasts from "./_components/AdminBroadcasts";
import Loader from "@/components/loader";

export default function ChatPage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Box sx={{ height: "calc(100vh - 80px)", display: "flex", flexDirection: "column" }}>
      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        sx={{
          mb: 2,
          minHeight: 42,
          "& .MuiTab-root": {
            minHeight: 42,
            fontSize: 13,
            fontWeight: 600,
            textTransform: "none",
            color: alpha("#F0F4F8", 0.5),
            px: 2,
          },
          "& .Mui-selected": { color: "#00E676 !important" },
          "& .MuiTabs-indicator": { bgcolor: "#00E676", height: 2 },
        }}
      >
        <Tab label="Support Tickets" />
        <Tab label="Direct Messages" />
        <Tab label="Broadcasts" />
      </Tabs>

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <Suspense fallback={<Loader />}>
          {activeTab === 0 && <AdminChatView />}
          {activeTab === 1 && <AdminDirectMessages />}
          {activeTab === 2 && <AdminBroadcasts />}
        </Suspense>
      </Box>
    </Box>
  );
}
