'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/Button';
import { useRequireAuth } from '@/lib/use-require-auth';
import { bookingsApi } from '@/lib/services';
import type { Booking } from '@/lib/types';
import {
  Download,
  FileText,
  TrendingUp,
  PoundSterling,
  MapPin,
  Building2,
} from 'lucide-react';

const periods = ['This Week', 'This Month', 'This Quarter', 'This Year'];

/* ───── Dept dot colors ───── */
const deptColors: Record<string, string> = {
  Sales: 'bg-primary',
  Engineering: 'bg-secondary',
  Marketing: 'bg-info',
  Management: 'bg-warning',
  HR: 'bg-error',
  General: 'bg-accent',
};

export default function CompanyReportsPage() {
  const { user } = useRequireAuth();
  const [activePeriod, setActivePeriod] = useState('This Month');
  const [overviewCards, setOverviewCards] = useState([
    { label: 'Total Trips', value: '0', icon: MapPin, color: 'bg-primary/10 text-primary' },
    { label: 'Total Spend', value: '\u00a30', icon: PoundSterling, color: 'bg-secondary/10 text-secondary' },
    { label: 'Avg per Trip', value: '\u00a30', icon: TrendingUp, color: 'bg-info/10 text-info' },
    { label: 'Most Active Dept', value: '\u2014', icon: Building2, color: 'bg-warning/10 text-warning' },
  ]);
  const [departmentBreakdown, setDepartmentBreakdown] = useState<{ department: string; trips: number; totalCost: string; avgCost: string }[]>([]);
  const [spendingTrend, setSpendingTrend] = useState<{ month: string; amount: number }[]>([]);
  const [topRoutes, setTopRoutes] = useState<{ route: string; count: number; avgCost: string }[]>([]);
  const [trendChange, setTrendChange] = useState('');

  const fetchReports = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await bookingsApi.getUserBookings(user.id);
      const bookings: Booking[] = Array.isArray(res) ? res : (res as { data?: Booking[] }).data || [];
      const completed = bookings.filter(b => b.status === 'COMPLETED');
      if (completed.length === 0) return;

      const totalSpend = completed.reduce((s, b) => s + (b.finalBill || 0), 0);
      const avg = completed.length > 0 ? totalSpend / completed.length : 0;

      // Build route stats
      const routeMap = new Map<string, { count: number; total: number }>();
      completed.forEach(b => {
        const from = b.startFrom?.name || b.startFrom?.postCode || 'Pickup';
        const to = b.destination?.name || b.destination?.postCode || 'Drop';
        const route = `${from} \u2192 ${to}`;
        const ex = routeMap.get(route) || { count: 0, total: 0 };
        routeMap.set(route, { count: ex.count + 1, total: ex.total + (b.finalBill || 0) });
      });
      const sortedRoutes = [...routeMap.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, 5);
      setTopRoutes(sortedRoutes.map(([route, data]) => ({
        route,
        count: data.count,
        avgCost: `\u00a3${(data.total / data.count).toFixed(2)}`,
      })));

      // Department breakdown (derive from riderName as department proxy)
      const deptMap = new Map<string, { trips: number; total: number }>();
      completed.forEach(b => {
        const dept = 'General';
        const ex = deptMap.get(dept) || { trips: 0, total: 0 };
        deptMap.set(dept, { trips: ex.trips + 1, total: ex.total + (b.finalBill || 0) });
      });
      const deptList = [...deptMap.entries()].sort((a, b) => b[1].trips - a[1].trips);
      setDepartmentBreakdown(deptList.map(([dept, data]) => ({
        department: dept,
        trips: data.trips,
        totalCost: `\u00a3${data.total.toFixed(0)}`,
        avgCost: `\u00a3${(data.total / data.trips).toFixed(2)}`,
      })));

      const topDept = deptList.length > 0 ? deptList[0][0] : '\u2014';

      setOverviewCards([
        { label: 'Total Trips', value: String(completed.length), icon: MapPin, color: 'bg-primary/10 text-primary' },
        { label: 'Total Spend', value: `\u00a3${totalSpend.toFixed(0)}`, icon: PoundSterling, color: 'bg-secondary/10 text-secondary' },
        { label: 'Avg per Trip', value: `\u00a3${avg.toFixed(2)}`, icon: TrendingUp, color: 'bg-info/10 text-info' },
        { label: 'Most Active Dept', value: topDept, icon: Building2, color: 'bg-warning/10 text-warning' },
      ]);

      // Spending trend — last 6 months
      const now = new Date();
      const months: { month: string; amount: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
        const inMonth = completed.filter(b => {
          const bd = new Date(b.createdAt);
          return bd >= d && bd <= end;
        });
        months.push({
          month: d.toLocaleDateString('en-GB', { month: 'short' }),
          amount: Math.round(inMonth.reduce((s, b) => s + (b.finalBill || 0), 0)),
        });
      }
      setSpendingTrend(months);

      // Trend change
      if (months.length >= 2) {
        const curr = months[months.length - 1].amount;
        const prev = months[months.length - 2].amount;
        if (prev > 0) {
          const pct = ((curr - prev) / prev) * 100;
          setTrendChange(`${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`);
        }
      }
    } catch { /* keep defaults */ }
  }, [user]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const maxSpend = Math.max(...spendingTrend.map(s => s.amount), 1);

  return (
    <DashboardLayout role="company">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Reports &amp; Analytics
          </h2>
          <p className="text-white/60 mt-1">
            Comprehensive insights into your corporate ride activity
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download size={16} /> Export PDF
          </Button>
          <Button variant="outline" size="sm">
            <FileText size={16} /> Export CSV
          </Button>
        </div>
      </div>

      {/* Period Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {periods.map((period) => (
          <button
            key={period}
            onClick={() => setActivePeriod(period)}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activePeriod === period
                ? 'bg-secondary text-dark'
                : 'bg-white/[0.03] border border-white/[0.06] text-white/40 hover:border-secondary hover:text-secondary'
            }`}
          >
            {period}
          </button>
        ))}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {overviewCards.map((card) => (
          <div
            key={card.label}
            className="bg-white/[0.02] rounded-2xl border border-white/[0.06] p-6 hover:bg-white/[0.04] transition-all"
          >
            <div
              className={`w-11 h-11 rounded-lg flex items-center justify-center ${card.color} mb-4`}
            >
              <card.icon size={22} />
            </div>
            <p className="text-2xl font-bold text-white">{card.value}</p>
            <p className="text-sm text-white/60 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Department Breakdown + Spending Trend */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {/* Department Breakdown */}
        <div className="bg-white/[0.02] rounded-2xl border border-white/[0.06]">
          <div className="px-6 py-4 border-b border-white/[0.06]">
            <h3 className="text-lg font-semibold text-white">
              Department Breakdown
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/[0.03] text-white/30">
                  <th className="text-left px-6 py-3 font-medium">Department</th>
                  <th className="text-left px-6 py-3 font-medium">Trips</th>
                  <th className="text-left px-6 py-3 font-medium">Total Cost</th>
                  <th className="text-left px-6 py-3 font-medium">Avg Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {departmentBreakdown.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-8 text-white/30 text-sm">No data yet</td></tr>
                ) : departmentBreakdown.map((dept) => (
                  <tr
                    key={dept.department}
                    className="hover:bg-white/[0.04] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${deptColors[dept.department] || 'bg-gray-400'}`}
                        />
                        <span className="font-medium text-white">
                          {dept.department}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/60">{dept.trips}</td>
                    <td className="px-6 py-4 font-semibold text-white">
                      {dept.totalCost}
                    </td>
                    <td className="px-6 py-4 text-white/60">{dept.avgCost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Spending Trend Chart */}
        <div className="bg-white/[0.02] rounded-2xl border border-white/[0.06] p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Spending Trend</h3>
            <span className="text-xs text-white/40">Last 6 months</span>
          </div>

          {/* Bar Chart */}
          <div className="flex items-end gap-3 h-52">
            {spendingTrend.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-white/30 text-sm">No spending data</p>
              </div>
            ) : spendingTrend.map((s) => (
              <div key={s.month} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-semibold text-white">
                  £{(s.amount / 1000).toFixed(1)}k
                </span>
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-primary to-secondary transition-all"
                  style={{ height: `${(s.amount / maxSpend) * 100}%` }}
                />
                <span className="text-xs text-white/40">{s.month}</span>
              </div>
            ))}
          </div>

          {/* Trend Summary */}
          {trendChange && (
          <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center gap-2 text-sm">
            <TrendingUp size={16} className="text-secondary" />
            <span className="text-white/60">
              <span className="font-semibold text-secondary">{trendChange}</span> vs previous
              period
            </span>
          </div>
          )}
        </div>
      </div>

      {/* Top Routes */}
      <div className="bg-white/[0.02] rounded-2xl border border-white/[0.06]">
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <h3 className="text-lg font-semibold text-white">Top Routes</h3>
          <p className="text-sm text-white/60 mt-0.5">
            Most frequently booked routes this period
          </p>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {topRoutes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/30 text-sm">No route data yet</p>
            </div>
          ) : topRoutes.map((r, i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.04] transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center text-sm font-bold shrink-0">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white flex items-center gap-1.5">
                  <MapPin size={14} className="text-secondary shrink-0" />
                  {r.route}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-white">{r.count} trips</p>
                <p className="text-xs text-white/40">avg {r.avgCost}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
