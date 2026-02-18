'use client';

import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import {
  CalendarCheck,
  Users,
  PoundSterling,
  TrendingUp,
  Plus,
  UserPlus,
  BarChart3,
  ArrowUpRight,
  Clock,
  MapPin,
} from 'lucide-react';

/* ───── Helpers ───── */
function getStatusStyle(status: string) {
  switch (status) {
    case 'Completed':
      return 'bg-success/10 text-success';
    case 'In Progress':
      return 'bg-info/10 text-info';
    case 'Cancelled':
      return 'bg-error/10 text-error';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

/* ───── Dummy data ───── */
const stats = [
  {
    label: 'Total Bookings',
    value: '156',
    icon: CalendarCheck,
    change: '+12%',
    color: 'bg-primary/10 text-primary',
  },
  {
    label: 'Active Employees',
    value: '23',
    icon: Users,
    change: '+3',
    color: 'bg-secondary/10 text-secondary',
  },
  {
    label: 'Monthly Spend',
    value: '£4,230',
    icon: PoundSterling,
    change: '-8%',
    color: 'bg-info/10 text-info',
  },
  {
    label: 'Avg Cost / Trip',
    value: '£18.50',
    icon: TrendingUp,
    change: '-£1.20',
    color: 'bg-warning/10 text-warning',
  },
];

const recentBookings = [
  {
    employee: 'Sarah Mitchell',
    date: '18 Feb 2026',
    route: 'Kings Cross → Canary Wharf',
    cost: '£22.00',
    status: 'Completed',
  },
  {
    employee: 'James Harlow',
    date: '17 Feb 2026',
    route: 'Heathrow T5 → Paddington',
    cost: '£38.50',
    status: 'In Progress',
  },
  {
    employee: 'Priya Sharma',
    date: '17 Feb 2026',
    route: 'Liverpool St → Shoreditch',
    cost: '£12.00',
    status: 'Completed',
  },
  {
    employee: 'Tom Walker',
    date: '16 Feb 2026',
    route: 'Waterloo → Westminster',
    cost: '£9.50',
    status: 'Cancelled',
  },
  {
    employee: 'Emma Collins',
    date: '16 Feb 2026',
    route: 'Bank → London Bridge',
    cost: '£8.00',
    status: 'Completed',
  },
];

const topEmployees = [
  { name: 'Sarah Mitchell', rides: 28, spent: '£620' },
  { name: 'James Harlow', rides: 22, spent: '£510' },
  { name: 'Priya Sharma', rides: 19, spent: '£380' },
  { name: 'Tom Walker', rides: 15, spent: '£305' },
  { name: 'Emma Collins', rides: 12, spent: '£240' },
];

export default function CompanyDashboardPage() {
  return (
    <DashboardLayout role="company" userName="Acme Corp">
      {/* Welcome Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-text-primary">
          Welcome back, <span className="gradient-text">Acme Corp</span>
        </h2>
        <p className="mt-1 text-text-secondary">
          Here&rsquo;s an overview of your corporate ride activity.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 card-hover"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-11 h-11 rounded-lg flex items-center justify-center ${s.color}`}
              >
                <s.icon size={22} />
              </div>
              <span className="text-xs font-semibold text-secondary flex items-center gap-0.5">
                {s.change} <ArrowUpRight size={14} />
              </span>
            </div>
            <p className="text-2xl font-bold text-text-primary">{s.value}</p>
            <p className="text-sm text-text-secondary mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Button variant="primary" href="/company/bookings">
          <Plus size={18} /> New Booking
        </Button>
        <Button variant="green" href="/company/employees">
          <UserPlus size={18} /> Add Employee
        </Button>
        <Button variant="outline" href="/company/reports">
          <BarChart3 size={18} /> View Reports
        </Button>
      </div>

      {/* Main Grid — Table + Sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Bookings Table */}
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-text-primary">Recent Bookings</h3>
            <Link
              href="/company/bookings"
              className="text-sm text-primary font-medium hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-text-secondary">
                  <th className="text-left px-6 py-3 font-medium">Employee</th>
                  <th className="text-left px-6 py-3 font-medium">Date</th>
                  <th className="text-left px-6 py-3 font-medium">Route</th>
                  <th className="text-left px-6 py-3 font-medium">Cost</th>
                  <th className="text-left px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentBookings.map((b, i) => (
                  <tr key={i} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4 font-medium text-text-primary">{b.employee}</td>
                    <td className="px-6 py-4 text-text-secondary">{b.date}</td>
                    <td className="px-6 py-4 text-text-secondary">
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-primary shrink-0" />
                        {b.route}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-text-primary">{b.cost}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyle(b.status)}`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Top Employees */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Top Employees</h3>
            <ul className="space-y-3">
              {topEmployees.map((emp, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                    {getInitials(emp.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {emp.name}
                    </p>
                    <p className="text-xs text-text-muted">{emp.rides} rides</p>
                  </div>
                  <span className="text-sm font-semibold text-text-primary">{emp.spent}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Active Bookings Gradient Card */}
          <div className="bg-gradient-to-br from-primary to-primary-light rounded-xl shadow-sm p-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              <Clock size={22} />
              <h3 className="text-lg font-semibold">Active Bookings</h3>
            </div>
            <p className="text-4xl font-bold mb-1">7</p>
            <p className="text-white/70 text-sm mb-4">rides currently in progress</p>
            <Link
              href="/company/bookings"
              className="inline-flex items-center gap-1 text-sm font-semibold text-white hover:underline"
            >
              View All <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
