import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Notifications - RS Ride - One App',
};

export default function NotificationsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
