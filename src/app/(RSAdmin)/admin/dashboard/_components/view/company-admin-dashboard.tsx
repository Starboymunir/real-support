"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/lib/auth-context";
import { adminStatsApi, type DashboardStats } from "@/lib/services/admin";
import { companyApi, type CompanyWalletData } from "@/lib/services/company";
import { LoadingScreen } from "@/app/(RSAdmin)/admin/common/loading-screen";
import {
  Building2,
  Car,
  CalendarCheck,
  Users,
  Activity,
  TrendingUp,
  Briefcase,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
} from "lucide-react";

const GoogleMap = dynamic(() => import("../google-map"), { ssr: false });

/* ── Amber / Orange theme tokens ── */
const T = {
  accent: "#F59E0B",
  accentLight: "#FBBF24",
  accentDark: "#D97706",
  gradient: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
  surface: "#0D1117",
  card: "#161B22",
  cardBorder: "rgba(245,158,11,0.15)",
  text: "#E6EDF3",
  textMuted: "rgba(230,237,243,0.5)",
};

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  large,
}: {
  icon: any;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  large?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-5 border transition-all duration-300 hover:scale-[1.02] ${large ? "sm:col-span-2" : ""}`}
      style={{ background: T.card, borderColor: `${color}25` }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}15` }}
        >
          <Icon size={18} style={{ color }} />
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: T.textMuted }}>
          {label}
        </p>
      </div>
      <p className={`font-bold ${large ? "text-3xl" : "text-2xl"}`} style={{ color: T.text }}>
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

export default function CompanyAdminDashboard() {
  const { admin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [wallet, setWallet] = useState<CompanyWalletData | null>(null);

  useEffect(() => {
    adminStatsApi
      .getDashboardStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Fetch company wallet for the admin's company
  useEffect(() => {
    const companyId = (admin as any)?.companyId || (stats as any)?.companyId;
    if (!companyId) return;
    companyApi.getWallet(companyId).then(setWallet).catch(() => {});
  }, [admin, stats]);

  if (loading) return <LoadingScreen />;

  const firstName = admin?.firstName || "Manager";

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
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold text-dark mb-3">
              <Building2 size={12} />
              COMPANY ADMIN
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-dark">
              Welcome back, {firstName}
            </h1>
            <p className="text-dark/60 mt-1 text-sm">
              Manage company operations &middot; Fleet overview &middot; Company wallet
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
            <Briefcase size={14} className="text-dark/70" />
            <span className="text-dark/70 text-xs font-bold">Company</span>
          </div>
        </div>
      </div>

      {/* ── Company Metrics ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={Car}
          label="Company Drivers"
          value={stats?.totalDrivers ?? 0}
          sub={`${stats?.activeDrivers ?? 0} currently active`}
          color="#F59E0B"
        />
        <MetricCard
          icon={CalendarCheck}
          label="Company Bookings"
          value={stats?.totalBookings ?? 0}
          sub={`${stats?.completedBookings ?? 0} completed`}
          color="#D97706"
        />
        <MetricCard
          icon={Users}
          label="Total Passengers"
          value={stats?.totalPassengers ?? 0}
          sub="Served by your fleet"
          color="#FBBF24"
        />
        <MetricCard
          icon={Activity}
          label="Active Fleet"
          value={stats?.activeDrivers ?? 0}
          sub="Drivers on the road"
          color="#EAB308"
        />
      </div>

      {/* ── Company Wallet & Fleet Status ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Company Wallet */}
        <div
          className="lg:col-span-2 rounded-2xl p-5 border relative overflow-hidden"
          style={{ background: T.card, borderColor: T.cardBorder }}
        >
          <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: T.gradient }} />
          <div className="flex items-center gap-2 mb-5 mt-1">
            <Wallet size={16} style={{ color: T.accent }} />
            <h3 className="text-sm font-bold" style={{ color: T.text }}>
              Company Wallet
            </h3>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.02]">
              <p className="text-xs" style={{ color: T.textMuted }}>Balance</p>
              <p className="text-3xl font-bold mt-1" style={{ color: T.accent }}>
                £{(wallet?.walletBalance ?? stats?.totalRevenue ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="flex items-center gap-1 mb-1">
                  <ArrowUpRight size={12} className="text-green-400" />
                  <p className="text-[10px]" style={{ color: T.textMuted }}>Revenue</p>
                </div>
                <p className="text-lg font-bold text-green-400">
                  £{(wallet?.totalRevenue ?? stats?.totalRevenue ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="flex items-center gap-1 mb-1">
                  <TrendingUp size={12} className="text-blue-400" />
                  <p className="text-[10px]" style={{ color: T.textMuted }}>Profit</p>
                </div>
                <p className="text-lg font-bold text-blue-400">
                  £{(wallet?.totalProfit ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="flex items-center gap-1 mb-1">
                  <ArrowDownRight size={12} className="text-red-400" />
                  <p className="text-[10px]" style={{ color: T.textMuted }}>Commission</p>
                </div>
                <p className="text-lg font-bold text-red-400">
                  £{(wallet?.totalCommission ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="flex items-center gap-1 mb-1">
                  <Wallet size={12} className="text-yellow-400" />
                  <p className="text-[10px]" style={{ color: T.textMuted }}>Bookings</p>
                </div>
                <p className="text-lg font-bold text-yellow-400">
                  {wallet?.totalBookings ?? stats?.completedBookings ?? 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Fleet Overview */}
        <div
          className="lg:col-span-3 rounded-2xl p-5 border"
          style={{ background: T.card, borderColor: T.cardBorder }}
        >
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={16} style={{ color: T.accent }} />
            <h3 className="text-sm font-bold" style={{ color: T.text }}>
              Fleet Overview
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Active Drivers", val: stats?.activeDrivers ?? 0, color: "#22C55E" },
              { label: "Pending Approval", val: stats?.pendingDrivers ?? 0, color: "#F59E0B" },
              { label: "Completed Rides", val: stats?.completedBookings ?? 0, color: "#0EA5E9" },
              { label: "Cancelled", val: stats?.cancelledBookings ?? 0, color: "#EF4444" },
            ].map((s) => (
              <div key={s.label} className="text-center p-4 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                <p className="text-2xl font-bold" style={{ color: T.text }}>{s.val.toLocaleString()}</p>
                <div className="w-8 h-1 rounded-full mx-auto my-2" style={{ background: s.color }} />
                <p className="text-[10px]" style={{ color: T.textMuted }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Completion rate bar */}
          <div className="mt-5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="flex justify-between text-xs mb-2">
              <span style={{ color: T.textMuted }}>Booking Completion Rate</span>
              <span style={{ color: T.accent }} className="font-semibold">
                {stats?.totalBookings
                  ? Math.round((stats.completedBookings / stats.totalBookings) * 100)
                  : 0}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/5">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  background: T.gradient,
                  width: `${stats?.totalBookings ? (stats.completedBookings / stats.totalBookings) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Live Map ── */}
      <div
        className="rounded-2xl overflow-hidden border"
        style={{ borderColor: T.cardBorder, background: T.card }}
      >
        <div className="flex items-center gap-2 px-5 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: T.accent }} />
          <span className="text-xs font-semibold" style={{ color: T.textMuted }}>FLEET MAP</span>
        </div>
        <div style={{ minHeight: 400 }}>
          <GoogleMap />
        </div>
      </div>
    </div>
  );
}
