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
  InputAdornment,
  Tab,
  Tabs,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useAuth } from "@/lib/auth-context";
import { useSocket, SOCKET_EVENTS } from "@/lib/socket-context";
import adminAxios from "@/lib/admin-axios";
import Iconify from "@/components/iconify/iconify";
import moment from "moment";

const S3_BASE = "https://psslrscab-storage-bucket4439f-dev.s3.eu-west-1.amazonaws.com/public";

function resolveAvatar(img: string | null | undefined): string | undefined {
  if (!img) return undefined;
  if (img.startsWith("http")) return img;
  if (img.includes("/")) return img;
  return `${S3_BASE}/${img}`;
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

// ── Types ──

interface UserItem {
  id: string;
  firstName: string;
  lastName: string;
  coverImage?: string;
  mode: string;
  phone_number?: string;
  emailAddress?: string;
  status?: string;
}

interface ChatItem {
  id: string;
  title: string;
  image?: string;
  isAdminChat: boolean;
  participants: Array<{ userId: string; user: UserItem }>;
  messages: Array<{ content: string; createdAt: string; senderId: string }>;
  updatedAt: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  sender: { firstName: string; lastName: string };
  content: string;
  attachments: string[];
  createdAt: string;
}

export default function AdminDirectMessages() {
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const userId = user?.id;

  // State for user list (right panel for picking users)
  const [allUsers, setAllUsers] = useState<UserItem[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [userFilter, setUserFilter] = useState<"ALL" | "DRIVER" | "PASSENGER">("ALL");

  // State for active chats list
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);

  // Active chat state
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeMessages, setActiveMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [activeChatUser, setActiveChatUser] = useState<UserItem | null>(null);

  // Message input
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  // View mode: 'chats' or 'users'
  const [sidebarView, setSidebarView] = useState<"chats" | "users">("chats");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Load all users
  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await adminAxios.get("/admin/passengers/all");
      setAllUsers(res.data.data || []);
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  // Load admin chat list
  const loadChats = useCallback(async () => {
    if (!userId) return;
    setLoadingChats(true);
    try {
      const res = await adminAxios.get("/chat?getAdminList=true");
      const chatList = (res.data.data || []).map((chat: any) => {
        const otherParticipant = chat.participants?.find((p: any) => p.userId !== userId)?.user;
        return {
          ...chat,
          title: otherParticipant
            ? `${otherParticipant.firstName || ""} ${otherParticipant.lastName || ""}`.trim()
            : "Unknown",
          image: otherParticipant?.coverImage,
        };
      });
      setChats(chatList);
    } catch (err) {
      console.error("Failed to load chats:", err);
    } finally {
      setLoadingChats(false);
    }
  }, [userId]);

  // Open/create chat with a user
  const openChatWithUser = useCallback(async (targetUser: UserItem) => {
    try {
      setLoadingMessages(true);
      setActiveChatUser(targetUser);
      setSidebarView("chats");

      const res = await adminAxios.get(`/chat/one-on-one-admin?userId=${targetUser.id}`);
      const chatId = res.data.data?.id;
      if (chatId) {
        setActiveChatId(chatId);
        // Reload chats to include the new one
        loadChats();
      }
    } catch (err) {
      console.error("Failed to open chat:", err);
    } finally {
      setLoadingMessages(false);
    }
  }, [loadChats]);

  // Load chat messages
  const loadMessages = useCallback(async (chatId: string) => {
    setLoadingMessages(true);
    try {
      const res = await adminAxios.get(`/chat/${chatId}`);
      const chatData = res.data.data;
      setActiveMessages(chatData?.messages || []);
      // Set active user from participants
      const otherUser = chatData?.participants?.find((p: any) => p.userId !== userId)?.user;
      if (otherUser) setActiveChatUser(otherUser);
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  }, [userId]);

  // Send message
  const handleSend = useCallback(async () => {
    if (!content.trim() || !activeChatId || sending) return;
    setSending(true);
    try {
      const res = await adminAxios.post(`/chat/${activeChatId}`, { content: content.trim(), attachments: [] });
      const newMsg = res.data.data;
      setActiveMessages((prev) => [...prev, newMsg]);
      setContent("");
      // Update last message in chat list
      setChats((prev) =>
        prev.map((c) => (c.id === activeChatId ? { ...c, messages: [newMsg] } : c))
      );
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

  // Load initial data
  useEffect(() => { loadChats(); loadUsers(); }, [loadChats, loadUsers]);
  useEffect(() => { if (activeChatId) loadMessages(activeChatId); }, [activeChatId, loadMessages]);
  useEffect(() => { scrollToBottom(); }, [activeMessages, scrollToBottom]);

  // Mark chat as read
  useEffect(() => {
    if (activeChatId) {
      adminAxios.post(`/chat/${activeChatId}/read`).catch(() => {});
    }
  }, [activeChatId]);

  // Socket events
  useEffect(() => {
    if (!socket) return;
    const handleNewMessage = (data: any) => {
      if (data?.chatId === activeChatId) {
        setActiveMessages((prev) => (prev.some((m) => m.id === data.id) ? prev : [...prev, data]));
      }
      setChats((prev) =>
        prev.map((c) => (c.id === data?.chatId ? { ...c, messages: [data] } : c))
      );
    };
    const handleNewChat = (data: any) => {
      setChats((prev) => (prev.some((c) => c.id === data.id) ? prev : [data, ...prev]));
    };
    socket.on(SOCKET_EVENTS.MESSAGE_RECEIVED_EVENT, handleNewMessage);
    socket.on(SOCKET_EVENTS.NEW_CHAT_EVENT, handleNewChat);
    return () => {
      socket.off(SOCKET_EVENTS.MESSAGE_RECEIVED_EVENT, handleNewMessage);
      socket.off(SOCKET_EVENTS.NEW_CHAT_EVENT, handleNewChat);
    };
  }, [socket, activeChatId]);

  // Filter users
  const filteredUsers = allUsers.filter((u) => {
    if (userFilter !== "ALL" && u.mode !== userFilter) return false;
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase();
      const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
      return fullName.includes(q) || u.phone_number?.includes(q) || u.emailAddress?.toLowerCase().includes(q);
    }
    return true;
  });

  const chatUserName = activeChatUser
    ? `${activeChatUser.firstName || ""} ${activeChatUser.lastName || ""}`.trim()
    : "Select a user";

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", gap: 1.5 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Iconify icon="solar:chat-line-bold-duotone" width={28} sx={{ color: "#00E676" }} />
          <Typography variant="h5" fontWeight={700} sx={{ color: "#F0F4F8" }}>
            Direct Messages
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
      <Box sx={{ flex: 1, display: "flex", borderRadius: 2, overflow: "hidden", border: `1px solid ${alpha("#FFFFFF", 0.06)}`, minHeight: 0 }}>

        {/* Sidebar */}
        <Box sx={{ width: 360, minWidth: 360, borderRight: `1px solid ${alpha("#FFFFFF", 0.06)}`, display: "flex", flexDirection: "column", bgcolor: alpha("#070D18", 0.6) }}>
          {/* Sidebar tabs */}
          <Tabs
            value={sidebarView}
            onChange={(_, v) => setSidebarView(v)}
            sx={{
              minHeight: 40,
              borderBottom: `1px solid ${alpha("#FFFFFF", 0.06)}`,
              "& .MuiTab-root": { minHeight: 40, fontSize: 12, fontWeight: 600, color: alpha("#F0F4F8", 0.5) },
              "& .Mui-selected": { color: "#00E676 !important" },
              "& .MuiTabs-indicator": { bgcolor: "#00E676" },
            }}
          >
            <Tab label="Chats" value="chats" />
            <Tab label="All Users" value="users" />
          </Tabs>

          {sidebarView === "chats" ? (
            <>
              {loadingChats ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                  <CircularProgress size={24} sx={{ color: "#00E676" }} />
                </Box>
              ) : chats.length === 0 ? (
                <Box sx={{ p: 3, textAlign: "center" }}>
                  <Iconify icon="solar:chat-dots-bold-duotone" width={40} sx={{ color: alpha("#F0F4F8", 0.1), mb: 1 }} />
                  <Typography variant="body2" sx={{ color: alpha("#F0F4F8", 0.3), fontSize: 13 }}>
                    No conversations yet
                  </Typography>
                  <Typography
                    variant="caption"
                    onClick={() => setSidebarView("users")}
                    sx={{ color: "#00E676", cursor: "pointer", fontSize: 12, mt: 1, display: "block", "&:hover": { textDecoration: "underline" } }}
                  >
                    Start a conversation →
                  </Typography>
                </Box>
              ) : (
                <List sx={{ overflowY: "auto", flex: 1, py: 0 }}>
                  {chats.map((chat) => {
                    const otherUser = chat.participants?.find((p) => p.userId !== userId)?.user;
                    const lastMsg = chat.messages?.[chat.messages.length - 1];
                    const userMode = otherUser?.mode || "PASSENGER";

                    return (
                      <ListItem key={chat.id} disablePadding>
                        <ListItemButton
                          selected={chat.id === activeChatId}
                          onClick={() => {
                            setActiveChatId(chat.id);
                            if (otherUser) setActiveChatUser(otherUser);
                          }}
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
                              src={resolveAvatar(otherUser?.coverImage)}
                              sx={{
                                width: 36,
                                height: 36,
                                fontSize: 13,
                                bgcolor: userMode === "DRIVER" ? alpha("#2196F3", 0.15) : alpha("#9C27B0", 0.15),
                                color: userMode === "DRIVER" ? "#64B5F6" : "#CE93D8",
                              }}
                            >
                              {getInitials(chat.title || "U")}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Stack direction="row" alignItems="center" spacing={0.5}>
                                <Typography variant="subtitle2" noWrap sx={{ color: "#F0F4F8", fontSize: 13, flex: 1 }}>
                                  {chat.title}
                                </Typography>
                                <Chip
                                  label={userMode === "DRIVER" ? "Driver" : "Rider"}
                                  size="small"
                                  sx={{
                                    height: 16,
                                    fontSize: 9,
                                    fontWeight: 700,
                                    bgcolor: userMode === "DRIVER" ? alpha("#2196F3", 0.12) : alpha("#9C27B0", 0.12),
                                    color: userMode === "DRIVER" ? "#2196F3" : "#9C27B0",
                                  }}
                                />
                              </Stack>
                            }
                            secondary={
                              <Typography variant="caption" noWrap sx={{ color: alpha("#F0F4F8", 0.4), fontSize: 11 }}>
                                {lastMsg?.content || "No messages"}
                              </Typography>
                            }
                          />
                          {lastMsg && (
                            <Typography variant="caption" sx={{ color: alpha("#F0F4F8", 0.3), fontSize: 10, ml: 1, flexShrink: 0 }}>
                              {getTimeAgo(lastMsg.createdAt)}
                            </Typography>
                          )}
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </>
          ) : (
            /* Users list */
            <>
              <Box sx={{ p: 1.5 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
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
                <Stack direction="row" spacing={0.5} sx={{ mt: 1 }}>
                  {(["ALL", "DRIVER", "PASSENGER"] as const).map((f) => (
                    <Box
                      key={f}
                      onClick={() => setUserFilter(f)}
                      sx={{
                        px: 1.5,
                        py: 0.25,
                        borderRadius: 1,
                        cursor: "pointer",
                        fontSize: 11,
                        fontWeight: 600,
                        bgcolor: userFilter === f ? alpha("#00E676", 0.12) : alpha("#FFFFFF", 0.03),
                        color: userFilter === f ? "#00E676" : alpha("#F0F4F8", 0.5),
                        border: `1px solid ${userFilter === f ? alpha("#00E676", 0.3) : "transparent"}`,
                        "&:hover": { bgcolor: alpha("#FFFFFF", 0.06) },
                      }}
                    >
                      {f === "ALL" ? "All" : f === "DRIVER" ? "Drivers" : "Riders"}
                    </Box>
                  ))}
                </Stack>
              </Box>

              {loadingUsers ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                  <CircularProgress size={24} sx={{ color: "#00E676" }} />
                </Box>
              ) : (
                <List sx={{ overflowY: "auto", flex: 1, py: 0 }}>
                  {filteredUsers.map((u) => {
                    const fullName = `${u.firstName} ${u.lastName}`.trim();
                    const isDriver = u.mode === "DRIVER";
                    return (
                      <ListItem key={u.id} disablePadding>
                        <ListItemButton
                          onClick={() => openChatWithUser(u)}
                          sx={{
                            py: 1,
                            px: 2,
                            borderBottom: `1px solid ${alpha("#FFFFFF", 0.03)}`,
                            "&:hover": { bgcolor: alpha("#FFFFFF", 0.03) },
                          }}
                        >
                          <ListItemAvatar sx={{ minWidth: 40 }}>
                            <Avatar
                              src={resolveAvatar(u.coverImage)}
                              sx={{
                                width: 32,
                                height: 32,
                                fontSize: 12,
                                bgcolor: isDriver ? alpha("#2196F3", 0.15) : alpha("#9C27B0", 0.15),
                                color: isDriver ? "#64B5F6" : "#CE93D8",
                              }}
                            >
                              {getInitials(fullName)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Stack direction="row" alignItems="center" spacing={0.5}>
                                <Typography variant="body2" noWrap sx={{ color: "#F0F4F8", fontSize: 13, flex: 1 }}>
                                  {fullName}
                                </Typography>
                                <Chip
                                  label={isDriver ? "Driver" : "Rider"}
                                  size="small"
                                  sx={{
                                    height: 16,
                                    fontSize: 9,
                                    fontWeight: 700,
                                    bgcolor: isDriver ? alpha("#2196F3", 0.12) : alpha("#9C27B0", 0.12),
                                    color: isDriver ? "#2196F3" : "#9C27B0",
                                  }}
                                />
                              </Stack>
                            }
                            secondary={
                              <Typography variant="caption" sx={{ color: alpha("#F0F4F8", 0.4), fontSize: 11 }}>
                                {u.phone_number || u.emailAddress || ""}
                              </Typography>
                            }
                          />
                          <Iconify icon="solar:arrow-right-linear" width={16} sx={{ color: alpha("#F0F4F8", 0.2), ml: 1 }} />
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                  {filteredUsers.length === 0 && (
                    <Box sx={{ p: 3, textAlign: "center" }}>
                      <Typography variant="body2" sx={{ color: alpha("#F0F4F8", 0.3), fontSize: 13 }}>
                        No users found
                      </Typography>
                    </Box>
                  )}
                </List>
              )}
            </>
          )}
        </Box>

        {/* Chat area */}
        {!activeChatId ? (
          <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 1.5, bgcolor: alpha("#0A0F1A", 0.5) }}>
            <Iconify icon="solar:chat-line-bold-duotone" width={56} sx={{ color: alpha("#F0F4F8", 0.06) }} />
            <Typography variant="h6" sx={{ color: alpha("#F0F4F8", 0.2), fontWeight: 600 }}>
              Start a conversation
            </Typography>
            <Typography variant="body2" sx={{ color: alpha("#F0F4F8", 0.1) }}>
              Pick a user from the &quot;All Users&quot; tab or select an existing chat
            </Typography>
          </Box>
        ) : (
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", bgcolor: alpha("#0A0F1A", 0.5), minWidth: 0 }}>
            {/* Chat header */}
            <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${alpha("#FFFFFF", 0.06)}`, bgcolor: alpha("#070D18", 0.4) }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Avatar
                  src={resolveAvatar(activeChatUser?.coverImage)}
                  sx={{
                    width: 36,
                    height: 36,
                    fontSize: 13,
                    bgcolor: activeChatUser?.mode === "DRIVER" ? alpha("#2196F3", 0.15) : alpha("#9C27B0", 0.15),
                    color: activeChatUser?.mode === "DRIVER" ? "#64B5F6" : "#CE93D8",
                  }}
                >
                  {getInitials(chatUserName)}
                </Avatar>
                <Box>
                  <Stack direction="row" alignItems="center" spacing={0.75}>
                    <Typography variant="subtitle2" sx={{ color: "#F0F4F8", fontSize: 14 }}>
                      {chatUserName}
                    </Typography>
                    {activeChatUser && (
                      <Chip
                        label={activeChatUser.mode === "DRIVER" ? "Driver" : "Rider"}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: 10,
                          fontWeight: 700,
                          bgcolor: activeChatUser.mode === "DRIVER" ? alpha("#2196F3", 0.12) : alpha("#9C27B0", 0.12),
                          color: activeChatUser.mode === "DRIVER" ? "#2196F3" : "#9C27B0",
                        }}
                      />
                    )}
                  </Stack>
                  {activeChatUser?.phone_number && (
                    <Typography variant="caption" sx={{ color: alpha("#F0F4F8", 0.35), fontSize: 11 }}>
                      {activeChatUser.phone_number}
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Box>

            {/* Messages area */}
            <Box sx={{ flex: 1, overflowY: "auto", px: 2.5, py: 2, display: "flex", flexDirection: "column", gap: 1 }}>
              {loadingMessages ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                  <CircularProgress size={24} sx={{ color: "#00E676" }} />
                </Box>
              ) : activeMessages.length === 0 ? (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1 }}>
                  <Typography variant="body2" sx={{ color: alpha("#F0F4F8", 0.2) }}>
                    No messages yet — start the conversation
                  </Typography>
                </Box>
              ) : (
                activeMessages.map((msg, idx) => {
                  const isOwn = msg.senderId === userId;
                  const senderName = msg.sender ? `${msg.sender.firstName || ""} ${msg.sender.lastName || ""}`.trim() : "Unknown";
                  return (
                    <Box key={msg.id || idx} sx={{ display: "flex", flexDirection: isOwn ? "row-reverse" : "row", alignItems: "flex-end", gap: 1 }}>
                      {!isOwn && (
                        <Avatar sx={{ width: 28, height: 28, fontSize: 11, bgcolor: alpha("#9C27B0", 0.15), color: "#CE93D8" }}>
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
                          <Typography variant="caption" fontWeight={700} sx={{ color: "#CE93D8", mb: 0.25, display: "block" }}>
                            {senderName}
                          </Typography>
                        )}
                        {msg.content && (
                          <Typography variant="body2" sx={{ fontSize: 13, lineHeight: 1.5 }}>
                            {msg.content}
                          </Typography>
                        )}
                        <Typography variant="caption" sx={{ opacity: 0.5, display: "block", textAlign: "right", mt: 0.25, fontSize: 10 }}>
                          {moment(msg.createdAt).format("HH:mm")}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })
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
                  placeholder="Type your message..."
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
