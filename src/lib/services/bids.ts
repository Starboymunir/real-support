/* ═══════════════════════════════════════════
   Bids API
   ═══════════════════════════════════════════ */

import { api } from '../api';
import type { Bid, BidStatus } from '../types';

export interface CreateBidDto {
  requestId: string;
  bidAmount: number;
  driverId: string;
}

export interface UpdateBidDto {
  status?: BidStatus;
  bidAmount?: number;
}

export const bidsApi = {
  create: (dto: CreateBidDto) =>
    api.post<Bid>('/bids', dto),

  getAll: (page = 1, limit = 20) =>
    api.get<Bid[]>(`/bids?page=${page}&limit=${limit}`),

  getByRequestId: (requestId: string) =>
    api.get<Bid[]>(`/bids/${requestId}`),

  getById: (id: string) =>
    api.get<Bid>(`/bids/${id}`),

  update: (id: string, dto: UpdateBidDto) =>
    api.patch<Bid>(`/bids/${id}`, dto),

  remove: (id: string) =>
    api.del(`/bids/${id}`),
};
