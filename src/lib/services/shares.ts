/* ═══════════════════════════════════════════
   Company Shares API
   ═══════════════════════════════════════════ */

import { api } from '../api';

export interface CompanyShare {
  id: string;
  price: number;
  buyPrice: number;
  sellPrice: number;
  totalShares: number;
  assetValue: number;
  earningsValue: number;
  futureValue: number;
  finalValuation: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserShareHolding {
  id: string;
  userId: string;
  shareId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface ShareTransaction {
  id: string;
  userId: string;
  shareId: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  total: number;
  createdAt: string;
}

export interface UserHoldingResponse {
  holding: UserShareHolding | null;
  transactions: ShareTransaction[];
}

export const sharesApi = {
  getShareInfo: () =>
    api.get<CompanyShare>('/company-shares'),

  getUserHolding: (userId: string) =>
    api.get<UserHoldingResponse>(`/company-shares/holdings/${userId}`),

  buyShares: (userId: string, quantity: number) =>
    api.post<{ success: boolean; message: string }>('/company-shares/buy', { userId, quantity }),

  sellShares: (userId: string, quantity: number) =>
    api.post<{ success: boolean; message: string }>('/company-shares/sell', { userId, quantity }),
};
