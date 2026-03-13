'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  FileCheck,
  Send,
  Inbox,
  Check,
  X,
  Loader2,
  ChevronRight,
  Clock,
  Plus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/button';
import { useRequireAuth } from '@/lib/use-require-auth';
import { walletApi } from '@/lib/services/wallet';
import { toast } from '@/lib/toast';
import type { PaymentRequest } from '@/lib/types';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

function statusBadge(status: string) {
  switch (status) {
    case 'COMPLETED':
    case 'CONFIRMED':
      return 'bg-secondary/10 text-secondary border-secondary/20';
    case 'DECLINED':
    case 'CANCELLED':
      return 'bg-red-500/10 text-red-400 border-red-500/20';
    default:
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  }
}

export default function RequestsPage() {
  const { user } = useRequireAuth();
  const [tab, setTab] = useState<'sent' | 'received'>('received');
  const [sentRequests, setSentRequests] = useState<PaymentRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // New request form
  const [showForm, setShowForm] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [onAccountOf, setOnAccountOf] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchRequests = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [sent, received] = await Promise.all([
        walletApi.getSentRequests(user.id),
        walletApi.getReceivedRequests(user.id),
      ]);
      setSentRequests(Array.isArray(sent) ? sent : []);
      setReceivedRequests(Array.isArray(received) ? received : []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleSendRequest = useCallback(async () => {
    if (!user?.id || !recipientEmail.trim() || !amount || !onAccountOf.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await walletApi.createPaymentRequest({
        payeeId: user.id,
        recipientId: recipientEmail.trim(),
        amount: parseFloat(amount),
        onAccountOf: onAccountOf.trim(),
        remarks: remarks.trim() || undefined,
      });
      toast.success('Request sent!', 'Payment request has been sent successfully.');
      setShowForm(false);
      setRecipientEmail('');
      setAmount('');
      setOnAccountOf('');
      setRemarks('');
      fetchRequests();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send request';
      setError(msg);
      toast.error('Request failed', msg);
    } finally {
      setSubmitting(false);
    }
  }, [user?.id, recipientEmail, amount, onAccountOf, remarks, fetchRequests]);

  const handleAction = useCallback(async (id: string, action: 'confirm' | 'decline') => {
    setActionLoading(id);
    try {
      if (action === 'confirm') {
        await walletApi.confirmRequest(id);
        toast.success('Request confirmed!');
      } else {
        await walletApi.declineRequest(id);
        toast.info('Request declined.');
      }
      fetchRequests();
    } catch {
      /* ignore */
    } finally {
      setActionLoading(null);
    }
  }, [fetchRequests]);

  const currentList = tab === 'sent' ? sentRequests : receivedRequests;

  return (
    <DashboardLayout role="rider" pageTitle="Payment Requests">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back */}
        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
          <Link href="/rider/wallet" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm font-medium transition-colors">
            <ArrowLeft size={16} /> Back to Wallet
          </Link>
        </motion.div>

        {/* Header + Tabs */}
        <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}>
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-secondary via-accent to-secondary" />

            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <FileCheck size={20} className="text-purple-400" />
                </div>
                <h2 className="text-lg font-bold text-white">Payment Requests</h2>
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                className="px-4 py-2 rounded-xl bg-secondary/10 border border-secondary/20 text-secondary text-sm font-bold hover:bg-secondary/20 transition-all flex items-center gap-1.5"
              >
                <Plus size={14} /> New Request
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-5">
              {[
                { key: 'received' as const, label: 'Received', icon: Inbox, count: receivedRequests.length },
                { key: 'sent' as const, label: 'Sent', icon: Send, count: sentRequests.length },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                    tab === t.key
                      ? 'bg-secondary/10 border border-secondary/30 text-secondary'
                      : 'bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-white/60'
                  }`}
                >
                  <t.icon size={16} />
                  {t.label}
                  {t.count > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      tab === t.key ? 'bg-secondary/20 text-secondary' : 'bg-white/[0.06] text-white/30'
                    }`}>
                      {t.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* List */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-secondary animate-spin" />
              </div>
            ) : currentList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
                  {tab === 'received' ? <Inbox size={24} className="text-white/20" /> : <Send size={24} className="text-white/20" />}
                </div>
                <p className="text-white/40 text-sm font-medium">No {tab} requests</p>
                <p className="text-white/20 text-xs mt-1">{tab === 'sent' ? 'Create a new payment request' : 'Requests from others will appear here'}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {currentList.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-all"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">
                          {tab === 'received'
                            ? (req.payee?.firstName ? `${req.payee.firstName} ${req.payee.lastName || ''}` : req.payeeId)
                            : (req.recipient?.firstName ? `${req.recipient.firstName} ${req.recipient.lastName || ''}` : req.recipientId)
                          }
                        </p>
                        <p className="text-xs text-white/30 mt-0.5">{req.onAccountOf}</p>
                        {req.remarks && <p className="text-xs text-white/20 mt-0.5 italic">{req.remarks}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-black text-white">£{req.amount.toFixed(2)}</p>
                        <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge(req.status)}`}>
                          {req.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-white/20 flex items-center gap-1">
                        <Clock size={10} /> {new Date(req.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>

                      {tab === 'received' && req.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction(req.id, 'confirm')}
                            disabled={actionLoading === req.id}
                            className="px-3 py-1.5 rounded-lg bg-secondary/10 border border-secondary/20 text-secondary text-xs font-bold hover:bg-secondary/20 transition-all disabled:opacity-50 flex items-center gap-1"
                          >
                            {actionLoading === req.id ? <Loader2 size={10} className="animate-spin" /> : <Check size={12} />} Pay
                          </button>
                          <button
                            onClick={() => handleAction(req.id, 'decline')}
                            disabled={actionLoading === req.id}
                            className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all disabled:opacity-50 flex items-center gap-1"
                          >
                            <X size={12} /> Decline
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* New Request Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-accent to-purple-500" />

                <h3 className="text-lg font-bold text-white mb-5">Send Payment Request</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/50 mb-2">Request From (Email or ID)</label>
                    <input
                      type="text"
                      placeholder="Enter recipient email or user ID"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      className="input-dark w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/50 mb-2">Amount</label>
                    <div className="flex items-center gap-2 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                      <span className="text-xl font-black text-white">£</span>
                      <input
                        type="number"
                        min="1"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="flex-1 bg-transparent text-xl font-black text-white placeholder:text-white/15 outline-none tabular-nums"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/50 mb-2">On Account Of</label>
                    <input
                      type="text"
                      placeholder="e.g., Ride fare, Split bill"
                      value={onAccountOf}
                      onChange={(e) => setOnAccountOf(e.target.value)}
                      className="input-dark w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/50 mb-2">Remarks (optional)</label>
                    <input
                      type="text"
                      placeholder="Additional notes"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="input-dark w-full"
                    />
                  </div>
                </div>

                {error && (
                  <div className="mt-4 p-4 rounded-xl bg-red-500/[0.08] border border-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <Button variant="outline" size="md" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="green"
                    size="lg"
                    className="flex-1"
                    onClick={handleSendRequest}
                    disabled={submitting || !recipientEmail.trim() || !amount || !onAccountOf.trim()}
                  >
                    {submitting ? (
                      <><Loader2 size={16} className="animate-spin" /> Sending...</>
                    ) : (
                      <>Send Request <ChevronRight size={16} /></>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
