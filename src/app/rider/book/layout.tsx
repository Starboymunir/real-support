import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Book a Ride - RS CAB',
};

export default function BookRideLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
