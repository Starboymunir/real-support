import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Support - RS Ride - Fast & Reliable Taxi Service',
}

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
