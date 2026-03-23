/* ═══════════════════════════════════════════════
   Auth API — login, register, OTP, password reset
   ═══════════════════════════════════════════════ */

import { api } from '../api';
import type {
  User,
  RegisterDto,
  LoginDto,
  ConfirmOtpDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from '../types';

/** Shape returned by the backend login endpoint (after envelope unwrap) */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  userData: User;
}

/** Shape returned by admin OTP request — OTP sent */
export interface AdminOtpSentResponse {
  otpSent: true;
  email: string;
}

export const authApi = {
  register: (dto: RegisterDto) =>
    api.post<User>('/auth/register', dto),

  confirmEmail: (dto: ConfirmOtpDto) =>
    api.post<void>('/auth/confirmEmail', dto),

  resendOtp: (email: string) =>
    api.post('/auth/resend-otp', { email }),

  login: (dto: LoginDto) =>
    api.post<LoginResponse>('/auth/login', dto),

  companyLogin: (dto: LoginDto) =>
    api.post<LoginResponse>('/auth/company-login', dto),

  /** Password login — returns tokens directly */
  adminLogin: (dto: LoginDto) =>
    api.post<LoginResponse>('/admin/adminUsers/login', dto),

  /** OTP login step 1 — sends OTP to email */
  requestAdminLoginOtp: (email: string) =>
    api.post<AdminOtpSentResponse>('/admin/adminUsers/request-login-otp', { email }),

  /** OTP login step 2 — verify OTP and get tokens */
  verifyAdminOtp: (dto: ConfirmOtpDto) =>
    api.post<LoginResponse>('/admin/adminUsers/verify-login-otp', {
      email: dto.emailAddress,
      otp: dto.otp,
    }),

  getCurrentUser: () =>
    api.get<User>('/auth/current-user'),

  updateCurrentUser: (data: Partial<User>) =>
    api.patch<User>('/auth/update-user', data),

  getUserById: (id: string) =>
    api.get<User>(`/auth/${id}`),

  forgotPassword: (dto: ForgotPasswordDto) =>
    api.post('/auth/forgot-password', dto),

  resetPassword: (dto: ResetPasswordDto) =>
    api.post('/auth/reset-password', dto),

  changePassword: (dto: ChangePasswordDto) =>
    api.post('/auth/change-password', dto),

};
