/* ═══════════════════════════════════════════
   Admin API — admin-only endpoints
   ═══════════════════════════════════════════ */

import { api } from '../api';
import type {
  User,
  Driver,
  Booking,
  Package,
  LoginDto,
  ConfirmOtpDto,
} from '../types';
import type { LoginResponse } from './auth';

// ── DTOs ──

export interface AdminRegisterDto {
  firstName: string;
  lastName: string;
  emailAddress: string;
  password: string;
  role: 'ADMIN' | 'STAFF';
  secretNumber: string;
}

export interface DashboardStats {
  totalBookings: number;
  totalDrivers: number;
  totalPassengers: number;
  totalRevenue: number;
  activeDrivers: number;
  pendingDrivers: number;
  completedBookings: number;
  cancelledBookings: number;
  [key: string]: unknown;
}

// ── Admin Auth ──

export const adminAuthApi = {
  login: (dto: LoginDto) =>
    api.post<LoginResponse>('/admin/adminUsers/login', dto),

  register: (dto: AdminRegisterDto) =>
    api.post<User>('/admin/adminUsers/register', dto),

  confirmSignup: (dto: ConfirmOtpDto) =>
    api.post<void>('/admin/adminUsers/confirm-signup', dto),

  forgotPassword: (email: string) =>
    api.post('/admin/adminUsers/forgot-password', { emailAddress: email }),

  resetPassword: (dto: { emailAddress: string; otp: string; newPassword: string }) =>
    api.post('/admin/adminUsers/reset-password', dto),

  changePassword: (dto: { oldPassword: string; newPassword: string }) =>
    api.post('/admin/adminUsers/change-password', dto),

  getAllAdmins: () =>
    api.get<User[]>('/admin/adminUsers'),

  getAdmin: (id: string) =>
    api.get<User>(`/admin/adminUsers/${id}`),

  updateAdmin: (id: string, data: Partial<User>) =>
    api.put<User>(`/admin/adminUsers/${id}`, data),

  deleteAdmin: (id: string) =>
    api.del<void>(`/admin/adminUsers/${id}`),
};

// ── Admin Bookings ──

export const adminBookingsApi = {
  getAll: () =>
    api.get<Booking[]>('/admin/bookings'),

  getById: (id: string) =>
    api.get<Booking>(`/admin/bookings/${id}`),

  create: (data: Partial<Booking>) =>
    api.post<Booking>('/admin/bookings', data),

  update: (id: string, data: Partial<Booking>) =>
    api.put<Booking>(`/admin/bookings/${id}`, data),

  delete: (id: string) =>
    api.del<void>(`/admin/bookings/${id}`),
};

// ── Admin Drivers ──

export const adminDriversApi = {
  getAll: () =>
    api.get<Driver[]>('/admin/drivers'),

  getById: (id: string) =>
    api.get<Driver>(`/admin/drivers/${id}`),

  create: (data: Partial<Driver>) =>
    api.post<Driver>('/admin/drivers', data),

  delete: (id: string) =>
    api.del<void>(`/admin/drivers/${id}`),
};

// ── Admin Passengers ──

export const adminPassengersApi = {
  getAll: () =>
    api.get<User[]>('/admin/passengers'),

  getById: (id: string) =>
    api.get<User>(`/admin/passengers/${id}`),

  promote: (userId: string) =>
    api.post<User>('/admin/passengers/promote-user', { userId }),

  updateStatus: (id: string, status: string) =>
    api.patch<User>(`/admin/passengers/${id}/status`, { status }),
};

// ── Admin Packages ──

export const adminPackagesApi = {
  getAll: () =>
    api.get<Package[]>('/admin/packages'),

  getById: (id: string) =>
    api.get<Package>(`/admin/packages/${id}`),

  create: (data: Partial<Package>) =>
    api.post<Package>('/admin/packages', data),

  update: (id: string, data: Partial<Package>) =>
    api.put<Package>(`/admin/packages/${id}`, data),

  delete: (id: string) =>
    api.del<void>(`/admin/packages/${id}`),
};

// ── Super Admin Stats ──

export const adminStatsApi = {
  getDashboardStats: () =>
    api.get<DashboardStats>('/super-admin/all-stats'),
};
