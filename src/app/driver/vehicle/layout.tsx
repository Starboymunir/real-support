import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vehicle Details - Driver Portal - RS Ride - One App',
  description: 'Add your vehicle details to complete your RS Ride driver registration.',
};

export default function VehicleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
