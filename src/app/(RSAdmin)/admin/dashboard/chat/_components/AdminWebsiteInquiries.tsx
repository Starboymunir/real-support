"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  TextField,
  Stack,
  CircularProgress,
  IconButton,
  Chip,
  Select,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useAuth } from "@/lib/auth-context";
import { useSocket } from "@/lib/socket-context";
import adminAxios from "@/lib/admin-axios";
import Iconify from "@/components/iconify/iconify";
import moment from "moment";
import { resolveS3Url } from "@/lib/api";

// ── Constants ──

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  PENDING: { label: "New", color: "#FF6B35", icon: "solar:danger-circle-bold" },
  PROCESSING: { label: "Working on it", color: "#2196F3", icon: "solar:refresh-circle-bold" },
  COMPLETED: { label: "Responded", color: "#4CAF50", icon: "solar:check-circle-bold" },
};

// ── Types ──

interface ContactUsMessage {
  id: string;
  contactUsId: string;
  sender: "CLIENT" | "ADMIN";
  content: string;
  createdAt: string;
}

interface ContactUs {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  reason: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED";
  userId?: string;
  userInfo?: {
    firstName?: string;
    lastName?: string;
    coverImage?: string;
    mode?: string;
  };
  messages: ContactUsMessage[];
  createdAt: string;
  updatedAt: string;
}

// ── Helpers ──

function resolveAvatar(img: string | null | undefined): string | undefined {
  return resolveS3Url(img) ?? undefined;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getTimeAgo(date: string) {
  const m = moment(date);
  const now = moment();
  if (now.diff(m, "hours") < 1) return m.fromNow();
  if (now.diff(m, "days") < 1) return m.format("HH:mm");
  if (now.diff(m, "days") < 7) return m.format("ddd HH:mm");
  return m.format("DD MMM");
}

// ── Status badge ──

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  return (
    <Chip
      icon={<Iconify icon={config.icon} width={14} />}
      label={config.label}
      size="small"
      sx={{
        height: 22,
        fontSize: 11,
        fontWeight: 600,
        bgcolor: alpha(config.color, 0.12),
        color: config.color,
        "& .MuiChip-icon": { color: config.color },
      }}
    />
  );
}

// ── Message bubble ──

function MessageBubble({ message }: { message: ContactUsMessage }) {
  const isAdmin = message.sender === "ADMIN";
  return (
    <Box sx={{ display: "flex", flexDirection: isAdmin ? "row-reverse" : "row", alignItems: "flex-end", gap: 1 }}>
      {!isAdmin && (
        <Avatar sx={{ width: 28, height: 28, fontSize: 11, bgcolor: alpha("#9C27B0", 0.15), color: "#CE93D8" }}>
          <Iconify icon="solar:user-bold" width={14} />
        </Avatar>
      )}
      <Box
        sx={{
          maxWidth: "65%",
          px: 1.5,
          py: 1,
          borderRadius: isAdmin ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
          bgcolor: isAdmin ? "#00E676" : alpha("#FFFFFF", 0.06),
          color: isAdmin ? "#0A0F1A" : "#E0E0E0",
        }}
      >
        {!isAdmin && (
          <Typography variant="caption" fontWeight={700} sx={{ color: "#CE93D8", mb: 0.25, display: "block" }}>
            User
          </Typography>
        )}
        <Typography variant="body2" sx={{ fontSize: 13, lineHeight: 1.5, whiteSpace: "pre-line" }}>
          {message.content}
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.5, display: "block", textAlign: "right", mt: 0.25, fontSize: 10 }}>
          {moment(message.createdAt).format("HH:mm")}
        </Typography>
      </Box>
    </Box>
  );
}

// ── Main component ──

