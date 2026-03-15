'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { useRequireAuth } from '@/lib/use-require-auth';
import { chatApi } from '@/lib/services/chat';
import { useSocket, SOCKET_EVENTS } from '@/lib/socket-context';
import type { Chat, ChatMessage } from '@/lib/types';
import {
  MessageSquare,
  Send,
  ArrowLeft,
  Search,
  CheckCheck,
  User,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ── helpers ── */
function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return d.toLocaleDateString('en-GB', { weekday: 'long' });
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function getOtherParticipant(chat: Chat, userId: string) {
  const other = chat.participants.find(p => p.userId !== userId);
  if (other?.user) {
    return {
      name: `${other.user.firstName} ${other.user.lastName}`.trim(),
      id: other.userId,
    };
  }
  return { name: 'Unknown User', id: other?.userId || '' };
}

function getLastMessage(chat: Chat): string {
  if (!chat.messages || chat.messages.length === 0) return 'No messages yet';
  const last = chat.messages[chat.messages.length - 1];
  return last.content || (last.attachments?.length > 0 ? '📎 Attachment' : 'No messages yet');
}

function getLastMessageTime(chat: Chat): string {
  if (!chat.messages || chat.messages.length === 0) return '';
  const last = chat.messages[chat.messages.length - 1];
  return formatDate(last.createdAt);
}

/* ── types for grouping messages by date ── */
interface MessageGroup {
  date: string;
  messages: ChatMessage[];
}

function groupMessagesByDate(messages: ChatMessage[]): MessageGroup[] {
  const groups: MessageGroup[] = [];
  let currentDate = '';
  messages.forEach(msg => {
    const date = formatDate(msg.createdAt);
    if (date !== currentDate) {
      currentDate = date;
      groups.push({ date, messages: [msg] });
    } else {
      groups[groups.length - 1].messages.push(msg);
    }
  });
  return groups;
}

export default function RiderChatPage() {
  const { user } = useRequireAuth();
  const { socket, setUnreadChats } = useSocket();
  const searchParams = useSearchParams();
  const chatIdFromUrl = searchParams.get('chatId');

  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileList, setShowMobileList] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Fetch all chats
  const fetchChats = useCallback(async () => {
    try {
      const data = await chatApi.getAll();
      const list = Array.isArray(data) ? data : [];
      setChats(list);
    } catch {
      // empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchChats(); }, [fetchChats]);

  // Auto-open chat when navigated with ?chatId=
  useEffect(() => {
    if (!chatIdFromUrl || loading) return;
    const match = chats.find(c => c.id === chatIdFromUrl);
    if (match && activeChat?.id !== chatIdFromUrl) {
      openChat(match);
    } else if (!match) {
      chatApi.getById(chatIdFromUrl).then(chat => {
        if (chat) {
          setChats(prev => [chat, ...prev]);
          openChat(chat);
        }
      }).catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatIdFromUrl, chats, loading]);

  // Open a chat and load its messages
  const openChat = useCallback(async (chat: Chat) => {
    setActiveChat(chat);
    setShowMobileList(false);
    setLoadingMessages(true);
    try {
      const full = await chatApi.getById(chat.id);
      setMessages(full.messages || []);
      // Mark as read
      await chatApi.markAsRead(chat.id);
      setUnreadChats(prev => Math.max(0, prev - 1));
    } catch {
      setMessages(chat.messages || []);
    } finally {
      setLoadingMessages(false);
      setTimeout(scrollToBottom, 100);
    }
  }, [scrollToBottom, setUnreadChats]);

  // Send message
  const handleSend = useCallback(async () => {
    if (!activeChat || !newMessage.trim() || sending) return;
    const content = newMessage.trim();
    setNewMessage('');
    setSending(true);

    // Optimistic message
    const optimistic: ChatMessage = {
      id: `temp-${Date.now()}`,
      senderId: user?.id,
      content,
      attachments: [],
      chatId: activeChat.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);
    setTimeout(scrollToBottom, 50);

    try {
      const sent = await chatApi.sendMessage(activeChat.id, { content });
      // Replace optimistic with real message
      setMessages(prev => prev.map(m => m.id === optimistic.id ? sent : m));
    } catch {
      // Keep optimistic message but could mark as failed
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }, [activeChat, newMessage, sending, user?.id, scrollToBottom]);

  // Socket.IO real-time messages
  useEffect(() => {
    if (!socket) return;
    const handleNewMessage = (data: ChatMessage) => {
      if (data.chatId === activeChat?.id) {
        setMessages(prev => {
          if (prev.find(m => m.id === data.id)) return prev;
          return [...prev, data];
        });
        setTimeout(scrollToBottom, 50);
        // Mark as read since we're viewing it
        if (activeChat) {
          chatApi.markAsRead(activeChat.id).catch(() => {});
        }
      }
      // Refresh chat list
      fetchChats();
    };

    const handleNewChat = () => {
      fetchChats();
    };

    socket.on(SOCKET_EVENTS.MESSAGE_RECEIVED_EVENT, handleNewMessage);
    socket.on(SOCKET_EVENTS.NEW_CHAT_EVENT, handleNewChat);

    return () => {
      socket.off(SOCKET_EVENTS.MESSAGE_RECEIVED_EVENT, handleNewMessage);
      socket.off(SOCKET_EVENTS.NEW_CHAT_EVENT, handleNewChat);
    };
  }, [socket, activeChat, scrollToBottom, fetchChats]);

  // Filter chats by search
  const filteredChats = chats.filter(chat => {
    if (!searchQuery) return true;
    const other = getOtherParticipant(chat, user?.id || '');
    return other.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const messageGroups = groupMessagesByDate(messages);

  return (
    <DashboardLayout role="rider" pageTitle="Messages">
      <div className="h-[calc(100vh-13rem)] lg:h-[calc(100vh-8rem)] flex rounded-2xl border border-white/[0.06] overflow-hidden bg-white/[0.01]">
        {/* ═══════ Chat List Panel ═══════ */}
        <div className={`${showMobileList ? 'flex' : 'hidden'} lg:flex flex-col w-full lg:w-[340px] border-r border-white/[0.06] bg-white/[0.02]`}>
          {/* Search header */}
          <div className="p-4 border-b border-white/[0.06]">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-white/20 outline-none focus:border-secondary/30 text-sm transition-colors"
              />
            </div>
          </div>

          {/* Chat list */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="text-secondary animate-spin" />
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-4">
                  <MessageSquare size={28} className="text-white/15" />
                </div>
                <p className="text-white/40 text-sm font-medium">No conversations yet</p>
                <p className="text-white/20 text-xs mt-1">Messages from your rides will appear here</p>
              </div>
            ) : (
              filteredChats.map((chat) => {
                const other = getOtherParticipant(chat, user?.id || '');
                const lastMsg = getLastMessage(chat);
                const lastTime = getLastMessageTime(chat);
                const isActive = activeChat?.id === chat.id;
                // Check if there are unread messages
                const myParticipant = chat.participants.find(p => p.userId === user?.id);
                const hasUnread = myParticipant?.lastReadAt && chat.messages?.length > 0
                  ? new Date(chat.messages[chat.messages.length - 1].createdAt) > new Date(myParticipant.lastReadAt)
                  : false;

                return (
                  <button
                    key={chat.id}
                    onClick={() => openChat(chat)}
                    className={`w-full flex items-center gap-3 p-4 text-left transition-all duration-200 border-b border-white/[0.03] ${
                      isActive
                        ? 'bg-secondary/[0.08] border-l-2 border-l-secondary'
                        : 'hover:bg-white/[0.04]'
                    }`}
                  >
                    {/* Avatar */}
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                      isActive
                        ? 'bg-secondary/20 text-secondary'
                        : 'bg-white/[0.06] text-white/50'
                    }`}>
                      {getInitials(other.name)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm font-semibold truncate ${
                          hasUnread ? 'text-white' : 'text-white/70'
                        }`}>
                          {other.name}
                        </p>
                        <span className="text-[10px] text-white/25 shrink-0">{lastTime}</span>
                      </div>
                      <p className={`text-xs mt-0.5 truncate ${
                        hasUnread ? 'text-white/60 font-medium' : 'text-white/30'
                      }`}>
                        {lastMsg}
                      </p>
                    </div>

                    {/* Unread dot */}
                    {hasUnread && (
                      <div className="w-2.5 h-2.5 rounded-full bg-secondary shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ═══════ Message Panel ═══════ */}
        <div className={`${!showMobileList ? 'flex' : 'hidden'} lg:flex flex-col flex-1 bg-dark/50`}>
          {activeChat ? (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-white/[0.06] bg-white/[0.02]">
                <button
                  onClick={() => setShowMobileList(true)}
                  className="lg:hidden p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>

                <div className="w-10 h-10 rounded-full bg-secondary/15 flex items-center justify-center text-secondary text-xs font-bold">
                  {getInitials(getOtherParticipant(activeChat, user?.id || '').name)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">
                    {getOtherParticipant(activeChat, user?.id || '').name}
                  </p>
                  <p className="text-[11px] text-white/30">
                    {activeChat.bookingId ? `Ride ${activeChat.bookingId.slice(-6)}` : 'Direct message'}
                  </p>
                </div>
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-6">
                {loadingMessages ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 size={24} className="text-secondary animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-3">
                      <MessageSquare size={24} className="text-white/15" />
                    </div>
                    <p className="text-white/30 text-sm">No messages yet</p>
                    <p className="text-white/15 text-xs mt-1">Start the conversation!</p>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {messageGroups.map((group) => (
                      <div key={group.date}>
                        {/* Date divider */}
                        <div className="flex items-center gap-3 my-4">
                          <div className="flex-1 h-px bg-white/[0.06]" />
                          <span className="text-[10px] font-medium text-white/20 uppercase tracking-wider px-2">
                            {group.date}
                          </span>
                          <div className="flex-1 h-px bg-white/[0.06]" />
                        </div>

                        {/* Messages */}
                        {group.messages.map((msg) => {
                          const isMine = msg.senderId === user?.id;
                          return (
                            <motion.div
                              key={msg.id}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2 }}
                              className={`flex mb-2 ${isMine ? 'justify-end' : 'justify-start'}`}
                            >
                              {!isMine && (
                                <div className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center text-white/30 text-[9px] font-bold mr-2 mt-auto mb-1 shrink-0">
                                  <User size={12} />
                                </div>
                              )}
                              <div className={`max-w-[75%] sm:max-w-[65%]`}>
                                <div
                                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                    isMine
                                      ? 'bg-secondary text-dark rounded-br-md'
                                      : 'bg-white/[0.06] text-white/90 rounded-bl-md'
                                  }`}
                                >
                                  {msg.content}
                                </div>
                                <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                                  <span className="text-[10px] text-white/20">
                                    {formatTime(msg.createdAt)}
                                  </span>
                                  {isMine && (
                                    <CheckCheck size={12} className="text-secondary/50" />
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    ))}
                  </AnimatePresence>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message input */}
              <div className="p-4 border-t border-white/[0.06] bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    className="flex-1 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-white/20 outline-none focus:border-secondary/30 text-sm transition-colors"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!newMessage.trim() || sending}
                    className={`p-3 rounded-xl transition-all duration-200 ${
                      newMessage.trim() && !sending
                        ? 'bg-secondary text-dark hover:bg-secondary/90'
                        : 'bg-white/[0.06] text-white/20 cursor-not-allowed'
                    }`}
                  >
                    {sending ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Send size={18} />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Empty state — no chat selected */
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
              <div className="w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-6">
                <MessageSquare size={32} className="text-white/10" />
              </div>
              <h3 className="text-lg font-bold text-white/60 mb-2">Your Messages</h3>
              <p className="text-white/25 text-sm max-w-xs leading-relaxed">
                Select a conversation from the list to start chatting, or wait for messages from your drivers.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
