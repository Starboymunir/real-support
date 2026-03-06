'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRequireAuth } from '@/lib/use-require-auth';
import { bookingsApi, companyApi } from '@/lib/services';
import type { Booking } from '@/lib/types';
import {
  CalendarCheck,
  Users,
  PoundSterling,
  Plus,
  UserPlus,
  BarChart3,
  ArrowUpRight,
  Clock,
  MapPin,
  Building2,
  Trophy,
  Activity,
} from 'lucide-react';

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

/* ─── arc progress ─── */
function ArcProgress({ value, size = 44, stroke = 4, color = 'var(--color-secondary)' }: { value: number; size?: number; stroke?: number; color?: string }) {
  const r = (size - stroke) / 2;
  const c = r * 2 * Math.PI;
  const offset = c - (value / 100) * c;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
    </svg>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

function getStatusStyle(status: string) {
  switch (status) {
    case 'Completed': return 'bg-secondary/10 text-secondary border border-secondary/20';
    case 'In Progress': return 'bg-accent/10 text-accent border border-accent/20';
    case 'Cancelled': return 'bg-error/10 text-error border border-error/20';
    default: return 'bg-white/[0.06] text-white/40';
  }
}

function getInitials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase();
}

const recentBookings: { employee: string; date: string; route: string; cost: string; status: string }[] = [];

const topEmployees: { name: string; rides: number; spent: string; pct: number }[] = [];

