/* ═══════════════════════════════════════════
   Others API (price calc, location update)
   ═══════════════════════════════════════════ */

import { api } from '../api';
import type { CalculatePriceDto } from '../types';

export interface PriceResult {
  totalBill: number;
  serviceFee: number;
  vat: number;
  breakdown: Record<string, number>;
}

export interface UpdateLocationDto {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export const othersApi = {
  calculatePrice: (dto: CalculatePriceDto) =>
    api.post<PriceResult>('/others/calculate-price', dto),

  updateLocation: (dto: UpdateLocationDto) =>
    api.post('/others/update-location', dto),
};
