import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Book a Ride - RS Ride - Fast & Reliable Taxi Service',
}

export default function BookRideLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
