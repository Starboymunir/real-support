"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/lib/auth-context";
import { adminStatsApi, type DashboardStats } from "@/lib/services/admin";
import { LoadingScreen } from "@/app/(RSAdmin)/admin/common/loading-screen";
import {
  ShieldCheck,
  Users,
  Car,
  CalendarCheck,
  Eye,
  Activity,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
} from "lucide-react";

const GoogleMap = dynamic(() => import("../google-map"), { ssr: false });

/* ── Cyan / Sky-blue theme tokens ── */
const T = {
  accent: "#0EA5E9",
  accentLight: "#38BDF8",
  accentDark: "#0284C7",
  gradient: "linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)",
  gradientSubtle: "linear-gradient(135deg, rgba(14,165,233,0.12) 0%, rgba(2,132,199,0.08) 100%)",
  surface: "#0D1117",
  card: "#161B22",
  cardBorder: "rgba(14,165,233,0.15)",
  text: "#E6EDF3",
  textMuted: "rgba(230,237,243,0.5)",
};

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: any;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div
      className="rounded-2xl p-5 border transition-all duration-300 hover:scale-[1.02]"
      style={{ background: T.card, borderColor: `${color}25` }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}18` }}
        >
          <Icon size={18} style={{ color }} />
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: T.textMuted }}>
          {label}
        </p>
      </div>
      <p className="text-2xl font-bold" style={{ color: T.text }}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      {sub && (
        <p className="text-xs mt-1" style={{ color: T.textMuted }}>
          {sub}
        </p>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    adminStatsApi
      .getDashboardStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen />;

  const firstName = user?.firstName || "Admin";

  return (
    <div className="space-y-6 pb-8">
      {/* ── Welcome Banner ── */}
      <div
        className="relative rounded-2xl p-6 sm:p-8 overflow-hidden border"
        style={{ background: T.gradient, borderColor: "rgba(255,255,255,0.1)" }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-white/10 blur-2xl" />
        </div>
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold text-white/90 mb-3">
              <ShieldCheck size={12} />
              ADMIN
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Welcome back, {firstName}
            </h1>
            <p className="text-white/60 mt-1 text-sm">
              Monitor platform operations &middot; View-only financial data
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5">
            <Eye size={14} className="text-white/70" />
            <span className="text-white/70 text-xs font-medium">View Mode</span>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Riders"
          value={stats?.totalPassengers ?? 0}
          sub="Registered passengers"
          color="#0EA5E9"
        />
        <StatCard
          icon={Car}
          label="Total Drivers"
          value={stats?.totalDrivers ?? 0}
          sub={`${stats?.activeDrivers ?? 0} active, ${stats?.pendingDrivers ?? 0} pending`}
          color="#06B6D4"
        />
        <StatCard
          icon={CalendarCheck}
          label="Total Bookings"
          value={stats?.totalBookings ?? 0}
          sub={`${stats?.completedBookings ?? 0} completed`}
          color="#0284C7"
        />
        <StatCard
          icon={Activity}
          label="Active Drivers"
          value={stats?.activeDrivers ?? 0}
          sub="Currently available"
          color="#38BDF8"
        />
      </div>

      {/* ── Operations Overview ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Booking Status */}
        <div
          className="rounded-2xl p-5 border"
          style={{ background: T.card, borderColor: T.cardBorder }}
        >
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 size={16} style={{ color: T.accent }} />
            <h3 className="text-sm font-bold" style={{ color: T.text }}>
              Booking Status
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Completed", value: stats?.completedBookings ?? 0, color: "#22C55E", icon: CalendarCheck },
              { label: "Cancelled", value: stats?.cancelledBookings ?? 0, color: "#EF4444", icon: Activity },
              { label: "Active Drivers", value: stats?.activeDrivers ?? 0, color: T.accent, icon: Car },
              { label: "Pending Drivers", value: stats?.pendingDrivers ?? 0, color: "#F59E0B", icon: ShieldCheck },
            ].map((item) => (
              <div
                key={item.label}
                className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.02]"
              >
                <item.icon size={16} style={{ color: item.color }} className="mb-2" />
                <p className="text-xl font-bold" style={{ color: T.text }}>
                  {item.value.toLocaleString()}
                </p>
                <p className="text-[11px] mt-1" style={{ color: T.textMuted }}>
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue - Read Only */}
        <div
          className="rounded-2xl p-5 border relative overflow-hidden"
          style={{ background: T.card, borderColor: T.cardBorder }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} style={{ color: T.accent }} />
              <h3 className="text-sm font-bold" style={{ color: T.text }}>
                Platform Revenue
              </h3>
            </div>
            <span
              className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border"
              style={{
                color: T.textMuted,
                borderColor: "rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.03)",
              }}
            >
              <Eye size={10} />
              READ ONLY
            </span>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <p className="text-xs" style={{ color: T.textMuted }}>
                Gross Fare (Completed Rides)
              </p>
              <p className="text-3xl font-bold mt-1" style={{ color: T.text }}>
                £{(stats?.totalGrossFare ?? stats?.totalRevenue ?? 0).toLocaleString()}
              </p>
              <p className="text-[10px] mt-1" style={{ color: T.textMuted }}>
                Commission £{(stats?.totalCommission ?? 0).toLocaleString()}
                {' '}+ service fees £{(stats?.totalServiceFees ?? 0).toLocaleString()}
                {' '}={' '}
                <span className="text-green-300 font-semibold">
                  £{(stats?.totalCompanyProfit ?? 0).toLocaleString()} profit
                </span>
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="flex items-center gap-1 mb-1">
                  <ArrowUpRight size={12} className="text-green-400" />
                  <p className="text-[10px]" style={{ color: T.textMuted }}>
                    Income (admin ledger)
                  </p>
                </div>
                <p className="text-lg font-bold text-green-400">
                  £{(stats?.totalIncome ?? 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="flex items-center gap-1 mb-1">
                  <ArrowDownRight size={12} className="text-red-400" />
                  <p className="text-[10px]" style={{ color: T.textMuted }}>
                    Expenditure (admin ledger)
                  </p>
                </div>
                <p className="text-lg font-bold text-red-400">
                  £{(stats?.totalExpenditure ?? 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Subtle overlay to reinforce read-only feel */}
          <div className="absolute bottom-0 left-0 right-0 h-px" 
               style={{ background: `linear-gradient(90deg, transparent, ${T.accent}30, transparent)` }} />
        </div>
      </div>

      {/* ── Live Map ── */}
      <div
        className="rounded-2xl overflow-hidden border"
        style={{ borderColor: T.cardBorder, background: T.card }}
      >
        <div className="flex items-center gap-2 px-5 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-semibold" style={{ color: T.textMuted }}>LIVE MAP</span>
        </div>
        <div style={{ minHeight: 400 }}>
          <GoogleMap />
        </div>
      </div>
    </div>
  );
}
