'use client';

/**
 * Driver Wallet
 *
 * Slim wallet page mirroring `/rider/wallet` but rendered inside the driver
 * dashboard layout so drivers can access wallet funds without switching to
 * the rider dashboard. Drivers reuse the same shared `walletApi` endpoints.
 */

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Wallet as WalletIcon,
  ArrowDownLeft,
  ArrowUpRight,
  Send,
  RefreshCw,
  Eye,
  EyeOff,
  Banknote,
  ArrowRight,
} from 'lucide-react';
import { motion } from 'framer-motion';

import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/button';
import { useRequireAuth } from '@/lib/use-require-auth';
import { walletApi } from '@/lib/services/wallet';
import type { Transaction as ApiTransaction } from '@/lib/types';

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.4, ease: 'easeOut' },
  }),
};

function fmtMoney(n: number): string {
  return `£${(n || 0).toFixed(2)}`;
}

function txMeta(type: string): { label: string; tone: 'in' | 'out' | 'neutral' } {
  switch (type) {
    case 'TOPUP':
    case 'BOOKING_INCOME':
    case 'REFUND':
    case 'ADMIN_FUND':
      return { label: type === 'BOOKING_INCOME' ? 'Ride income' : type === 'REFUND' ? 'Refund' : type === 'ADMIN_FUND' ? 'Admin fund' : 'Top-up', tone: 'in' };
    case 'WITHDRAW':
      return { label: 'Withdraw', tone: 'out' };
    case 'COMMISSION':
    case 'CANCELLATION_FEE':
    case 'ADMIN_CHARGE':
      return { label: type === 'COMMISSION' ? 'Commission' : type === 'CANCELLATION_FEE' ? 'Cancellation fee' : 'Admin charge', tone: 'out' };
    case 'EXPENSE':
      return { label: 'Expense', tone: 'out' };
    case 'P2P_WALLET':
      return { label: 'Wallet transfer', tone: 'neutral' };
    default:
      return { label: type, tone: 'neutral' };
  }
}

export default function DriverWalletPage() {
  const { user } = useRequireAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<ApiTransaction[]>([]);
  const [showBalance, setShowBalance] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchWallet = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [walletRes, txRes] = await Promise.allSettled([
        walletApi.getUserWallet(user.id),
        walletApi.getUserTransactions(user.id),
      ]);

      if (walletRes.status === 'fulfilled') {
        const w = walletRes.value as { balance?: number } | { data?: { balance?: number } };
        const b = 'data' in w && w.data ? (w.data.balance ?? 0) : (w as { balance?: number }).balance ?? 0;
        setBalance(b);
      }

      if (txRes.status === 'fulfilled') {
        const list: ApiTransaction[] = Array.isArray(txRes.value)
          ? (txRes.value as ApiTransaction[])
          : ((txRes.value as { data?: ApiTransaction[] }).data || []);
        setTransactions(list.slice(0, 12));
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchWallet(); }, [fetchWallet]);

  return (
    <DashboardLayout role="driver" pageTitle="Wallet">
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Driver Wallet</h1>
            <p className="text-white/40 mt-1 text-sm">Manage your earnings, tips and payouts.</p>
          </div>
          <button
            onClick={fetchWallet}
            className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/50 hover:text-white"
            aria-label="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </motion.div>

        {/* Balance card */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={1}
          variants={fadeUp}
          className="rounded-2xl border border-secondary/20 bg-gradient-to-br from-secondary/15 via-secondary/5 to-transparent p-6 relative overflow-hidden"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/60 text-xs uppercase tracking-wider">Available balance</p>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-4xl font-bold text-white tabular-nums">
                  {showBalance ? fmtMoney(balance) : '••••••'}
                </span>
                <button
                  onClick={() => setShowBalance((v) => !v)}
                  className="text-white/40 hover:text-white"
                  aria-label="Toggle balance visibility"
                >
                  {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center">
              <WalletIcon size={22} className="text-secondary" />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <Link href="/driver/withdraw" className="rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.06] p-3 flex flex-col items-center gap-1.5 transition">
              <Banknote size={18} className="text-secondary" />
              <span className="text-xs font-semibold text-white">Withdraw</span>
            </Link>
            <Link href="/rider/wallet/transfer" className="rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.06] p-3 flex flex-col items-center gap-1.5 transition">
              <Send size={18} className="text-accent" />
              <span className="text-xs font-semibold text-white">Transfer</span>
            </Link>
            <Link href="/rider/wallet/topup" className="rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.06] p-3 flex flex-col items-center gap-1.5 transition">
              <ArrowDownLeft size={18} className="text-success" />
              <span className="text-xs font-semibold text-white">Top up</span>
            </Link>
            <Link href="/driver/earnings" className="rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.06] p-3 flex flex-col items-center gap-1.5 transition">
              <ArrowUpRight size={18} className="text-warning" />
              <span className="text-xs font-semibold text-white">Earnings</span>
            </Link>
          </div>
        </motion.div>

        {/* Transactions */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={2}
          variants={fadeUp}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent transactions</h2>
            <Link href="/driver/earnings" className="text-xs text-secondary hover:underline flex items-center gap-1">
              View earnings <ArrowRight size={12} />
            </Link>
          </div>

          {loading && transactions.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-8">Loading…</p>
          ) : transactions.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-8">No transactions yet.</p>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {transactions.map((tx) => {
                const meta = txMeta(tx.type);
                const sign = tx.amount > 0 ? '+' : '';
                const tone = meta.tone === 'in' ? 'text-success' : meta.tone === 'out' ? 'text-error' : 'text-white/70';
                return (
                  <div key={tx.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-white">{meta.label}</p>
                      <p className="text-xs text-white/40">
                        {new Date(tx.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        {tx.narration ? ` · ${tx.narration}` : ''}
                      </p>
                    </div>
                    <p className={`text-sm font-bold tabular-nums ${tone}`}>{sign}{fmtMoney(tx.amount)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
