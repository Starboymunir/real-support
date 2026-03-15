'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Car,
  Star,
  CheckCircle,
  Target,
  Clock,
  Sunrise,
  Award,
  Map,
  ThumbsUp,
  Zap,
  Flame,
} from 'lucide-react';
import { useRequireAuth } from '@/lib/use-require-auth';
import { bookingsApi, driverApi } from '@/lib/services';
import type { Booking, Driver } from '@/lib/types';

/* ─── animated counter hook ─── */
function useCounter(end: number, duration = 1400) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = end / (duration / 16);
    const id = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(id); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(id);
  }, [end, duration]);
  return count;
}

/* ─── SVG arc progress ─── */
function ArcProgress({ value, size = 56, stroke = 5, color = 'var(--color-secondary)' }: { value: number; size?: number; stroke?: number; color?: string }) {
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

const tips = [
  { title: 'Peak Hours', desc: 'Drive 7–9 AM & 5–8 PM for surge pricing', icon: Sunrise, gradient: 'from-orange-500/20 to-amber-500/20', accent: 'text-orange-400' },
  { title: 'Stay 5-Star', desc: 'Cleanliness, courtesy & water go a long way', icon: Award, gradient: 'from-yellow-500/20 to-orange-400/20', accent: 'text-yellow-400' },
  { title: 'Hotspot Areas', desc: 'Airports, stations & event venues = quick pickups', icon: Map, gradient: 'from-blue-500/20 to-cyan-400/20', accent: 'text-blue-400' },
  { title: 'Accept More', desc: 'High acceptance unlocks bonuses & priority matching', icon: ThumbsUp, gradient: 'from-emerald-500/20 to-green-400/20', accent: 'text-emerald-400' },
];

type RecentRide = { time: string; from: string; to: string; fare: string; rating: number; distance: string; duration: string };
type WeeklyBar = { day: string; amount: number; pct: number };

export default function DriverDashboardPage() {
  const { user } = useRequireAuth();
  const router = useRouter();

  // Guard: redirect non-drivers to driver registration
  useEffect(() => {
    if (user && !user.driver) {
      router.replace('/driver');
    }
  }, [user, router]);

  const [todayEarnings, setTodayEarnings] = useState(0);
  const [todayRides, setTodayRides] = useState(0);
  const [weeklyEarnings, setWeeklyEarnings] = useState(0);
  const [driverRating, setDriverRating] = useState(0);
  const [totalJobComplete, setTotalJobComplete] = useState(0);
  const [acceptanceRate, setAcceptanceRate] = useState(0);
  const [completionRate, setCompletionRate] = useState(0);
  const [dailyGoalEarned, setDailyGoalEarned] = useState(0);
  const [recentRidesData, setRecentRidesData] = useState<RecentRide[]>([]);
  const [weeklyChartData, setWeeklyChartData] = useState<WeeklyBar[]>([]);
  const [loading, setLoading] = useState(true);

  const earnings = useCounter(todayEarnings);
  const rides = useCounter(todayRides, 800);
  const weekly = useCounter(weeklyEarnings);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const dailyGoal = 200;
  const dailyGoalPct = dailyGoal > 0 ? Math.min(100, Math.round((dailyGoalEarned / dailyGoal) * 100)) : 0;

  const fetchDashboardData = useCallback(async () => {
    if (!user?.driver?.id) { setLoading(false); return; }
    try {
      const [bookingsRes, driverRes] = await Promise.allSettled([
        bookingsApi.getDriverBookings(user.driver.id),
        driverApi.getById(user.driver.id),
      ]);

      if (driverRes.status === 'fulfilled') {
        const driverData = driverRes.value as Driver | { data?: Driver };
        const d = 'data' in driverData && driverData.data ? driverData.data : driverData as Driver;
        if (d.ratings) setDriverRating(d.ratings);
        if (d.totalJobComplete) setTotalJobComplete(d.totalJobComplete);
      }

      if (bookingsRes.status === 'fulfilled') {
        const bookings: Booking[] = Array.isArray(bookingsRes.value) ? bookingsRes.value : (bookingsRes.value as { data?: Booking[] }).data || [];
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(todayStart);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());

        const completed = bookings.filter(b => b.status === 'COMPLETED');
        const todayBookings = completed.filter(b => new Date(b.createdAt) >= todayStart);
        setTodayRides(todayBookings.length);

        const todayTotal = todayBookings.reduce((s, b) => s + (b.finalBill || 0), 0);
        setTodayEarnings(Math.round(todayTotal * 100));
        setDailyGoalEarned(todayTotal);

        const weekBookings = completed.filter(b => new Date(b.createdAt) >= weekStart);
        const weekTotal = weekBookings.reduce((s, b) => s + (b.finalBill || 0), 0);
        setWeeklyEarnings(Math.round(weekTotal));

        const totalBookings = bookings.length;
        const cancelled = bookings.filter(b => b.status === 'CANCELLED' || b.status === 'REJECTED').length;
        if (totalBookings > 0) {
          setAcceptanceRate(Math.round(((totalBookings - cancelled) / totalBookings) * 100));
          setCompletionRate(Math.round((completed.length / totalBookings) * 100));
        }

        const sorted = [...completed].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
        setRecentRidesData(sorted.map(b => ({
          time: new Date(b.createdAt).toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true }),
          from: b.startFrom?.name || b.startFrom?.postCode || 'Pickup',
          to: b.destination?.name || b.destination?.postCode || 'Destination',
          fare: `£${(b.finalBill || 0).toFixed(2)}`,
          rating: 5,
          distance: '—',
          duration: '—',
        })));

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayTotals = [0, 0, 0, 0, 0, 0, 0];
        weekBookings.forEach(b => {
          const dow = new Date(b.createdAt).getDay();
          dayTotals[dow] += b.finalBill || 0;
        });
        const maxDay = Math.max(...dayTotals, 1);
        setWeeklyChartData(days.map((day, i) => ({
          day,
          amount: Math.round(dayTotals[i]),
          pct: Math.round((dayTotals[i] / maxDay) * 100),
        })));
      }
    } catch { /* silent */ }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  const displayName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Driver' : 'Driver';

  return (
    <DashboardLayout role="driver" pageTitle="Dashboard">
      <div className="space-y-6">
        {/* ═══════ HERO WELCOME ═══════ */}
        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-secondary/[0.06] rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-16 left-1/4 w-48 h-48 bg-accent/[0.04] rounded-full blur-[60px] pointer-events-none" />
            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                {totalJobComplete > 50 && (
                  <div className="badge-green mb-3"><Zap size={12} /> Top Rated Driver</div>
                )}
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  Welcome back, <span className="gradient-text">{displayName.split(' ')[0]}</span>
                </h1>
                <p className="text-white/40 mt-1.5 text-sm">
                  Your driver dashboard overview
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══════ BENTO STAT GRID ═══════ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp} className="col-span-2 row-span-2">
            <div className="relative h-full overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-secondary/[0.06] via-white/[0.02] to-transparent p-6 sm:p-8">
              <div className="absolute top-0 right-0 w-40 h-40 bg-secondary/[0.04] rounded-full blur-[60px] pointer-events-none" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                    <DollarSign size={20} className="text-secondary" />
                  </div>
                  <span className="text-white/40 text-sm font-medium">Today&apos;s Earnings</span>
                </div>
                <p className="text-4xl sm:text-5xl font-black text-white tabular-nums tracking-tight">
                  £{(earnings / 100).toFixed(2)}
                </p>
                {todayRides > 0 && (
                  <div className="flex items-center gap-3 mt-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-bold">
                      <Car size={12} /> {todayRides} rides
                    </span>
                  </div>
                )}
                <svg className="w-full h-16 mt-6" viewBox="0 0 240 60" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-secondary)" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,45 C20,42 30,38 48,35 C66,32 78,40 96,38 C114,36 126,22 144,18 C162,14 174,20 192,16 C210,12 225,8 240,6" fill="none" stroke="var(--color-secondary)" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M0,45 C20,42 30,38 48,35 C66,32 78,40 96,38 C114,36 126,22 144,18 C162,14 174,20 192,16 C210,12 225,8 240,6 L240,60 L0,60Z" fill="url(#sparkGrad)" />
                </svg>
                <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <div>
                    <p className="text-white/30 text-xs font-medium uppercase tracking-wider">Daily Goal</p>
                    <p className="text-white text-sm font-bold mt-0.5">£{dailyGoalEarned.toFixed(2)} / £{dailyGoal.toFixed(2)}</p>
                  </div>
                  <div className="relative">
                    <ArcProgress value={dailyGoalPct} size={52} stroke={5} />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-secondary">{dailyGoalPct}%</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp}>
            <div className="h-full rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-400 group">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Car size={20} className="text-accent" />
              </div>
              <p className="text-3xl font-black text-white tabular-nums">{rides}</p>
              <p className="text-white/30 text-xs font-medium mt-1">Rides Today</p>
              {totalJobComplete > 0 && (
                <div className="mt-3 flex items-center gap-1.5">
                  <span className="text-white/20 text-[10px]">{totalJobComplete} total</span>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp}>
            <div className="h-full rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-400 group">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Star size={20} className="text-yellow-400" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <p className="text-3xl font-black text-white">{driverRating > 0 ? driverRating.toFixed(1) : '—'}</p>
                {driverRating > 0 && (
                  <div className="flex gap-0.5 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={10} className={i < Math.round(driverRating) ? 'text-yellow-400 fill-yellow-400' : 'text-white/10'} />
                    ))}
                  </div>
                )}
              </div>
              <p className="text-white/30 text-xs font-medium mt-1">Driver Rating</p>
            </div>
          </motion.div>

          <motion.div initial="hidden" animate="visible" custom={4} variants={fadeUp}>
            <div className="h-full rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-400 group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle size={20} className="text-emerald-400" />
                </div>
                <ArcProgress value={acceptanceRate} size={40} stroke={4} color="var(--color-secondary)" />
              </div>
              <p className="text-3xl font-black text-white tabular-nums">{acceptanceRate}%</p>
              <p className="text-white/30 text-xs font-medium mt-1">Acceptance Rate</p>
            </div>
          </motion.div>

          <motion.div initial="hidden" animate="visible" custom={5} variants={fadeUp}>
            <div className="h-full rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-400 group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Target size={20} className="text-indigo-400" />
                </div>
                <ArcProgress value={completionRate} size={40} stroke={4} color="#818CF8" />
              </div>
              <p className="text-3xl font-black text-white tabular-nums">{completionRate}%</p>
              <p className="text-white/30 text-xs font-medium mt-1">Completion Rate</p>
            </div>
          </motion.div>
        </div>

        {/* ═══════ WEEKLY EARNINGS ═══════ */}
        <motion.div initial="hidden" animate="visible" custom={7} variants={fadeUp}>
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent via-secondary to-accent" />
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-lg font-bold text-white">Weekly Earnings</h3>
                <p className="text-white/30 text-xs mt-0.5">This week&apos;s performance</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-white tabular-nums">£{weekly}</p>
              </div>
            </div>
            {weeklyChartData.length > 0 ? (
              <div className="flex items-end justify-between gap-2 sm:gap-3 h-44 mt-6 pt-2">
                {weeklyChartData.map((d, i) => {
                  const isHovered = hoveredBar === i;
                  const todayName = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date().getDay()];
                  const isToday = d.day === todayName;
                  return (
                    <div key={d.day} className="flex flex-col items-center gap-2 flex-1 relative" onMouseEnter={() => setHoveredBar(i)} onMouseLeave={() => setHoveredBar(null)}>
                      {isHovered && (
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-xl border border-white/10 text-white text-xs font-bold whitespace-nowrap z-10">£{d.amount}</div>
                      )}
                      <div
                        className={`w-full rounded-xl transition-all duration-500 cursor-pointer ${isToday ? 'bg-gradient-to-t from-secondary/80 to-secondary shadow-[0_0_20px_rgba(0,230,118,0.2)]' : 'bg-gradient-to-t from-white/[0.06] to-white/[0.12]'} ${isHovered ? 'opacity-100 scale-x-110' : isToday ? 'opacity-100' : 'opacity-60 hover:opacity-80'}`}
                        style={{ height: `${Math.max(d.pct, 4)}%` }}
                      />
                      <span className={`text-[10px] font-semibold ${isToday ? 'text-secondary' : 'text-white/30'}`}>{d.day}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-44 mt-6">
                <p className="text-white/20 text-sm">{loading ? 'Loading chart…' : 'No earnings data this week'}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* ═══════ RECENT RIDES TIMELINE ═══════ */}
        <motion.div initial="hidden" animate="visible" custom={8} variants={fadeUp}>
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="p-6 pb-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Recent Rides</h3>
                <span className="text-white/30 text-xs font-medium">Latest completed</span>
              </div>
            </div>
            <div className="px-6 pb-6 space-y-3">
              {recentRidesData.length > 0 ? recentRidesData.map((ride, i) => (
                <div key={i} className="group relative flex items-stretch gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300">
                  <div className="flex flex-col items-center shrink-0 w-14">
                    <Clock size={12} className="text-white/20 mb-1" />
                    <p className="text-xs font-bold text-white/60 tabular-nums">{ride.time}</p>
                  </div>
                  <div className="w-[1px] bg-white/[0.06] self-stretch" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_6px_rgba(0,230,118,0.4)]" />
                      <p className="text-sm font-semibold text-white truncate">{ride.from}</p>
                      <svg width="20" height="8" className="text-white/20 shrink-0"><path d="M0,4 L16,4 M12,0 L18,4 L12,8" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
                      <div className="w-2 h-2 rounded-full bg-accent shadow-[0_0_6px_rgba(0,176,255,0.4)]" />
                      <p className="text-sm font-semibold text-white truncate">{ride.to}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-white/30">
                      <span>{ride.distance}</span><span className="text-white/10">·</span><span>{ride.duration}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-center shrink-0">
                    <p className="text-sm font-black text-white tabular-nums">{ride.fare}</p>
                    <div className="flex gap-0.5 mt-1">
                      {[...Array(5)].map((_, s) => (
                        <Star key={s} size={9} className={s < ride.rating ? 'text-yellow-400 fill-yellow-400' : 'text-white/10'} />
                      ))}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <p className="text-white/20 text-sm">{loading ? 'Loading rides…' : 'No completed rides yet'}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ═══════ DRIVER TIPS ═══════ */}
        <motion.div initial="hidden" animate="visible" custom={9} variants={fadeUp}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Flame size={16} className="text-orange-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Pro Tips</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tips.map((tip) => {
              const TipIcon = tip.icon;
              return (
                <div key={tip.title} className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-400 cursor-default">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${tip.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <TipIcon size={20} className={tip.accent} />
                  </div>
                  <h4 className="font-bold text-white text-sm mb-1.5">{tip.title}</h4>
                  <p className="text-white/30 text-xs leading-relaxed">{tip.desc}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
