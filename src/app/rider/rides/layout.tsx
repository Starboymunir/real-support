import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Rides - RS Ride - Fast & Reliable Taxi Service',
}

export default function MyRidesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
