import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Earnings - Driver Portal - RS Ride',
  description: 'Track your RS Ride driver earnings, payouts, and transaction history.',
};

export default function EarningsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
