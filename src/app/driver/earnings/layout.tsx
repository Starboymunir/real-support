import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Earnings - Driver Portal - One App',
  description: 'Track your One App driver earnings, payouts, and transaction history.',
};

export default function EarningsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
