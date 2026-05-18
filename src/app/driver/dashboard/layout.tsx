import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - Driver Portal - RS Ride - One App',
  description: 'Your RS Ride driver dashboard — view earnings, rides, and manage your availability.',
};

export default function DashboardDriverLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
