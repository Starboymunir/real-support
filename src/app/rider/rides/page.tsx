'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Search,
  CalendarDays,
  Clock,
  User,
  Car,
  CircleDot,
  ChevronRight,
  Inbox,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/Button';
import { useRequireAuth } from '@/lib/use-require-auth';
import { bookingsApi } from '@/lib/services/bookings';
import type { Booking } from '@/lib/types';

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: 'easeOut' },
  }),
};

type RideStatus = 'All' | 'Completed' | 'Cancelled' | 'Scheduled';

interface Ride {
  id: string;
  from: string;
  to: string;
  date: string;
  time: string;
  driver: string;
  vehicle: string;
  fare: string;
  status: 'Completed' | 'Cancelled' | 'Scheduled';
}

function mapBookingStatus(status: string): 'Completed' | 'Cancelled' | 'Scheduled' {
  switch (status) {
    case 'COMPLETED': return 'Completed';
    case 'CANCELLED':
    case 'REJECTED':
      return 'Cancelled';
    case 'ACCEPTED':
    case 'WAY_TO_PICKUP':
    case 'ARRIVED':
    case 'PICKED_UP':
    case 'WAY_TO_DESTINATION':
      return 'Scheduled';
    default: return 'Scheduled';
  }
}

function bookingToRide(b: Booking): Ride {
  const d = new Date(b.createdAt);
  return {
    id: b.id.slice(-6).toUpperCase(),
    from: b.startFrom?.name || b.startFrom?.postCode || 'Pickup',
    to: b.destination?.name || b.destination?.postCode || 'Destination',
    date: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase(),
    driver: b.driverName || 'Pending',
    vehicle: b.packageName || 'Comfort',
    fare: `£${(b.finalBill ?? b.totalBill ?? 0).toFixed(2)}`,
    status: mapBookingStatus(b.status),
  };
}

const fallbackRides: Ride[] = [
  { id: 'RS-1024', from: '12 Baker Street', to: 'Heathrow T5', date: '14 Feb 2026', time: '09:15 AM', driver: 'Michael Smith', vehicle: 'Toyota Camry', fare: '£34.50', status: 'Completed' },
  { id: 'RS-1022', from: 'Kings Cross', to: 'Canary Wharf', date: '12 Feb 2026', time: '02:30 PM', driver: 'Sarah Johnson', vehicle: 'Honda Civic', fare: '£22.00', status: 'Completed' },
  { id: 'RS-1019', from: 'Kings Cross', to: 'Camden Town', date: '10 Feb 2026', time: '11:00 AM', driver: 'David Brown', vehicle: 'VW Passat', fare: '£12.80', status: 'Cancelled' },
  { id: 'RS-1015', from: 'Paddington', to: 'Soho Square', date: '8 Feb 2026', time: '06:45 PM', driver: 'Emma Wilson', vehicle: 'Mercedes E-Class', fare: '£18.20', status: 'Completed' },
  { id: 'RS-1030', from: 'Baker Street', to: 'Gatwick Airport', date: '25 Feb 2026', time: '08:30 AM', driver: 'Pending', vehicle: 'Comfort', fare: '£45.00', status: 'Scheduled' },
  { id: 'RS-1012', from: 'Liverpool Street', to: 'Greenwich', date: '5 Feb 2026', time: '04:00 PM', driver: 'James Taylor', vehicle: 'Skoda Octavia', fare: '£16.50', status: 'Completed' },
];

const tabs: RideStatus[] = ['All', 'Completed', 'Cancelled', 'Scheduled'];

const statusStyles: Record<string, string> = {
  Completed: 'bg-success/10 text-success',
  Cancelled: 'bg-error/10 text-error',
  Scheduled: 'bg-info/10 text-info',
};

export default function MyRides() {
  const { user } = useRequireAuth();
  const [activeTab, setActiveTab] = useState<RideStatus>('All');
  const [search, setSearch] = useState('');
  const [rides, setRides] = useState<Ride[]>(fallbackRides);

  const fetchRides = useCallback(async () => {
    if (!user?.id) return;
    try {
      const bookings = await bookingsApi.getUserBookings(user.id);
      if (bookings && bookings.length > 0) {
        setRides(bookings.map(bookingToRide));
      }
    } catch {
      // keep fallback
    }
  }, [user?.id]);

  useEffect(() => { fetchRides(); }, [fetchRides]);

  const filtered = useMemo(() => {
    return rides.filter((r) => {
      const matchTab = activeTab === 'All' || r.status === activeTab;
      const matchSearch =
        !search ||
        r.id.toLowerCase().includes(search.toLowerCase()) ||
        r.from.toLowerCase().includes(search.toLowerCase()) ||
        r.to.toLowerCase().includes(search.toLowerCase()) ||
        r.driver.toLowerCase().includes(search.toLowerCase());
      return matchTab && matchSearch;
    });
  }, [activeTab, search]);

  return (
    <DashboardLayout role="rider" pageTitle="My Rides">
      <div className="space-y-6">
        {/* ── Header ── */}
        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
          <h1 className="text-2xl font-bold text-white">My Rides</h1>
          <p className="text-white/40 mt-1">View and manage your ride history.</p>
        </motion.div>

        {/* ── Filters ── */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={1}
          variants={fadeUp}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          {/* Tabs */}
          <div className="flex gap-2 bg-white/[0.03] rounded-xl border border-white/[0.06] p-1.5">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  activeTab === tab
                    ? 'bg-secondary text-dark'
                    : 'text-white/40 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
            <input
              type="text"
              placeholder="Search rides..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>
        </motion.div>

        {/* ── Ride Cards ── */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filtered.length > 0 ? (
              filtered.map((ride, i) => (
                <motion.div
                  key={ride.id}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, y: -10 }}
                  custom={i + 2}
                  variants={fadeUp}
                  layout
                  className="bg-white/[0.02] rounded-2xl border border-white/[0.06] p-5 hover:bg-white/[0.04] transition-all duration-200"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Route */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="flex flex-col items-center gap-0.5 pt-0.5">
                        <CircleDot size={14} className="text-secondary" />
                        <div className="w-0.5 h-6 bg-gradient-to-b from-secondary to-accent rounded-full" />
                        <CircleDot size={14} className="text-accent" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-sm font-mono font-bold text-accent">{ride.id}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusStyles[ride.status]}`}>
                            {ride.status}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-white truncate">{ride.from}</p>
                        <p className="text-sm text-white/40 truncate mt-0.5">{ride.to}</p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/40 lg:justify-end">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays size={14} className="text-white/30" />
                        {ride.date}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} className="text-white/30" />
                        {ride.time}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <User size={14} className="text-white/30" />
                        {ride.driver}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Car size={14} className="text-white/30" />
                        {ride.vehicle}
                      </span>
                    </div>

                    {/* Price + Action */}
                    <div className="flex items-center gap-4 lg:ml-4">
                      <span className="text-lg font-bold text-white">{ride.fare}</span>
                      <Button href={`/rider/rides/${ride.id}`} variant="outline" size="sm">
                        View <ChevronRight size={14} />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/[0.02] rounded-2xl border border-white/[0.06] p-16 text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/[0.06] flex items-center justify-center mx-auto mb-4">
                  <Inbox size={28} className="text-white/40" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">No rides found</h3>
                <p className="text-sm text-white/40">
                  {search ? 'Try adjusting your search criteria.' : 'No rides match the selected filter.'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
}
