import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Documents - Driver Portal - One App',
  description: 'Upload your required documents to complete your One App driver application.',
};

export default function DocumentsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
