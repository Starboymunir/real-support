'use client';

import { useState, useEffect, useCallback } from 'react';
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
  Zap,
  Shield,
  Sparkles,
  Route,
  CreditCard,
  ArrowUpRight,
  CalendarOff,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/lib/auth-context';
import { useRequireAuth } from '@/lib/use-require-auth';
import { bookingsApi } from '@/lib/services/bookings';
import { walletApi } from '@/lib/services/wallet';
import { userAddressApi } from '@/lib/services/user';
import type { Booking } from '@/lib/types';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

/* ─── animated counter ─── */
function useCounter(end: number, dur = 1200) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let s = 0;
    const step = end / (dur / 16);
    const id = setInterval(() => {
      s += step;
      if (s >= end) { setN(end); clearInterval(id); } else setN(Math.floor(s));
    }, 16);
    return () => clearInterval(id);
  }, [end, dur]);
  return n;
}

/* Active booking statuses – ride hasn't ended yet */
const ACTIVE_STATUSES: string[] = ['ACCEPTED', 'WAY_TO_PICKUP', 'ARRIVED', 'PICKED_UP', 'WAY_TO_DESTINATION'];

const quickActions = [
  { label: 'Book a Ride', href: '/rider/book', icon: Navigation, gradient: 'from-secondary/20 to-emerald-500/20', accent: 'text-secondary', desc: 'Get moving' },
  { label: 'My Rides', href: '/rider/rides', icon: History, gradient: 'from-accent/20 to-blue-500/20', accent: 'text-accent', desc: 'View history' },
  { label: 'Profile', href: '/rider/profile', icon: User, gradient: 'from-purple-500/20 to-indigo-500/20', accent: 'text-purple-400', desc: 'Edit details' },
  { label: 'Payment', href: '/rider/payment', icon: CreditCard, gradient: 'from-orange-500/20 to-amber-500/20', accent: 'text-orange-400', desc: 'Manage cards' },
];

function getStatusColor(status: string) {
  if (['COMPLETED'].includes(status)) return 'bg-secondary/10 text-secondary border-secondary/20';
  if (['CANCELLED', 'REJECTED'].includes(status)) return 'bg-error/10 text-error border-error/20';
  return 'bg-accent/10 text-accent border-accent/20';
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'Yesterday';
  return `${d} days ago`;
}

