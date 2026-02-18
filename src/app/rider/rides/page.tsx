'use client';

import { useState, useMemo } from 'react';
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

const rides: Ride[] = [
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
  const [activeTab, setActiveTab] = useState<RideStatus>('All');
  const [search, setSearch] = useState('');

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
    <DashboardLayout role="rider" userName="James Rider" pageTitle="My Rides">
      <div className="space-y-6">
        {/* ── Header ── */}
        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
          <h1 className="text-2xl font-bold text-text-primary">My Rides</h1>
          <p className="text-text-muted mt-1">View and manage your ride history.</p>
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
          <div className="flex gap-2 bg-white rounded-xl border border-gray-100 p-1.5">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  activeTab === tab
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-text-muted hover:text-text-primary hover:bg-gray-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
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
                  className="bg-white rounded-xl border border-gray-100 p-5 card-hover transition-all duration-200"
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
                          <span className="text-sm font-mono font-bold text-text-primary">{ride.id}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusStyles[ride.status]}`}>
                            {ride.status}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-text-primary truncate">{ride.from}</p>
                        <p className="text-sm text-text-muted truncate mt-0.5">{ride.to}</p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-text-muted lg:justify-end">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays size={14} className="text-primary/60" />
                        {ride.date}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} className="text-primary/60" />
                        {ride.time}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <User size={14} className="text-primary/60" />
                        {ride.driver}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Car size={14} className="text-primary/60" />
                        {ride.vehicle}
                      </span>
                    </div>

                    {/* Price + Action */}
                    <div className="flex items-center gap-4 lg:ml-4">
                      <span className="text-lg font-bold text-text-primary">{ride.fare}</span>
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
                className="bg-white rounded-xl border border-gray-100 p-16 text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Inbox size={28} className="text-text-muted" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-1">No rides found</h3>
                <p className="text-sm text-text-muted">
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
