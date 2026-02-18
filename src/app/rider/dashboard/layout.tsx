import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - RS CAB',
};

export default function RiderDashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
