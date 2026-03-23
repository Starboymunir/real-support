'use client';

/* ═══════════════════════════════════════════════════════════
   Auth Context — manages current user state & tokens
   ═══════════════════════════════════════════════════════════ */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { setToken, getToken } from './api';
import { authApi, type LoginResponse, type AdminOtpSentResponse } from './services/auth';
import type {
  User,
  RegisterDto,
  LoginDto,
  ConfirmOtpDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './types';
import { ApiError } from './api';

// ── Types ──

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login: (dto: LoginDto) => Promise<void>;
  companyLogin: (dto: LoginDto) => Promise<void>;
  adminLogin: (dto: LoginDto) => Promise<void>;
  requestAdminLoginOtp: (email: string) => Promise<AdminOtpSentResponse>;
  verifyAdminOtp: (dto: ConfirmOtpDto) => Promise<void>;
  register: (dto: RegisterDto) => Promise<void>;
  confirmEmail: (dto: ConfirmOtpDto) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  forgotPassword: (dto: ForgotPasswordDto) => Promise<void>;
  resetPassword: (dto: ResetPasswordDto) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ── Provider ──

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  const setError = (error: string | null) =>
    setState((s) => ({ ...s, error }));

  const clearError = () => setError(null);

  // On mount: try to restore session from stored token
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setState({ user: null, loading: false, error: null });
      return;
    }
    authApi
      .getCurrentUser()
      .then((res) => {
        setState({ user: res, loading: false, error: null });
      })
      .catch(() => {
        setToken(null);
        setState({ user: null, loading: false, error: null });
      });
  }, []);

  const handleAuth = useCallback(async (promise: Promise<LoginResponse>) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await promise;
      setToken(res.accessToken);
      if (typeof window !== 'undefined' && res.refreshToken) {
        localStorage.setItem('rs_refresh_token', res.refreshToken);
      }
      setState({ user: res.userData, loading: false, error: null });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Something went wrong';
      setState((s) => ({ ...s, loading: false, error: message }));
      throw err;
    }
  }, []);

  const login = useCallback(
    (dto: LoginDto) => handleAuth(authApi.login(dto)),
    [handleAuth],
  );

  const companyLogin = useCallback(
    (dto: LoginDto) => handleAuth(authApi.companyLogin(dto)),
    [handleAuth],
  );

  const register = useCallback(
    async (dto: RegisterDto) => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        await authApi.register(dto);
        setState((s) => ({ ...s, loading: false }));
        // User needs to confirm email before login
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : 'Registration failed';
        setState((s) => ({ ...s, loading: false, error: message }));
        throw err;
      }
    },
    [],
  );

  const adminLogin = useCallback(
    async (dto: LoginDto) => {
      await handleAuth(authApi.adminLogin(dto));
    },
    [handleAuth],
  );

  const requestAdminLoginOtp = useCallback(
    async (email: string): Promise<AdminOtpSentResponse> => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const res = await authApi.requestAdminLoginOtp(email);
        setState((s) => ({ ...s, loading: false }));
        return res;
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : 'Something went wrong';
        setState((s) => ({ ...s, loading: false, error: message }));
        throw err;
      }
    },
    [],
  );

  const verifyAdminOtp = useCallback(
    async (dto: ConfirmOtpDto) => {
      await handleAuth(authApi.verifyAdminOtp(dto));
    },
    [handleAuth],
  );

  const confirmEmail = useCallback(
    async (dto: ConfirmOtpDto) => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        // Backend only confirms the OTP — returns null, no token/user
        await authApi.confirmEmail(dto);
        setState((s) => ({ ...s, loading: false }));
        // Caller should auto-login after this succeeds
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : 'Verification failed';
        setState((s) => ({ ...s, loading: false, error: message }));
        throw err;
      }
    },
    [],
  );

  const resendOtp = useCallback(async (email: string) => {
    try {
      await authApi.resendOtp(email);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to resend code';
      setState((s) => ({ ...s, error: message }));
      throw err;
    }
  }, []);

  const forgotPassword = useCallback(async (dto: ForgotPasswordDto) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      await authApi.forgotPassword(dto);
      setState((s) => ({ ...s, loading: false }));
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to send reset code';
      setState((s) => ({ ...s, loading: false, error: message }));
      throw err;
    }
  }, []);

  const resetPassword = useCallback(async (dto: ResetPasswordDto) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      await authApi.resetPassword(dto);
      setState((s) => ({ ...s, loading: false }));
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Password reset failed';
      setState((s) => ({ ...s, loading: false, error: message }));
      throw err;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await authApi.getCurrentUser();
      setState((s) => ({ ...s, user: res }));
    } catch {
      // silently ignore
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('rs_refresh_token');
    }
    setState({ user: null, loading: false, error: null });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        companyLogin,
        adminLogin,
        requestAdminLoginOtp,
        verifyAdminOtp,
        register,
        confirmEmail,
        resendOtp,
        forgotPassword,
        resetPassword,
        logout,
        refreshUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
