import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Rides - One App',
};

export default function MyRidesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
