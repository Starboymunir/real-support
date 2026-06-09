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
  email: string;
  phone_number?: string;
  password: string;
  role: 'SUPER_ADMIN' | 'ADMIN';
  secretNumber: string;
  profileImageUrl?: string;
}

export interface DashboardStats {
  totalBookings: number;
  totalDrivers: number;
  totalPassengers: number;
  totalRevenue: number;
  totalReceived: number;
  totalDispensed: number;
  platformBalance: number;
  activeDrivers: number;
  pendingDrivers: number;
  completedBookings: number;
  cancelledBookings: number;
  activeBookings: number;
  companyId?: string;
  [key: string]: unknown;
}

// ── Admin Auth ──

export const adminAuthApi = {
  login: (dto: LoginDto) =>
    api.post<LoginResponse>('/admin/adminUsers/login', {
      email: dto.emailAddress,
      password: dto.password,
    }),

  register: (dto: AdminRegisterDto) =>
    api.post<User>('/admin/adminUsers/register', dto),

  confirmSignup: (dto: ConfirmOtpDto) =>
    api.post<void>('/admin/adminUsers/confirm-signup', {
      email: dto.emailAddress,
      otp: dto.otp,
    }),

  forgotPassword: (email: string) =>
    api.post('/admin/adminUsers/forgot-password', { email }),

  resetPassword: (dto: { email: string; otp: string; newPassword: string }) =>
    api.post('/admin/adminUsers/reset-password', dto),

  changePassword: (dto: { email: string; oldPassword: string; newPassword: string }) =>
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

export interface AdminBookingsQuery {
  page?: number;
  count?: number;
  status?: string;
  driverId?: string;
  passengerId?: string;
  startDate?: string;
  endDate?: string;
}

export interface PaginatedBookings {
  items: Booking[];
  totalRecords: number;
  page: number;
  count: number;
}

function toQueryString(query: Record<string, unknown>): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== null && v !== '') params.append(k, String(v));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const adminBookingsApi = {
  /**
   * Paginated, server-filtered listing. Use this instead of loading every
   * booking into memory — pass only the filters you care about.
   */
  list: async (query: AdminBookingsQuery = {}): Promise<PaginatedBookings> => {
    const page = Number(query.page ?? 1);
    const count = Number(query.count ?? 20);
    const envelope = await api.getEnvelope<{
      success?: boolean;
      data?: Booking[];
      totalRecords?: number;
      message?: string;
    }>(`/admin/bookings${toQueryString({ ...query, page, count })}`);
    return {
      items: envelope.data ?? [],
      totalRecords: envelope.totalRecords ?? 0,
      page,
      count,
    };
  },

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

  update: (id: string, data: Partial<Driver>) =>
    api.put<Driver>(`/admin/drivers/${id}`, data),

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
