"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/lib/auth-context";
import { adminStatsApi, type DashboardStats } from "@/lib/services/admin";
import { LoadingScreen } from "@/app/(RSAdmin)/admin/common/loading-screen";
import { useSocket } from "@/providers/SocketProvider";
import {
  Crown,
  Users,
  Car,
  CalendarCheck,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Shield,
} from "lucide-react";

const GoogleMap = dynamic(() => import("../google-map"), { ssr: false });

/* ── Violet / Indigo theme tokens ── */
const T = {
  accent: "#7C3AED",
  accentLight: "#A78BFA",
  accentDark: "#5B21B6",
  gradient: "linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)",
  gradientSubtle: "linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(79,70,229,0.08) 100%)",
  surface: "#0D1117",
  card: "#161B22",
  cardBorder: "rgba(124,58,237,0.15)",
  text: "#E6EDF3",
  textMuted: "rgba(230,237,243,0.5)",
};

function StatCard({
  icon: Icon,
  label,
  value,
  change,
  positive,
  color,
}: {
  icon: any;
  label: string;
  value: string | number;
  change?: string;
  positive?: boolean;
  color: string;
}) {
  return (
    <div
      className="rounded-2xl p-5 border backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
      style={{
        background: T.card,
        borderColor: `${color}25`,
        boxShadow: `0 0 40px ${color}08`,
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: `${color}18` }}
        >
          <Icon size={20} style={{ color }} />
        </div>
        {change && (
          <span
            className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full"
            style={{
              background: positive ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
              color: positive ? "#22C55E" : "#EF4444",
            }}
          >
            {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {change}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold" style={{ color: T.text }}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      <p className="text-xs mt-1" style={{ color: T.textMuted }}>
        {label}
      </p>
    </div>
  );
}

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const fetchStats = useCallback(() => {
    adminStatsApi
      .getDashboardStats()
      .then(setStats)
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchStats();
    setLoading(false);
  }, [fetchStats]);

  // Refresh stats when relevant events occur
  useEffect(() => {
    if (!socket) return;
    const refresh = () => fetchStats();
    socket.on("driver-status-changed", refresh);
    socket.on("new-driver-registered", refresh);
    socket.on("new-booking", refresh);
    socket.on("booking-status-changed", refresh);
    socket.on("withdrawal-request-sent", refresh);
    socket.on("admin-process-withdrawal-request", refresh);
    return () => {
      socket.off("driver-status-changed", refresh);
      socket.off("new-driver-registered", refresh);
      socket.off("new-booking", refresh);
      socket.off("booking-status-changed", refresh);
      socket.off("withdrawal-request-sent", refresh);
      socket.off("admin-process-withdrawal-request", refresh);
    };
  }, [socket, fetchStats]);

  if (loading) return <LoadingScreen />;

  const firstName = user?.firstName || "Admin";

  return (
    <div className="space-y-6 pb-8">
      {/* ── Welcome Banner ── */}
      <div
        className="relative rounded-2xl p-6 sm:p-8 overflow-hidden border"
        style={{
          background: T.gradient,
          borderColor: "rgba(255,255,255,0.1)",
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        </div>
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold text-white/90 mb-3">
              <Crown size={12} />
              SUPER ADMIN
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Welcome back, {firstName}
            </h1>
            <p className="text-white/60 mt-1 text-sm">
              Full platform control &middot; All metrics &middot; Wallet management
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white/70 text-sm font-medium">System Online</span>
          </div>
        </div>
      </div>

      {/* ── Main Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          icon={Users}
          label="Total Riders"
          value={stats?.totalPassengers ?? 0}
          change="2.6%"
          positive
          color="#7C3AED"
        />
        <StatCard
          icon={Car}
          label="Total Drivers"
          value={stats?.totalDrivers ?? 0}
          change="0.8%"
          positive
          color="#4F46E5"
        />
        <StatCard
          icon={CalendarCheck}
          label="Total Bookings"
          value={stats?.totalBookings ?? 0}
          change="1.2%"
          positive
          color="#6366F1"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Revenue"
          value={`£${(stats?.totalRevenue ?? 0).toLocaleString()}`}
          change="4.1%"
          positive
          color="#8B5CF6"
        />
        <StatCard
          icon={Activity}
          label="Active Drivers"
          value={stats?.activeDrivers ?? 0}
          color="#A78BFA"
        />
      </div>

      {/* ── Wallet Overview ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Wallet size={18} style={{ color: T.accent }} />
          <h2 className="text-lg font-bold" style={{ color: T.text }}>
            Wallet Overview
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Platform Balance */}
          <div
            className="rounded-2xl p-5 border relative overflow-hidden"
            style={{ background: T.card, borderColor: T.cardBorder }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
              style={{ background: T.gradient }}
            />
            <p className="text-xs font-semibold uppercase tracking-wider mt-1" style={{ color: T.textMuted }}>
              Platform Balance
            </p>
            <p className="text-3xl font-bold mt-2" style={{ color: T.text }}>
              £{(stats?.totalRevenue ?? 0).toLocaleString()}
            </p>
            <p className="text-xs mt-2" style={{ color: T.textMuted }}>
              All-time accumulated
            </p>
          </div>

          {/* Income */}
          <div
            className="rounded-2xl p-5 border relative overflow-hidden"
            style={{ background: T.card, borderColor: "rgba(34,197,94,0.15)" }}
          >
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r from-green-500 to-emerald-400" />
            <div className="flex items-center gap-2 mt-1">
              <ArrowUpRight size={14} className="text-green-400" />
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: T.textMuted }}>
                Income
              </p>
            </div>
            <p className="text-3xl font-bold mt-2 text-green-400">
              £{Math.round((stats?.totalRevenue ?? 0) * 0.7).toLocaleString()}
            </p>
            <p className="text-xs mt-2" style={{ color: T.textMuted }}>
              From completed bookings
            </p>
          </div>

          {/* Expenditure */}
          <div
            className="rounded-2xl p-5 border relative overflow-hidden"
            style={{ background: T.card, borderColor: "rgba(239,68,68,0.15)" }}
          >
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r from-red-500 to-orange-400" />
            <div className="flex items-center gap-2 mt-1">
              <ArrowDownRight size={14} className="text-red-400" />
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: T.textMuted }}>
                Expenditure
              </p>
            </div>
            <p className="text-3xl font-bold mt-2 text-red-400">
              £{Math.round((stats?.totalRevenue ?? 0) * 0.3).toLocaleString()}
            </p>
            <p className="text-xs mt-2" style={{ color: T.textMuted }}>
              Driver payouts &amp; fees
            </p>
          </div>
        </div>
      </div>

      {/* ── Platform Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Booking breakdown */}
        <div
          className="rounded-2xl p-5 border"
          style={{ background: T.card, borderColor: T.cardBorder }}
        >
          <h3 className="text-sm font-bold mb-4" style={{ color: T.text }}>
            Booking Breakdown
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: T.textMuted }}>Completed</span>
                <span className="text-green-400 font-semibold">
                  {stats?.completedBookings ?? 0}
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-green-400/80 transition-all duration-700"
                  style={{
                    width: `${stats?.totalBookings ? ((stats.completedBookings / stats.totalBookings) * 100) : 0}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: T.textMuted }}>Cancelled</span>
                <span className="text-red-400 font-semibold">
                  {stats?.cancelledBookings ?? 0}
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-red-400/80 transition-all duration-700"
                  style={{
                    width: `${stats?.totalBookings ? ((stats.cancelledBookings / stats.totalBookings) * 100) : 0}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: T.textMuted }}>Pending Drivers</span>
                <span style={{ color: T.accentLight }} className="font-semibold">
                  {stats?.pendingDrivers ?? 0}
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/5">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    background: T.accent,
                    width: `${stats?.totalDrivers ? ((stats.pendingDrivers / stats.totalDrivers) * 100) : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div
          className="lg:col-span-2 rounded-2xl p-5 border"
          style={{ background: T.card, borderColor: T.cardBorder }}
        >
          <h3 className="text-sm font-bold mb-4" style={{ color: T.text }}>
            Platform Pulse
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Active Drivers", val: stats?.activeDrivers ?? 0, icon: Car, color: "#22C55E" },
              { label: "Pending Approval", val: stats?.pendingDrivers ?? 0, icon: Shield, color: "#F59E0B" },
              { label: "Completed Rides", val: stats?.completedBookings ?? 0, icon: CalendarCheck, color: "#6366F1" },
              { label: "Cancelled", val: stats?.cancelledBookings ?? 0, icon: Activity, color: "#EF4444" },
            ].map((s) => (
              <div key={s.label} className="text-center p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                <s.icon size={18} className="mx-auto mb-2" style={{ color: s.color }} />
                <p className="text-xl font-bold" style={{ color: T.text }}>{s.val.toLocaleString()}</p>
                <p className="text-[10px] mt-1" style={{ color: T.textMuted }}>{s.label}</p>
              </div>
            ))}
          </div>
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
