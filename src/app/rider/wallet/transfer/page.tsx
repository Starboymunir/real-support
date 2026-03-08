'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowLeftRight,
  Wallet,
  Check,
  ChevronRight,
  Shield,
  Loader2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/Button';
import { useRequireAuth } from '@/lib/use-require-auth';
import { walletApi } from '@/lib/services/wallet';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export default function TransferPage() {
  const { user } = useRequireAuth();
  const [recipientEmail, setRecipientEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [narration, setNarration] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [currentBalance, setCurrentBalance] = useState(0);

  const numAmount = parseFloat(amount) || 0;

  useEffect(() => {
    if (!user?.id) return;
    walletApi.getUserWallet(user.id)
      .then(w => setCurrentBalance(w.balance ?? 0))
      .catch(() => {});
  }, [user?.id]);

  const handleTransfer = useCallback(async () => {
    if (!user?.id || numAmount < 1 || !recipientEmail.trim()) return;
    if (numAmount > currentBalance) {
      setError('Insufficient balance');
      return;
    }
    setProcessing(true);
    setError('');
    try {
      await walletApi.walletTransfer({
        payeeId: user.id,
        recipientId: recipientEmail.trim(),
        amount: numAmount,
        narration: narration.trim() || undefined,
      });
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Transfer failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  }, [user?.id, numAmount, recipientEmail, narration, currentBalance]);

  return (
    <DashboardLayout role="rider" pageTitle="Transfer">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back */}
        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
          <Link href="/rider/wallet" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm font-medium transition-colors">
            <ArrowLeft size={16} /> Back to Wallet
          </Link>
        </motion.div>

        {!success ? (
          <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}>
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-secondary via-accent to-secondary" />

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <ArrowLeftRight size={22} className="text-accent" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Send Money</h2>
                  <p className="text-white/30 text-sm">Transfer funds to another user</p>
                </div>
              </div>

              {/* Balance */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-6">
                <Wallet size={18} className="text-secondary" />
                <span className="text-white/50 text-sm">Available Balance</span>
                <span className="ml-auto text-white font-bold">£{currentBalance.toFixed(2)}</span>
              </div>

              <div className="space-y-5">
                {/* Recipient */}
                <div>
                  <label className="block text-sm font-medium text-white/50 mb-2">Recipient Email or ID</label>
                  <input
                    type="text"
                    placeholder="Enter recipient email or user ID"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className="input-dark w-full"
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-white/50 mb-2">Amount</label>
                  <div className="flex items-center gap-2 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                    <span className="text-2xl font-black text-white">£</span>
                    <input
                      type="number"
                      min="1"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="flex-1 bg-transparent text-2xl font-black text-white placeholder:text-white/15 outline-none tabular-nums"
                    />
                  </div>
                </div>

                {/* Narration */}
                <div>
                  <label className="block text-sm font-medium text-white/50 mb-2">Note (optional)</label>
                  <input
                    type="text"
                    placeholder="What's this for?"
                    value={narration}
                    onChange={(e) => setNarration(e.target.value)}
                    className="input-dark w-full"
                  />
                </div>
              </div>

              {error && (
                <div className="mt-4 p-4 rounded-xl bg-red-500/[0.08] border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="mt-6">
                <Button
                  variant="green"
                  size="lg"
                  className="w-full"
                  onClick={handleTransfer}
                  disabled={processing || numAmount < 1 || !recipientEmail.trim()}
                >
                  {processing ? (
                    <><Loader2 size={16} className="animate-spin" /> Sending...</>
                  ) : (
                    <>Send £{numAmount > 0 ? numAmount.toFixed(2) : '0.00'} <ChevronRight size={16} /></>
                  )}
                </Button>
              </div>

              <div className="flex items-center gap-2 mt-4 justify-center">
                <Shield size={14} className="text-white/20" />
                <span className="text-white/20 text-xs">Transfers are instant and secure</span>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative overflow-hidden rounded-2xl border border-secondary/20 bg-gradient-to-br from-secondary/[0.08] via-dark-surface to-accent/[0.04] p-8 sm:p-12 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-20 h-20 rounded-full bg-secondary/20 border-2 border-secondary/30 flex items-center justify-center mx-auto mb-6"
              >
                <Check size={36} className="text-secondary" />
              </motion.div>

              <h2 className="text-2xl font-black text-white mb-2">Transfer Successful!</h2>
              <p className="text-white/40 text-sm mb-8">
                £{numAmount.toFixed(2)} has been sent to {recipientEmail}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button href="/rider/wallet" variant="green" size="md">
                  <Wallet size={16} /> Back to Wallet
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => {
                    setSuccess(false);
                    setRecipientEmail('');
                    setAmount('');
                    setNarration('');
                  }}
                >
                  Send Another
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
