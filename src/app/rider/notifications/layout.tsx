import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Notifications - RS CAB',
};

export default function NotificationsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
