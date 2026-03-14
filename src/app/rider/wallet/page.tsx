'use client';

import { useState, useEffect, useCallback } from 'react';
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
  Shield,
  CreditCard,
  Clock,
  ArrowRight,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/button';
import { useRequireAuth } from '@/lib/use-require-auth';
import { walletApi } from '@/lib/services/wallet';
import type { Transaction as ApiTransaction } from '@/lib/types';

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

/* ── helpers ── */
function mapTxType(type: string, amount?: number): TxFilter {
  switch (type) {
    case 'TOPUP': return 'topup';
    case 'EXPENSE': return 'ride';
    case 'WITHDRAW': return 'withdraw';
    case 'P2P_WALLET': return amount != null && amount < 0 ? 'transfer' : 'topup';
    case 'REFUND': return 'refund';
    default: return 'ride';
  }
}

function txIcon(filter: TxFilter) {
  switch (filter) {
    case 'topup': return { icon: ArrowDownLeft, color: 'text-secondary', bg: 'bg-secondary/10' };
    case 'ride': return { icon: ArrowUpRight, color: 'text-accent', bg: 'bg-accent/10' };
    case 'refund': return { icon: RefreshCw, color: 'text-purple-400', bg: 'bg-purple-500/10' };
    case 'withdraw': return { icon: Send, color: 'text-orange-400', bg: 'bg-orange-500/10' };
    case 'transfer': return { icon: ArrowUpRight, color: 'text-blue-400', bg: 'bg-blue-500/10' };
    default: return { icon: ArrowUpRight, color: 'text-accent', bg: 'bg-accent/10' };
  }
}

function txDesc(type: TxFilter, tx: ApiTransaction): string {
  switch (type) {
    case 'topup': return tx.type === 'P2P_WALLET' ? `Transfer from ${tx.senderInfo?.firstName || 'user'}` : 'Wallet Top-up';
    case 'transfer': return `Transfer to ${tx.receiverInfo?.firstName || 'user'}`;
    case 'ride': return tx.bookingId ? `Ride ${tx.bookingId.slice(-6)}` : 'Ride Payment';
    case 'refund': return tx.bookingId ? `Refund ${tx.bookingId.slice(-6)}` : 'Refund';
    case 'withdraw': return 'Withdrawal';
    default: return tx.narration || 'Transaction';
  }
}

function formatTxDate(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
  };
}

const quickAmounts = [10, 20, 50, 100];

type TxFilter = 'all' | 'topup' | 'ride' | 'refund' | 'withdraw' | 'transfer';
type DisplayTx = { id: string; type: TxFilter; desc: string; amount: string; date: string; time: string; method: string; icon: typeof ArrowUpRight; color: string; bg: string };

