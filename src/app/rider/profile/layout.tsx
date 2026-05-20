import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Profile - RS Ride - Fast & Reliable Taxi Service',
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
