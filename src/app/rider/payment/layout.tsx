import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Payment Methods - One App',
};

export default function PaymentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
