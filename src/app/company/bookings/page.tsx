'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/Button';
import { useRequireAuth } from '@/lib/use-require-auth';
import { bookingsApi } from '@/lib/services';
import type { Booking } from '@/lib/types';
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
      return 'bg-white/[0.06] text-white/40';
  }
}

/* ───── Dummy bookings (fallback) ───── */
type DisplayBooking = { id: string; employee: string; date: string; pickup: string; dropoff: string; vehicle: string; cost: string; status: string };

export default function CompanyBookingsPage() {
  const { user } = useRequireAuth();
  const [bookingsList, setBookingsList] = useState<DisplayBooking[]>([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [employeeFilter, setEmployeeFilter] = useState('All');

  const fetchBookings = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await bookingsApi.getUserBookings(user.id);
      const raw: Booking[] = Array.isArray(res) ? res : (res as { data?: Booking[] }).data || [];
      if (raw.length > 0) {
        const statusMap: Record<string, string> = { COMPLETED: 'Completed', CANCELLED: 'Cancelled', REJECTED: 'Cancelled', ACCEPTED: 'In Progress', WAY_TO_PICKUP: 'In Progress', ARRIVED: 'In Progress', PICKED_UP: 'In Progress', WAY_TO_DESTINATION: 'In Progress' };
        setBookingsList(raw.map((b, i) => ({
          id: b.id || `BK-${1041 - i}`,
          employee: b.riderName || 'Employee',
          date: new Date(b.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          pickup: b.startFrom?.name || b.startFrom?.postCode || 'Pickup',
          dropoff: b.destination?.name || b.destination?.postCode || 'Destination',
          vehicle: b.packageName || 'Standard',
          cost: `\u00A3${(b.finalBill || 0).toFixed(2)}`,
          status: statusMap[b.status] || 'Scheduled',
        })));
      }
    } catch { /* keep fallback */ }
  }, [user]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const statuses = ['All', 'Completed', 'In Progress', 'Scheduled', 'Cancelled'];
  const employees = ['All', ...Array.from(new Set(bookingsList.map((b) => b.employee)))];

  const filtered = bookingsList.filter((b) => {
    if (statusFilter !== 'All' && b.status !== statusFilter) return false;
    if (employeeFilter !== 'All' && b.employee !== employeeFilter) return false;
    return true;
  });

  const totalCost = filtered.reduce(
    (sum, b) => sum + parseFloat(b.cost.replace('£', '')),
    0,
  );

  return (
    <DashboardLayout role="company">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Company Bookings</h2>
          <p className="text-white/60 mt-1">Manage all corporate ride bookings</p>
        </div>
        <Button variant="primary" href="/company/bookings">
          <Plus size={18} /> New Booking
        </Button>
      </div>

      {/* Filter Section */}
      <div className="bg-white/[0.02] rounded-2xl border border-white/[0.06] p-5 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date From */}
          <div>
            <label className="block text-sm font-medium text-white mb-1.5">
              Date From
            </label>
            <div className="relative">
              <Calendar
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
              />
              <input type="date" className="input-field pl-10" defaultValue="2026-02-01" />
            </div>
          </div>

          {/* Date To */}
          <div>
            <label className="block text-sm font-medium text-white mb-1.5">
              Date To
            </label>
            <div className="relative">
              <Calendar
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
              />
              <input type="date" className="input-field pl-10" defaultValue="2026-02-18" />
            </div>
          </div>

          {/* Employee */}
          <div>
            <label className="block text-sm font-medium text-white mb-1.5">
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
            <label className="block text-sm font-medium text-white mb-1.5">
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
      <div className="bg-white/[0.02] rounded-2xl border border-white/[0.06] overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/[0.03] text-white/30">
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
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-white/[0.04] transition-colors">
                  <td className="px-5 py-4 font-mono text-xs text-accent font-semibold">
                    {b.id}
                  </td>
                  <td className="px-5 py-4 font-medium text-white">{b.employee}</td>
                  <td className="px-5 py-4 text-white/60">{b.date}</td>
                  <td className="px-5 py-4 text-white/60">
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-secondary shrink-0" />
                      {b.pickup} → {b.dropoff}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-white/60">{b.vehicle}</td>
                  <td className="px-5 py-4 font-semibold text-white">{b.cost}</td>
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
                        className="p-1.5 rounded-lg text-accent hover:bg-accent/10 transition-colors"
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
          <p className="text-white/60">
            Showing{' '}
            <span className="font-semibold text-white">{filtered.length}</span>{' '}
            bookings
          </p>
          <p className="text-white/60">
            Total Cost:{' '}
            <span className="font-semibold text-white">
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
