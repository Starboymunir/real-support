/* ═══════════════════════════════════════════
   Support Tickets API
   ═══════════════════════════════════════════ */

import { api } from '../api';
import type { SupportTicket, SupportTicketMessage } from '../types';

export interface CreateSupportTicketDto {
  subject: string;
  description: string;
  category?: string;
}

export interface UpdateSupportTicketDto {
  status?: string;
  priority?: string;
  assignedAdminId?: string;
}

export interface CreateTicketMessageDto {
  content: string;
  attachments?: string[];
}

export const supportTicketApi = {
  create: (dto: CreateSupportTicketDto) =>
    api.post<SupportTicket>('/support-tickets', dto),

  getAll: () =>
    api.get<SupportTicket[]>('/support-tickets'),

  getById: (id: string) =>
    api.get<SupportTicket>(`/support-tickets/${id}`),

  update: (id: string, dto: UpdateSupportTicketDto) =>
    api.patch<SupportTicket>(`/support-tickets/${id}`, dto),

  addMessage: (id: string, dto: CreateTicketMessageDto) =>
    api.post<SupportTicketMessage>(`/support-tickets/${id}/messages`, dto),

  remove: (id: string) =>
    api.del(`/support-tickets/${id}`),
};
