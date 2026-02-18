import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Driver Portal - RS CAB',
  description: 'RS CAB Driver Portal — Register, manage your vehicle, documents, and start earning.',
};

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
