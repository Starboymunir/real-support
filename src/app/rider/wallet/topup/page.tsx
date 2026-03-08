'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CreditCard,
  Wallet,
  Shield,
  Check,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

const presetAmounts = [10, 20, 30, 50, 75, 100];

function TopUpContent() {
  const { user } = useRequireAuth();
  const searchParams = useSearchParams();
  const preselectedAmount = searchParams.get('amount');

  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState(preselectedAmount || '');
  const [customAmount, setCustomAmount] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [currentBalance, setCurrentBalance] = useState(0);

  const numAmount = parseFloat(amount) || 0;
  const total = numAmount;

  useEffect(() => {
    if (!user?.id) return;
    walletApi.getUserWallet(user.id)
      .then(w => setCurrentBalance(w.balance ?? 0))
      .catch(() => {});
  }, [user?.id]);

  const handleConfirm = useCallback(async () => {
    if (!user?.id || numAmount < 1) return;
    setProcessing(true);
    setError('');
    try {
      const intent = await walletApi.createPaymentIntent({
        amount: numAmount,
        userId: user.id,
        email: user.emailAddress || '',
      });
      await walletApi.createTopUp({
        userId: user.id,
        amount: numAmount,
        stripeId: intent.clientSecret || '',
        type: 'TOPUP',
      });
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Top-up failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  }, [user?.id, numAmount, user?.emailAddress]);

  return (
    <DashboardLayout role="rider" pageTitle="Top Up Wallet">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back Link */}
        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
          <Link
            href="/rider/wallet"
            className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm font-medium transition-colors"
          >
            <ArrowLeft size={16} /> Back to Wallet
          </Link>
        </motion.div>

        {/* Steps Indicator */}
        <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step >= s
                      ? success
                        ? 'bg-secondary text-dark'
                        : 'bg-secondary/20 text-secondary border border-secondary/30'
                      : 'bg-white/[0.06] text-white/30 border border-white/[0.06]'
                  }`}
                >
                  {(step > s || success) ? <Check size={14} /> : s}
                </div>
                {s < 3 && (
                  <div className={`w-12 sm:w-20 h-0.5 rounded-full ${
                    step > s ? 'bg-secondary/30' : 'bg-white/[0.06]'
                  }`} />
                )}
              </div>
            ))}
            <span className="text-xs text-white/30 font-medium ml-2 hidden sm:block">
              {step === 1 ? 'Choose Amount' : step === 2 ? 'Payment Method' : success ? 'Complete!' : 'Confirm'}
            </span>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* ═══════ STEP 1: AMOUNT ═══════ */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-secondary via-accent to-secondary" />

                <h2 className="text-xl font-bold text-white mb-1">Choose top-up amount</h2>
                <p className="text-white/30 text-sm mb-6">Select a preset amount or enter a custom value</p>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  {presetAmounts.map((a) => (
                    <button
                      key={a}
                      onClick={() => { setAmount(String(a)); setCustomAmount(false); }}
                      className={`relative p-4 rounded-xl border text-center font-black text-lg transition-all duration-300 ${
                        amount === String(a) && !customAmount
                          ? 'border-secondary/40 bg-secondary/[0.08] text-secondary shadow-lg shadow-secondary/5'
                          : 'border-white/[0.06] bg-white/[0.03] text-white hover:border-white/[0.12] hover:bg-white/[0.06]'
                      }`}
                    >
                      £{a}
                    </button>
                  ))}
                </div>

                <div
                  className={`rounded-xl border p-4 transition-all cursor-pointer ${
                    customAmount
                      ? 'border-secondary/30 bg-secondary/[0.04]'
                      : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'
                  }`}
                  onClick={() => setCustomAmount(true)}
                >
                  <p className="text-sm font-semibold text-white/60 mb-2">Custom Amount</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-white">£</span>
                    <input
                      type="number"
                      min="1"
                      max="500"
                      placeholder="0.00"
                      value={customAmount ? amount : ''}
                      onChange={(e) => { setAmount(e.target.value); setCustomAmount(true); }}
                      onFocus={() => setCustomAmount(true)}
                      className="flex-1 bg-transparent text-2xl font-black text-white placeholder:text-white/15 outline-none tabular-nums"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <Button
                    variant="green"
                    size="lg"
                    className="w-full"
                    onClick={() => numAmount >= 1 && setStep(2)}
                  >
                    Continue <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════ STEP 2: PAYMENT METHOD ═══════ */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-secondary via-accent to-secondary" />

                <h2 className="text-xl font-bold text-white mb-1">Payment method</h2>
                <p className="text-white/30 text-sm mb-6">Your payment will be processed securely via Stripe</p>

                <div className="space-y-3">
                  {/* Stripe payment */}
                  <div className="w-full flex items-center gap-4 p-4 rounded-xl border border-secondary/40 bg-secondary/[0.06] text-left">
                    <div className="w-12 h-8 rounded-lg flex items-center justify-center bg-secondary/15">
                      <CreditCard size={20} className="text-secondary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white">Pay with Card</p>
                      <p className="text-xs text-white/30">Secure payment via Stripe</p>
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 border-secondary bg-secondary flex items-center justify-center">
                      <Check size={12} className="text-dark" />
                    </div>
                  </div>

                  {/* Wallet balance info */}
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                    <div className="w-12 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
                      <Wallet size={18} className="text-white/40" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white/60">Current Balance</p>
                      <p className="text-xs text-white/30">£{currentBalance.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button variant="outline" size="md" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button variant="green" size="lg" className="flex-1" onClick={() => setStep(3)}>
                    Review Top-up <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════ STEP 3: CONFIRM ═══════ */}
          {step === 3 && !success && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-secondary via-accent to-secondary" />

                <h2 className="text-xl font-bold text-white mb-6">Review & Confirm</h2>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-white/[0.06]">
                    <span className="text-white/50 text-sm">Top-up Amount</span>
                    <span className="text-white font-bold text-lg">£{total.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-white/[0.06]">
                    <span className="text-white/50 text-sm">Payment Method</span>
                    <span className="text-white font-semibold text-sm">Card via Stripe</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-white/50 text-sm">Total Charge</span>
                    <span className="text-white font-black text-xl">£{total.toFixed(2)}</span>
                  </div>

                </div>

                {error && (
                  <div className="mt-4 p-4 rounded-xl bg-red-500/[0.08] border border-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 mt-8">
                  <Button variant="outline" size="md" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button
                    variant="green"
                    size="lg"
                    className="flex-1"
                    onClick={handleConfirm}
                    disabled={processing}
                  >
                    {processing ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-dark/30 border-t-dark rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      <>Confirm Top-up · £{total.toFixed(2)}</>
                    )}
                  </Button>
                </div>

                <div className="flex items-center gap-2 mt-4 justify-center">
                  <Shield size={14} className="text-white/20" />
                  <span className="text-white/20 text-xs">Secured with 256-bit SSL encryption</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════ SUCCESS ═══════ */}
          {success && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="relative overflow-hidden rounded-2xl border border-secondary/20 bg-gradient-to-br from-secondary/[0.08] via-dark-surface to-accent/[0.04] p-8 sm:p-12 text-center">
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-60 bg-secondary/[0.08] rounded-full blur-[100px] pointer-events-none" />

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="relative w-20 h-20 rounded-full bg-secondary/20 border-2 border-secondary/30 flex items-center justify-center mx-auto mb-6"
                >
                  <Check size={36} className="text-secondary" />
                </motion.div>

                <h2 className="text-2xl font-black text-white mb-2">Top-up Successful!</h2>
                <p className="text-white/40 text-sm mb-6 max-w-sm mx-auto">
                  £{total.toFixed(2)} has been added to your wallet.
                </p>

                <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/[0.04] border border-white/[0.08] mb-8">
                  <Wallet size={18} className="text-secondary" />
                  <span className="text-white font-bold">New Balance:</span>
                  <span className="text-secondary font-black text-lg">
                    £{(currentBalance + total).toFixed(2)}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button href="/rider/wallet" variant="green" size="md">
                    <Wallet size={16} /> Back to Wallet
                  </Button>
                  <Button href="/rider/book" variant="outline" size="md">
                    Book a Ride <ChevronRight size={14} />
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

export default function TopUpPage() {
  return (
    <Suspense fallback={
      <DashboardLayout role="rider" pageTitle="Top Up Wallet">
        <div className="max-w-2xl mx-auto flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-white/10 border-t-secondary rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    }>
      <TopUpContent />
    </Suspense>
  );
}
