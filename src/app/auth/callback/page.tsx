'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { setToken } from '@/lib/api';
import { authApi } from '@/lib/services/auth';

function CallbackContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (!accessToken) {
      setError('Authentication failed. No token received.');
      return;
    }

    // Store tokens
    setToken(accessToken);
    if (refreshToken) {
      localStorage.setItem('rs_refresh_token', refreshToken);
    }

    // Fetch user and redirect to appropriate dashboard
    authApi
      .getCurrentUser()
      .then((user) => {
        const dest = user.Admin
          ? '/admin/dashboard'
          : '/rider/dashboard';
        // Use full page load so AuthProvider re-initialises with the stored token
        window.location.href = dest;
      })
      .catch(() => {
        setToken(null);
        setError('Failed to fetch user profile. Please try logging in again.');
      });
  }, [searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#060B14' }}>
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <a href="/login" className="text-secondary hover:underline">Back to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#060B14' }}>
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-white animate-spin mx-auto mb-4" />
        <p className="text-white/50">Signing you in...</p>
      </div>
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