export default function WalletPage() {
  const { user } = useRequireAuth();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [filter, setFilter] = useState<TxFilter>('all');
  const [walletBalance, setWalletBalance] = useState(0);
  const [totalTopups, setTotalTopups] = useState(0);
  const [monthSpent, setMonthSpent] = useState(0);
  const [txCount, setTxCount] = useState(0);
  const [transactions, setTransactions] = useState<DisplayTx[]>([]);
  const [lastTopup, setLastTopup] = useState<number | null>(null);
  const [, setLoading] = useState(true);
  const [monthlySpend, setMonthlySpend] = useState<{ month: string; amount: number }[]>([]);

  const balance = useCounter(walletBalance, 1000);
  const spent = useCounter(monthSpent);
  const topups = useCounter(totalTopups);

  /* ── Fetch wallet data ── */
  const fetchWalletData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [wallet, txList] = await Promise.all([
        walletApi.getUserWallet(user.id),
        walletApi.getUserTransactions(user.id),
      ]);
      setWalletBalance(wallet.balance ?? 0);

      if (txList && txList.length > 0) {
        setTxCount(txList.length);

        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();
        let topupTotal = 0;
        let spentTotal = 0;
        let latestTopup: number | null = null;

        const mapped: DisplayTx[] = txList.map((tx) => {
          const txType = mapTxType(tx.type, tx.amount);
          const { icon, color, bg } = txIcon(txType);
          const { date, time } = formatTxDate(tx.createdAt);
          const isCredit = txType !== 'ride' && txType !== 'withdraw' && txType !== 'transfer';

          if (tx.type === 'TOPUP') {
            topupTotal += tx.amount;
            if (latestTopup === null) latestTopup = tx.amount;
          }
          const txDate = new Date(tx.createdAt);
          if (tx.type === 'EXPENSE' && txDate.getMonth() === thisMonth && txDate.getFullYear() === thisYear) {
            spentTotal += tx.amount;
          }

          return {
            id: tx.id,
            type: txType,
            desc: txDesc(txType, tx),
            amount: `${isCredit ? '+' : '-'}£${Math.abs(tx.amount).toFixed(2)}`,
            date,
            time,
            method: tx.narration || (isCredit ? 'Wallet credit' : 'Wallet debit'),
            icon,
            color,
            bg,
          };
        });

        setTransactions(mapped);
        setTotalTopups(topupTotal);
        setMonthSpent(spentTotal);
        setLastTopup(latestTopup);

        // Build monthly spend chart (last 6 months)
        const months: { month: string; amount: number }[] = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(thisYear, thisMonth - i, 1);
          const label = d.toLocaleDateString('en-GB', { month: 'short' });
          const monthExpenses = txList
            .filter((t) => {
              const td = new Date(t.createdAt);
              return t.type === 'EXPENSE' && td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear();
            })
            .reduce((sum, t) => sum + t.amount, 0);
          months.push({ month: label, amount: Math.round(monthExpenses) });
        }
        setMonthlySpend(months);
      }
    } catch {
      // No fallback — show empty state
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchWalletData(); }, [fetchWalletData]);

  const maxSpend = Math.max(...monthlySpend.map((m) => m.amount), 1);

  const filtered = filter === 'all'
    ? transactions
    : transactions.filter((t) => t.type === filter);

  const filterButtons: { label: string; value: TxFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Top-ups', value: 'topup' },
    { label: 'Transfers', value: 'transfer' },
    { label: 'Rides', value: 'ride' },
    { label: 'Refunds', value: 'refund' },
    { label: 'Withdrawals', value: 'withdraw' },
  ];

  return (
    <DashboardLayout role="rider" pageTitle="Wallet">
      <div className="space-y-6">

        {/* ═══════ WALLET BALANCE HERO ═══════ */}
        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-secondary/[0.10] via-white/[0.02] to-accent/[0.06]">
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-secondary/[0.06] rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-16 left-1/3 w-56 h-56 bg-accent/[0.04] rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-secondary via-accent to-secondary" />

            <div className="relative p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
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
                  {lastTopup !== null && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <TrendingUp size={14} className="text-secondary" />
                      <span className="text-secondary text-sm font-semibold">+£{lastTopup.toFixed(2)}</span>
                      <span className="text-white/25 text-xs">last top-up</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button href="/rider/wallet/topup" variant="green" size="md">
                    <Plus size={16} /> Top Up
                  </Button>
                  <Button href="/rider/wallet/withdraw" variant="outline" size="md">
                    <Send size={16} /> Withdraw
                  </Button>
                  <Button href="/rider/wallet/transfer" variant="outline" size="md">
                    <ArrowRight size={16} /> Transfer
                  </Button>
                  <Button href="/rider/wallet/requests" variant="outline" size="md">
                    <CreditCard size={16} /> Request
                  </Button>
                </div>
              </div>

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
            <Link href="/rider/payment" className="block h-full rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-all group">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <CreditCard size={20} className="text-purple-400" />
              </div>
              <p className="text-sm font-bold text-white">Payment</p>
              <p className="text-white/30 text-xs font-medium mt-1">Manage Methods</p>
            </Link>
          </motion.div>

          <motion.div initial="hidden" animate="visible" custom={4} variants={fadeUp}>
            <div className="h-full rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-all group">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Clock size={20} className="text-orange-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white tabular-nums">{txCount}</p>
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
                {monthlySpend.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-white/20 text-sm">
                    No spending data yet
                  </div>
                ) : (
                  monthlySpend.map((m, idx) => {
                    const h = maxSpend > 0 ? (m.amount / maxSpend) * 100 : 0;
                    const isLast = idx === monthlySpend.length - 1;
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
                          style={{ height: `${Math.max(h, 2)}%` }}
                        />
                        <span className={`text-[10px] font-medium ${isLast ? 'text-secondary' : 'text-white/25'}`}>
                          {m.month}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Chart summary */}
              <div className="mt-6 pt-4 border-t border-white/[0.06]">
                <div className="mb-2">
                  <p className="text-white/25 text-[10px] uppercase tracking-wider font-semibold">6-month avg</p>
                  <p className="text-white font-bold text-lg">
                    £{monthlySpend.length > 0 ? (monthlySpend.reduce((a, b) => a + b.amount, 0) / monthlySpend.length).toFixed(2) : '0.00'}
                  </p>
                </div>
                {monthlySpend.length >= 2 && monthlySpend[monthlySpend.length - 2].amount > 0 && (
                  <div className="flex items-center gap-1 text-xs font-semibold">
                    {(() => {
                      const prev = monthlySpend[monthlySpend.length - 2].amount;
                      const curr = monthlySpend[monthlySpend.length - 1].amount;
                      const pct = prev > 0 ? Math.round(((curr - prev) / prev) * 100) : 0;
                      const isDown = pct <= 0;
                      return (
                        <span className={isDown ? 'text-secondary flex items-center gap-1' : 'text-accent flex items-center gap-1'}>
                          {isDown ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                          {pct > 0 ? '+' : ''}{pct}% vs last month
                        </span>
                      );
                    })()}
                  </div>
                )}
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

        {/* ═══════ WALLET SECURITY ═══════ */}
        <div className="grid grid-cols-1 gap-6">
          <motion.div initial="hidden" animate="visible" custom={7} variants={fadeUp}>
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
