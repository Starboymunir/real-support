'use client';

import { useState, useEffect } from 'react';
import {
  Car,
  MapPin,
  Clock,
  Star,
  Navigation,
  History,
  User,
  ArrowRight,
  CalendarDays,
  Bookmark,
  TrendingUp,
  Gift,
  ChevronRight,
  CircleDot,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: 'easeOut' },
  }),
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

const stats = [
  { label: 'Total Rides', value: '24', icon: Car, color: 'bg-primary/10 text-primary' },
  { label: 'This Month', value: '5', icon: TrendingUp, color: 'bg-secondary/10 text-secondary' },
  { label: 'Saved Places', value: '3', icon: Bookmark, color: 'bg-accent/10 text-accent' },
  { label: 'Avg Rating', value: '4.8★', icon: Star, color: 'bg-warning/10 text-warning' },
];

const recentRides = [
  { id: 'RS-1024', from: '12 Baker Street', to: 'Heathrow T5', fare: '£34.50', status: 'Completed', statusColor: 'bg-success/10 text-success' },
  { id: 'RS-1019', from: 'Kings Cross', to: 'Camden Town', fare: '£12.80', status: 'Cancelled', statusColor: 'bg-error/10 text-error' },
  { id: 'RS-1015', from: 'Paddington', to: 'Soho Square', fare: '£18.20', status: 'Completed', statusColor: 'bg-success/10 text-success' },
];

export default function RiderDashboard() {
  const [greeting, setGreeting] = useState('Good Morning');

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  return (
    <DashboardLayout role="rider" userName="James Rider" pageTitle="Dashboard">
      <div className="space-y-8">
        {/* ── Greeting ── */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={0}
          variants={fadeUp}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              {greeting}, <span className="gradient-text">James</span>!
            </h1>
            <p className="text-text-muted mt-1">Where would you like to go today?</p>
          </div>

          <div className="flex gap-3">
            <Button href="/rider/book" size="sm" variant="green">
              <Navigation size={16} /> Book a Ride
            </Button>
            <Button href="/rider/rides" size="sm" variant="outline">
              <History size={16} /> My Rides
            </Button>
            <Button href="/rider/profile" size="sm" variant="ghost">
              <User size={16} /> Profile
            </Button>
          </div>
        </motion.div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial="hidden"
              animate="visible"
              custom={i + 1}
              variants={fadeUp}
              className="bg-white rounded-xl border border-gray-100 p-5 card-hover transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color}`}>
                  <s.icon size={22} />
                </div>
                <div>
                  <p className="text-sm text-text-muted">{s.label}</p>
                  <p className="text-2xl font-bold text-text-primary">{s.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Quick Book  +  Upcoming Ride ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Book */}
          <motion.div
            initial="hidden"
            animate="visible"
            custom={5}
            variants={fadeUp}
            className="bg-white rounded-xl border border-gray-100 p-6 card-premium transition-all duration-200"
          >
            <h2 className="text-lg font-semibold text-text-primary mb-5">Quick Book</h2>

            <div className="relative space-y-4 pl-8">
              {/* Route dots + line */}
              <div className="absolute left-2.5 top-4 bottom-6 w-0.5 bg-gradient-to-b from-secondary to-accent rounded-full" />
              <div className="absolute left-0 top-3 w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-secondary" />
              </div>
              <div className="absolute left-0 bottom-14 w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-accent" />
              </div>

              <Input icon={MapPin} placeholder="Pickup location" />
              <Input icon={MapPin} placeholder="Drop-off location" />
            </div>

            <div className="mt-5">
              <Button variant="green" className="w-full">
                Book Now <ArrowRight size={16} />
              </Button>
            </div>
          </motion.div>

          {/* Upcoming Ride */}
          <motion.div
            initial="hidden"
            animate="visible"
            custom={6}
            variants={fadeUp}
            className="bg-white rounded-xl border border-gray-100 p-6 card-premium transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-text-primary">Upcoming Ride</h2>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-info/10 text-info">Scheduled</span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-text-muted">
                <span className="font-mono font-semibold text-text-primary">RS-1030</span>
              </div>

              {/* Route */}
              <div className="relative pl-8 space-y-3">
                <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-secondary to-accent rounded-full" />
                <div className="absolute left-0 top-1 w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-secondary" />
                </div>
                <div className="absolute left-0 bottom-0.5 w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                </div>

                <p className="text-sm font-medium text-text-primary">Baker Street</p>
                <p className="text-sm font-medium text-text-primary">Gatwick Airport</p>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <CalendarDays size={15} className="text-primary" />
                  <span>25 Feb 2026</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <Clock size={15} className="text-primary" />
                  <span>08:30 AM</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <Car size={15} className="text-primary" />
                  <span>Comfort</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                  <span>£45.00</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Recent Rides + Promo ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Rides */}
          <motion.div
            initial="hidden"
            animate="visible"
            custom={7}
            variants={fadeUp}
            className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-text-primary">Recent Rides</h2>
              <Button href="/rider/rides" variant="ghost" size="sm">
                View All <ChevronRight size={14} />
              </Button>
            </div>

            <div className="divide-y divide-gray-100">
              {recentRides.map((ride) => (
                <Link
                  key={ride.id}
                  href="/rider/rides"
                  className="flex items-center justify-between py-4 first:pt-0 last:pb-0 hover:bg-gray-50/50 -mx-2 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex flex-col items-center gap-0.5">
                      <CircleDot size={12} className="text-secondary" />
                      <div className="w-0.5 h-4 bg-gradient-to-b from-secondary to-accent rounded-full" />
                      <CircleDot size={12} className="text-accent" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text-primary">{ride.id}</p>
                      <p className="text-xs text-text-muted truncate">{ride.from} → {ride.to}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-text-primary">{ride.fare}</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${ride.statusColor}`}>
                      {ride.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Promo Card */}
          <motion.div
            initial="hidden"
            animate="visible"
            custom={8}
            variants={fadeUp}
            className="bg-gradient-to-br from-primary to-primary-light rounded-xl p-6 text-white flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center mb-4">
                <Gift size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">20% Off Your Next Ride!</h3>
              <p className="text-white/70 text-sm mb-4">Enjoy a special discount on your next booking with RS CAB.</p>
            </div>
            <div className="bg-white/15 rounded-lg px-4 py-3 text-center">
              <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Promo Code</p>
              <p className="text-lg font-bold tracking-widest">RSCAB20</p>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
