/* ═══════════════════════════════════════════
   Booking & Ride Requests API
   ═══════════════════════════════════════════ */

import { api } from '../api';
import type {
  RideRequest,
  Booking,
  CreateRequestDto,
  CreateBookingDto,
  BookingStatus,
} from '../types';

export const requestsApi = {
  create: (dto: CreateRequestDto) =>
    api.post<RideRequest>('/requests', dto),

  getAll: (page = 1, count = 20) =>
    api.get<RideRequest[]>(`/requests?page=${page}&count=${count}`),

  getById: (id: string) =>
    api.get<RideRequest>(`/requests/${id}`),

  getUserRequests: (userId: string, page = 1, count = 20) =>
    api.get<RideRequest[]>(`/requests/users/${userId}?page=${page}&count=${count}`),

  getDriverRequests: (driverId: string, page = 1, count = 20) =>
    api.get<RideRequest[]>(`/requests/driver/${driverId}?page=${page}&count=${count}`),

  getAdjustable: (page = 1, count = 20) =>
    api.get<RideRequest[]>(`/requests/adjustable?page=${page}&count=${count}`),

  getFixed: (page = 1, count = 20) =>
    api.get<RideRequest[]>(`/requests/fixed?page=${page}&count=${count}`),

  update: (id: string, data: Partial<RideRequest>) =>
    api.patch<RideRequest>(`/requests/${id}`, data),

  cancel: (id: string) =>
    api.patch<RideRequest>(`/requests/${id}`, { status: 'CANCELLED' }),

  decline: (id: string) =>
    api.patch<RideRequest>(`/requests/${id}/declined`, {}),

  remove: (id: string) =>
    api.del(`/requests/${id}`),
};

export const bookingsApi = {
  create: (dto: CreateBookingDto) =>
    api.post<Booking>('/bookings', dto),

  getUserBookings: (userId: string, status?: BookingStatus) => {
    const qs = status ? `?status=${status}` : '';
    return api.get<Booking[]>(`/bookings/user/${userId}${qs}`);
  },

  getDriverBookings: (driverId: string, status?: BookingStatus) => {
    const qs = status ? `?status=${status}` : '';
    return api.get<Booking[]>(`/bookings/driver/${driverId}${qs}`);
  },

  getById: (id: string) =>
    api.get<Booking>(`/bookings/${id}`),

  update: (id: string, data: Partial<Booking>) =>
    api.patch<Booking>(`/bookings/${id}`, data),

  // Driver records cash collected; backend auto-refunds change to rider's wallet.
  recordCashCollected: (id: string, amount: number) =>
    api.post<{ booking: Booking; overpayment: number }>(
      `/bookings/${id}/cash-collected`,
      { amount },
    ),

  // Rider tips driver (wallet-to-wallet transfer, recorded on the booking).
  tipDriver: (id: string, amount: number) =>
    api.post<Booking>(`/bookings/${id}/tip`, { amount }),
};
