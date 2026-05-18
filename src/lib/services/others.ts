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

/** A single GPS fix for a driver. */
export interface UpdateLocationDto {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export const othersApi = {
  calculatePrice: (dto: CalculatePriceDto) =>
    api.post<PriceResult>('/others/calculate-price', dto),

  /**
   * Push a driver's current GPS location.
   * `userId` is the User id — the backend stores the fix on `user.currentLocation`,
   * which the dispatch engine reads to find the nearest drivers.
   */
  updateLocation: (userId: string, location: UpdateLocationDto) =>
    api.post('/others/update-location', {
      id: userId,
      currentLocation: { set: location },
    }),
};
