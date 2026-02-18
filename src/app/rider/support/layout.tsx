import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Support - RS CAB',
};

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
