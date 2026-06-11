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
    // Use the /users/:id endpoint which already includes shareHoldings &
    // shareTransactions. The /users endpoint returns transactions in
    // insertion order (oldest first), but the UI expects "most recent at
    // the top" — sort by createdAt descending here so callers don't have
    // to worry about it.
    const user = await api.get<User>(`/users/${userId}`);
    const raw = user.shareTransactions ?? [];
    const transactions = [...raw].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return {
      holding: user.shareHoldings?.[0] ?? null,
      transactions,
    };
  },

  buyShares: (userId: string, quantity: number) =>
    api.post<{ success: boolean; message: string }>('/company-shares/buy', { userId, quantity }),

  sellShares: (userId: string, quantity: number) =>
    api.post<{ success: boolean; message: string }>('/company-shares/sell', { userId, quantity }),
};
