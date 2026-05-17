'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import Image from 'next/image';
import { setToken } from '@/lib/api';
import { authApi } from '@/lib/services/auth';

function CallbackContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Signing you in...');
  const [userMode, setUserMode] = useState<string | null>(null);

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const errorParam = searchParams.get('error');
    const errorMsg = searchParams.get('message');

    if (errorParam || !accessToken) {
      setStatus('error');
      setMessage(errorMsg || 'Authentication failed. No token received.');
      return;
    }

    // Store tokens
    setToken(accessToken);
    if (refreshToken) {
      localStorage.setItem('rs_refresh_token', refreshToken);
    }

    // Fetch user and show success before redirecting
    authApi
      .getCurrentUser()
      .then((user) => {
        const mode = user?.mode === 'DRIVER' ? 'DRIVER' : 'RIDER';
        setUserMode(mode);
        setStatus('success');
        setMessage(`Welcome${user?.firstName ? `, ${user.firstName}` : ''}! Redirecting to your dashboard...`);

        // Auto-redirect after 2 seconds
        const dest = user?.mode === 'DRIVER' ? '/driver/dashboard' : '/rider/dashboard';
        setTimeout(() => {
          window.location.href = dest;
        }, 2000);
      })
      .catch(() => {
        setToken(null);
        setStatus('error');
        setMessage('Failed to fetch user profile. Please try logging in again.');
      });
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#060B14' }}>
      <div className="text-center max-w-md px-6">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image src="/images/brand/logo.png" alt="One App" width={120} height={36} className="object-contain" />
        </div>

        {/* Status Card */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8">
          {status === 'loading' && (
            <>
              <Loader2 className="w-14 h-14 text-white animate-spin mx-auto mb-5" />
              <p className="text-white/50 text-lg">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="relative mx-auto w-16 h-16 mb-5">
                <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
                <div className="relative w-16 h-16 rounded-full bg-green-500/10 border-2 border-green-500 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Sign-in Successful</h2>
              <p className="text-white/50">{message}</p>
              <div className="mt-4 flex justify-center">
                <div className="h-1 w-32 bg-white/[0.06] rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full animate-[progress_2s_ease-in-out]" />
                </div>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="relative mx-auto w-16 h-16 mb-5">
                <div className="w-16 h-16 rounded-full bg-red-500/10 border-2 border-red-500/50 flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-red-400" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Authentication Failed</h2>
              <p className="text-red-400/80 mb-6">{message}</p>
              <a
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(255,255,255,0.12)] transition-all"
              >
                Back to Login
              </a>
            </>
          )}
        </div>
      </div>

      {/* Progress bar animation */}
      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#060B14' }}>
          <Loader2 className="w-10 h-10 text-white animate-spin" />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
