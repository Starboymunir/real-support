'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CreditCard,
  Plus,
  Wallet,
  Sparkles,
  Shield,
  Check,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

const savedCards = [
  { id: 1, type: 'visa', last4: '4242', expiry: '08/27', label: 'Visa' },
  { id: 2, type: 'mastercard', last4: '8888', expiry: '12/26', label: 'Mastercard' },
];

const presetAmounts = [10, 20, 30, 50, 75, 100];

function TopUpContent() {
  const searchParams = useSearchParams();
  const preselectedAmount = searchParams.get('amount');

  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState(preselectedAmount || '');
  const [selectedCard, setSelectedCard] = useState(savedCards[0].id);
  const [customAmount, setCustomAmount] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const numAmount = parseFloat(amount) || 0;
  const cashback = numAmount >= 50 ? (numAmount * 0.05).toFixed(2) : null;
  const total = numAmount;

  const handleConfirm = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
    }, 2000);
  };

  return (
    <DashboardLayout role="rider" userName="James Rider" pageTitle="Top Up Wallet">
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

                {/* Preset Grid */}
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
                      {a >= 50 && (
                        <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-secondary text-dark text-[9px] font-bold uppercase tracking-wide flex items-center gap-0.5">
                          <Zap size={8} /> 5% back
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Custom amount */}
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

                {/* Cashback Banner */}
                {cashback && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 p-4 rounded-xl bg-secondary/[0.08] border border-secondary/20 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center shrink-0">
                      <Sparkles size={18} className="text-secondary" />
                    </div>
                    <div>
                      <p className="text-secondary font-bold text-sm">5% Cashback Eligible!</p>
                      <p className="text-white/30 text-xs">You&apos;ll receive £{cashback} bonus credit</p>
                    </div>
                  </motion.div>
                )}

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

                <h2 className="text-xl font-bold text-white mb-1">Select payment method</h2>
                <p className="text-white/30 text-sm mb-6">Choose a saved card or add a new one</p>

                <div className="space-y-3">
                  {savedCards.map((card) => (
                    <button
                      key={card.id}
                      onClick={() => setSelectedCard(card.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 text-left ${
                        selectedCard === card.id
                          ? 'border-secondary/40 bg-secondary/[0.06]'
                          : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'
                      }`}
                    >
                      <div className={`w-12 h-8 rounded-lg flex items-center justify-center ${
                        selectedCard === card.id ? 'bg-secondary/15' : 'bg-white/[0.06]'
                      }`}>
                        <CreditCard size={20} className={selectedCard === card.id ? 'text-secondary' : 'text-white/40'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white">{card.label} •••• {card.last4}</p>
                        <p className="text-xs text-white/30">Expires {card.expiry}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedCard === card.id
                          ? 'border-secondary bg-secondary'
                          : 'border-white/20'
                      }`}>
                        {selectedCard === card.id && <Check size={12} className="text-dark" />}
                      </div>
                    </button>
                  ))}

                  {/* Add new card */}
                  <Link
                    href="/rider/payment"
                    className="w-full flex items-center gap-4 p-4 rounded-xl border border-dashed border-white/[0.10] bg-white/[0.01] hover:border-white/[0.20] hover:bg-white/[0.03] transition-all"
                  >
                    <div className="w-12 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center">
                      <Plus size={18} className="text-white/30" />
                    </div>
                    <p className="text-sm font-semibold text-white/40">Add new payment method</p>
                  </Link>
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
                  {cashback && (
                    <div className="flex justify-between items-center py-3 border-b border-white/[0.06]">
                      <span className="text-secondary text-sm font-medium flex items-center gap-1.5">
                        <Sparkles size={14} /> Cashback Bonus
                      </span>
                      <span className="text-secondary font-bold">+£{cashback}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-3 border-b border-white/[0.06]">
                    <span className="text-white/50 text-sm">Payment Method</span>
                    <span className="text-white font-semibold text-sm">
                      {savedCards.find((c) => c.id === selectedCard)?.label} •••• {savedCards.find((c) => c.id === selectedCard)?.last4}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-white/50 text-sm">Total Charge</span>
                    <span className="text-white font-black text-xl">£{total.toFixed(2)}</span>
                  </div>
                  {cashback && (
                    <div className="flex justify-between items-center py-3 bg-secondary/[0.06] rounded-xl px-4">
                      <span className="text-secondary text-sm font-medium">Added to Wallet</span>
                      <span className="text-secondary font-black text-xl">
                        £{(total + parseFloat(cashback)).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

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
                  {cashback && (
                    <> Plus £{cashback} cashback bonus!</>
                  )}
                </p>

                <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/[0.04] border border-white/[0.08] mb-8">
                  <Wallet size={18} className="text-secondary" />
                  <span className="text-white font-bold">New Balance:</span>
                  <span className="text-secondary font-black text-lg">
                    £{(186 + total + (cashback ? parseFloat(cashback) : 0)).toFixed(2)}
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
      <DashboardLayout role="rider" userName="James Rider" pageTitle="Top Up Wallet">
        <div className="max-w-2xl mx-auto flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-white/10 border-t-secondary rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    }>
      <TopUpContent />
    </Suspense>
  );
}
