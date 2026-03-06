'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useRequireAuth } from '@/lib/use-require-auth';
import { walletApi } from '@/lib/services/wallet';
import {
  CreditCard,
  Shield,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  Lock,
} from 'lucide-react';

export default function PaymentPage() {
  const { user } = useRequireAuth();
  const [txList, setTxList] = useState<{ id: string; date: string; amount: string; ride: string; status: 'Paid' | 'Refunded' }[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [monthSpent, setMonthSpent] = useState(0);
  const [txCount, setTxCount] = useState(0);

  const fetchTransactions = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await walletApi.getUserTransactions(user.id);
      if (data && data.length > 0) {
        setTxCount(data.filter(t => t.type === 'EXPENSE' || t.type === 'REFUND').length);
        const mapped = data
          .filter(t => t.type === 'EXPENSE' || t.type === 'REFUND')
          .slice(0, 10)
          .map((t, idx) => {
            const d = new Date(t.createdAt);
            return {
              id: `TXN-${idx}`,
              date: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
              amount: `£${Math.abs(t.amount).toFixed(2)}`,
              ride: t.bookingId ? t.bookingId.slice(-6) : 'N/A',
              status: (t.type === 'REFUND' ? 'Refunded' : 'Paid') as 'Paid' | 'Refunded',
            };
          });
        setTxList(mapped);

        const total = data.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
        setTotalSpent(total);

        const now = new Date();
        const monthTotal = data.filter(t => {
          const td = new Date(t.createdAt);
          return t.type === 'EXPENSE' && td.getMonth() === now.getMonth() && td.getFullYear() === now.getFullYear();
        }).reduce((s, t) => s + t.amount, 0);
        setMonthSpent(monthTotal);
      }
    } catch { /* keep empty */ }
  }, [user?.id]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  return (
    <DashboardLayout role="rider" pageTitle="Payment Methods">
      {/* ── Header ── */}
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">Payment Methods</h2>
        <p className="text-white/60">Manage your cards and view transaction history.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* ════════ Left Column (2/3) ════════ */}
        <div className="lg:col-span-2 space-y-6">
          {/* ── Payment Method Info ── */}
          <div className="bg-white/[0.02] rounded-2xl p-6 border border-white/[0.06]">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-11 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shrink-0">
                <CreditCard size={22} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-white">Secure Payments via Stripe</p>
                <p className="text-sm text-white/40 mt-0.5">All payments are processed securely through Stripe</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.04] flex items-start gap-3">
              <Shield size={16} className="text-secondary shrink-0 mt-0.5" />
              <p className="text-xs text-white/40 leading-relaxed">
                Your card details are never stored on our servers. Each transaction creates a secure payment intent through Stripe&apos;s PCI-DSS Level 1 certified infrastructure.
              </p>
            </div>
          </div>

          {/* ── Transaction History ── */}
          <div className="bg-white/[0.02] rounded-2xl p-6 sm:p-8 border border-white/[0.06] hover:bg-white/[0.04] transition-all">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                <ArrowUpRight size={18} className="text-secondary" />
              </div>
              Transaction History
            </h3>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left py-3 px-4 text-white/30 font-medium">Date</th>
                    <th className="text-left py-3 px-4 text-white/30 font-medium">Amount</th>
                    <th className="text-left py-3 px-4 text-white/30 font-medium">Ride ID</th>
                    <th className="text-left py-3 px-4 text-white/30 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {txList.length === 0 ? (
                    <tr><td colSpan={4} className="py-8 text-center text-white/30">No transactions yet</td></tr>
                  ) : txList.map((tx) => (
                    <tr key={tx.id} className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors">
                      <td className="py-3.5 px-4 text-white font-medium">{tx.date}</td>
                      <td className="py-3.5 px-4 text-white font-semibold">{tx.amount}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs bg-white/[0.06] px-2 py-1 rounded text-white/50">{tx.ride}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1 ${
                          tx.status === 'Paid' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                        }`}>
                          {tx.status === 'Paid' ? <ArrowUpRight size={10} /> : <ArrowDownLeft size={10} />}
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden space-y-3">
              {txList.length === 0 ? (
                <p className="text-center text-white/30 py-6">No transactions yet</p>
              ) : txList.map((tx) => (
                <div key={tx.id} className="p-4 rounded-xl bg-white/[0.03]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-white">{tx.amount}</span>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      tx.status === 'Paid' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                    }`}>{tx.status}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-white/40">
                    <span>{tx.date}</span>
                    <span className="font-mono bg-white/[0.08] px-1.5 py-0.5 rounded">{tx.ride}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ════════ Right Column (1/3) ════════ */}
        <div className="space-y-6">
          {/* ── Payment Summary ── */}
          <div className="bg-white/[0.02] rounded-2xl p-6 border border-white/[0.06] hover:bg-white/[0.04] transition-all">
            <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Wallet size={18} className="text-secondary" />
              </div>
              Payment Summary
            </h3>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                <p className="text-xs text-white/30 font-medium uppercase tracking-wider">Total Spent</p>
                <p className="text-2xl font-bold text-white mt-1">£{totalSpent.toFixed(2)}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                <p className="text-xs text-white/30 font-medium uppercase tracking-wider">This Month</p>
                <p className="text-2xl font-bold gradient-text mt-1">£{monthSpent.toFixed(2)}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                <p className="text-xs text-white/30 font-medium uppercase tracking-wider">Transactions</p>
                <p className="text-2xl font-bold text-white mt-1">{txCount}</p>
              </div>
            </div>
          </div>

          {/* ── Secure Payments ── */}
          <div className="bg-gradient-to-br from-secondary/[0.12] via-dark-surface to-accent/[0.06] rounded-2xl p-6 text-white border border-secondary/20">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center mb-4">
              <Shield size={24} className="text-white" />
            </div>
            <h3 className="text-lg font-bold mb-2">Secure Payments</h3>
            <p className="text-sm text-white/80 leading-relaxed">
              All transactions are protected with bank-grade 256-bit SSL encryption. Your card details are never stored on our servers.
            </p>
            <div className="flex items-center gap-2 mt-4 text-xs text-white/60">
              <Lock size={12} />
              <span>PCI-DSS Level 1 Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
