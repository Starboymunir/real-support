/* ═══════════════════════════════════════════
   User Info & Address API
   ═══════════════════════════════════════════ */

import { api } from '../api';
import type { User, UserAddress } from '../types';

export const userInfoApi = {
  updateMode: (id: string, mode: 'DRIVER' | 'PASSENGER') =>
    api.patch<User>(`/users/info/mode/${id}`, { mode }),

  update: (id: string, data: Partial<User>) =>
    api.patch<User>(`/users/info/${id}`, data),

  getById: (id: string) =>
    api.get<User>(`/users/${id}`),

  lookupByEmail: (email: string) =>
    api.get<{ id: string; firstName: string; lastName: string; emailAddress: string; phone_number: string; profileImageUrl: string } | null>(`/users/lookup?email=${encodeURIComponent(email)}`),
};

export const userAddressApi = {
  create: (data: Omit<UserAddress, 'id' | 'createdAt' | 'updatedAt'>) =>
    api.post<UserAddress>('/user-address', data),

  getAll: () =>
    api.get<UserAddress[]>('/user-address'),

  getById: (id: string) =>
    api.get<UserAddress>(`/user-address/${id}`),

  update: (id: string, data: Partial<UserAddress>) =>
    api.patch<UserAddress>(`/user-address/${id}`, data),

  remove: (id: string) =>
    api.del(`/user-address/${id}`),
};