export default function CompanyDashboardPage() {
  const { user } = useRequireAuth();
  const [bookingCount, setBookingCount] = useState(0);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [monthlySpend, setMonthlySpend] = useState(0);
  const [activeRidesCount, setActiveRidesCount] = useState(0);
  const [recentBookingsData, setRecentBookingsData] = useState(recentBookings);
  const [topEmployeesData, setTopEmployeesData] = useState(topEmployees);
  const bookings = useCounter(bookingCount);
  const employees = useCounter(employeeCount, 800);
  const monthSpend = useCounter(monthlySpend);
  const activeRides = useCounter(activeRidesCount, 600);
  const companyName = user?.firstName || 'Company';

  const fetchCompanyData = useCallback(async () => {
    if (!user?.id) return;
    try {
      // Fetch bookings for the user to get company ride activity
      const res = await bookingsApi.getUserBookings(user.id);
      const allBookings: Booking[] = Array.isArray(res) ? res : (res as { data?: Booking[] }).data || [];
      if (allBookings.length > 0) {
        setBookingCount(allBookings.length);
        const active = allBookings.filter(b => (['ACCEPTED', 'WAY_TO_PICKUP', 'ARRIVED', 'PICKED_UP', 'WAY_TO_DESTINATION'] as string[]).includes(b.status));
        setActiveRidesCount(active.length);
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthBookings = allBookings.filter(b => new Date(b.createdAt) >= monthStart);
        const total = monthBookings.reduce((s, b) => s + (b.finalBill || 0), 0);
        if (total > 0) setMonthlySpend(Math.round(total));

        const sorted = [...allBookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
        setRecentBookingsData(sorted.map(b => {
          const statusMap: Record<string, string> = { COMPLETED: 'Completed', CANCELLED: 'Cancelled', REJECTED: 'Cancelled', ACCEPTED: 'In Progress', WAY_TO_PICKUP: 'In Progress', ARRIVED: 'In Progress', PICKED_UP: 'In Progress', WAY_TO_DESTINATION: 'In Progress' };
          return {
            employee: b.riderName || 'Employee',
            date: new Date(b.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            route: `${b.startFrom?.name || b.startFrom?.postCode || 'Pickup'} \u2192 ${b.destination?.name || b.destination?.postCode || 'Destination'}`,
            cost: `\u00A3${(b.finalBill || 0).toFixed(2)}`,
            status: statusMap[b.status] || 'Scheduled',
          };
        }));

        // Derive top employees from completed bookings
        const completed = allBookings.filter(b => b.status === 'COMPLETED');
        const empMap = new Map<string, { rides: number; spent: number }>();
        completed.forEach(b => {
          const name = b.riderName || 'Unknown';
          const existing = empMap.get(name) || { rides: 0, spent: 0 };
          empMap.set(name, { rides: existing.rides + 1, spent: existing.spent + (b.finalBill || 0) });
        });
        const empList = [...empMap.entries()].sort((a, b) => b[1].rides - a[1].rides).slice(0, 5);
        const maxRides = empList.length > 0 ? empList[0][1].rides : 1;
        setTopEmployeesData(empList.map(([name, data]) => ({
          name,
          rides: data.rides,
          spent: `\u00A3${data.spent.toFixed(0)}`,
          pct: Math.round((data.rides / maxRides) * 100),
        })));
        setEmployeeCount(empMap.size);
      }
    } catch { /* keep fallback */ }
  }, [user]);

  useEffect(() => { fetchCompanyData(); }, [fetchCompanyData]);

  return (
    <DashboardLayout role="company">
      <div className="space-y-6">

        {/* ═══════ HERO WELCOME ═══════ */}
        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-accent/[0.04] rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-12 left-1/4 w-48 h-48 bg-secondary/[0.03] rounded-full blur-[60px] pointer-events-none" />

            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <div className="badge-green mb-3"><Building2 size={12} /> Corporate Account</div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  Welcome back, <span className="gradient-text">{companyName}</span>
                </h2>
                <p className="mt-1.5 text-white/40 text-sm">Here&rsquo;s your corporate ride activity overview.</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button variant="green" href="/company/bookings" size="sm">
                  <Plus size={16} /> New Booking
                </Button>
                <Button variant="outline" href="/company/employees" size="sm">
                  <UserPlus size={16} /> Add Employee
                </Button>
                <Button variant="ghost" href="/company/reports" size="sm">
                  <BarChart3 size={16} /> Reports
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══════ BENTO STAT GRID ═══════ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Bookings — hero stat */}
          <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp} className="col-span-2">
            <div className="relative h-full overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-accent/[0.06] via-white/[0.02] to-transparent p-6">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/[0.08] rounded-full blur-[50px] pointer-events-none" />
              <div className="relative flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                      <CalendarCheck size={20} className="text-accent" />
                    </div>
                    <span className="text-white/40 text-sm font-medium">Total Bookings</span>
                  </div>
                  <p className="text-4xl font-black text-white tabular-nums">{bookings}</p>
                </div>
                {/* Mini sparkline */}
                <svg width="120" height="50" className="hidden sm:block" viewBox="0 0 120 50">
                  <defs>
                    <linearGradient id="compSparkGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,35 L20,30 L40,32 L60,20 L80,25 L100,12 L120,8" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" />
                  <path d="M0,35 L20,30 L40,32 L60,20 L80,25 L100,12 L120,8 L120,50 L0,50Z" fill="url(#compSparkGrad)" />
                </svg>
              </div>
            </div>
          </motion.div>

          {/* Active Employees */}
          <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp}>
            <div className="h-full rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-all group">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Users size={20} className="text-secondary" />
              </div>
              <p className="text-3xl font-black text-white tabular-nums">{employees}</p>
              <p className="text-white/30 text-xs font-medium mt-1">Active Employees</p>
            </div>
          </motion.div>

          {/* Monthly Spend */}
          <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp}>
            <div className="h-full rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-all group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <PoundSterling size={20} className="text-orange-400" />
                </div>
                <ArcProgress value={68} size={40} stroke={4} color="#FB923C" />
              </div>
              <p className="text-3xl font-black text-white tabular-nums">£{monthSpend.toLocaleString()}</p>
              <p className="text-white/30 text-xs font-medium mt-1">Monthly Spend</p>
            </div>
          </motion.div>
        </div>

        {/* ═══════ BOOKINGS TABLE + SIDEBAR ═══════ */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Recent Bookings */}
          <motion.div initial="hidden" animate="visible" custom={4} variants={fadeUp} className="xl:col-span-2">
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent via-secondary to-accent" />

              <div className="flex items-center justify-between px-6 py-5">
                <h3 className="text-lg font-bold text-white">Recent Bookings</h3>
                <Link href="/company/bookings" className="text-sm text-accent font-semibold hover:text-accent-light transition-colors flex items-center gap-1">
                  View All <ArrowUpRight size={14} />
                </Link>
              </div>

              <div className="px-6 pb-6 space-y-3">
                {recentBookingsData.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-white/30 text-sm">No bookings yet</p>
                  </div>
                ) : recentBookingsData.map((b, i) => (
                  <div key={i} className="group flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300">
                    {/* Employee */}
                    <div className="flex items-center gap-3 sm:w-40 shrink-0">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center text-secondary text-xs font-bold">
                        {getInitials(b.employee)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{b.employee}</p>
                        <p className="text-[10px] text-white/25">{b.date}</p>
                      </div>
                    </div>

                    {/* Route */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <MapPin size={13} className="text-secondary shrink-0" />
                      <p className="text-sm text-white/60 truncate">{b.route}</p>
                    </div>

                    {/* Cost + Status */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-black text-white tabular-nums">{b.cost}</span>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getStatusStyle(b.status)}`}>{b.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Top Employees */}
            <motion.div initial="hidden" animate="visible" custom={5} variants={fadeUp}>
              <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent" />

                <div className="flex items-center gap-2 mb-5">
                  <Trophy size={16} className="text-yellow-400" />
                  <h3 className="text-lg font-bold text-white">Top Employees</h3>
                </div>

                {topEmployeesData.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-white/30 text-sm">No ride data yet</p>
                  </div>
                ) : (
                <div className="space-y-3">
                  {topEmployeesData.map((emp, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.03] hover:bg-white/[0.04] transition-all">
                      {/* Rank */}
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
                        i === 0 ? 'bg-yellow-500/10 text-yellow-400' : i === 1 ? 'bg-gray-400/10 text-gray-400' : i === 2 ? 'bg-orange-600/10 text-orange-500' : 'bg-white/[0.04] text-white/20'
                      }`}>
                        {i + 1}
                      </div>
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center text-secondary text-[10px] font-bold">
                        {getInitials(emp.name)}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{emp.name}</p>
                        <p className="text-[10px] text-white/25">{emp.rides} rides</p>
                      </div>
                      <span className="text-sm font-bold text-white tabular-nums">{emp.spent}</span>
                    </div>
                  ))}
                </div>
                )}
              </div>
            </motion.div>

            {/* Active Bookings */}
            <motion.div initial="hidden" animate="visible" custom={6} variants={fadeUp}>
              <div className="relative overflow-hidden rounded-2xl border border-secondary/20 bg-gradient-to-br from-secondary/[0.08] via-dark-surface to-accent/[0.04] p-6">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-secondary/[0.1] rounded-full blur-[40px] pointer-events-none" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                      <Activity size={20} className="text-secondary" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Active Now</h3>
                  </div>
                  <p className="text-5xl font-black text-white tabular-nums">{activeRides}</p>
                  <p className="text-white/40 text-sm mt-1">rides currently in progress</p>
                  <Link
                    href="/company/bookings"
                    className="inline-flex items-center gap-1.5 mt-4 text-sm font-bold text-secondary hover:text-secondary-light transition-colors"
                  >
                    View All <ArrowUpRight size={14} />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
