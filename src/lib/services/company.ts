/* ═══════════════════════════════════════════
   Company API
   ═══════════════════════════════════════════ */

import { api } from '../api';
import type { Company } from '../types';

export interface CompanyWalletData {
  companyId: string;
  companyName: string;
  walletBalance: number;
  totalRevenue: number;
  totalCommission: number;
  totalProfit: number;
  totalCashCollected: number;
  totalWalletCollected: number;
  totalBookings: number;
  totalDrivers: number;
}

export const companyApi = {
  getAll: (page = 1, limit = 20) =>
    api.get<Company[]>(`/companies?page=${page}&count=${limit}`),

  getById: (id: string) =>
    api.get<Company>(`/company/findById/${id}`),

  getByCode: (code: string) =>
    api.get<Company>(`/company/findByCode/${encodeURIComponent(code)}`),

  update: (id: string, data: Partial<Company>) =>
    api.patch<Company>(`/company/updateById/${id}`, data),

  inviteDriver: (driverIdOrEmail: string) =>
    api.post(`/company/inviteDriverToJoin/${encodeURIComponent(driverIdOrEmail)}`),

  getWallet: (companyId: string) =>
    api.get<CompanyWalletData>(`/company/${companyId}/wallet`),
};
