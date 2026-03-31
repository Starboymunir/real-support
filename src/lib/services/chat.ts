/* ═══════════════════════════════════════════
   Chat API
   ═══════════════════════════════════════════ */

import { api } from '../api';
import type { Chat, ChatMessage } from '../types';

export interface CreateChatMessageDto {
  content?: string;
  attachments?: string[];
}

export const chatApi = {
  getAll: (getAdminList = false) =>
    api.get<Chat[]>(`/chat?getAdminList=${getAdminList}`),

  getById: (chatId: string) =>
    api.get<Chat>(`/chat/${chatId}`),

  getOneOnOne: (participantId: string) =>
    api.get<Chat>(`/chat/one-on-one/${participantId}`),

  getOneOnOneAdmin: (userId?: string) => {
    const qs = userId ? `?userId=${userId}` : '';
    return api.get<Chat>(`/chat/one-on-one-admin${qs}`);
  },

  getBookingChat: (bookingId: string) =>
    api.get<Chat>(`/chat/booking/${bookingId}`),

  getUnreadCount: () =>
    api.get<{ count: number }>('/chat/unread-count'),

  sendMessage: (chatId: string, dto: CreateChatMessageDto) =>
    api.post<ChatMessage>(`/chat/${chatId}`, dto),

  markAsRead: (chatId: string) =>
    api.post(`/chat/${chatId}/read`),

  getUnreadMessageCount: (chatId: string) =>
    api.get<{ count: number }>(`/chat/${chatId}/read`),

  deleteChat: (chatId: string) =>
    api.del(`/chat/${chatId}`),

  getBroadcasts: () =>
    api.get<any[]>('/chat/broadcasts/list'),
};
