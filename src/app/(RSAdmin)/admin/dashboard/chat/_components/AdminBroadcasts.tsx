"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  Stack,
  CircularProgress,
  IconButton,
  Chip,
  Select,
  MenuItem,
  Card,
  Avatar,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useAuth } from "@/lib/auth-context";
import { useSocket, SOCKET_EVENTS } from "@/lib/socket-context";
import adminAxios from "@/lib/admin-axios";
import Iconify from "@/components/iconify/iconify";
import moment from "moment";

const TARGET_CONFIG: Record<string, { label: string; color: string; icon: string; description: string }> = {
  ALL: { label: "All Users", color: "#00E676", icon: "solar:users-group-rounded-bold", description: "Send to all riders and drivers" },
  DRIVERS: { label: "Drivers Only", color: "#2196F3", icon: "solar:wheel-bold", description: "Send to all registered drivers" },
  RIDERS: { label: "Riders Only", color: "#9C27B0", icon: "solar:user-bold", description: "Send to all registered riders" },
};

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

interface BroadcastItem {
  id: string;
  content: string;
  target: string;
  sender?: { id: string; firstName: string; lastName: string } | null;
  createdAt: string;
}

export default function AdminBroadcasts() {
  const { admin, user } = useAuth();
  const { connected } = useSocket();

  const [broadcasts, setBroadcasts] = useState<BroadcastItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [target, setTarget] = useState<string>("ALL");
  const [sending, setSending] = useState(false);

  const loadBroadcasts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAxios.get("/chat/broadcasts/list");
      setBroadcasts(res.data.data || []);
    } catch (err) {
      console.error("Failed to load broadcasts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSend = useCallback(async () => {
    if (!content.trim() || sending) return;
    setSending(true);
    try {
      const res = await adminAxios.post("/chat/broadcast", {
        content: content.trim(),
        target,
      });
      const newBroadcast = res.data.data;
      setBroadcasts((prev) => [newBroadcast, ...prev]);
      setContent("");
    } catch (err) {
      console.error("Failed to send broadcast:", err);
    } finally {
      setSending(false);
    }
  }, [content, target, sending]);

  useEffect(() => { loadBroadcasts(); }, [loadBroadcasts]);

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Iconify icon="solar:soundwave-bold-duotone" width={28} sx={{ color: "#00E676" }} />
          <Typography variant="h5" fontWeight={700} sx={{ color: "#F0F4F8" }}>
            Broadcasts
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: connected ? "#4CAF50" : "#F44336" }} />
          <Typography variant="caption" sx={{ color: alpha("#F0F4F8", 0.5), fontSize: 11 }}>
            {connected ? "Live" : "Offline"}
          </Typography>
        </Stack>
      </Stack>

      {/* Main content */}
      <Box sx={{ flex: 1, display: "flex", gap: 2, minHeight: 0 }}>
        {/* Left: Compose */}
        <Box sx={{ width: 400, minWidth: 400, display: "flex", flexDirection: "column", gap: 2 }}>
          <Card sx={{ p: 2.5, bgcolor: alpha("#070D18", 0.6), border: `1px solid ${alpha("#FFFFFF", 0.06)}`, borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ color: "#F0F4F8", mb: 2 }}>
              New Broadcast
            </Typography>

            {/* Target selector */}
            <Typography variant="caption" sx={{ color: alpha("#F0F4F8", 0.5), fontSize: 11, fontWeight: 600, mb: 0.5, display: "block" }}>
              TARGET AUDIENCE
            </Typography>
            <Stack direction="column" spacing={1} sx={{ mb: 2 }}>
              {Object.entries(TARGET_CONFIG).map(([key, cfg]) => (
                <Box
                  key={key}
                  onClick={() => setTarget(key)}
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    cursor: "pointer",
                    border: `1px solid ${target === key ? alpha(cfg.color, 0.4) : alpha("#FFFFFF", 0.06)}`,
                    bgcolor: target === key ? alpha(cfg.color, 0.08) : alpha("#FFFFFF", 0.02),
                    transition: "all 0.15s",
                    "&:hover": { bgcolor: alpha(cfg.color, 0.06) },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Iconify icon={cfg.icon} width={20} sx={{ color: target === key ? cfg.color : alpha("#F0F4F8", 0.3) }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={600} sx={{ color: target === key ? cfg.color : "#F0F4F8", fontSize: 13 }}>
                        {cfg.label}
                      </Typography>
                      <Typography variant="caption" sx={{ color: alpha("#F0F4F8", 0.4), fontSize: 11 }}>
                        {cfg.description}
                      </Typography>
                    </Box>
                    {target === key && (
                      <Iconify icon="solar:check-circle-bold" width={20} sx={{ color: cfg.color }} />
                    )}
                  </Stack>
                </Box>
              ))}
            </Stack>

            {/* Message input */}
            <Typography variant="caption" sx={{ color: alpha("#F0F4F8", 0.5), fontSize: 11, fontWeight: 600, mb: 0.5, display: "block" }}>
              MESSAGE
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Write your broadcast message..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1.5,
                  bgcolor: alpha("#FFFFFF", 0.03),
                  "& fieldset": { borderColor: alpha("#FFFFFF", 0.06) },
                  "&:hover fieldset": { borderColor: alpha("#FFFFFF", 0.12) },
                  "&.Mui-focused fieldset": { borderColor: alpha("#00E676", 0.3) },
                },
                "& textarea": { fontSize: 13, color: "#F0F4F8" },
              }}
            />

            {/* Send button */}
            <Box
              onClick={!content.trim() || sending ? undefined : handleSend}
              sx={{
                py: 1.25,
                borderRadius: 1.5,
                textAlign: "center",
                cursor: content.trim() && !sending ? "pointer" : "default",
                bgcolor: content.trim() && !sending ? "#00E676" : alpha("#00E676", 0.2),
                color: content.trim() && !sending ? "#0A0F1A" : alpha("#0A0F1A", 0.3),
                fontWeight: 700,
                fontSize: 14,
                transition: "all 0.15s",
                "&:hover": content.trim() && !sending ? { bgcolor: "#00C853" } : {},
              }}
            >
              {sending ? (
                <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
                  <CircularProgress size={16} sx={{ color: "#0A0F1A" }} />
                  <span>Sending...</span>
                </Stack>
              ) : (
                <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
                  <Iconify icon="solar:plain-bold" width={18} />
                  <span>Send Broadcast</span>
                </Stack>
              )}
            </Box>
          </Card>
        </Box>

        {/* Right: Broadcast history */}
        <Box sx={{ flex: 1, borderRadius: 2, border: `1px solid ${alpha("#FFFFFF", 0.06)}`, bgcolor: alpha("#070D18", 0.6), display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${alpha("#FFFFFF", 0.06)}` }}>
            <Typography variant="subtitle2" sx={{ color: "#F0F4F8", fontSize: 13 }}>
              Broadcast History
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress size={24} sx={{ color: "#00E676" }} />
            </Box>
          ) : broadcasts.length === 0 ? (
            <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 1 }}>
              <Iconify icon="solar:soundwave-bold-duotone" width={48} sx={{ color: alpha("#F0F4F8", 0.06) }} />
              <Typography variant="body2" sx={{ color: alpha("#F0F4F8", 0.2) }}>
                No broadcasts sent yet
              </Typography>
            </Box>
          ) : (
            <Box sx={{ flex: 1, overflowY: "auto", p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
              {broadcasts.map((b) => {
                const cfg = TARGET_CONFIG[b.target] || TARGET_CONFIG.ALL;
                const senderName = b.sender ? `${b.sender.firstName} ${b.sender.lastName}`.trim() : `${admin?.firstName || user?.firstName || "One App"} ${admin?.lastName || user?.lastName || "Admin"}`.trim();
                return (
                  <Card
                    key={b.id}
                    sx={{
                      p: 2,
                      bgcolor: alpha("#FFFFFF", 0.02),
                      border: `1px solid ${alpha("#FFFFFF", 0.04)}`,
                      borderRadius: 1.5,
                      borderLeft: `3px solid ${cfg.color}`,
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Chip
                          icon={<Iconify icon={cfg.icon} width={14} />}
                          label={cfg.label}
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: 11,
                            fontWeight: 600,
                            bgcolor: alpha(cfg.color, 0.12),
                            color: cfg.color,
                            "& .MuiChip-icon": { color: cfg.color },
                          }}
                        />
                        <Typography variant="caption" sx={{ color: alpha("#F0F4F8", 0.4), fontSize: 10 }}>
                          by {senderName}
                        </Typography>
                      </Stack>
                      <Typography variant="caption" sx={{ color: alpha("#F0F4F8", 0.3), fontSize: 10 }}>
                        {moment(b.createdAt).format("DD MMM YYYY, HH:mm")}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ color: "#E0E0E0", fontSize: 13, lineHeight: 1.5 }}>
                      {b.content}
                    </Typography>
                  </Card>
                );
              })}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
