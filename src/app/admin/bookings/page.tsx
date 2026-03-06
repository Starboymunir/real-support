'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  Clock,
  DollarSign,
  User,
  Car,
  Loader2,
  Eye,
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/lib/auth-context';
import { adminBookingsApi } from '@/lib/services';
import type { Booking } from '@/lib/types';

type FilterTab = 'ALL' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED';

const statusColors: Record<string, string> = {
  ACCEPTED: 'text-blue-400 bg-blue-400/10',
  WAY_TO_PICKUP: 'text-amber-400 bg-amber-400/10',
  ARRIVED: 'text-cyan-400 bg-cyan-400/10',
  PICKED_UP: 'text-indigo-400 bg-indigo-400/10',
  WAY_TO_DESTINATION: 'text-violet-400 bg-violet-400/10',
  COMPLETED: 'text-emerald-400 bg-emerald-400/10',
  CANCELLED: 'text-red-400 bg-red-400/10',
  REJECTED: 'text-orange-400 bg-orange-400/10',
};

export default function AdminBookingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (!user?.Admin) {
      router.replace('/admin/login');
      return;
    }
    adminBookingsApi
      .getAll()
      .then((data) => setBookings(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, router]);

  if (!user?.Admin) return null;

  const tabs: FilterTab[] = ['ALL', 'ACCEPTED', 'COMPLETED', 'CANCELLED'];

  const filtered = bookings.filter((b) => {
    if (activeTab !== 'ALL' && b.status !== activeTab) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        (b.riderName ?? '').toLowerCase().includes(q) ||
        (b.driverName ?? '').toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <DashboardLayout role="admin" pageTitle="Bookings Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-white/40 text-sm">{bookings.length} total bookings</p>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
            <input
              type="text"
              placeholder="Search by rider, driver, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-dark pl-11 text-sm"
            />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-secondary/10 text-secondary border border-secondary/20'
                  : 'text-white/40 hover:text-white/60 border border-white/[0.06] hover:bg-white/[0.04]'
              }`}
            >
              {tab === 'ALL' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Bookings list */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 size={28} className="animate-spin text-secondary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12 text-center">
            <Filter size={40} className="mx-auto text-white/10 mb-3" />
            <p className="text-white/30 text-lg font-medium">No bookings found</p>
            <p className="text-white/15 text-sm mt-1">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((booking) => {
              const statusClass = statusColors[booking.status] || 'text-white/40 bg-white/5';
              return (
                <div
                  key={booking.id}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Route info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${statusClass}`}>
                          {booking.status.replace(/_/g, ' ')}
                        </span>
                        <span className="text-white/20 text-xs font-mono">
                          #{booking.id.slice(-8)}
                        </span>
                      </div>
                      <div className="space-y-1.5 text-sm">
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                          <span className="text-white/60 truncate">
                            {booking.startFrom?.city || 'Pickup'}
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-400 mt-1.5 shrink-0" />
                          <span className="text-white/60 truncate">
                            {booking.destination?.city || 'Destination'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* People */}
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-white/25" />
                        <span className="text-white/50">
                          {booking.riderName || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Car size={14} className="text-white/25" />
                        <span className="text-white/50">
                          {booking.driverName || 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Price & date */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5">
                        <DollarSign size={14} className="text-secondary" />
                        <span className="text-white font-semibold">
                          £{(booking.totalBill ?? 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-white/30">
                        <Clock size={14} />
                        <span>{new Date(booking.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <button
                      onClick={() => setSelectedBooking(selectedBooking?.id === booking.id ? null : booking)}
                      className="p-2 rounded-xl text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-colors"
                    >
                      <Eye size={18} />
                    </button>
                  </div>

                  {/* Expanded detail */}
                  {selectedBooking?.id === booking.id && (
                    <div className="mt-4 pt-4 border-t border-white/[0.06] grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-white/25 text-xs uppercase tracking-wide mb-1">Distance</p>
                        <p className="text-white/60">{booking.totalDistance?.toFixed(1) ?? '—'} miles</p>
                      </div>
                      <div>
                        <p className="text-white/25 text-xs uppercase tracking-wide mb-1">Duration</p>
                        <p className="text-white/60">{booking.totalDuration ?? '—'} min</p>
                      </div>
                      <div>
                        <p className="text-white/25 text-xs uppercase tracking-wide mb-1">Payment</p>
                        <p className="text-white/60">{booking.paymentType ?? '—'}</p>
                      </div>
                      <div>
                        <p className="text-white/25 text-xs uppercase tracking-wide mb-1">Rider Phone</p>
                        <p className="text-white/60">{booking.riderPhone ?? 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-white/25 text-xs uppercase tracking-wide mb-1">Driver Phone</p>
                        <p className="text-white/60">{booking.driverPhone ?? 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-white/25 text-xs uppercase tracking-wide mb-1">Created</p>
                        <p className="text-white/60">{new Date(booking.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
