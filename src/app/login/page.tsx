'use client';

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const _raw = process.env.NEXT_PUBLIC_BACKEND_API ?? 'https://backend.real-support.com/api';
const API_BASE = _raw.endsWith('/api') ? _raw : `${_raw.replace(/\/$/, '')}/api`;

function LoginContent() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [socialLoading, setSocialLoading] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [oauthError, setOauthError] = useState<string | null>(null);
  const { login, confirmEmail, resendOtp, loading, error, clearError, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Show OAuth error if redirected back from failed social login
  useEffect(() => {
    const oauthErr = searchParams.get('error');
    const oauthMsg = searchParams.get('message');
    if (oauthErr) {
      setOauthError(oauthMsg || 'Social login failed. Please try again.');
    }
  }, [searchParams]);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      const dest = '/rider/dashboard';
      router.replace(dest);
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login({ emailAddress: email, password });
      // Redirect is handled by the useEffect watching `user`
    } catch (err: unknown) {
      // If user is not confirmed, show OTP step
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes('not confirmed') || msg.toLowerCase().includes('confirmation code')) {
        setOtpStep(true);
      }
    }
  };

  const handleConfirmOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await confirmEmail({ emailAddress: email, otp });
      await login({ emailAddress: email, password });
      // Redirect is handled by the useEffect watching `user`
    } catch {
      // error set in context
    }
  };

  const handleResendOtp = async () => {
    clearError();
    try {
      await resendOtp(email);
    } catch {
      // error set in context
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#060B14' }}>
      {/* Left â€” Hero Image */}
      <div className="hidden lg:block lg:w-[55%] relative overflow-hidden">
        <Image
          src="/images/auth/london-night.jpg"
          alt="London cityscape at night"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#060B14] via-[#060B14]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060B14] via-transparent to-[#060B14]/40" />

        <div className="absolute inset-0 flex flex-col justify-between p-12 z-10">
          <Image src="/images/brand/logo.png" alt="RS CAB" width={160} height={48} className="object-contain" />

          <div className="mb-16">
            <h1 className="text-5xl font-black text-white leading-tight mb-4 tracking-[-0.02em]">
              Your Premium
              <br />
              <span className="text-white/25">Ride Awaits</span>
            </h1>
            <p className="text-white/40 text-lg max-w-md">
              Experience luxury transportation across London with RS CAB â€” where every journey is first class.
            </p>
          </div>

          {/* Stat cards */}
          <div className="absolute top-1/3 right-12 flex flex-col gap-4">
            {[
              { value: '15K+', label: 'Rides Completed', color: '#00E676' },
              { value: '4.9â˜…', label: 'Average Rating', color: '#00B0FF' },
              { value: '24/7', label: 'Availability', color: '#fff' },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-white/[0.06] bg-white/[0.04] backdrop-blur-sm p-5">
                <p className="font-bold text-2xl" style={{ color: s.color }}>{s.value}</p>
                <p className="text-white/40 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right â€” Login Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 sm:p-12 relative">
        <div className="absolute top-20 right-20 w-64 h-64 bg-secondary/[0.03] rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-10 mt-6">
            <Image src="/images/brand/logo.png" alt="RS CAB" width={140} height={42} className="object-contain max-h-12" />
          </div>

          {/* Form card */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 sm:p-10">
            <div className="hidden lg:flex justify-center mb-8">
              <Image src="/images/brand/logo.png" alt="RS CAB" width={100} height={30} className="object-contain" />
            </div>

            <h2 className="text-3xl font-bold text-white text-center mb-2">Welcome back</h2>
            <p className="text-white/35 text-center mb-8">Sign in to continue your journey</p>

            {otpStep ? (
              /* ── OTP Verification Step ── */
              <div>
                <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 text-amber-400 text-sm mb-6">
                  Your email is not yet verified. Enter the code sent to <span className="font-semibold text-secondary">{email}</span>
                </div>
                {error && (
                  <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm mb-4">
                    {error}
                  </div>
                )}
                <form onSubmit={handleConfirmOtp} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/25" />
                    <input type="text" placeholder="Enter 6-digit code" value={otp} onChange={(e) => setOtp(e.target.value)} className="input-dark pl-12 text-center text-lg tracking-[0.3em]" maxLength={6} required />
                  </div>
                  <button type="submit" disabled={loading} className="w-full py-4 bg-white text-black font-bold rounded-xl text-lg hover:shadow-[0_0_30px_rgba(255,255,255,0.12)] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</> : 'Verify & Sign In'}
                  </button>
                  <p className="text-center text-white/35 text-sm mt-2">
                    Didn&apos;t get the code?{' '}
                    <button type="button" onClick={handleResendOtp} className="text-secondary font-semibold hover:underline underline-offset-4">Resend</button>
                  </p>
                  <button type="button" onClick={() => { setOtpStep(false); clearError(); }} className="text-white/30 text-sm hover:text-white/50 transition-colors w-full text-center mt-2">
                    ← Back to login
                  </button>
                </form>
              </div>
            ) : (
            <>
            {/* OAuth error banner */}
            {oauthError && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm mb-6">
                {oauthError}
              </div>
            )}

            {/* Social buttons */}
            <div className="flex gap-3 mb-6">
              <button
                type="button"
                disabled={socialLoading}
                onClick={() => { window.location.href = `${API_BASE}/auth/google?origin=${encodeURIComponent(window.location.origin)}`; }}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white text-gray-800 font-semibold text-sm hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              <button
                type="button"
                disabled={socialLoading}
                onClick={() => { window.location.href = `${API_BASE}/auth/apple?origin=${encodeURIComponent(window.location.origin)}`; }}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-black text-white font-semibold text-sm hover:bg-gray-900 transition-colors disabled:opacity-50 border border-white/10"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Apple
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-white/[0.06]" />
              <span className="text-white/25 text-sm">OR</span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm">
                  {error}
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/25" />
                <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className="input-dark pl-12" required />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/25" />
                <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-dark pl-12 pr-12" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div className="text-right">
                <Link href="/forget-password" className="text-secondary text-sm font-medium hover:underline underline-offset-4">Forgot password?</Link>
              </div>
              <button type="submit" disabled={loading} className="w-full py-4 bg-white text-black font-bold rounded-xl text-lg hover:shadow-[0_0_30px_rgba(255,255,255,0.12)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Signing in...</> : 'Sign In'}
              </button>
            </form>



            <p className="text-center text-white/35 mt-6 text-sm">
              New here?{' '}
              <Link href="/register" className="text-secondary font-semibold hover:underline underline-offset-4">Create account</Link>
            </p>


            </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: '#060B14' }}><Loader2 className="w-8 h-8 text-white animate-spin" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
