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
  Badge,
  IconButton,
  Chip,
  Select,
  MenuItem,
  Divider,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useAuth } from "@/lib/auth-context";
import { useSocket, SOCKET_EVENTS } from "@/lib/socket-context";
import adminAxios from "@/lib/admin-axios";
import Iconify from "@/components/iconify/iconify";
import moment from "moment";

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

// ── Helpers ──

function getUserType(user: any): "DRIVER" | "RIDER" {
  return user?.mode === "DRIVER" ? "DRIVER" : "RIDER";
}

function getChatContact(chat: any) {
  const participant = chat.participants?.[0];
  const user = participant?.user;
  if (!user) return { name: "Unknown User", type: "RIDER" as const, avatar: null };
  const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "Unknown";
  return { name, type: getUserType(user), avatar: user.coverImage ?? null, phone: user.phone_number };
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

function MessageBubble({ message, isOwn }: { message: any; isOwn: boolean }) {
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
            <Typography variant="caption" fontWeight={700} sx={{ color: senderType === "DRIVER" ? "#64B5F6" : "#CE93D8" }}>
              {senderName}
            </Typography>
            {senderType && (
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

  const [chatList, setChatList] = useState<any[]>([]);
  const [filteredChats, setFilteredChats] = useState<any[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
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

  // Filter chats by search and status
  useEffect(() => {
    let filtered = chatList;
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((c) => (c.ticketStatus || "OPEN") === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((c) => {
        const contact = getChatContact(c);
        return contact.name.toLowerCase().includes(q) || contact.type.toLowerCase().includes(q);
      });
    }
    setFilteredChats(filtered);
  }, [chatList, statusFilter, searchQuery]);

  // Load chat list
  const loadChatList = useCallback(async () => {
    if (!userId) return;
    setLoadingList(true);
    try {
      const res = await adminAxios.get("/chat?getAdminList=true");
      setChatList(res.data.data || []);
    } catch (err) {
      console.error("Failed to load chats:", err);
    } finally {
      setLoadingList(false);
    }
  }, [userId]);

  // Load a specific chat's messages
  const loadChat = useCallback(async (chatId: string) => {
    if (!userId) return;
    setLoadingMessages(true);
    try {
      const res = await adminAxios.get(`/chat/${chatId}`);
      const chatData = res.data.data;
      setActiveChat(chatData);
      setMessages(chatData.messages || []);
      await adminAxios.post(`/chat/${chatId}/read`).catch(() => {});
    } catch (err) {
      console.error("Failed to load chat:", err);
    } finally {
      setLoadingMessages(false);
    }
  }, [userId]);

  // Update ticket status/priority
  const updateTicket = useCallback(async (chatId: string, updates: { ticketStatus?: string; ticketPriority?: string }) => {
    try {
      const res = await adminAxios.patch(`/chat/${chatId}/ticket`, updates);
      const updated = res.data.data;
      setActiveChat((prev: any) => (prev?.id === chatId ? { ...prev, ...updated } : prev));
      setChatList((prev) => prev.map((c) => (c.id === chatId ? { ...c, ...updated } : c)));
    } catch (err) {
      console.error("Failed to update ticket:", err);
    }
  }, []);

  // Send message
  const handleSend = useCallback(async () => {
    if (!content.trim() || !activeChatId || sending) return;
    setSending(true);
    try {
      const res = await adminAxios.post(`/chat/${activeChatId}`, { content: content.trim(), attachments: [] });
      setMessages((prev) => [...prev, res.data.data]);
      setContent("");
    } catch (err) {
      console.error("Failed to send:", err);
    } finally {
      setSending(false);
    }
  }, [content, activeChatId, sending]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  useEffect(() => { loadChatList(); }, [loadChatList]);
  useEffect(() => { if (activeChatId) loadChat(activeChatId); }, [activeChatId, loadChat]);
  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  // Socket events
  useEffect(() => {
    if (!socket) return;
    const handleNewMessage = (data: any) => {
      if (data?.chatId === activeChatId) {
        setMessages((prev) => (prev.some((m) => m.id === data.id) ? prev : [...prev, data]));
      }
      setChatList((prev) =>
        prev.map((c) => (c.id === data?.chatId ? { ...c, messages: [data] } : c))
      );
    };
    const handleNewChat = (data: any) => {
      if (data?.isAdminChat) setChatList((prev) => [data, ...prev]);
    };
    const handleChatDeleted = (data: any) => {
      setChatList((prev) => prev.filter((c) => c.id !== data?.chatId));
      if (activeChatId === data?.chatId) {
        setActiveChatId(null);
        setActiveChat(null);
        setMessages([]);
      }
    };
    socket.on(SOCKET_EVENTS.MESSAGE_RECEIVED_EVENT, handleNewMessage);
    socket.on(SOCKET_EVENTS.NEW_CHAT_EVENT, handleNewChat);
    socket.on(SOCKET_EVENTS.CHAT_DELETE_EVENT, handleChatDeleted);
    return () => {
      socket.off(SOCKET_EVENTS.MESSAGE_RECEIVED_EVENT, handleNewMessage);
      socket.off(SOCKET_EVENTS.NEW_CHAT_EVENT, handleNewChat);
      socket.off(SOCKET_EVENTS.CHAT_DELETE_EVENT, handleChatDeleted);
    };
  }, [socket, activeChatId, userId]);

  // Status counts
  const statusCounts = chatList.reduce((acc, c) => {
    const s = c.ticketStatus || "OPEN";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const contact = activeChat ? getChatContact(activeChat) : null;

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
            label={chatList.length}
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
        {[{ key: "ALL", label: "All", count: chatList.length }, ...Object.entries(STATUS_CONFIG).map(([key, cfg]) => ({ key, label: cfg.label, count: statusCounts[key] || 0 }))].map((tab) => (
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
        {/* Sidebar */}
        <Box sx={{ width: 340, minWidth: 340, borderRight: `1px solid ${alpha("#FFFFFF", 0.06)}`, display: "flex", flexDirection: "column", bgcolor: alpha("#070D18", 0.6) }}>
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

          {/* Chat list */}
          {loadingList ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress size={24} sx={{ color: "#00E676" }} />
            </Box>
          ) : filteredChats.length === 0 ? (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Iconify icon="solar:inbox-line-bold-duotone" width={40} sx={{ color: alpha("#F0F4F8", 0.1), mb: 1 }} />
              <Typography variant="body2" sx={{ color: alpha("#F0F4F8", 0.3), fontSize: 13 }}>
                No tickets found
              </Typography>
            </Box>
          ) : (
            <List sx={{ overflowY: "auto", flex: 1, py: 0 }}>
              {filteredChats.map((chat) => {
                const chatContact = getChatContact(chat);
                const lastMsg = chat.messages?.[0];
                const status = chat.ticketStatus || "OPEN";
                const priority = chat.ticketPriority || "MEDIUM";

                return (
                  <ListItem key={chat.id} disablePadding>
                    <ListItemButton
                      selected={chat.id === activeChatId}
                      onClick={() => setActiveChatId(chat.id)}
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
                          src={chatContact.avatar ?? undefined}
                          sx={{
                            width: 36,
                            height: 36,
                            fontSize: 13,
                            bgcolor: chatContact.type === "DRIVER" ? alpha("#2196F3", 0.15) : alpha("#9C27B0", 0.15),
                            color: chatContact.type === "DRIVER" ? "#64B5F6" : "#CE93D8",
                          }}
                        >
                          {getInitials(chatContact.name)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <Typography variant="subtitle2" noWrap sx={{ color: "#F0F4F8", fontSize: 13, flex: 1 }}>
                              {chatContact.name}
                            </Typography>
                            <PriorityDot priority={priority} />
                          </Stack>
                        }
                        secondary={
                          <Stack spacing={0.25}>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <UserTypeBadge type={chatContact.type} />
                              <StatusBadge status={status} />
                            </Stack>
                            {lastMsg && (
                              <Typography variant="caption" noWrap sx={{ color: alpha("#F0F4F8", 0.35), fontSize: 11 }}>
                                {lastMsg.content || "Attachment"}
                              </Typography>
                            )}
                          </Stack>
                        }
                      />
                      <Typography variant="caption" sx={{ color: alpha("#F0F4F8", 0.3), fontSize: 10, ml: 1, flexShrink: 0 }}>
                        {lastMsg ? getTimeAgo(lastMsg.createdAt) : getTimeAgo(chat.createdAt)}
                      </Typography>
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          )}
        </Box>

        {/* Chat area */}
        {!activeChatId ? (
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
            {/* Chat header with ticket controls */}
            <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${alpha("#FFFFFF", 0.06)}`, bgcolor: alpha("#070D18", 0.4) }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      fontSize: 13,
                      bgcolor: contact?.type === "DRIVER" ? alpha("#2196F3", 0.15) : alpha("#9C27B0", 0.15),
                      color: contact?.type === "DRIVER" ? "#64B5F6" : "#CE93D8",
                    }}
                  >
                    {getInitials(contact?.name || "?")}
                  </Avatar>
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={0.75}>
                      <Typography variant="subtitle2" sx={{ color: "#F0F4F8", fontSize: 14 }}>
                        {contact?.name}
                      </Typography>
                      <UserTypeBadge type={contact?.type || "RIDER"} />
                    </Stack>
                    {contact?.phone && (
                      <Typography variant="caption" sx={{ color: alpha("#F0F4F8", 0.35), fontSize: 11 }}>
                        {contact.phone}
                      </Typography>
                    )}
                  </Box>
                </Stack>

                {/* Ticket controls */}
                <Stack direction="row" spacing={1} alignItems="center">
                  <Select
                    size="small"
                    value={activeChat?.ticketPriority || "MEDIUM"}
                    onChange={(e) => updateTicket(activeChatId!, { ticketPriority: e.target.value })}
                    sx={{
                      height: 30,
                      fontSize: 12,
                      color: PRIORITY_CONFIG[activeChat?.ticketPriority || "MEDIUM"]?.color,
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
                    value={activeChat?.ticketStatus || "OPEN"}
                    onChange={(e) => updateTicket(activeChatId!, { ticketStatus: e.target.value })}
                    sx={{
                      height: 30,
                      fontSize: 12,
                      color: STATUS_CONFIG[activeChat?.ticketStatus || "OPEN"]?.color,
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

                  {(activeChat?.ticketStatus || "OPEN") !== "RESOLVED" && (activeChat?.ticketStatus || "OPEN") !== "CLOSED" && (
                    <Tooltip title="Resolve ticket">
                      <IconButton
                        size="small"
                        onClick={() => updateTicket(activeChatId!, { ticketStatus: "RESOLVED" })}
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

              {activeChat?.resolvedAt && (
                <Typography variant="caption" sx={{ color: alpha("#4CAF50", 0.7), fontSize: 10, mt: 0.5, display: "block" }}>
                  Resolved {moment(activeChat.resolvedAt).format("DD MMM YYYY, HH:mm")}
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
                  <MessageBubble key={msg.id || idx} message={msg} isOwn={msg.senderId === userId} />
                ))
              )}
              <div ref={messagesEndRef} />
            </Box>

            {/* Input */}
            <Box sx={{ px: 2, py: 1.5, borderTop: `1px solid ${alpha("#FFFFFF", 0.06)}`, display: "flex", gap: 1, alignItems: "center" }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Type a reply..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    bgcolor: alpha("#FFFFFF", 0.03),
                    "& fieldset": { borderColor: alpha("#FFFFFF", 0.06) },
                    "&:hover fieldset": { borderColor: alpha("#FFFFFF", 0.12) },
                    "&.Mui-focused fieldset": { borderColor: alpha("#00E676", 0.3) },
                  },
                  "& input": { fontSize: 13, color: "#F0F4F8" },
                }}
              />
              <IconButton
                onClick={handleSend}
                disabled={!content.trim() || sending}
                sx={{
                  bgcolor: "#00E676",
                  color: "#0A0F1A",
                  width: 38,
                  height: 38,
                  "&:hover": { bgcolor: "#00C853" },
                  "&.Mui-disabled": { bgcolor: alpha("#00E676", 0.2), color: alpha("#0A0F1A", 0.3) },
                }}
              >
                {sending ? <CircularProgress size={18} color="inherit" /> : <Iconify icon="solar:plain-bold" width={18} />}
              </IconButton>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
