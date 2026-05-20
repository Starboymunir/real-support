import type { ReactNode } from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Company Bookings - RS Ride - Fast & Reliable Taxi Service',
  description: 'View and manage all corporate ride bookings for your company.',
}

export default function CompanyBookingsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
