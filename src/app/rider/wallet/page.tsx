'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Send,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  ChevronRight,
  Gift,
  Shield,
  Zap,
  CreditCard,
  Clock,
  ArrowRight,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/Button';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

/* ── animated counter ── */
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

/* ── data ── */
const transactions = [
  { id: 'WTX-3012', type: 'topup' as const, desc: 'Wallet Top-up', amount: '+£50.00', date: '17 Feb 2026', time: '14:32', method: 'Visa •••• 4242', icon: ArrowDownLeft, color: 'text-secondary', bg: 'bg-secondary/10' },
  { id: 'WTX-3011', type: 'ride' as const, desc: 'Ride RS-1024', amount: '-£34.50', date: '15 Feb 2026', time: '10:15', method: 'Baker St → Heathrow T5', icon: ArrowUpRight, color: 'text-accent', bg: 'bg-accent/10' },
  { id: 'WTX-3010', type: 'topup' as const, desc: 'Wallet Top-up', amount: '+£100.00', date: '12 Feb 2026', time: '09:20', method: 'Mastercard •••• 8888', icon: ArrowDownLeft, color: 'text-secondary', bg: 'bg-secondary/10' },
  { id: 'WTX-3009', type: 'ride' as const, desc: 'Ride RS-1019', amount: '-£12.80', date: '11 Feb 2026', time: '18:45', method: 'Kings Cross → Camden', icon: ArrowUpRight, color: 'text-accent', bg: 'bg-accent/10' },
  { id: 'WTX-3008', type: 'refund' as const, desc: 'Refund RS-1015', amount: '+£18.20', date: '10 Feb 2026', time: '11:00', method: 'Cancelled ride refund', icon: RefreshCw, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { id: 'WTX-3007', type: 'ride' as const, desc: 'Ride RS-1010', amount: '-£9.50', date: '8 Feb 2026', time: '07:30', method: 'Paddington → Soho', icon: ArrowUpRight, color: 'text-accent', bg: 'bg-accent/10' },
  { id: 'WTX-3006', type: 'withdraw' as const, desc: 'Withdrawal', amount: '-£25.00', date: '5 Feb 2026', time: '16:10', method: 'To bank account', icon: Send, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { id: 'WTX-3005', type: 'topup' as const, desc: 'Wallet Top-up', amount: '+£75.00', date: '1 Feb 2026', time: '12:00', method: 'Visa •••• 4242', icon: ArrowDownLeft, color: 'text-secondary', bg: 'bg-secondary/10' },
];

const monthlySpend = [
  { month: 'Sep', amount: 45 },
  { month: 'Oct', amount: 78 },
  { month: 'Nov', amount: 62 },
  { month: 'Dec', amount: 95 },
  { month: 'Jan', amount: 55 },
  { month: 'Feb', amount: 66 },
];

const quickAmounts = [10, 20, 50, 100];

type TxFilter = 'all' | 'topup' | 'ride' | 'refund' | 'withdraw';

export default function WalletPage() {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [filter, setFilter] = useState<TxFilter>('all');
  const balance = useCounter(186, 1000);
  const spent = useCounter(66);
  const topups = useCounter(225);

  const maxSpend = Math.max(...monthlySpend.map((m) => m.amount));

  const filtered = filter === 'all'
    ? transactions
    : transactions.filter((t) => t.type === filter);

  const filterButtons: { label: string; value: TxFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Top-ups', value: 'topup' },
    { label: 'Rides', value: 'ride' },
    { label: 'Refunds', value: 'refund' },
    { label: 'Withdrawals', value: 'withdraw' },
  ];

  return (
    <DashboardLayout role="rider" userName="James Rider" pageTitle="Wallet">
      <div className="space-y-6">

        {/* ═══════ WALLET BALANCE HERO ═══════ */}
        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-secondary/[0.10] via-white/[0.02] to-accent/[0.06]">
            {/* Decorative */}
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-secondary/[0.06] rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-16 left-1/3 w-56 h-56 bg-accent/[0.04] rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-secondary via-accent to-secondary" />

            <div className="relative p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
                {/* Left — Balance */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="badge-green"><Wallet size={12} /> RS CAB Wallet</div>
                  </div>
                  <p className="text-white/40 text-sm mt-3">Available Balance</p>
                  <div className="flex items-center gap-3 mt-1">
                    <h1 className="text-4xl sm:text-5xl font-black text-white tabular-nums tracking-tight">
                      {balanceVisible ? `£${balance.toFixed(2)}` : '£•••••'}
                    </h1>
                    <button
                      onClick={() => setBalanceVisible(!balanceVisible)}
                      className="p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.10] text-white/40 hover:text-white transition-all"
                      aria-label={balanceVisible ? 'Hide balance' : 'Show balance'}
                    >
                      {balanceVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <TrendingUp size={14} className="text-secondary" />
                    <span className="text-secondary text-sm font-semibold">+£50.00</span>
                    <span className="text-white/25 text-xs">last top-up</span>
                  </div>
                </div>

                {/* Right — Quick Actions */}
                <div className="flex flex-wrap gap-3">
                  <Button href="/rider/wallet/topup" variant="green" size="md">
                    <Plus size={16} /> Top Up
                  </Button>
                  <Button href="/rider/wallet/withdraw" variant="outline" size="md">
                    <Send size={16} /> Withdraw
                  </Button>
                </div>
              </div>

              {/* Quick top-up amounts */}
              <div className="mt-6 pt-6 border-t border-white/[0.06]">
                <p className="text-white/30 text-xs font-semibold uppercase tracking-wider mb-3">Quick Top-up</p>
                <div className="flex flex-wrap gap-2">
                  {quickAmounts.map((amt) => (
                    <Link
                      key={amt}
                      href={`/rider/wallet/topup?amount=${amt}`}
                      className="px-5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:border-secondary/30 hover:bg-secondary/[0.06] text-white font-bold text-sm transition-all duration-300"
                    >
                      £{amt}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══════ STATS ROW ═══════ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}>
            <div className="h-full rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-all group">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <TrendingUp size={20} className="text-secondary" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white tabular-nums">£{topups}</p>
              <p className="text-white/30 text-xs font-medium mt-1">Total Top-ups</p>
            </div>
          </motion.div>

          <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp}>
            <div className="h-full rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-all group">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <TrendingDown size={20} className="text-accent" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white tabular-nums">£{spent}</p>
              <p className="text-white/30 text-xs font-medium mt-1">Spent This Month</p>
            </div>
          </motion.div>

          <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp}>
            <div className="h-full rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-all group">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <CreditCard size={20} className="text-purple-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white tabular-nums">2</p>
              <p className="text-white/30 text-xs font-medium mt-1">Linked Cards</p>
            </div>
          </motion.div>

          <motion.div initial="hidden" animate="visible" custom={4} variants={fadeUp}>
            <div className="h-full rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-all group">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Clock size={20} className="text-orange-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white tabular-nums">8</p>
              <p className="text-white/30 text-xs font-medium mt-1">Transactions</p>
            </div>
          </motion.div>
        </div>

        {/* ═══════ SPENDING CHART + TRANSACTIONS ═══════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Spending Chart */}
          <motion.div initial="hidden" animate="visible" custom={5} variants={fadeUp}>
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 h-full">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-secondary via-accent to-secondary" />
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Sparkles size={18} className="text-secondary" /> Monthly Spending
              </h2>

              <div className="flex items-end justify-between gap-2 h-40">
                {monthlySpend.map((m) => {
                  const h = (m.amount / maxSpend) * 100;
                  const isLast = m.month === 'Feb';
                  return (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                      <span className={`text-[10px] font-bold tabular-nums ${isLast ? 'text-secondary' : 'text-white/30'}`}>
                        £{m.amount}
                      </span>
                      <div
                        className={`w-full rounded-lg transition-all duration-700 ${
                          isLast
                            ? 'bg-gradient-to-t from-secondary/60 to-secondary'
                            : 'bg-white/[0.06] hover:bg-white/[0.10]'
                        }`}
                        style={{ height: `${h}%` }}
                      />
                      <span className={`text-[10px] font-medium ${isLast ? 'text-secondary' : 'text-white/25'}`}>
                        {m.month}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                <div>
                  <p className="text-white/25 text-[10px] uppercase tracking-wider font-semibold">6-month avg</p>
                  <p className="text-white font-bold text-lg">£66.83</p>
                </div>
                <div className="flex items-center gap-1 text-secondary text-xs font-semibold">
                  <TrendingDown size={12} />
                  <span>-5% vs last month</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Transactions */}
          <motion.div initial="hidden" animate="visible" custom={6} variants={fadeUp} className="lg:col-span-2">
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <h2 className="text-lg font-bold text-white">Transaction History</h2>
                <div className="flex flex-wrap gap-1.5">
                  {filterButtons.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setFilter(f.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        filter === f.value
                          ? 'bg-secondary/10 text-secondary border border-secondary/20'
                          : 'bg-white/[0.04] text-white/40 border border-white/[0.06] hover:bg-white/[0.08] hover:text-white/60'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {filtered.length === 0 ? (
                  <div className="text-center py-12">
                    <Wallet size={32} className="text-white/10 mx-auto mb-3" />
                    <p className="text-white/30 text-sm">No transactions found</p>
                  </div>
                ) : (
                  filtered.map((tx) => {
                    const Icon = tx.icon;
                    return (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-xl ${tx.bg} flex items-center justify-center shrink-0`}>
                            <Icon size={18} className={tx.color} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-white">{tx.desc}</p>
                            <p className="text-xs text-white/30 truncate mt-0.5">{tx.method}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-3">
                          <p className={`text-sm font-black tabular-nums ${
                            tx.amount.startsWith('+') ? 'text-secondary' : 'text-white'
                          }`}>
                            {tx.amount}
                          </p>
                          <p className="text-[10px] text-white/20 mt-0.5">{tx.date} · {tx.time}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {filtered.length > 0 && (
                <div className="mt-4 text-center">
                  <Button variant="ghost" size="sm">
                    Load More <ChevronRight size={14} />
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* ═══════ BOTTOM ROW: PROMO + SECURITY ═══════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cashback / Promo */}
          <motion.div initial="hidden" animate="visible" custom={7} variants={fadeUp}>
            <div className="relative h-full overflow-hidden rounded-2xl border border-secondary/20 bg-gradient-to-br from-secondary/[0.08] via-dark-surface to-accent/[0.04] p-6 flex flex-col justify-between">
              <div className="absolute -top-16 -right-16 w-40 h-40 bg-secondary/[0.1] rounded-full blur-[60px] pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-accent/[0.06] rounded-full blur-[40px] pointer-events-none" />

              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center mb-5">
                  <Gift size={26} className="text-secondary" />
                </div>
                <h3 className="text-xl font-black text-white mb-2">Earn 5% Cashback!</h3>
                <p className="text-white/40 text-sm leading-relaxed">
                  Top up £50 or more and receive 5% bonus credit automatically added to your wallet.
                </p>
              </div>

              <div className="relative mt-6">
                <Button href="/rider/wallet/topup?amount=50" variant="green" size="md" className="w-full">
                  <Zap size={16} /> Claim Cashback <ArrowRight size={14} />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Wallet Security */}
          <motion.div initial="hidden" animate="visible" custom={8} variants={fadeUp}>
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 h-full">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />
              <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <Shield size={18} className="text-secondary" /> Wallet Security
              </h2>

              <div className="space-y-4">
                {[
                  { label: 'Two-Factor Authentication', desc: 'Extra layer of protection on withdrawals', status: 'Enabled', statusColor: 'text-secondary bg-secondary/10' },
                  { label: 'Transaction Alerts', desc: 'Get notified for every transaction', status: 'Enabled', statusColor: 'text-secondary bg-secondary/10' },
                  { label: 'Spending Limit', desc: 'Daily limit set to £500', status: '£500/day', statusColor: 'text-accent bg-accent/10' },
                  { label: 'Auto Top-up', desc: 'Automatically add funds when balance is low', status: 'Disabled', statusColor: 'text-white/40 bg-white/[0.06]' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.05] transition-all"
                  >
                    <div className="min-w-0 mr-3">
                      <p className="text-sm font-semibold text-white">{item.label}</p>
                      <p className="text-xs text-white/30 mt-0.5">{item.desc}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full shrink-0 ${item.statusColor}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
