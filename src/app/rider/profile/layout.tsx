import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Profile - RS Ride - One App',
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