export default function AdminWebsiteInquiries() {
  const { admin, user } = useAuth();
  const { socket, connected } = useSocket();
  const adminId = admin?.id ?? user?.id;

  const [inquiries, setInquiries] = useState<ContactUs[]>([]);
  const [filteredInquiries, setFilteredInquiries] = useState<ContactUs[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeInquiry, setActiveInquiry] = useState<ContactUs | null>(null);
  const [messages, setMessages] = useState<ContactUsMessage[]>([]);
  const [content, setContent] = useState("");
  const [loadingList, setLoadingList] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Filter inquiries
  useEffect(() => {
    let filtered = inquiries;
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((i) => i.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((i) => {
        return (
          i.name.toLowerCase().includes(q) ||
          i.email.toLowerCase().includes(q) ||
          i.reason.toLowerCase().includes(q) ||
          (i.phone_number || "").includes(q)
        );
      });
    }
    setFilteredInquiries(filtered);
  }, [inquiries, statusFilter, searchQuery]);

  // Load all inquiries
  const loadInquiries = useCallback(async () => {
    if (!adminId) return;
    setLoadingList(true);
    try {
      const res = await adminAxios.get("/contact-us");
      setInquiries(res.data.data || []);
    } catch (err) {
      console.error("Failed to load inquiries:", err);
    } finally {
      setLoadingList(false);
    }
  }, [adminId]);

  // Load single inquiry with messages
  const loadInquiry = useCallback(async (inquiryId: string) => {
    if (!adminId) return;
    setLoadingMessages(true);
    try {
      const res = await adminAxios.get(`/contact-us/${inquiryId}`);
      const data = res.data.data;
      setActiveInquiry(data);
      setMessages(data.messages || []);
    } catch (err) {
      console.error("Failed to load inquiry:", err);
    } finally {
      setLoadingMessages(false);
    }
  }, [adminId]);

  // Update inquiry status
  const updateStatus = useCallback(async (inquiryId: string, status: string) => {
    try {
      const res = await adminAxios.patch(`/contact-us/${inquiryId}`, { status, sender: "ADMIN" });
      const updated = res.data.data;
      setActiveInquiry((prev) => (prev?.id === inquiryId ? { ...prev, status: updated.status ?? status } : prev));
      setInquiries((prev) => prev.map((i) => (i.id === inquiryId ? { ...i, status: updated.status ?? status } : i)));
    } catch (err) {
      console.error("Failed to update inquiry:", err);
    }
  }, []);

  // Send reply
  const handleSend = useCallback(async () => {
    if (!content.trim() || !activeId || sending) return;
    setSending(true);
    try {
      const res = await adminAxios.patch(`/contact-us/${activeId}`, {
        messageContent: content.trim(),
        status: activeInquiry?.status === "PENDING" ? "PROCESSING" : activeInquiry?.status,
        sender: "ADMIN",
      });
      const updated = res.data.data;
      // Add the new message to local state
      const newMsg: ContactUsMessage = {
        id: `msg-${Date.now()}`,
        contactUsId: activeId,
        sender: "ADMIN",
        content: content.trim(),
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, newMsg]);
      setContent("");
      // Update status locally
      if (updated?.status) {
        setActiveInquiry((prev) => (prev ? { ...prev, status: updated.status } : prev));
        setInquiries((prev) => prev.map((i) => (i.id === activeId ? { ...i, status: updated.status } : i)));
      }
    } catch (err) {
      console.error("Failed to send:", err);
    } finally {
      setSending(false);
    }
  }, [content, activeId, sending, activeInquiry?.status]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  useEffect(() => { loadInquiries(); }, [loadInquiries]);

  // Refresh periodically
  useEffect(() => {
    const intervalId = window.setInterval(() => loadInquiries(), 15000);
    const onFocus = () => loadInquiries();
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
    };
  }, [loadInquiries]);

  useEffect(() => { if (activeId) loadInquiry(activeId); }, [activeId, loadInquiry]);
  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  // Socket events
  useEffect(() => {
    if (!socket) return;
    const handleNew = (data: ContactUs) => {
      setInquiries((prev) => (prev.some((i) => i.id === data.id) ? prev : [data, ...prev]));
    };
    const handleUpdated = (data: any) => {
      if (data?.id === activeId) {
        loadInquiry(activeId);
      }
      setInquiries((prev) =>
        prev.map((i) => (i.id === data?.id ? { ...i, ...data } : i))
      );
    };
    socket.on("NEW_CONTACT_US", handleNew);
    socket.on("CONTACT_US_UPDATED", handleUpdated);
    return () => {
      socket.off("NEW_CONTACT_US", handleNew);
      socket.off("CONTACT_US_UPDATED", handleUpdated);
    };
  }, [socket, activeId, loadInquiry]);

  // Status counts
  const statusCounts = inquiries.reduce((acc, i) => {
    acc[i.status] = (acc[i.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Box sx={{ height: "calc(100vh - 100px)", display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Iconify icon="solar:chat-line-bold-duotone" width={28} sx={{ color: "#00E676" }} />
          <Typography variant="h5" fontWeight={700} sx={{ color: "#F0F4F8" }}>
            Website Inquiries
          </Typography>
          <Chip
            label={inquiries.length}
            size="small"
            sx={{ height: 22, fontSize: 11, fontWeight: 700, bgcolor: alpha("#00E676", 0.12), color: "#00E676" }}
          />
        </Stack>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: connected ? "#4CAF50" : "#F44336" }} />
          <Typography variant="caption" sx={{ color: alpha("#F0F4F8", 0.5), fontSize: 11 }}>
            {connected ? "Live" : "Offline"}
          </Typography>
        </Stack>
      </Stack>

      {/* Status filter tabs */}
      <Stack direction="row" spacing={1}>
        {[
          { key: "ALL", label: "All", count: inquiries.length },
          ...Object.entries(STATUS_CONFIG).map(([key, cfg]) => ({
            key,
            label: cfg.label,
            count: statusCounts[key] || 0,
          })),
        ].map((tab) => (
          <Box
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              transition: "all 0.15s",
              bgcolor: statusFilter === tab.key ? alpha("#00E676", 0.12) : alpha("#FFFFFF", 0.03),
              color: statusFilter === tab.key ? "#00E676" : alpha("#F0F4F8", 0.5),
              border: `1px solid ${statusFilter === tab.key ? alpha("#00E676", 0.3) : "transparent"}`,
              "&:hover": { bgcolor: alpha("#FFFFFF", 0.06) },
            }}
          >
            {tab.label} ({tab.count})
          </Box>
        ))}
      </Stack>

      {/* Main content */}
      <Box sx={{ flex: 1, display: "flex", borderRadius: 2, overflow: "hidden", border: `1px solid ${alpha("#FFFFFF", 0.06)}`, minHeight: 0 }}>
        {/* Sidebar — inquiry list */}
        <Box sx={{ width: 360, minWidth: 360, borderRight: `1px solid ${alpha("#FFFFFF", 0.06)}`, display: "flex", flexDirection: "column", bgcolor: alpha("#070D18", 0.6) }}>
          <Box sx={{ p: 1.5 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search inquiries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="solar:magnifer-linear" width={18} sx={{ color: alpha("#F0F4F8", 0.3) }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1.5,
                  bgcolor: alpha("#FFFFFF", 0.03),
                  "& fieldset": { borderColor: alpha("#FFFFFF", 0.06) },
                  "&:hover fieldset": { borderColor: alpha("#FFFFFF", 0.12) },
                  "&.Mui-focused fieldset": { borderColor: alpha("#00E676", 0.3) },
                },
                "& input": { fontSize: 13, color: "#F0F4F8" },
              }}
            />
          </Box>

          {loadingList ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress size={24} sx={{ color: "#00E676" }} />
            </Box>
          ) : filteredInquiries.length === 0 ? (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Iconify icon="solar:inbox-line-bold-duotone" width={40} sx={{ color: alpha("#F0F4F8", 0.1), mb: 1 }} />
              <Typography variant="body2" sx={{ color: alpha("#F0F4F8", 0.3), fontSize: 13 }}>
                No inquiries found
              </Typography>
            </Box>
          ) : (
            <List sx={{ overflowY: "auto", flex: 1, py: 0 }}>
              {filteredInquiries.map((inquiry) => {
                const displayName = inquiry.userInfo
                  ? `${inquiry.userInfo.firstName ?? ""} ${inquiry.userInfo.lastName ?? ""}`.trim() || inquiry.name
                  : inquiry.name;
                const lastMsg = inquiry.messages?.length > 0 ? inquiry.messages[inquiry.messages.length - 1] : null;

                return (
                  <ListItem key={inquiry.id} disablePadding>
                    <ListItemButton
                      selected={inquiry.id === activeId}
                      onClick={() => setActiveId(inquiry.id)}
                      sx={{
                        py: 1.5,
                        px: 2,
                        borderBottom: `1px solid ${alpha("#FFFFFF", 0.03)}`,
                        "&.Mui-selected": { bgcolor: alpha("#00E676", 0.06), borderLeft: "2px solid #00E676" },
                        "&:hover": { bgcolor: alpha("#FFFFFF", 0.03) },
                      }}
                    >
                      <ListItemAvatar sx={{ minWidth: 44 }}>
                        <Avatar
                          src={resolveAvatar(inquiry.userInfo?.coverImage)}
                          sx={{
                            width: 36,
                            height: 36,
                            fontSize: 13,
                            bgcolor: alpha("#9C27B0", 0.15),
                            color: "#CE93D8",
                          }}
                        >
                          {getInitials(displayName)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" noWrap sx={{ color: "#F0F4F8", fontSize: 13 }}>
                            {displayName}
                          </Typography>
                        }
                        secondary={
                          <Stack spacing={0.25}>
                            <Typography variant="caption" noWrap sx={{ color: alpha("#F0F4F8", 0.5), fontSize: 11 }}>
                              {inquiry.reason}
                            </Typography>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <StatusBadge status={inquiry.status} />
                              {inquiry.email && (
                                <Typography variant="caption" noWrap sx={{ color: alpha("#F0F4F8", 0.3), fontSize: 10, maxWidth: 120 }}>
                                  {inquiry.email}
                                </Typography>
                              )}
                            </Stack>
                          </Stack>
                        }
                      />
                      <Typography variant="caption" sx={{ color: alpha("#F0F4F8", 0.3), fontSize: 10, ml: 1, flexShrink: 0 }}>
                        {getTimeAgo(inquiry.updatedAt || inquiry.createdAt)}
                      </Typography>
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          )}
        </Box>

        {/* Detail / Chat area */}
        {!activeId ? (
          <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 1.5, bgcolor: alpha("#0A0F1A", 0.5) }}>
            <Iconify icon="solar:inbox-line-bold-duotone" width={56} sx={{ color: alpha("#F0F4F8", 0.06) }} />
            <Typography variant="h6" sx={{ color: alpha("#F0F4F8", 0.2), fontWeight: 600 }}>
              Select an inquiry
            </Typography>
            <Typography variant="body2" sx={{ color: alpha("#F0F4F8", 0.1) }}>
              Choose a website inquiry to view and respond
            </Typography>
          </Box>
        ) : (
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", bgcolor: alpha("#0A0F1A", 0.5), minWidth: 0 }}>
            {/* Header */}
            <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${alpha("#FFFFFF", 0.06)}`, bgcolor: alpha("#070D18", 0.4) }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Avatar
                    src={resolveAvatar(activeInquiry?.userInfo?.coverImage)}
                    sx={{ width: 36, height: 36, fontSize: 13, bgcolor: alpha("#9C27B0", 0.15), color: "#CE93D8" }}
                  >
                    {getInitials(activeInquiry?.name || "?")}
                  </Avatar>
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={0.75}>
                      <Typography variant="subtitle2" sx={{ color: "#F0F4F8", fontSize: 14 }}>
                        {activeInquiry?.name}
                      </Typography>
                      <Chip
                        label="Website"
                        size="small"
                        sx={{ height: 18, fontSize: 10, fontWeight: 700, letterSpacing: 0.5, bgcolor: alpha("#FF9800", 0.12), color: "#FF9800" }}
                      />
                    </Stack>
                    <Typography variant="caption" sx={{ color: alpha("#F0F4F8", 0.5), fontSize: 12 }}>
                      {activeInquiry?.reason}
                    </Typography>
                    <Stack direction="row" spacing={1.5} sx={{ mt: 0.25 }}>
                      {activeInquiry?.email && (
                        <Typography variant="caption" sx={{ color: alpha("#F0F4F8", 0.35), fontSize: 11 }}>
                          {activeInquiry.email}
                        </Typography>
                      )}
                      {activeInquiry?.phone_number && (
                        <Typography variant="caption" sx={{ color: alpha("#F0F4F8", 0.35), fontSize: 11 }}>
                          {activeInquiry.phone_number}
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                </Stack>

                <Select
                  size="small"
                  value={activeInquiry?.status || "PENDING"}
                  onChange={(e) => updateStatus(activeId!, e.target.value)}
                  sx={{
                    height: 30,
                    fontSize: 12,
                    color: STATUS_CONFIG[activeInquiry?.status || "PENDING"]?.color,
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: alpha("#FFFFFF", 0.08) },
                    "& .MuiSvgIcon-root": { color: alpha("#F0F4F8", 0.3) },
                  }}
                >
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <MenuItem key={key} value={key} sx={{ fontSize: 12 }}>
                      <Stack direction="row" alignItems="center" spacing={0.75}>
                        <Iconify icon={cfg.icon} width={14} sx={{ color: cfg.color }} />
                        <span>{cfg.label}</span>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </Stack>
            </Box>

            {/* Messages */}
            <Box sx={{ flex: 1, overflowY: "auto", px: 2.5, py: 2, display: "flex", flexDirection: "column", gap: 1 }}>
              {loadingMessages ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                  <CircularProgress size={24} sx={{ color: "#00E676" }} />
                </Box>
              ) : messages.length === 0 ? (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1 }}>
                  <Typography variant="body2" sx={{ color: alpha("#F0F4F8", 0.2) }}>
                    No messages yet
                  </Typography>
                </Box>
              ) : (
                messages.map((msg, idx) => (
                  <MessageBubble key={msg.id || idx} message={msg} />
                ))
              )}
              <div ref={messagesEndRef} />
            </Box>

            {/* Input */}
            <Box sx={{ px: 2, py: 1.5, borderTop: `1px solid ${alpha("#FFFFFF", 0.06)}`, bgcolor: alpha("#070D18", 0.4) }}>
              {activeInquiry?.status === "COMPLETED" ? (
                <Stack direction="row" alignItems="center" spacing={1} sx={{ color: alpha("#F0F4F8", 0.4) }}>
                  <Iconify icon="solar:check-circle-bold" width={18} sx={{ color: "#4CAF50" }} />
                  <Typography variant="body2" sx={{ fontSize: 13 }}>
                    This inquiry has been marked as responded.
                  </Typography>
                </Stack>
              ) : (
                <Stack direction="row" spacing={1} alignItems="flex-end">
                  <TextField
                    fullWidth
                    multiline
                    maxRows={3}
                    size="small"
                    placeholder="Type your reply..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 1.5,
                        bgcolor: alpha("#FFFFFF", 0.03),
                        "& fieldset": { borderColor: alpha("#FFFFFF", 0.06) },
                        "&:hover fieldset": { borderColor: alpha("#FFFFFF", 0.12) },
                        "&.Mui-focused fieldset": { borderColor: alpha("#00E676", 0.3) },
                      },
                      "& textarea, & input": { fontSize: 13, color: "#F0F4F8" },
                    }}
                  />
                  <IconButton
                    onClick={handleSend}
                    disabled={!content.trim() || sending}
                    sx={{
                      bgcolor: "#00E676",
                      color: "#0A0F1A",
                      "&:hover": { bgcolor: "#00C853" },
                      "&.Mui-disabled": { bgcolor: alpha("#00E676", 0.2), color: alpha("#0A0F1A", 0.3) },
                    }}
                  >
                    {sending ? <CircularProgress size={18} sx={{ color: "#0A0F1A" }} /> : <Iconify icon="solar:arrow-up-bold" width={18} />}
                  </IconButton>
                </Stack>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
