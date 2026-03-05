/* ═══════════════════════════════════════════
   Notifications API
   ═══════════════════════════════════════════ */

import { api } from '../api';
import type { Notification } from '../types';

export interface FilterNotificationDto {
  userId?: string;
  companyId?: string;
  isRead?: boolean;
  page?: number;
  limit?: number;
}

export const notificationsApi = {
  getAll: (filters: FilterNotificationDto = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined) params.append(k, String(v));
    });
    const qs = params.toString();
    return api.get<Notification[]>(`/notifications${qs ? `?${qs}` : ''}`);
  },

  markAsRead: (id: string) =>
    api.patch<Notification>(`/notifications/${id}/read`),

  remove: (id: string) =>
    api.del(`/notifications/${id}`),
};
