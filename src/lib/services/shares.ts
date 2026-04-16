/* ═══════════════════════════════════════════
   Company Shares API
   ═══════════════════════════════════════════ */

import { api } from '../api';
import type { User } from '../types';

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

export type { UserShareHolding, ShareTransaction } from '../types';

export interface UserHoldingResponse {
  holding: import('../types').UserShareHolding | null;
  transactions: import('../types').ShareTransaction[];
}

export const sharesApi = {
  getShareInfo: () =>
    api.get<CompanyShare>('/company-shares'),

  getUserHolding: async (userId: string): Promise<UserHoldingResponse> => {
    // Use the /users/:id endpoint which already includes shareHoldings & shareTransactions
    const user = await api.get<User>(`/users/${userId}`);
    return {
      holding: user.shareHoldings?.[0] ?? null,
      transactions: user.shareTransactions ?? [],
    };
  },

  buyShares: (userId: string, quantity: number) =>
    api.post<{ success: boolean; message: string }>('/company-shares/buy', { userId, quantity }),

  sellShares: (userId: string, quantity: number) =>
    api.post<{ success: boolean; message: string }>('/company-shares/sell', { userId, quantity }),
};
