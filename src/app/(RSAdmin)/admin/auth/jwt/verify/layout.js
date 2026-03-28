'use client';

import PropTypes from 'prop-types';
// auth
import { GuestGuard } from '@/app/(RSAdmin)/admin/auth/guard';
// components
import CompactLayout from '@/app/(RSAdmin)/admin/layouts/compact';

// ----------------------------------------------------------------------

export default function Layout({ children }) {
  return (
    <GuestGuard>
      <CompactLayout>{children}</CompactLayout>
    </GuestGuard>
  );
}

Layout.propTypes = {
  children: PropTypes.node,
};
