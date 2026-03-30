'use client';

import PropTypes from 'prop-types';
import { useCallback, useEffect } from 'react';
// routes
import { paths } from '@/app/(RSAdmin)/admin/routes/paths';
import { useRouter } from '@/app/(RSAdmin)/admin/routes/hook';
//
import { useAuth } from '@/lib/auth-context';

// ----------------------------------------------------------------------

export default function GuestGuard({ children }) {
  const router = useRouter();

  const { admin, loading } = useAuth();

  const check = useCallback(() => {
    if (loading) return;
    // Only redirect if the user is an admin — riders/drivers should stay on login
    if (admin) {
      router.replace(paths.dashboard.root);
    }
  }, [admin, loading, router]);

  useEffect(() => {
    check();
  }, [check]);

  return <>{children}</>;
}

GuestGuard.propTypes = {
  children: PropTypes.node,
};
