"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
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
  Button,
  Stack,
  CircularProgress,
  Badge,
  IconButton,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import { useAuth } from "@/lib/auth-context";
import { useSocket, SOCKET_EVENTS } from "@/lib/socket-context";
import adminAxios from "@/lib/admin-axios";
import Iconify from "@/components/iconify/iconify";
import moment from "moment";

// ── Styled components ──

const RootContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  height: "80vh",
  borderRadius: 16,
  overflow: "hidden",
  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
  backgroundColor: theme.palette.background.default,
}));

const SidebarContainer = styled(Box)(({ theme }) => ({
  width: 320,
  minWidth: 320,
  borderRight: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
  display: "flex",
  flexDirection: "column",
  backgroundColor: theme.palette.background.paper,
}));

const SidebarHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5, 2),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
}));

const ChatArea = styled(Box)({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
});

const ChatHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  backgroundColor: alpha(theme.palette.background.paper, 0.6),
  backdropFilter: "blur(8px)",
}));

const MessagesArea = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: "auto",
  padding: theme.spacing(3),
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
}));

const InputArea = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  borderTop: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  backgroundColor: alpha(theme.palette.background.paper, 0.6),
}));

// ── Helper: extract chat title from participants ──

function getChatTitle(chat: any, currentUserId: string) {
  if (chat.bookingId) return `Booking: ${chat.bookingId.slice(-6)}`;
  const other = chat.participants?.find(
    (p: any) => p.userId !== currentUserId
  )?.user;
  if (other) return `${other.firstName ?? ""} ${other.lastName ?? ""}`.trim();
  return chat.isAdminChat ? "Admin Chat" : "Chat";
}

