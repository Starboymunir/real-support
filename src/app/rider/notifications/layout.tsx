import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Notifications - One App',
};

export default function NotificationsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
