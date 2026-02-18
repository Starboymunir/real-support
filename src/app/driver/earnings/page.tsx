'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/Button';
import {
  DollarSign,
  TrendingUp,
  Car,
  Coins,
  ArrowUpRight,
  Download,
  Clock,
  MapPin,
  CheckCircle,
  Building2,
  Calendar,
  Banknote,
} from 'lucide-react';

type Period = 'today' | 'week' | 'month' | 'custom';

const periodData: Record<Period, { earnings: string; rides: string; average: string; tips: string }> = {
  today: { earnings: '£145.50', rides: '8', average: '£18.19', tips: '£12.50' },
  week: { earnings: '£823.00', rides: '47', average: '£17.51', tips: '£68.20' },
  month: { earnings: '£3,420.00', rides: '196', average: '£17.45', tips: '£285.00' },
  custom: { earnings: '£1,250.00', rides: '72', average: '£17.36', tips: '£105.40' },
};

const breakdownData = [
  { label: 'Base Fares', percent: 75, amount: '£2,565.00', color: 'from-primary to-primary-light' },
  { label: 'Surge Pricing', percent: 12, amount: '£410.40', color: 'from-orange-400 to-orange-500' },
  { label: 'Tips', percent: 9, amount: '£307.80', color: 'from-secondary to-secondary-light' },
  { label: 'Bonuses', percent: 4, amount: '£136.80', color: 'from-accent to-accent-light' },
];

const transactions = [
  { date: 'Feb 18', time: '2:30 PM', from: 'Baker Street', to: 'Canary Wharf', amount: '£24.50', status: 'completed' },
  { date: 'Feb 18', time: '1:15 PM', from: 'Paddington', to: 'Liverpool Street', amount: '£18.00', status: 'completed' },
  { date: 'Feb 18', time: '11:45 AM', from: "King's Cross", to: 'Westminster', amount: '£15.50', status: 'completed' },
  { date: 'Feb 18', time: '10:20 AM', from: 'Shoreditch', to: 'Chelsea', amount: '£22.00', status: 'completed' },
  { date: 'Feb 18', time: '9:00 AM', from: 'Hackney', to: 'Mayfair', amount: '£19.80', status: 'completed' },
  { date: 'Feb 17', time: '6:45 PM', from: 'Camden', to: 'Greenwich', amount: '£28.50', status: 'completed' },
  { date: 'Feb 17', time: '4:30 PM', from: 'Brixton', to: 'Islington', amount: '£16.20', status: 'completed' },
  { date: 'Feb 17', time: '2:15 PM', from: 'Soho', to: 'Stratford', amount: '£21.00', status: 'completed' },
  { date: 'Feb 17', time: '12:00 PM', from: 'Notting Hill', to: 'Docklands', amount: '£26.80', status: 'completed' },
  { date: 'Feb 17', time: '10:30 AM', from: 'Kensington', to: 'Whitechapel', amount: '£17.50', status: 'completed' },
];

const payouts = [
  { date: 'Feb 14, 2026', amount: '£745.20', method: 'Bank Transfer - ****4521', status: 'completed' },
  { date: 'Feb 7, 2026', amount: '£812.50', method: 'Bank Transfer - ****4521', status: 'completed' },
  { date: 'Jan 31, 2026', amount: '£698.80', method: 'Bank Transfer - ****4521', status: 'completed' },
];

export default function EarningsPage() {
  const [activePeriod, setActivePeriod] = useState<Period>('month');
  const data = periodData[activePeriod];

  const summaryCards = [
    { label: 'Total Earnings', value: data.earnings, icon: DollarSign, color: 'bg-secondary/10 text-secondary', change: '+12%' },
    { label: 'Total Rides', value: data.rides, icon: Car, color: 'bg-accent/10 text-accent', change: '+8%' },
    { label: 'Average per Ride', value: data.average, icon: TrendingUp, color: 'bg-purple-500/10 text-purple-400', change: '+3%' },
    { label: 'Tips', value: data.tips, icon: Coins, color: 'bg-yellow-500/10 text-yellow-400', change: '+15%' },
  ];

  const periods: { key: Period; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'custom', label: 'Custom' },
  ];

  return (
    <DashboardLayout role="driver" userName="James Wilson" pageTitle="Earnings">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Earnings Overview</h1>
            <p className="text-white/60 mt-1">Track your income and payment history</p>
          </div>
          <Button variant="green">
            <Banknote size={18} />
            Request Payout
          </Button>
        </div>

        {/* Period Tabs */}
        <div className="flex gap-2 bg-white/[0.03] rounded-xl border border-white/[0.06] p-1.5 w-fit">
          {periods.map((p) => (
            <button
              key={p.key}
              onClick={() => setActivePeriod(p.key)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activePeriod === p.key
                  ? 'bg-secondary text-dark'
                  : 'text-white/40 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {summaryCards.map((card) => {
            const CardIcon = card.icon;
            return (
              <div
                key={card.label}
                className="bg-white/[0.02] rounded-2xl border border-white/[0.06] p-5 hover:bg-white/[0.04] transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${card.color}`}>
                    <CardIcon size={20} />
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-secondary/10 text-secondary">
                    <ArrowUpRight size={12} />
                    {card.change}
                  </span>
                </div>
                <p className="text-2xl font-bold text-white tabular-nums">{card.value}</p>
                <p className="text-sm text-white/40 mt-0.5">{card.label}</p>
              </div>
            );
          })}
        </div>

        {/* Earnings Breakdown */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
          <h3 className="text-lg font-bold text-white mb-6">Earnings Breakdown</h3>
          <div className="space-y-5">
            {breakdownData.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">{item.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-white tabular-nums">{item.amount}</span>
                    <span className="text-xs font-semibold text-white/40 tabular-nums w-10 text-right">{item.percent}%</span>
                  </div>
                </div>
                <div className="w-full bg-white/[0.06] rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all duration-700`}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction History */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
          <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Transaction History</h3>
            <Button variant="outline" size="sm">
              <Download size={16} />
              Export
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white/[0.03]">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white/30 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white/30 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white/30 uppercase tracking-wider">Route</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white/30 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white/30 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {transactions.map((tx, i) => (
                  <tr key={i} className="hover:bg-white/[0.03] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-white/40" />
                        <span className="text-sm text-white">{tx.date}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-white/40" />
                        <span className="text-sm text-white">{tx.time}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin size={14} className="text-secondary shrink-0" />
                        <span className="text-white">{tx.from}</span>
                        <span className="text-white/40">→</span>
                        <span className="text-white">{tx.to}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-white tabular-nums">{tx.amount}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-secondary/10 text-secondary">
                        <CheckCircle size={12} />
                        Completed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payouts */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
          <h3 className="text-lg font-bold text-white mb-6">Recent Payouts</h3>
          <div className="space-y-4">
            {payouts.map((payout, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-white/[0.03] rounded-xl border border-white/[0.06]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-secondary/10 flex items-center justify-center">
                    <Building2 size={20} className="text-secondary" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{payout.amount}</p>
                    <p className="text-sm text-white/40">{payout.method}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-secondary/10 text-secondary mb-1">
                    <CheckCircle size={12} />
                    Completed
                  </span>
                  <p className="text-xs text-white/40">{payout.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
