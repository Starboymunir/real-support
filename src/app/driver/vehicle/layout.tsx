import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vehicle Details - Driver Portal - RS CAB',
  description: 'Add your vehicle details to complete your RS CAB driver registration.',
};

export default function VehicleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
