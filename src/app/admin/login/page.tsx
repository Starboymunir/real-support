'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, Loader2, Shield, KeyRound } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

type LoginMode = 'password' | 'otp';

export default function AdminLoginPage() {
  const [mode, setMode] = useState<LoginMode>('password');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { adminLogin, requestAdminLoginOtp, verifyAdminOtp, loading, error, clearError, admin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (admin) {
      router.replace('/admin/dashboard');
    }
  }, [admin, router]);

  // Password login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const trimmedEmail = (email || '').trim();
    if (!trimmedEmail || !password) return;
    try {
      await adminLogin({ emailAddress: trimmedEmail, password });
    } catch {
      // error set in context
    }
  };

  // OTP login step 1: request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await requestAdminLoginOtp(email);
      setOtpSent(true);
    } catch {
      // error set in context
    }
  };

  // OTP login step 2: verify
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const otpString = otp.join('');
    if (otpString.length !== 6) return;
    try {
      await verifyAdminOtp({ emailAddress: email, otp: otpString });
    } catch {
      // error set in context
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const switchMode = (newMode: LoginMode) => {
    setMode(newMode);
    setOtpSent(false);
    setOtp(['', '', '', '', '', '']);
    setPassword('');
    clearError();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#060B14' }}>
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-secondary/[0.04] rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative">
        <div className="flex justify-center mb-8">
          <Image src="/images/brand/logo.png" alt="RS Ride" width={120} height={36} className="object-contain" />
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 sm:p-10 backdrop-blur-sm">
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20">
              <Shield size={16} className="text-secondary" />
              <span className="text-secondary text-sm font-semibold">Admin Portal</span>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white text-center mb-2">Admin Login</h2>
          <p className="text-white/35 text-center mb-6">Sign in to the management dashboard</p>

          {/* Mode tabs */}
          <div className="flex mb-6 rounded-xl bg-white/[0.04] p-1">
            <button
              type="button"
              onClick={() => switchMode('password')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                mode === 'password'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              <Lock className="w-4 h-4 inline mr-1.5 -mt-0.5" />
              Password
            </button>
            <button
              type="button"
              onClick={() => switchMode('otp')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                mode === 'otp'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              <KeyRound className="w-4 h-4 inline mr-1.5 -mt-0.5" />
              Login with OTP
            </button>
          </div>

          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm mb-5">
              {error}
            </div>
          )}

          {/* PASSWORD MODE */}
          {mode === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-5">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/25" />
                <input
                  type="email"
                  placeholder="Admin email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-dark pl-12"
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/25" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-dark pl-12 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-white text-black font-bold rounded-xl text-lg hover:shadow-[0_0_30px_rgba(255,255,255,0.12)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>

              <div className="text-right">
                <Link
                  href="/admin/auth/jwt/forgot-password"
                  className="text-white/35 text-sm hover:text-white/50 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </form>
          )}

          {/* OTP MODE — Step 1: Enter email */}
          {mode === 'otp' && !otpSent && (
            <form onSubmit={handleRequestOtp} className="space-y-5">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/25" />
                <input
                  type="email"
                  placeholder="Admin email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-dark pl-12"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-white text-black font-bold rounded-xl text-lg hover:shadow-[0_0_30px_rgba(255,255,255,0.12)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Sending code...
                  </>
                ) : (
                  'Send Login Code'
                )}
              </button>
            </form>
          )}

          {/* OTP MODE — Step 2: Enter OTP */}
          {mode === 'otp' && otpSent && (
            <>
              <p className="text-white/35 text-center mb-6">
                Enter the 6-digit code sent to<br />
                <span className="text-white/60">{email}</span>
              </p>

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="flex justify-center gap-3">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { inputRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      onPaste={i === 0 ? handleOtpPaste : undefined}
                      className="w-12 h-14 text-center text-xl font-bold rounded-xl border border-white/10 bg-white/[0.04] text-white focus:border-secondary focus:outline-none transition-colors"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.join('').length !== 6}
                  className="w-full py-4 bg-white text-black font-bold rounded-xl text-lg hover:shadow-[0_0_30px_rgba(255,255,255,0.12)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Verifying...
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-5 h-5" /> Verify & Sign In
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => { setOtpSent(false); setOtp(['', '', '', '', '', '']); clearError(); }}
                  className="w-full text-white/35 text-sm hover:text-white/50 transition-colors"
                >
                  &larr; Change email
                </button>
              </form>
            </>
          )}

          <div className="mt-6 pt-6 border-t border-white/[0.04] text-center">
            <Link
              href="/login"
              className="text-white/25 text-sm hover:text-white/50 transition-colors"
            >
              Back to User Login <span className="text-secondary">&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
