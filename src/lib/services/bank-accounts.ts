/* ═══════════════════════════════════════════
   Bank Account API
   ═══════════════════════════════════════════ */

import { api } from '../api';
import type { BankAccount } from '../types';

export const bankAccountApi = {
  getByUser: (userId: string) =>
    api.get<BankAccount[]>(`/accounts/user/${userId}`),

  getById: (id: string) =>
    api.get<BankAccount>(`/accounts/${id}`),

  create: (data: {
    userId: string;
    bankName: string;
    accountName: string;
    accountNumber: string;
    sortCode: string;
    document?: string;
    isDefault?: boolean;
  }) =>
    api.post<BankAccount>('/accounts', data),

  update: (id: string, data: Partial<{
    bankName: string;
    accountName: string;
    accountNumber: string;
    sortCode: string;
    document: string;
    isDefault: boolean;
    userId: string;
  }>) =>
    api.patch<BankAccount>(`/accounts/${id}`, data),

  remove: (id: string) =>
    api.del(`/accounts/${id}`),
};
