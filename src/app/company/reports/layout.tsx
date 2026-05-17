import type { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reports & Analytics - One App',
  description: 'Corporate ride analytics, spending reports, and department breakdowns.',
};

export default function CompanyReportsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
