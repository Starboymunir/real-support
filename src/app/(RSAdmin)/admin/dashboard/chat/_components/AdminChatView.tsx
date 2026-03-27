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
  Tooltip,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useAuth } from "@/lib/auth-context";
import { useSocket, SOCKET_EVENTS } from "@/lib/socket-context";
import adminAxios from "@/lib/admin-axios";
import Iconify from "@/components/iconify/iconify";
import moment from "moment";
import type { SupportTicket, SupportTicketMessage } from "@/lib/types";

// ── Constants ──

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  OPEN: { label: "Open", color: "#FF6B35", icon: "solar:danger-circle-bold" },
  IN_PROGRESS: { label: "In Progress", color: "#2196F3", icon: "solar:refresh-circle-bold" },
  RESOLVED: { label: "Resolved", color: "#4CAF50", icon: "solar:check-circle-bold" },
  CLOSED: { label: "Closed", color: "#9E9E9E", icon: "solar:close-circle-bold" },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  LOW: { label: "Low", color: "#8BC34A" },
  MEDIUM: { label: "Medium", color: "#FF9800" },
  HIGH: { label: "High", color: "#F44336" },
  URGENT: { label: "Urgent", color: "#D32F2F" },
};

const CATEGORY_CONFIG: Record<string, { label: string; icon: string }> = {
  BOOKING: { label: "Booking", icon: "solar:calendar-bold" },
  PAYMENT: { label: "Payment", icon: "solar:card-bold" },
  DRIVER_ISSUE: { label: "Driver Issue", icon: "solar:user-bold" },
  APP_ISSUE: { label: "App Issue", icon: "solar:smartphone-bold" },
  ACCOUNT: { label: "Account", icon: "solar:settings-bold" },
  OTHER: { label: "Other", icon: "solar:question-circle-bold" },
};

// ── Helpers ──

function getUserType(user: any): "DRIVER" | "RIDER" {
  return user?.mode === "DRIVER" ? "DRIVER" : "RIDER";
}

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
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
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.OPEN;
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

function PriorityDot({ priority }: { priority: string }) {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.MEDIUM;
  return (
    <Tooltip title={`${config.label} Priority`}>
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          bgcolor: config.color,
          flexShrink: 0,
        }}
      />
    </Tooltip>
  );
}

function UserTypeBadge({ type }: { type: string }) {
  const isDriver = type === "DRIVER";
  return (
    <Chip
      label={isDriver ? "Driver" : "Rider"}
      size="small"
      sx={{
        height: 18,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 0.5,
        bgcolor: isDriver ? alpha("#2196F3", 0.12) : alpha("#9C27B0", 0.12),
        color: isDriver ? "#2196F3" : "#9C27B0",
      }}
    />
  );
}

// ── Message bubble ──

function MessageBubble({ message, isOwn }: { message: SupportTicketMessage; isOwn: boolean }) {
  const senderName = message.sender
    ? `${message.sender.firstName ?? ""} ${message.sender.lastName ?? ""}`.trim()
    : "Unknown";
  const senderType = message.sender ? getUserType(message.sender) : null;

  return (
    <Box sx={{ display: "flex", flexDirection: isOwn ? "row-reverse" : "row", alignItems: "flex-end", gap: 1 }}>
      {!isOwn && (
        <Avatar sx={{ width: 28, height: 28, fontSize: 11, bgcolor: senderType === "DRIVER" ? "#2196F3" : "#9C27B0" }}>
          {getInitials(senderName)}
        </Avatar>
      )}
      <Box
        sx={{
          maxWidth: "65%",
          px: 1.5,
          py: 1,
          borderRadius: isOwn ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
          bgcolor: isOwn ? "#00E676" : alpha("#FFFFFF", 0.06),
          color: isOwn ? "#0A0F1A" : "#E0E0E0",
        }}
      >
        {!isOwn && (
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.25 }}>
            <Typography variant="caption" fontWeight={700} sx={{ color: message.isAdminReply ? "#00E676" : (senderType === "DRIVER" ? "#64B5F6" : "#CE93D8") }}>
              {message.isAdminReply ? "Support Agent" : senderName}
            </Typography>
            {!message.isAdminReply && senderType && (
              <Typography variant="caption" sx={{ fontSize: 9, opacity: 0.5 }}>
                ({senderType === "DRIVER" ? "Driver" : "Rider"})
              </Typography>
            )}
          </Stack>
        )}
        {message.content && <Typography variant="body2" sx={{ fontSize: 13, lineHeight: 1.5 }}>{message.content}</Typography>}
        <Typography variant="caption" sx={{ opacity: 0.5, display: "block", textAlign: "right", mt: 0.25, fontSize: 10 }}>
          {moment(message.createdAt).format("HH:mm")}
        </Typography>
      </Box>
    </Box>
  );
}

