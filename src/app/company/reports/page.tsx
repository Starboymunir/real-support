'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/Button';
import {
  Download,
  FileText,
  TrendingUp,
  PoundSterling,
  MapPin,
  Building2,
} from 'lucide-react';

/* ───── Dummy data ───── */
const overviewCards = [
  { label: 'Total Trips', value: '156', icon: MapPin, color: 'bg-primary/10 text-primary' },
  {
    label: 'Total Spend',
    value: '£4,230',
    icon: PoundSterling,
    color: 'bg-secondary/10 text-secondary',
  },
  {
    label: 'Avg per Trip',
    value: '£18.50',
    icon: TrendingUp,
    color: 'bg-info/10 text-info',
  },
  {
    label: 'Most Active Dept',
    value: 'Sales',
    icon: Building2,
    color: 'bg-warning/10 text-warning',
  },
];

const departmentBreakdown = [
  { department: 'Sales', trips: 52, totalCost: '£1,340', avgCost: '£25.77' },
  { department: 'Engineering', trips: 38, totalCost: '£890', avgCost: '£23.42' },
  { department: 'Marketing', trips: 31, totalCost: '£720', avgCost: '£23.23' },
  { department: 'Management', trips: 22, totalCost: '£810', avgCost: '£36.82' },
  { department: 'HR', trips: 13, totalCost: '£470', avgCost: '£36.15' },
];

const spendingTrend = [
  { month: 'Sep', amount: 3200 },
  { month: 'Oct', amount: 3800 },
  { month: 'Nov', amount: 4100 },
  { month: 'Dec', amount: 3500 },
  { month: 'Jan', amount: 4600 },
  { month: 'Feb', amount: 4230 },
];

const topRoutes = [
  { route: 'Kings Cross → Canary Wharf', count: 34, avgCost: '£22.00' },
  { route: 'Heathrow T5 → Paddington', count: 21, avgCost: '£38.50' },
  { route: 'Liverpool St → Shoreditch', count: 18, avgCost: '£12.00' },
  { route: 'Victoria → Chelsea', count: 14, avgCost: '£15.50' },
  { route: 'Euston → Camden', count: 11, avgCost: '£10.00' },
];

const periods = ['This Week', 'This Month', 'This Quarter', 'This Year'];

const maxSpend = Math.max(...spendingTrend.map((s) => s.amount));

/* ───── Dept dot colors ───── */
const deptColors: Record<string, string> = {
  Sales: 'bg-primary',
  Engineering: 'bg-secondary',
  Marketing: 'bg-info',
  Management: 'bg-warning',
  HR: 'bg-error',
};

export default function CompanyReportsPage() {
  const [activePeriod, setActivePeriod] = useState('This Month');

  return (
    <DashboardLayout role="company" userName="Acme Corp">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">
            Reports &amp; Analytics
          </h2>
          <p className="text-text-secondary mt-1">
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
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white border border-gray-200 text-text-secondary hover:border-primary hover:text-primary'
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
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 card-hover"
          >
            <div
              className={`w-11 h-11 rounded-lg flex items-center justify-center ${card.color} mb-4`}
            >
              <card.icon size={22} />
            </div>
            <p className="text-2xl font-bold text-text-primary">{card.value}</p>
            <p className="text-sm text-text-secondary mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Department Breakdown + Spending Trend */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {/* Department Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-text-primary">
              Department Breakdown
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-text-secondary">
                  <th className="text-left px-6 py-3 font-medium">Department</th>
                  <th className="text-left px-6 py-3 font-medium">Trips</th>
                  <th className="text-left px-6 py-3 font-medium">Total Cost</th>
                  <th className="text-left px-6 py-3 font-medium">Avg Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {departmentBreakdown.map((dept) => (
                  <tr
                    key={dept.department}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${deptColors[dept.department] || 'bg-gray-400'}`}
                        />
                        <span className="font-medium text-text-primary">
                          {dept.department}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">{dept.trips}</td>
                    <td className="px-6 py-4 font-semibold text-text-primary">
                      {dept.totalCost}
                    </td>
                    <td className="px-6 py-4 text-text-secondary">{dept.avgCost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Spending Trend Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-text-primary">Spending Trend</h3>
            <span className="text-xs text-text-muted">Last 6 months</span>
          </div>

          {/* Bar Chart */}
          <div className="flex items-end gap-3 h-52">
            {spendingTrend.map((s) => (
              <div key={s.month} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-semibold text-text-primary">
                  £{(s.amount / 1000).toFixed(1)}k
                </span>
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-primary to-secondary transition-all"
                  style={{ height: `${(s.amount / maxSpend) * 100}%` }}
                />
                <span className="text-xs text-text-muted">{s.month}</span>
              </div>
            ))}
          </div>

          {/* Trend Summary */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-sm">
            <TrendingUp size={16} className="text-secondary" />
            <span className="text-text-secondary">
              <span className="font-semibold text-secondary">+8.2%</span> vs previous
              period
            </span>
          </div>
        </div>
      </div>

      {/* Top Routes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-text-primary">Top Routes</h3>
          <p className="text-sm text-text-secondary mt-0.5">
            Most frequently booked routes this period
          </p>
        </div>
        <div className="divide-y divide-gray-50">
          {topRoutes.map((r, i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/60 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary flex items-center gap-1.5">
                  <MapPin size={14} className="text-primary shrink-0" />
                  {r.route}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-text-primary">{r.count} trips</p>
                <p className="text-xs text-text-muted">avg {r.avgCost}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