function getChatAvatar(chat: any, currentUserId: string) {
  const other = chat.participants?.find(
    (p: any) => p.userId !== currentUserId
  )?.user;
  return other?.coverImage ?? null;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ── Message bubble ──

function MessageBubble({
  message,
  isOwn,
}: {
  message: any;
  isOwn: boolean;
}) {
  const senderName = message.sender
    ? `${message.sender.firstName ?? ""} ${message.sender.lastName ?? ""}`.trim()
    : "Unknown";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: isOwn ? "row-reverse" : "row",
        alignItems: "flex-end",
        gap: 1,
      }}
    >
      {!isOwn && (
        <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
          {getInitials(senderName)}
        </Avatar>
      )}
      <Box
        sx={{
          maxWidth: "60%",
          px: 2,
          py: 1.5,
          borderRadius: 2,
          bgcolor: isOwn ? "secondary.main" : (theme: any) => alpha(theme.palette.grey[500], 0.12),
          color: isOwn ? "secondary.contrastText" : "text.primary",
        }}
      >
        {!isOwn && (
          <Typography variant="caption" fontWeight={600} sx={{ display: "block", mb: 0.25 }}>
            {senderName}
          </Typography>
        )}
        {message.content && (
          <Typography variant="body2">{message.content}</Typography>
        )}
        <Typography variant="caption" sx={{ opacity: 0.7, display: "block", textAlign: "right", mt: 0.5 }}>
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
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [loadingList, setLoadingList] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Load chat list
  const loadChatList = useCallback(async () => {
    if (!userId) return;
    setLoadingList(true);
    try {
      const res = await adminAxios.get("/chat?getAdminList=true");
      const chats = (res.data.data || []).map((chat: any) => ({
        ...chat,
        title: getChatTitle(chat, userId),
        avatar: getChatAvatar(chat, userId),
      }));
      setChatList(chats);
    } catch (err) {
      console.error("Failed to load chats:", err);
    } finally {
      setLoadingList(false);
    }
  }, [userId]);

  // Load a specific chat's messages
  const loadChat = useCallback(
    async (chatId: string) => {
      if (!userId) return;
      setLoadingMessages(true);
      try {
        const res = await adminAxios.get(`/chat/${chatId}`);
        const chatData = res.data.data;
        setActiveChat({
          ...chatData,
          title: getChatTitle(chatData, userId),
          avatar: getChatAvatar(chatData, userId),
        });
        setMessages(chatData.messages || []);

        // Mark as read
        await adminAxios.post(`/chat/${chatId}/read`).catch(() => {});
      } catch (err) {
        console.error("Failed to load chat:", err);
      } finally {
        setLoadingMessages(false);
      }
    },
    [userId]
  );

  // Send message
  const handleSend = useCallback(async () => {
    if (!content.trim() || !activeChatId || sending) return;
    setSending(true);
    try {
      const res = await adminAxios.post(`/chat/${activeChatId}`, {
        content: content.trim(),
        attachments: [],
      });
      const newMsg = res.data.data;
      setMessages((prev) => [...prev, newMsg]);
      setContent("");
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  }, [content, activeChatId, sending]);

  // Handle Enter key
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  // Load chats on mount
  useEffect(() => {
    loadChatList();
  }, [loadChatList]);

  // Load messages when active chat changes
  useEffect(() => {
    if (activeChatId) {
      loadChat(activeChatId);
    }
  }, [activeChatId, loadChat]);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Socket events
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data: any) => {
      // Add message to active chat if it matches
      if (data?.chatId === activeChatId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.id)) return prev;
          return [...prev, data];
        });
      }

      // Update chat list: move chat to top / update unread
      setChatList((prev) =>
        prev.map((c) =>
          c.id === data?.chatId ? { ...c, lastMessage: data } : c
        )
      );
    };

    const handleNewChat = (data: any) => {
      if (!userId) return;
      const enriched = {
        ...data,
        title: getChatTitle(data, userId),
        avatar: getChatAvatar(data, userId),
      };
      setChatList((prev) => [enriched, ...prev]);
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

  const activeChatTitle = activeChat?.title || "";

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Support Chat
      </Typography>

      <RootContainer>
        {/* Sidebar */}
        <SidebarContainer>
          <SidebarHeader>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h6">Conversations</Typography>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: connected ? "success.main" : "error.main",
                  }}
                />
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {connected ? "Online" : "Offline"}
                </Typography>
              </Stack>
            </Stack>
          </SidebarHeader>

          {loadingList ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress size={28} />
            </Box>
          ) : chatList.length === 0 ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                No conversations yet
              </Typography>
            </Box>
          ) : (
            <List sx={{ overflowY: "auto", flex: 1 }}>
              {chatList.map((chat) => (
                <ListItem key={chat.id} disablePadding>
                  <ListItemButton
                    selected={chat.id === activeChatId}
                    onClick={() => setActiveChatId(chat.id)}
                    sx={{
                      py: 1.5,
                      px: 2,
                      "&.Mui-selected": {
                        bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.08),
                        borderRight: (theme) => `2px solid ${theme.palette.secondary.main}`,
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar src={chat.avatar ?? undefined}>
                        {getInitials(chat.title || "?")}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={chat.title}
                      primaryTypographyProps={{
                        noWrap: true,
                        variant: "subtitle2",
                      }}
                      secondary={chat.lastMessage?.content || ""}
                      secondaryTypographyProps={{
                        noWrap: true,
                        variant: "caption",
                      }}
                    />
                    {chat.unreadCount > 0 && (
                      <Badge badgeContent={chat.unreadCount} color="error" />
                    )}
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </SidebarContainer>

        {/* Chat Area */}
        {!activeChatId ? (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Iconify
              icon="solar:chat-round-dots-bold-duotone"
              width={64}
              sx={{ color: "text.disabled" }}
            />
            <Typography variant="h6" sx={{ color: "text.secondary" }}>
              Select a conversation
            </Typography>
            <Typography variant="body2" sx={{ color: "text.disabled" }}>
              Choose from the list on the left to start chatting
            </Typography>
          </Box>
        ) : (
          <ChatArea>
            <ChatHeader>
              <Avatar src={activeChat?.avatar ?? undefined}>
                {getInitials(activeChatTitle || "?")}
              </Avatar>
              <Box>
                <Typography variant="subtitle1">{activeChatTitle}</Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {activeChat?.isAdminChat ? "Admin Support" : "User Chat"}
                </Typography>
              </Box>
            </ChatHeader>

            <MessagesArea>
              {loadingMessages ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                  <CircularProgress size={28} />
                </Box>
              ) : messages.length === 0 ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    No messages yet. Start the conversation!
                  </Typography>
                </Box>
              ) : (
                messages.map((msg, idx) => (
                  <MessageBubble
                    key={msg.id || idx}
                    message={msg}
                    isOwn={msg.senderId === userId}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </MessagesArea>

            <InputArea>
              <TextField
                fullWidth
                size="small"
                placeholder="Type a message..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                  },
                }}
              />
              <IconButton
                color="secondary"
                onClick={handleSend}
                disabled={!content.trim() || sending}
                sx={{
                  bgcolor: "secondary.main",
                  color: "secondary.contrastText",
                  "&:hover": { bgcolor: "secondary.dark" },
                  "&.Mui-disabled": {
                    bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.3),
                  },
                  width: 44,
                  height: 44,
                }}
              >
                {sending ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <Iconify icon="solar:plain-bold" width={22} />
                )}
              </IconButton>
            </InputArea>
          </ChatArea>
        )}
      </RootContainer>
    </Box>
  );
}
