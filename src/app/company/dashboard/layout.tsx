import type { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Company Dashboard - RS CAB',
  description: 'Manage your corporate ride bookings, employees, and spending with the RS CAB company dashboard.',
};

export default function CompanyDashboardLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
