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

export interface AuthResponse {
  user: User;
  token: string;        // Cognito ID token
  refreshToken?: string;
  accessToken?: string;
}

export const authApi = {
  register: (dto: RegisterDto) =>
    api.post<AuthResponse>('/auth/register', dto),

  confirmEmail: (dto: ConfirmOtpDto) =>
    api.post<AuthResponse>('/auth/confirmEmail', dto),

  resendOtp: (email: string) =>
    api.post('/auth/resend-otp', { email }),

  login: (dto: LoginDto) =>
    api.post<AuthResponse>('/auth/login', dto),

  companyLogin: (dto: LoginDto) =>
    api.post<AuthResponse>('/auth/company-login', dto),

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
