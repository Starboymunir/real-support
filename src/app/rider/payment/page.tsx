'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
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
  const [showAddForm, setShowAddForm] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');

  return (
    <DashboardLayout role="rider" userName="John Doe" pageTitle="Payment Methods">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-1">
          Payment Methods
        </h2>
        <p className="text-text-secondary">Manage your cards and view transaction history.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* ════════ Left Column (2/3) ════════════════════════════ */}
        <div className="lg:col-span-2 space-y-6">
          {/* ── Saved Cards ──────────────────────────────────────── */}
          <div className="space-y-4">
            {savedCards.map((card) => (
              <div
                key={card.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 card-hover"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-16 h-11 rounded-lg bg-gradient-to-br ${cardGradients[card.type]} flex items-center justify-center shrink-0 shadow-md`}
                    >
                      <CreditCard size={22} className="text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-text-primary">
                          {card.type} •••• {card.last4}
                        </p>
                        {card.isDefault && (
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-success/10 text-success flex items-center gap-1">
                            <Check size={10} /> Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-text-muted mt-0.5">Expires {card.expiry}</p>
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {!showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full p-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all duration-200 flex items-center justify-center gap-3 text-text-secondary hover:text-primary group"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                  <Plus size={20} />
                </div>
                <span className="font-semibold">Add New Card</span>
              </button>
            ) : (
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <CreditCard size={18} className="text-primary" />
                    </div>
                    Add New Card
                  </h3>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  >
                    <X size={16} className="text-text-muted" />
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

                  <div className="flex items-center gap-2 text-xs text-text-muted bg-gray-50 rounded-lg p-3">
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
          <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-100 card-hover">
            <h3 className="text-lg font-semibold text-text-primary mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <ArrowUpRight size={18} className="text-primary" />
              </div>
              Transaction History
            </h3>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-text-muted font-medium">Date</th>
                    <th className="text-left py-3 px-4 text-text-muted font-medium">Amount</th>
                    <th className="text-left py-3 px-4 text-text-muted font-medium">Ride ID</th>
                    <th className="text-left py-3 px-4 text-text-muted font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 px-4 text-text-primary font-medium">{tx.date}</td>
                      <td className="py-3.5 px-4 text-text-primary font-semibold">{tx.amount}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-text-secondary">
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
                <div key={tx.id} className="p-4 rounded-xl bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-text-primary">{tx.amount}</span>
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
                  <div className="flex items-center justify-between text-xs text-text-muted">
                    <span>{tx.date}</span>
                    <span className="font-mono bg-gray-200 px-1.5 py-0.5 rounded">{tx.ride}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ════════ Right Column (1/3) ═══════════════════════════ */}
        <div className="space-y-6">
          {/* ── Payment Summary ──────────────────────────────────── */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 card-hover">
            <h3 className="text-lg font-semibold text-text-primary mb-5 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Wallet size={18} className="text-primary" />
              </div>
              Payment Summary
            </h3>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gray-50">
                <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Total Spent</p>
                <p className="text-2xl font-bold text-text-primary mt-1">£342.80</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50">
                <p className="text-xs text-text-muted font-medium uppercase tracking-wider">This Month</p>
                <p className="text-2xl font-bold gradient-text mt-1">£65.50</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50">
                <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Saved Cards</p>
                <p className="text-2xl font-bold text-text-primary mt-1">2</p>
              </div>
            </div>
          </div>

          {/* ── Secure Payments ──────────────────────────────────── */}
          <div className="bg-gradient-to-br from-primary to-primary-light rounded-xl p-6 text-white shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center mb-4">
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
