'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useRequireAuth } from '@/lib/use-require-auth';
import { walletApi } from '@/lib/services/wallet';
import type { Transaction as ApiTransaction } from '@/lib/types';
import {
  CreditCard,
  Plus,
  Trash2,
  Star,
  Shield,
  User,
  Lock,
  X,
  Check,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const savedCards = [
  { id: 1, type: 'Visa', last4: '4242', expiry: '12/27', isDefault: true },
  { id: 2, type: 'Mastercard', last4: '8888', expiry: '09/28', isDefault: false },
];

const transactions = [
  { id: 'TXN-5001', date: '15 Feb 2026', amount: '£34.50', ride: 'RS-1024', status: 'Paid' as const },
  { id: 'TXN-4998', date: '14 Feb 2026', amount: '£18.20', ride: 'RS-1022', status: 'Paid' as const },
  { id: 'TXN-4990', date: '12 Feb 2026', amount: '£12.80', ride: 'RS-1019', status: 'Refunded' as const },
  { id: 'TXN-4985', date: '10 Feb 2026', amount: '£18.20', ride: 'RS-1015', status: 'Paid' as const },
  { id: 'TXN-4970', date: '8 Feb 2026', amount: '£9.50', ride: 'RS-1010', status: 'Paid' as const },
];

const cardGradients: Record<string, string> = {
  Visa: 'from-blue-600 to-blue-800',
  Mastercard: 'from-orange-500 to-red-600',
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function PaymentPage() {
  const { user } = useRequireAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [txList, setTxList] = useState(transactions);
  const [totalSpent, setTotalSpent] = useState(342.80);
  const [monthSpent, setMonthSpent] = useState(65.50);

  const fetchTransactions = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await walletApi.getUserTransactions(user.id);
      if (data && data.length > 0) {
        const mapped = data
          .filter(t => t.type === 'EXPENSE')
          .slice(0, 10)
          .map((t, idx) => {
            const d = new Date(t.createdAt);
            return {
              id: `TXN-${idx}`,
              date: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
              amount: `£${Math.abs(t.amount).toFixed(2)}`,
              ride: t.bookingId ? t.bookingId.slice(-6) : 'N/A',
              status: 'Paid' as const,
            };
          });
        if (mapped.length > 0) setTxList(mapped);
        const total = data.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
        setTotalSpent(total);
        const now = new Date();
        const monthTotal = data.filter(t => {
          const td = new Date(t.createdAt);
          return t.type === 'EXPENSE' && td.getMonth() === now.getMonth() && td.getFullYear() === now.getFullYear();
        }).reduce((s, t) => s + t.amount, 0);
        setMonthSpent(monthTotal);
      }
    } catch { /* keep fallback */ }
  }, [user?.id]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  return (
    <DashboardLayout role="rider" pageTitle="Payment Methods">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">
          Payment Methods
        </h2>
        <p className="text-white/60">Manage your cards and view transaction history.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* ════════ Left Column (2/3) ════════════════════════════ */}
        <div className="lg:col-span-2 space-y-6">
          {/* ── Saved Cards ──────────────────────────────────────── */}
          <div className="space-y-4">
            {savedCards.map((card) => (
              <div
                key={card.id}
                className="bg-white/[0.02] rounded-2xl p-6 border border-white/[0.06] hover:bg-white/[0.04] transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-16 h-11 rounded-lg bg-gradient-to-br ${cardGradients[card.type]} flex items-center justify-center shrink-0`}
                    >
                      <CreditCard size={22} className="text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-white">
                          {card.type} •••• {card.last4}
                        </p>
                        {card.isDefault && (
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-success/10 text-success flex items-center gap-1">
                            <Check size={10} /> Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-white/40 mt-0.5">Expires {card.expiry}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3">
                    {!card.isDefault && (
                      <Button variant="outline" size="sm">
                        <Star size={14} /> Set Default
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="!text-error hover:!bg-error/10"
                    >
                      <Trash2 size={14} /> Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Add New Card ─────────────────────────────────────── */}
          <div className="bg-white/[0.02] rounded-2xl border border-white/[0.06] overflow-hidden">
            {!showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full p-6 border-2 border-dashed border-white/[0.08] rounded-2xl hover:border-secondary hover:bg-secondary/[0.04] transition-all duration-200 flex items-center justify-center gap-3 text-white/40 hover:text-secondary group"
              >
                <div className="w-10 h-10 rounded-full bg-white/[0.06] group-hover:bg-secondary/10 flex items-center justify-center transition-colors">
                  <Plus size={20} />
                </div>
                <span className="font-semibold">Add New Card</span>
              </button>
            ) : (
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <CreditCard size={18} className="text-secondary" />
                    </div>
                    Add New Card
                  </h3>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center transition-colors"
                  >
                    <X size={16} className="text-white/40" />
                  </button>
                </div>

                <div className="space-y-5">
                  <Input
                    label="Card Number"
                    icon={CreditCard}
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                  />

                  <div className="grid grid-cols-2 gap-5">
                    <Input
                      label="Expiry Date"
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                    />
                    <Input
                      label="CVV"
                      icon={Lock}
                      placeholder="•••"
                      type="password"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                    />
                  </div>

                  <Input
                    label="Cardholder Name"
                    icon={User}
                    placeholder="Name on card"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                  />

                  <div className="flex items-center gap-2 text-xs text-white/40 bg-white/[0.03] border border-white/[0.04] rounded-lg p-3">
                    <Shield size={14} className="text-success shrink-0" />
                    <span>Your payment info is secured with 256-bit SSL encryption</span>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <Button variant="green" size="md">
                      <Plus size={16} /> Add Card
                    </Button>
                    <Button variant="ghost" size="md" onClick={() => setShowAddForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Transaction History ──────────────────────────────── */}
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
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors">
                      <td className="py-3.5 px-4 text-white font-medium">{tx.date}</td>
                      <td className="py-3.5 px-4 text-white font-semibold">{tx.amount}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs bg-white/[0.06] px-2 py-1 rounded text-white/50">
                          {tx.ride}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1 ${
                            tx.status === 'Paid'
                              ? 'bg-success/10 text-success'
                              : 'bg-warning/10 text-warning'
                          }`}
                        >
                          {tx.status === 'Paid' ? (
                            <ArrowUpRight size={10} />
                          ) : (
                            <ArrowDownLeft size={10} />
                          )}
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
              {transactions.map((tx) => (
                <div key={tx.id} className="p-4 rounded-xl bg-white/[0.03]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-white">{tx.amount}</span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        tx.status === 'Paid'
                          ? 'bg-success/10 text-success'
                          : 'bg-warning/10 text-warning'
                      }`}
                    >
                      {tx.status}
                    </span>
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

        {/* ════════ Right Column (1/3) ═══════════════════════════ */}
        <div className="space-y-6">
          {/* ── Payment Summary ──────────────────────────────────── */}
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
                <p className="text-xs text-white/30 font-medium uppercase tracking-wider">Saved Cards</p>
                <p className="text-2xl font-bold text-white mt-1">2</p>
              </div>
            </div>
          </div>

          {/* ── Secure Payments ──────────────────────────────────── */}
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
