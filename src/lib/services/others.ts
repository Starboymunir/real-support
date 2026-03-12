/* ═══════════════════════════════════════════
   Others API (price calc, location update)
   ═══════════════════════════════════════════ */

import { api } from '../api';
import type { CalculatePriceDto } from '../types';

export interface PriceResult {
  price: number;
  serviceFee: number;
  discountAmount: number;
  farePerMile: number;
  farePerMinute: number;
  distancePrice: number;
  timePrice: number;
  averagePrice: number;
  totalFareBeforeVat: number;
  vat: number;
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