// ── Main component ──

export default function AdminChatView() {
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const userId = user?.id;

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<SupportTicket[]>([]);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportTicketMessage[]>([]);
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

  // Filter tickets by search and status
  useEffect(() => {
    let filtered = tickets;
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((t) => {
        const userName = `${t.user?.firstName ?? ""} ${t.user?.lastName ?? ""}`.trim().toLowerCase();
        return (
          userName.includes(q) ||
          t.ticketNumber.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          (t.user?.mode ?? "").toLowerCase().includes(q)
        );
      });
    }
    setFilteredTickets(filtered);
  }, [tickets, statusFilter, searchQuery]);

  // Load ticket list
  const loadTickets = useCallback(async () => {
    if (!userId) return;
    setLoadingList(true);
    try {
      const res = await adminAxios.get("/support-tickets");
      setTickets(res.data.data || []);
    } catch (err) {
      console.error("Failed to load tickets:", err);
    } finally {
      setLoadingList(false);
    }
  }, [userId]);

  // Load a specific ticket with messages
  const loadTicket = useCallback(async (ticketId: string) => {
    if (!userId) return;
    setLoadingMessages(true);
    try {
      const res = await adminAxios.get(`/support-tickets/${ticketId}`);
      const ticketData = res.data.data;
      setActiveTicket(ticketData);
      setMessages(ticketData.messages || []);
    } catch (err) {
      console.error("Failed to load ticket:", err);
    } finally {
      setLoadingMessages(false);
    }
  }, [userId]);

  // Update ticket status/priority
  const updateTicket = useCallback(async (ticketId: string, updates: { status?: string; priority?: string }) => {
    try {
      const res = await adminAxios.patch(`/support-tickets/${ticketId}`, updates);
      const updated = res.data.data;
      setActiveTicket((prev) => (prev?.id === ticketId ? { ...prev, ...updated } : prev));
      setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, ...updated } : t)));
    } catch (err) {
      console.error("Failed to update ticket:", err);
    }
  }, []);

  // Send message (admin reply)
  const handleSend = useCallback(async () => {
    if (!content.trim() || !activeTicketId || sending) return;
    setSending(true);
    try {
      const res = await adminAxios.post(`/support-tickets/${activeTicketId}/messages`, { content: content.trim(), attachments: [] });
      const newMsg = res.data.data;
      setMessages((prev) => [...prev, newMsg]);
      setContent("");
      // If ticket was OPEN, update local status to IN_PROGRESS
      setActiveTicket((prev) => {
        if (prev && prev.status === "OPEN") return { ...prev, status: "IN_PROGRESS" };
        return prev;
      });
      setTickets((prev) =>
        prev.map((t) =>
          t.id === activeTicketId
            ? { ...t, ...(t.status === "OPEN" ? { status: "IN_PROGRESS" as const } : {}), messages: [newMsg] }
            : t
        )
      );
    } catch (err) {
      console.error("Failed to send:", err);
    } finally {
      setSending(false);
    }
  }, [content, activeTicketId, sending]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  useEffect(() => { loadTickets(); }, [loadTickets]);
  useEffect(() => { if (activeTicketId) loadTicket(activeTicketId); }, [activeTicketId, loadTicket]);
  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  // Socket events
  useEffect(() => {
    if (!socket) return;
    const handleNewTicket = (data: any) => {
      setTickets((prev) => (prev.some((t) => t.id === data.id) ? prev : [data, ...prev]));
    };
    const handleTicketMessage = (data: any) => {
      if (data?.ticketId === activeTicketId) {
        setMessages((prev) => (prev.some((m) => m.id === data.id) ? prev : [...prev, data]));
      }
      setTickets((prev) =>
        prev.map((t) => (t.id === data?.ticketId ? { ...t, messages: [data] } : t))
      );
    };
    const handleTicketUpdated = (data: any) => {
      setTickets((prev) => prev.map((t) => (t.id === data?.id ? { ...t, ...data } : t)));
      if (data?.id === activeTicketId) {
        setActiveTicket((prev) => (prev ? { ...prev, ...data } : prev));
      }
    };
    socket.on(SOCKET_EVENTS.NEW_SUPPORT_TICKET, handleNewTicket);
    socket.on(SOCKET_EVENTS.SUPPORT_TICKET_MESSAGE, handleTicketMessage);
    socket.on(SOCKET_EVENTS.SUPPORT_TICKET_UPDATED, handleTicketUpdated);
    return () => {
      socket.off(SOCKET_EVENTS.NEW_SUPPORT_TICKET, handleNewTicket);
      socket.off(SOCKET_EVENTS.SUPPORT_TICKET_MESSAGE, handleTicketMessage);
      socket.off(SOCKET_EVENTS.SUPPORT_TICKET_UPDATED, handleTicketUpdated);
    };
  }, [socket, activeTicketId]);

  // Status counts
  const statusCounts = tickets.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const ticketUser = activeTicket?.user;
  const ticketUserName = ticketUser
    ? `${ticketUser.firstName ?? ""} ${ticketUser.lastName ?? ""}`.trim()
    : "Unknown User";
  const ticketUserType = ticketUser ? getUserType(ticketUser) : "RIDER";

  return (
    <Box sx={{ height: "calc(100vh - 100px)", display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Iconify icon="solar:chat-round-dots-bold-duotone" width={28} sx={{ color: "#00E676" }} />
          <Typography variant="h5" fontWeight={700} sx={{ color: "#F0F4F8" }}>
            Support Tickets
          </Typography>
          <Chip
            label={tickets.length}
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
        {[{ key: "ALL", label: "All", count: tickets.length }, ...Object.entries(STATUS_CONFIG).map(([key, cfg]) => ({ key, label: cfg.label, count: statusCounts[key] || 0 }))].map((tab) => (
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
        {/* Sidebar — ticket list */}
        <Box sx={{ width: 360, minWidth: 360, borderRight: `1px solid ${alpha("#FFFFFF", 0.06)}`, display: "flex", flexDirection: "column", bgcolor: alpha("#070D18", 0.6) }}>
          {/* Search */}
          <Box sx={{ p: 1.5 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search tickets..."
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

          {/* Ticket list */}
          {loadingList ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress size={24} sx={{ color: "#00E676" }} />
            </Box>
          ) : filteredTickets.length === 0 ? (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Iconify icon="solar:inbox-line-bold-duotone" width={40} sx={{ color: alpha("#F0F4F8", 0.1), mb: 1 }} />
              <Typography variant="body2" sx={{ color: alpha("#F0F4F8", 0.3), fontSize: 13 }}>
                No tickets found
              </Typography>
            </Box>
          ) : (
            <List sx={{ overflowY: "auto", flex: 1, py: 0 }}>
              {filteredTickets.map((ticket) => {
                const tUser = ticket.user;
                const tUserName = tUser ? `${tUser.firstName ?? ""} ${tUser.lastName ?? ""}`.trim() : "Unknown";
                const tUserType = tUser ? getUserType(tUser) : "RIDER";
                const lastMsg = ticket.messages?.[0];
                const catConfig = CATEGORY_CONFIG[ticket.category] || CATEGORY_CONFIG.OTHER;

                return (
                  <ListItem key={ticket.id} disablePadding>
                    <ListItemButton
                      selected={ticket.id === activeTicketId}
                      onClick={() => setActiveTicketId(ticket.id)}
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
                          src={tUser?.coverImage ?? undefined}
                          sx={{
                            width: 36,
                            height: 36,
                            fontSize: 13,
                            bgcolor: tUserType === "DRIVER" ? alpha("#2196F3", 0.15) : alpha("#9C27B0", 0.15),
                            color: tUserType === "DRIVER" ? "#64B5F6" : "#CE93D8",
                          }}
                        >
                          {getInitials(tUserName)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <Typography variant="subtitle2" noWrap sx={{ color: "#F0F4F8", fontSize: 13, flex: 1 }}>
                              {tUserName}
                            </Typography>
                            <PriorityDot priority={ticket.priority} />
                          </Stack>
                        }
                        secondary={
                          <Stack spacing={0.25}>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <Typography variant="caption" sx={{ color: alpha("#F0F4F8", 0.5), fontSize: 10, fontWeight: 600 }}>
                                {ticket.ticketNumber}
                              </Typography>
                              <Chip
                                label={catConfig.label}
                                size="small"
                                sx={{ height: 16, fontSize: 9, fontWeight: 600, bgcolor: alpha("#FFFFFF", 0.06), color: alpha("#F0F4F8", 0.5) }}
                              />
                            </Stack>
                            <Typography variant="caption" noWrap sx={{ color: alpha("#F0F4F8", 0.4), fontSize: 11, fontWeight: 500 }}>
                              {ticket.subject}
                            </Typography>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <UserTypeBadge type={tUserType} />
                              <StatusBadge status={ticket.status} />
                            </Stack>
                          </Stack>
                        }
                      />
                      <Typography variant="caption" sx={{ color: alpha("#F0F4F8", 0.3), fontSize: 10, ml: 1, flexShrink: 0 }}>
                        {lastMsg ? getTimeAgo(lastMsg.createdAt) : getTimeAgo(ticket.createdAt)}
                      </Typography>
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          )}
        </Box>

        {/* Ticket detail / Chat area */}
        {!activeTicketId ? (
          <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 1.5, bgcolor: alpha("#0A0F1A", 0.5) }}>
            <Iconify icon="solar:inbox-line-bold-duotone" width={56} sx={{ color: alpha("#F0F4F8", 0.06) }} />
            <Typography variant="h6" sx={{ color: alpha("#F0F4F8", 0.2), fontWeight: 600 }}>
              Select a ticket
            </Typography>
            <Typography variant="body2" sx={{ color: alpha("#F0F4F8", 0.1) }}>
              Choose a support ticket to view conversation
            </Typography>
          </Box>
        ) : (
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", bgcolor: alpha("#0A0F1A", 0.5), minWidth: 0 }}>
            {/* Ticket header */}
            <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${alpha("#FFFFFF", 0.06)}`, bgcolor: alpha("#070D18", 0.4) }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      fontSize: 13,
                      bgcolor: ticketUserType === "DRIVER" ? alpha("#2196F3", 0.15) : alpha("#9C27B0", 0.15),
                      color: ticketUserType === "DRIVER" ? "#64B5F6" : "#CE93D8",
                    }}
                  >
                    {getInitials(ticketUserName)}
                  </Avatar>
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={0.75}>
                      <Typography variant="subtitle2" sx={{ color: "#F0F4F8", fontSize: 14 }}>
                        {ticketUserName}
                      </Typography>
                      <UserTypeBadge type={ticketUserType} />
                      <Typography variant="caption" sx={{ color: alpha("#F0F4F8", 0.4), fontSize: 10, fontWeight: 600 }}>
                        {activeTicket?.ticketNumber}
                      </Typography>
                    </Stack>
                    <Typography variant="caption" sx={{ color: alpha("#F0F4F8", 0.5), fontSize: 12 }}>
                      {activeTicket?.subject}
                    </Typography>
                    {(ticketUser as any)?.phone_number && (
                      <Typography variant="caption" sx={{ color: alpha("#F0F4F8", 0.35), fontSize: 11, display: "block" }}>
                        {(ticketUser as any).phone_number}
                      </Typography>
                    )}
                  </Box>
                </Stack>

                {/* Ticket controls */}
                <Stack direction="row" spacing={1} alignItems="center">
                  {activeTicket?.category && (
                    <Chip
                      icon={<Iconify icon={CATEGORY_CONFIG[activeTicket.category]?.icon || "solar:question-circle-bold"} width={14} />}
                      label={CATEGORY_CONFIG[activeTicket.category]?.label || activeTicket.category}
                      size="small"
                      sx={{
                        height: 24,
                        fontSize: 11,
                        fontWeight: 600,
                        bgcolor: alpha("#FFFFFF", 0.06),
                        color: alpha("#F0F4F8", 0.6),
                        "& .MuiChip-icon": { color: alpha("#F0F4F8", 0.4) },
                      }}
                    />
                  )}

                  <Select
                    size="small"
                    value={activeTicket?.priority || "MEDIUM"}
                    onChange={(e) => updateTicket(activeTicketId!, { priority: e.target.value })}
                    sx={{
                      height: 30,
                      fontSize: 12,
                      color: PRIORITY_CONFIG[activeTicket?.priority || "MEDIUM"]?.color,
                      "& .MuiOutlinedInput-notchedOutline": { borderColor: alpha("#FFFFFF", 0.08) },
                      "& .MuiSvgIcon-root": { color: alpha("#F0F4F8", 0.3) },
                    }}
                  >
                    {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                      <MenuItem key={key} value={key} sx={{ fontSize: 12 }}>
                        <Stack direction="row" alignItems="center" spacing={0.75}>
                          <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: cfg.color }} />
                          <span>{cfg.label}</span>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>

                  <Select
                    size="small"
                    value={activeTicket?.status || "OPEN"}
                    onChange={(e) => updateTicket(activeTicketId!, { status: e.target.value })}
                    sx={{
                      height: 30,
                      fontSize: 12,
                      color: STATUS_CONFIG[activeTicket?.status || "OPEN"]?.color,
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

                  {activeTicket?.status !== "RESOLVED" && activeTicket?.status !== "CLOSED" && (
                    <Tooltip title="Resolve ticket">
                      <IconButton
                        size="small"
                        onClick={() => updateTicket(activeTicketId!, { status: "RESOLVED" })}
                        sx={{
                          bgcolor: alpha("#4CAF50", 0.1),
                          color: "#4CAF50",
                          "&:hover": { bgcolor: alpha("#4CAF50", 0.2) },
                        }}
                      >
                        <Iconify icon="solar:check-circle-bold" width={18} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>
              </Stack>

              {activeTicket?.resolvedAt && (
                <Typography variant="caption" sx={{ color: alpha("#4CAF50", 0.7), fontSize: 10, mt: 0.5, display: "block" }}>
                  Resolved {moment(activeTicket.resolvedAt).format("DD MMM YYYY, HH:mm")}
                </Typography>
              )}
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
                  <MessageBubble key={msg.id || idx} message={msg} isOwn={msg.isAdminReply} />
                ))
              )}
              <div ref={messagesEndRef} />
            </Box>

            {/* Input */}
            <Box sx={{ px: 2, py: 1.5, borderTop: `1px solid ${alpha("#FFFFFF", 0.06)}`, bgcolor: alpha("#070D18", 0.4) }}>
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
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
