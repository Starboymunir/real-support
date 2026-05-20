import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Notifications - RS Ride - Fast & Reliable Taxi Service',
}

export default function NotificationsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
