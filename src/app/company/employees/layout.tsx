import type { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Employee Management - RS Ride - One App',
  description: 'Manage employees and their ride booking privileges.',
};

export default function CompanyEmployeesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
