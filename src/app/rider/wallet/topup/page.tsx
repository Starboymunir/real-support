'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Wallet,
  Shield,
  Check,
  ChevronRight,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/button';
import { useRequireAuth } from '@/lib/use-require-auth';
import { walletApi } from '@/lib/services/wallet';

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const presetAmounts = [10, 20, 30, 50, 75, 100];

/* ──────────────────────────────────────────────
   Stripe Card Form (rendered inside <Elements>)
   ────────────────────────────────────────────── */
function CardForm({
  amount,
  userId,
  clientSecret: _clientSecret,
  paymentIntentId,
  currentBalance,
  onSuccess,
  onBack,
}: {
  amount: number;
  userId: string;
  clientSecret: string;
  paymentIntentId: string;
  currentBalance: number;
  onSuccess: () => void;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);

  const handlePay = useCallback(async () => {
    if (!stripe || !elements) return;
    setProcessing(true);
    setError('');

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: window.location.href },
        redirect: 'if_required',
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed. Please try again.');
        setProcessing(false);
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        await walletApi.createTopUp({
          userId,
          amount,
          stripeId: paymentIntentId,
          type: 'TOPUP',
        });
        onSuccess();
      } else {
        setError('Payment was not completed. Please try again.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  }, [stripe, elements, userId, amount, paymentIntentId, onSuccess]);

  return (
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

        <h2 className="text-xl font-bold text-white mb-1">Enter card details</h2>
        <p className="text-white/30 text-sm mb-6">
          You&apos;ll be charged <span className="text-white font-semibold">£{amount.toFixed(2)}</span>
        </p>

        {/* Stripe Payment Element */}
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 mb-4">
          <PaymentElement
            onReady={() => setReady(true)}
            options={{
              layout: 'tabs',
            }}
          />
        </div>

        {/* Balance preview */}
        <div className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
          <div className="w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center">
            <Wallet size={18} className="text-white/40" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white/60">Balance after top-up</p>
            <p className="text-sm text-secondary font-bold">
              £{currentBalance.toFixed(2)} → £{(currentBalance + amount).toFixed(2)}
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-500/[0.08] border border-red-500/20 text-red-400 text-sm flex items-start gap-2">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <Button variant="outline" size="md" onClick={onBack} disabled={processing}>
            Back
          </Button>
          <Button
            variant="green"
            size="lg"
            className="flex-1"
            onClick={handlePay}
            disabled={processing || !ready || !stripe}
          >
            {processing ? (
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Processing...
              </span>
            ) : (
              <>Pay £{amount.toFixed(2)}</>
            )}
          </Button>
        </div>

        <div className="flex items-center gap-2 mt-4 justify-center">
          <Shield size={14} className="text-white/20" />
          <span className="text-white/20 text-xs">Secured with 256-bit SSL encryption via Stripe</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   Main Top-Up Page
   ────────────────────────────────────────────── */
function TopUpContent() {
  const { user } = useRequireAuth();
  const searchParams = useSearchParams();
  const preselectedAmount = searchParams.get('amount');

  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState(preselectedAmount || '');
  const [customAmount, setCustomAmount] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [currentBalance, setCurrentBalance] = useState(0);

  // Stripe intent state
  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [creatingIntent, setCreatingIntent] = useState(false);

  const numAmount = parseFloat(amount) || 0;

  useEffect(() => {
    if (!user?.id) return;
    walletApi.getUserWallet(user.id)
      .then(w => setCurrentBalance(w.balance ?? 0))
      .catch(() => {});
  }, [user?.id]);

  const proceedToPayment = useCallback(async () => {
    if (!user?.id || numAmount < 1) return;

    if (!stripePromise) {
      setError('Payment is not configured. Please contact support.');
      return;
    }

    setCreatingIntent(true);
    setError('');
    try {
      const intent = await walletApi.createPaymentIntent({
        amount: numAmount,
        userId: user.id,
        email: user.emailAddress || undefined,
      });
      setClientSecret(intent.paymentIntent);
      setPaymentIntentId(intent.paymentIntentId);
      setStep(2);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to initialise payment. Please try again.');
    } finally {
      setCreatingIntent(false);
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
                    step >= s || (s === 3 && success)
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
                    step > s || (s === 2 && success) ? 'bg-secondary/30' : 'bg-white/[0.06]'
                  }`} />
                )}
              </div>
            ))}
            <span className="text-xs text-white/30 font-medium ml-2 hidden sm:block">
              {step === 1 ? 'Choose Amount' : step === 2 ? 'Pay with Card' : 'Complete!'}
            </span>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* ═══════ STEP 1: AMOUNT ═══════ */}
          {step === 1 && !success && (
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

                {error && (
                  <div className="mt-4 p-4 rounded-xl bg-red-500/[0.08] border border-red-500/20 text-red-400 text-sm flex items-start gap-2">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}

                <div className="mt-6">
                  <Button
                    variant="green"
                    size="lg"
                    className="w-full"
                    onClick={proceedToPayment}
                    disabled={numAmount < 1 || creatingIntent}
                  >
                    {creatingIntent ? (
                      <span className="flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin" />
                        Setting up payment...
                      </span>
                    ) : (
                      <>Continue to Payment <ChevronRight size={16} /></>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════ STEP 2: CARD PAYMENT (Stripe Elements) ═══════ */}
          {step === 2 && !success && clientSecret && stripePromise && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'night',
                  variables: {
                    colorPrimary: '#22c55e',
                    colorBackground: '#0a0a0a',
                    colorText: '#ffffff',
                    colorTextSecondary: '#ffffff66',
                    colorDanger: '#ef4444',
                    fontFamily: 'inherit',
                    borderRadius: '12px',
                    spacingUnit: '4px',
                  },
                  rules: {
                    '.Input': {
                      backgroundColor: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#ffffff',
                    },
                    '.Input:focus': {
                      border: '1px solid rgba(34,197,94,0.4)',
                      boxShadow: '0 0 0 1px rgba(34,197,94,0.2)',
                    },
                    '.Label': {
                      color: 'rgba(255,255,255,0.5)',
                    },
                  },
                },
              }}
            >
              <CardForm
                amount={numAmount}
                userId={user!.id}
                clientSecret={clientSecret}
                paymentIntentId={paymentIntentId}
                currentBalance={currentBalance}
                onSuccess={() => setSuccess(true)}
                onBack={() => {
                  setStep(1);
                  setClientSecret('');
                  setPaymentIntentId('');
                }}
              />
            </Elements>
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
                  £{numAmount.toFixed(2)} has been added to your wallet.
                </p>

                <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/[0.04] border border-white/[0.08] mb-8">
                  <Wallet size={18} className="text-secondary" />
                  <span className="text-white font-bold">New Balance:</span>
                  <span className="text-secondary font-black text-lg">
                    £{(currentBalance + numAmount).toFixed(2)}
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
