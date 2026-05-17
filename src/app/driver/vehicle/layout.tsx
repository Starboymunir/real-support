import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vehicle Details - Driver Portal - One App',
  description: 'Add your vehicle details to complete your One App driver registration.',
};

export default function VehicleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
