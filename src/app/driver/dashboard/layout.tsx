import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - Driver Portal - One App',
  description: 'Your One App driver dashboard — view earnings, rides, and manage your availability.',
};

export default function DashboardDriverLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
