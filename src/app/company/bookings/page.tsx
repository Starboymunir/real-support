'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/Button';
import {
  Plus,
  Calendar,
  MapPin,
  Eye,
  XCircle,
  Download,
  Printer,
} from 'lucide-react';

/* ───── Helper ───── */
function getStatusStyle(status: string) {
  switch (status) {
    case 'Completed':
      return 'bg-success/10 text-success';
    case 'In Progress':
      return 'bg-info/10 text-info';
    case 'Cancelled':
      return 'bg-error/10 text-error';
    case 'Scheduled':
      return 'bg-warning/10 text-warning';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}

/* ───── Dummy bookings ───── */
const bookings = [
  {
    id: 'BK-1041',
    employee: 'Sarah Mitchell',
    date: '18 Feb 2026',
    pickup: 'Kings Cross',
    dropoff: 'Canary Wharf',
    vehicle: 'Executive',
    cost: '£22.00',
    status: 'Completed',
  },
  {
    id: 'BK-1040',
    employee: 'James Harlow',
    date: '17 Feb 2026',
    pickup: 'Heathrow T5',
    dropoff: 'Paddington',
    vehicle: 'Premium',
    cost: '£38.50',
    status: 'In Progress',
  },
  {
    id: 'BK-1039',
    employee: 'Priya Sharma',
    date: '17 Feb 2026',
    pickup: 'Liverpool St',
    dropoff: 'Shoreditch',
    vehicle: 'Standard',
    cost: '£12.00',
    status: 'Completed',
  },
  {
    id: 'BK-1038',
    employee: 'Tom Walker',
    date: '16 Feb 2026',
    pickup: 'Waterloo',
    dropoff: 'Westminster',
    vehicle: 'Standard',
    cost: '£9.50',
    status: 'Cancelled',
  },
  {
    id: 'BK-1037',
    employee: 'Emma Collins',
    date: '16 Feb 2026',
    pickup: 'Bank',
    dropoff: 'London Bridge',
    vehicle: 'Standard',
    cost: '£8.00',
    status: 'Completed',
  },
  {
    id: 'BK-1036',
    employee: 'David Chen',
    date: '15 Feb 2026',
    pickup: 'Euston',
    dropoff: 'Camden',
    vehicle: 'Executive',
    cost: '£15.00',
    status: 'Completed',
  },
  {
    id: 'BK-1035',
    employee: 'Olivia Brown',
    date: '15 Feb 2026',
    pickup: 'Victoria',
    dropoff: 'Chelsea',
    vehicle: 'Premium',
    cost: '£19.00',
    status: 'Scheduled',
  },
  {
    id: 'BK-1034',
    employee: 'Liam Patel',
    date: '14 Feb 2026',
    pickup: 'Stratford',
    dropoff: 'Canary Wharf',
    vehicle: 'Standard',
    cost: '£11.50',
    status: 'Completed',
  },
];

export default function CompanyBookingsPage() {
  const [statusFilter, setStatusFilter] = useState('All');
  const [employeeFilter, setEmployeeFilter] = useState('All');

  const statuses = ['All', 'Completed', 'In Progress', 'Scheduled', 'Cancelled'];
  const employees = ['All', ...Array.from(new Set(bookings.map((b) => b.employee)))];

  const filtered = bookings.filter((b) => {
    if (statusFilter !== 'All' && b.status !== statusFilter) return false;
    if (employeeFilter !== 'All' && b.employee !== employeeFilter) return false;
    return true;
  });

  const totalCost = filtered.reduce(
    (sum, b) => sum + parseFloat(b.cost.replace('£', '')),
    0,
  );

  return (
    <DashboardLayout role="company" userName="Acme Corp">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Company Bookings</h2>
          <p className="text-text-secondary mt-1">Manage all corporate ride bookings</p>
        </div>
        <Button variant="primary" href="/company/bookings">
          <Plus size={18} /> New Booking
        </Button>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date From */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Date From
            </label>
            <div className="relative">
              <Calendar
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
              />
              <input type="date" className="input-field pl-10" defaultValue="2026-02-01" />
            </div>
          </div>

          {/* Date To */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Date To
            </label>
            <div className="relative">
              <Calendar
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
              />
              <input type="date" className="input-field pl-10" defaultValue="2026-02-18" />
            </div>
          </div>

          {/* Employee */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Employee
            </label>
            <select
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              className="input-field"
            >
              {employees.map((emp) => (
                <option key={emp}>{emp}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              {statuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-text-secondary">
                <th className="text-left px-5 py-3.5 font-medium">ID</th>
                <th className="text-left px-5 py-3.5 font-medium">Employee</th>
                <th className="text-left px-5 py-3.5 font-medium">Date</th>
                <th className="text-left px-5 py-3.5 font-medium">Route</th>
                <th className="text-left px-5 py-3.5 font-medium">Vehicle</th>
                <th className="text-left px-5 py-3.5 font-medium">Cost</th>
                <th className="text-left px-5 py-3.5 font-medium">Status</th>
                <th className="text-left px-5 py-3.5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-4 font-mono text-xs text-primary font-semibold">
                    {b.id}
                  </td>
                  <td className="px-5 py-4 font-medium text-text-primary">{b.employee}</td>
                  <td className="px-5 py-4 text-text-secondary">{b.date}</td>
                  <td className="px-5 py-4 text-text-secondary">
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-primary shrink-0" />
                      {b.pickup} → {b.dropoff}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-text-secondary">{b.vehicle}</td>
                  <td className="px-5 py-4 font-semibold text-text-primary">{b.cost}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyle(b.status)}`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                      {b.status !== 'Completed' && b.status !== 'Cancelled' && (
                        <button
                          className="p-1.5 rounded-lg text-error hover:bg-error/10 transition-colors"
                          title="Cancel"
                        >
                          <XCircle size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Bar + Bulk Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Summary */}
        <div className="flex items-center gap-6 text-sm">
          <p className="text-text-secondary">
            Showing{' '}
            <span className="font-semibold text-text-primary">{filtered.length}</span>{' '}
            bookings
          </p>
          <p className="text-text-secondary">
            Total Cost:{' '}
            <span className="font-semibold text-text-primary">
              £{totalCost.toFixed(2)}
            </span>
          </p>
        </div>

        {/* Bulk Actions */}
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download size={16} /> Export CSV
          </Button>
          <Button variant="outline" size="sm">
            <Printer size={16} /> Print
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
