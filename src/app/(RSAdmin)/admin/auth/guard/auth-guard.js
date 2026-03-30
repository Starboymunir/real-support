'use client';

import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { LoadingScreen } from '@/app/(RSAdmin)/admin/common/loading-screen';

// ----------------------------------------------------------------------

export default function AuthGuard({ children }) {
  const router = useRouter();
  const { admin, loading } = useAuth();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!admin) {
      // Not an admin — redirect to admin login
      router.replace('/admin/auth/jwt/login');
    } else {
      setChecked(true);
    }
  }, [admin, loading, router]);

  if (loading || !checked) {
    return <LoadingScreen sx={{}} />;
  }

  return <>{children}</>;
}

AuthGuard.propTypes = {
  children: PropTypes.node,
};
