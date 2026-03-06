'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Car,
  Briefcase,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  XCircle,
  Activity,
  ArrowUpRight,
  Loader2,
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/lib/auth-context';
import { adminStatsApi, type DashboardStats } from '@/lib/services';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.Admin) {
      router.replace('/admin/login');
      return;
    }
    adminStatsApi
      .getDashboardStats()
      .then((data) => setStats(data as DashboardStats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, router]);

  if (!user?.Admin) return null;

  const statCards = stats
    ? [
        {
          label: 'Total Bookings',
          value: stats.totalBookings ?? 0,
          icon: Briefcase,
          color: 'text-blue-400',
          bg: 'bg-blue-400/10',
          trend: '+12%',
          trendUp: true,
        },
        {
          label: 'Total Drivers',
          value: stats.totalDrivers ?? 0,
          icon: Car,
          color: 'text-emerald-400',
          bg: 'bg-emerald-400/10',
          trend: '+5%',
          trendUp: true,
        },
        {
          label: 'Total Riders',
          value: stats.totalPassengers ?? 0,
          icon: Users,
          color: 'text-violet-400',
          bg: 'bg-violet-400/10',
          trend: '+8%',
          trendUp: true,
        },
        {
          label: 'Revenue',
          value: `£${(stats.totalRevenue ?? 0).toLocaleString()}`,
          icon: DollarSign,
          color: 'text-secondary',
          bg: 'bg-secondary/10',
          trend: '+15%',
          trendUp: true,
        },
      ]
    : [];

  const statusCards = stats
    ? [
        { label: 'Active Drivers', value: stats.activeDrivers ?? 0, icon: Activity, color: 'text-emerald-400' },
        { label: 'Pending Drivers', value: stats.pendingDrivers ?? 0, icon: Clock, color: 'text-amber-400' },
        { label: 'Completed Rides', value: stats.completedBookings ?? 0, icon: CheckCircle2, color: 'text-blue-400' },
        { label: 'Cancelled', value: stats.cancelledBookings ?? 0, icon: XCircle, color: 'text-red-400' },
      ]
    : [];

  return (
    <DashboardLayout role="admin" pageTitle="Dashboard">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} className="animate-spin text-secondary" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Welcome banner */}
          <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-r from-secondary/[0.08] to-accent/[0.04] p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white mb-1">
              Welcome back, {user.firstName}
            </h2>
            <p className="text-white/40">
              Here&apos;s what&apos;s happening with RS CAB today.
            </p>
          </div>

          {/* Main stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center`}>
                      <Icon size={22} className={card.color} />
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-medium ${card.trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
                      {card.trendUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {card.trend}
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-white">{card.value}</p>
                  <p className="text-white/40 text-sm mt-1">{card.label}</p>
                </div>
              );
            })}
          </div>

          {/* Status overview */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Status Overview</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {statusCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.label}
                    className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Icon size={18} className={card.color} />
                      <span className="text-white/40 text-sm">{card.label}</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{card.value}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick actions */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Manage Bookings', href: '/admin/bookings', icon: Briefcase, desc: 'View and manage all ride bookings' },
                { label: 'Manage Drivers', href: '/admin/drivers', icon: Car, desc: 'Approve, suspend, or review drivers' },
                { label: 'Manage Riders', href: '/admin/riders', icon: Users, desc: 'View and manage passenger accounts' },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={() => router.push(action.href)}
                    className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 text-left hover:bg-white/[0.04] hover:border-secondary/20 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Icon size={22} className="text-secondary" />
                      <ArrowUpRight size={16} className="text-white/20 group-hover:text-secondary transition-colors" />
                    </div>
                    <p className="text-white font-semibold mb-1">{action.label}</p>
                    <p className="text-white/30 text-sm">{action.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
