import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Driver Portal - RS Ride - One App',
  description: 'RS Ride Driver Portal — Register, manage your vehicle, documents, and start earning.',
};

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
