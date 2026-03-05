'use client';

/* ═══════════════════════════════════════════
   useRequireAuth — redirect to login if not
   authenticated. Use in dashboard pages.
   ═══════════════════════════════════════════ */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-context';

export function useRequireAuth(redirectTo = '/login') {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(redirectTo);
    }
  }, [user, loading, redirectTo, router]);

  return { user, loading };
}
