'use client';

import PropTypes from 'prop-types';
// auth
import { GuestGuard } from '@/app/(RSAdmin)/admin/auth/guard';
// components
import AuthClassicLayout from '@/app/(RSAdmin)/admin/layouts/auth/classic';

// ----------------------------------------------------------------------

export default function Layout({ children }) {
  return (
    <GuestGuard>
      <AuthClassicLayout title="Real Support Admin">
        {children}
      </AuthClassicLayout>
    </GuestGuard>
  );
}

Layout.propTypes = {
  children: PropTypes.node,
};
