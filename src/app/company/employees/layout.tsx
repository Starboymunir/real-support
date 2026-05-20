import type { ReactNode } from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Employee Management - RS Ride - Fast & Reliable Taxi Service',
  description: 'Manage employees and their ride booking privileges.',
}

export default function CompanyEmployeesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
