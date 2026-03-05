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

  getAll: (page = 1, limit = 20) =>
    api.get<RideRequest[]>(`/requests?page=${page}&limit=${limit}`),

  getById: (id: string) =>
    api.get<RideRequest>(`/requests/${id}`),

  getUserRequests: (userId: string, page = 1, limit = 20) =>
    api.get<RideRequest[]>(`/requests/users/${userId}?page=${page}&limit=${limit}`),

  getAdjustable: (page = 1, limit = 20) =>
    api.get<RideRequest[]>(`/requests/adjustable?page=${page}&limit=${limit}`),

  getFixed: (page = 1, limit = 20) =>
    api.get<RideRequest[]>(`/requests/fixed?page=${page}&limit=${limit}`),

  update: (id: string, data: Partial<RideRequest>) =>
    api.patch<RideRequest>(`/requests/${id}`, data),

  cancel: (id: string) =>
    api.patch<RideRequest>(`/requests/${id}`, { status: 'CANCELLED' }),

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
};