export default function RiderDashboard() {
  const { user } = useRequireAuth();
  const [greeting, setGreeting] = useState('Good Morning');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [savedPlacesCount, setSavedPlacesCount] = useState(0);

  const totalRides = useCounter(bookings.length || 0);
  const monthRides = useCounter(
    bookings.filter((b) => {
      const d = new Date(b.createdAt);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length,
    800,
  );
  const savedPlaces = useCounter(savedPlacesCount, 600);

  /* Derive user rating from their profile (backend field) */
  const userRating = user?.ratings ?? 0;
  const filledStars = Math.round(userRating);

  useEffect(() => { setGreeting(getGreeting()); }, []);

  // Fetch bookings, wallet, and saved places
  useEffect(() => {
    if (!user) return;
    bookingsApi.getUserBookings(user.id).then((res) => {
      const bookingList = Array.isArray(res) ? res : [];
      if (bookingList.length > 0) setBookings(bookingList);
    }).catch(() => {});
    walletApi.getUserWallet(user.id).then((res) => {
      if (res) setWalletBalance(res.balance ?? 0);
    }).catch(() => {});
    userAddressApi.getAll().then((res) => {
      const list = Array.isArray(res) ? res : [];
      setSavedPlacesCount(list.length);
    }).catch(() => {});
  }, [user]);

  /* ── Upcoming ride: first active (non-completed, non-cancelled) booking ── */
  const upcomingRide = bookings.find((b) => ACTIVE_STATUSES.includes(b.status)) ?? null;

  /* ── Recent rides: latest 3, sorted newest-first ── */
  const recentRides = bookings.length > 0
    ? [...bookings]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3)
        .map((b) => ({
          id: b.uniqueId,
          from: b.startFrom?.city || b.startFrom?.name || 'Unknown',
          to: b.destination?.city || b.destination?.name || 'Unknown',
          fare: `£${(b.finalBill ?? b.totalBill ?? 0).toFixed(2)}`,
          status: b.status.replace(/_/g, ' '),
          time: timeAgo(b.createdAt),
          statusColor: getStatusColor(b.status),
        }))
    : [];

  const firstName = user?.firstName || 'Rider';

  return (
    <DashboardLayout role="rider" pageTitle="Dashboard">
      <div className="space-y-6">

        {/* ═══════ GREETING + QUICK ACTIONS ═══════ */}
        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8">
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-secondary/[0.04] rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-16 left-1/3 w-56 h-56 bg-accent/[0.03] rounded-full blur-[80px] pointer-events-none" />

            <div className="relative">
              <div className="badge-green mb-3"><Sparkles size={12} /> RS CAB Rider</div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                {greeting}, <span className="gradient-text">{firstName}</span>!
              </h1>
              <p className="text-white/40 mt-1.5 text-sm">Where would you like to go today?</p>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                {quickActions.map((a) => {
                  const Icon = a.icon;
                  return (
                    <Link
                      key={a.label}
                      href={a.href}
                      className="group p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300"
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                        <Icon size={18} className={a.accent} />
                      </div>
                      <p className="text-sm font-bold text-white">{a.label}</p>
                      <p className="text-[11px] text-white/30 mt-0.5">{a.desc}</p>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══════ BENTO STATS ═══════ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp} className="col-span-2 lg:col-span-1">
            <div className="h-full rounded-2xl border border-white/[0.06] bg-gradient-to-br from-secondary/[0.08] via-white/[0.02] to-transparent p-6 relative overflow-hidden">
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-secondary/[0.1] rounded-full blur-2xl pointer-events-none" />
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center mb-3">
                  <Car size={20} className="text-secondary" />
                </div>
                <p className="text-3xl font-black text-white tabular-nums">{totalRides}</p>
                <p className="text-white/30 text-xs font-medium mt-1">Total Rides</p>
                <div className="mt-3 flex items-center gap-1">
                  {monthRides > 0 && (
                    <>
                      <span className="text-secondary text-xs font-semibold flex items-center gap-0.5"><ArrowUpRight size={11} />{monthRides}</span>
                      <span className="text-white/20 text-[10px]">this month</span>
                    </>
                  )}
                  {monthRides === 0 && (
                    <span className="text-white/20 text-[10px]">No rides this month</span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp}>
            <div className="h-full rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-all group">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <TrendingUp size={20} className="text-accent" />
              </div>
              <p className="text-3xl font-black text-white tabular-nums">{monthRides}</p>
              <p className="text-white/30 text-xs font-medium mt-1">This Month</p>
            </div>
          </motion.div>

          <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp}>
            <div className="h-full rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-all group">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Bookmark size={20} className="text-purple-400" />
              </div>
              <p className="text-3xl font-black text-white tabular-nums">{savedPlaces}</p>
              <p className="text-white/30 text-xs font-medium mt-1">Saved Places</p>
            </div>
          </motion.div>

          <motion.div initial="hidden" animate="visible" custom={4} variants={fadeUp}>
            <div className="h-full rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-all group">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Star size={20} className="text-yellow-400" />
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={9} className={i < filledStars ? 'text-yellow-400 fill-yellow-400' : 'text-white/10'} />
                  ))}
                </div>
              </div>
              <p className="text-3xl font-black text-white">{userRating > 0 ? userRating.toFixed(1) : 'N/A'}</p>
              <p className="text-white/30 text-xs font-medium mt-1">Avg Rating</p>
            </div>
          </motion.div>
        </div>

        {/* ═══════ QUICK BOOK + UPCOMING ═══════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Book */}
          <motion.div initial="hidden" animate="visible" custom={5} variants={fadeUp}>
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-secondary via-accent to-secondary" />
              <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <Route size={18} className="text-secondary" /> Quick Book
              </h2>

              <div className="relative space-y-4 pl-8">
                <div className="absolute left-[9px] top-5 bottom-16 w-[2px] bg-gradient-to-b from-secondary to-accent rounded-full" />
                <div className="absolute left-0 top-4 w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center ring-2 ring-dark/60">
                  <div className="w-2.5 h-2.5 rounded-full bg-secondary shadow-[0_0_8px_rgba(0,230,118,0.5)]" />
                </div>
                <div className="absolute left-0 bottom-[60px] w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center ring-2 ring-dark/60">
                  <div className="w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_8px_rgba(0,176,255,0.5)]" />
                </div>

                <Input icon={MapPin} placeholder="Pickup location" />
                <Input icon={MapPin} placeholder="Drop-off location" />
              </div>

              <div className="mt-5">
                <Button variant="green" className="w-full" href="/rider/book">
                  Book Now <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Upcoming Ride */}
          <motion.div initial="hidden" animate="visible" custom={6} variants={fadeUp}>
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 h-full">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent via-secondary to-accent" />

              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-white">Upcoming Ride</h2>
                {upcomingRide && (
                  <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-accent/10 text-accent border border-accent/20">
                    {upcomingRide.status.replace(/_/g, ' ')}
                  </span>
                )}
              </div>

              {upcomingRide ? (
                <>
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.04] mb-5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/25">Booking ID</span>
                    <p className="font-mono font-bold text-white mt-0.5">{upcomingRide.uniqueId}</p>
                  </div>

                  {/* Route */}
                  <div className="relative pl-8 space-y-4 mb-5">
                    <div className="absolute left-[9px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-secondary to-accent rounded-full" />
                    <div className="relative">
                      <div className="absolute -left-[22px] top-0.5 w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center ring-4 ring-dark/40">
                        <div className="w-2.5 h-2.5 rounded-full bg-secondary shadow-[0_0_8px_rgba(0,230,118,0.5)]" />
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-secondary/60">Pickup</p>
                      <p className="font-bold text-white mt-0.5">{upcomingRide.startFrom?.city || upcomingRide.startFrom?.name || 'TBD'}</p>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[22px] top-0.5 w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center ring-4 ring-dark/40">
                        <div className="w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_8px_rgba(0,176,255,0.5)]" />
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-accent/60">Drop-off</p>
                      <p className="font-bold text-white mt-0.5">{upcomingRide.destination?.city || upcomingRide.destination?.name || 'TBD'}</p>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: CalendarDays, label: upcomingRide.bookingDate || new Date(upcomingRide.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), color: 'text-secondary' },
                      { icon: Clock, label: upcomingRide.bookingTime || new Date(upcomingRide.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), color: 'text-accent' },
                      { icon: Car, label: upcomingRide.packageName || 'Standard', color: 'text-purple-400' },
                      { icon: CreditCard, label: `£${(upcomingRide.finalBill ?? upcomingRide.totalBill ?? 0).toFixed(2)}`, color: 'text-orange-400' },
                    ].map((m) => (
                      <div key={m.label} className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                        <m.icon size={14} className={m.color} />
                        <span className="text-sm text-white/60 font-medium">{m.label}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
                    <CalendarOff size={28} className="text-white/20" />
                  </div>
                  <p className="text-white/40 text-sm font-medium mb-1">No upcoming rides</p>
                  <p className="text-white/20 text-xs mb-4">Book your next journey to see it here</p>
                  <Button variant="green" size="sm" href="/rider/book">
                    Book a Ride <ArrowRight size={14} />
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* ═══════ RECENT RIDES + PROMO ═══════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Rides */}
          <motion.div initial="hidden" animate="visible" custom={7} variants={fadeUp} className="lg:col-span-2">
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-white">Recent Rides</h2>
                <Button href="/rider/rides" variant="ghost" size="sm">
                  View All <ChevronRight size={14} />
                </Button>
              </div>

              <div className="space-y-3">
                {recentRides.length > 0 ? (
                  recentRides.map((ride) => (
                    <Link
                      key={ride.id}
                      href="/rider/rides"
                      className="group flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="flex flex-col items-center gap-0.5 shrink-0">
                          <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_6px_rgba(0,230,118,0.4)]" />
                          <div className="w-[2px] h-5 bg-gradient-to-b from-secondary to-accent rounded-full" />
                          <div className="w-2 h-2 rounded-full bg-accent shadow-[0_0_6px_rgba(0,176,255,0.4)]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white">{ride.id}</p>
                          <p className="text-xs text-white/30 truncate mt-0.5">{ride.from} → {ride.to}</p>
                          <p className="text-[10px] text-white/20 mt-0.5">{ride.time}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-black text-white tabular-nums">{ride.fare}</span>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${ride.statusColor}`}>
                          {ride.status}
                        </span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <History size={28} className="text-white/15 mb-3" />
                    <p className="text-white/30 text-sm font-medium">No rides yet</p>
                    <p className="text-white/15 text-xs mt-1">Your ride history will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Wallet Card */}
          <motion.div initial="hidden" animate="visible" custom={8} variants={fadeUp}>
            <div className="relative h-full overflow-hidden rounded-2xl border border-secondary/20 bg-gradient-to-br from-secondary/[0.08] via-dark-surface to-accent/[0.04] p-6 flex flex-col justify-between">
              <div className="absolute -top-16 -right-16 w-40 h-40 bg-secondary/[0.1] rounded-full blur-[60px] pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-accent/[0.06] rounded-full blur-[40px] pointer-events-none" />

              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center mb-5">
                  <CreditCard size={26} className="text-secondary" />
                </div>
                <h3 className="text-xl font-black text-white mb-2">Wallet Balance</h3>
                <p className="text-white/40 text-sm leading-relaxed">Your current RS CAB wallet balance.</p>
              </div>

              <div className="relative mt-6 bg-white/[0.04] border border-white/[0.06] rounded-xl px-5 py-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-1">Available</p>
                <p className="text-xl font-black tracking-[0.05em] gradient-text">£{walletBalance.toFixed(2)}</p>
              </div>

              <div className="relative mt-4">
                <Button variant="green" className="w-full" href="/rider/payment" size="sm">
                  Top Up Wallet <ArrowRight size={14} />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
