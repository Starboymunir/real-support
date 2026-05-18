import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Documents - Driver Portal - RS Ride - One App',
  description: 'Upload your required documents to complete your RS Ride driver application.',
};

export default function DocumentsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
