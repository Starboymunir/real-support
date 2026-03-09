'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Wallet,
  Shield,
  Check,
  ChevronRight,
  AlertTriangle,
  Info,
  Landmark,
  Loader2,
  Star,
  Plus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/Button';
import { useRequireAuth } from '@/lib/use-require-auth';
import { walletApi } from '@/lib/services/wallet';
import { bankAccountApi } from '@/lib/services/bank-accounts';
import type { BankAccount } from '@/lib/types';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export default function WithdrawPage() {
  const { user } = useRequireAuth();
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);

  const numAmount = parseFloat(amount) || 0;
  const isValid = numAmount >= 5 && numAmount <= walletBalance;
  const selectedAccount = bankAccounts.find(a => a.id === selectedAccountId);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      walletApi.getUserWallet(user.id).then(w => setWalletBalance(w.balance ?? 0)).catch(() => {}),
      bankAccountApi.getByUser(user.id).then(res => {
        const list = Array.isArray(res) ? res : (res as unknown as { data: BankAccount[] })?.data ?? [];
        setBankAccounts(list);
        const defaultAcc = list.find(a => a.isDefault);
        if (defaultAcc) setSelectedAccountId(defaultAcc.id);
        else if (list.length > 0) setSelectedAccountId(list[0].id);
      }).catch(() => {}),
    ]).finally(() => setLoadingAccounts(false));
  }, [user?.id]);

  const handleConfirm = useCallback(async () => {
    if (!user?.id || !isValid || !selectedAccountId) return;
    setProcessing(true);
    setError('');
    try {
      await walletApi.createWithdrawRequest({
        userId: user.id,
        amount: numAmount,
        bankAccountId: selectedAccountId,
        notes: `Withdrawal to ${selectedAccount?.bankName || 'bank account'} (****${selectedAccount?.accountNumber.slice(-4) || ''})`,
      });
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Withdrawal failed');
    } finally {
      setProcessing(false);
    }
  }, [user?.id, numAmount, isValid, selectedAccountId, selectedAccount]);

  return (
    <DashboardLayout role="rider" pageTitle="Withdraw Funds">
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

        {/* Balance Banner */}
        <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}>
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Wallet size={18} className="text-secondary" />
              </div>
              <div>
                <p className="text-xs text-white/30 font-medium">Available Balance</p>
                <p className="text-lg font-black text-white">£{walletBalance.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06]">
              <Info size={12} className="text-white/30" />
              <span className="text-[10px] text-white/30 font-medium">Min. £5.00</span>
            </div>
          </div>
        </motion.div>

        {/* Steps */}
        <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp}>
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
              {step === 1 ? 'Amount' : step === 2 ? 'Bank Account' : success ? 'Complete!' : 'Confirm'}
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

                <h2 className="text-xl font-bold text-white mb-1">How much would you like to withdraw?</h2>
                <p className="text-white/30 text-sm mb-6">Funds will be transferred to your linked bank account</p>

                <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6">
                  <div className="flex items-center gap-2 justify-center">
                    <span className="text-4xl font-black text-white/30">£</span>
                    <input
                      type="number"
                      min="5"
                      max={walletBalance}
                      step="0.01"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-transparent text-4xl sm:text-5xl font-black text-white placeholder:text-white/15 outline-none tabular-nums w-48 text-center"
                    />
                  </div>
                  {numAmount > 0 && numAmount < 5 && (
                    <p className="text-red-400 text-xs text-center mt-3 flex items-center gap-1 justify-center">
                      <AlertTriangle size={12} /> Minimum withdrawal is £5.00
                    </p>
                  )}
                  {numAmount > walletBalance && (
                    <p className="text-red-400 text-xs text-center mt-3 flex items-center gap-1 justify-center">
                      <AlertTriangle size={12} /> Amount exceeds available balance
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-4 justify-center">
                  {[25, 50, 100].map((a) => (
                    <button
                      key={a}
                      onClick={() => a <= walletBalance ? setAmount(String(a)) : undefined}
                      disabled={a > walletBalance}
                      className={`px-5 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                        amount === String(a)
                          ? 'border-secondary/40 bg-secondary/[0.08] text-secondary'
                          : a > walletBalance
                            ? 'border-white/[0.04] bg-white/[0.01] text-white/15 cursor-not-allowed'
                            : 'border-white/[0.06] bg-white/[0.03] text-white hover:border-white/[0.12]'
                      }`}
                    >
                      £{a}
                    </button>
                  ))}
                  <button
                    onClick={() => setAmount(String(walletBalance))}
                    className={`px-5 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                      amount === String(walletBalance)
                        ? 'border-secondary/40 bg-secondary/[0.08] text-secondary'
                        : 'border-white/[0.06] bg-white/[0.03] text-white hover:border-white/[0.12]'
                    }`}
                  >
                    Withdraw All
                  </button>
                </div>

                <div className="mt-6 p-3 rounded-xl bg-accent/[0.06] border border-accent/20 flex items-start gap-3">
                  <Info size={16} className="text-accent shrink-0 mt-0.5" />
                  <p className="text-xs text-white/40 leading-relaxed">
                    Withdrawals are typically processed within 1-2 business days. No fees are charged for standard withdrawals.
                  </p>
                </div>

                <div className="mt-6">
                  <Button
                    variant="green"
                    size="lg"
                    className="w-full"
                    onClick={() => isValid && setStep(2)}
                    disabled={!isValid}
                  >
                    Continue <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════ STEP 2: SELECT BANK ACCOUNT ═══════ */}
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

                <h2 className="text-xl font-bold text-white mb-1">Select bank account</h2>
                <p className="text-white/30 text-sm mb-6">Choose which bank account to receive your funds</p>

                {loadingAccounts ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 text-secondary animate-spin" />
                  </div>
                ) : bankAccounts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
                      <Landmark size={24} className="text-white/20" />
                    </div>
                    <p className="text-white/40 text-sm font-medium mb-1">No bank accounts</p>
                    <p className="text-white/20 text-xs mb-4">Add a bank account first to withdraw funds</p>
                    <Button href="/rider/wallet/bank-accounts" variant="green" size="md">
                      <Plus size={16} /> Add Bank Account
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bankAccounts.map((acc) => (
                      <button
                        key={acc.id}
                        onClick={() => setSelectedAccountId(acc.id)}
                        className={`w-full p-4 rounded-xl border text-left transition-all ${
                          selectedAccountId === acc.id
                            ? 'border-secondary/40 bg-secondary/[0.06]'
                            : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              selectedAccountId === acc.id ? 'bg-secondary/10' : 'bg-white/[0.04]'
                            }`}>
                              <Landmark size={18} className={selectedAccountId === acc.id ? 'text-secondary' : 'text-white/30'} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-white">{acc.accountName}</p>
                                {acc.isDefault && (
                                  <span className="px-1.5 py-0.5 rounded-full bg-secondary/10 text-secondary text-[9px] font-bold flex items-center gap-0.5">
                                    <Star size={7} /> Default
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-white/30 mt-0.5">{acc.bankName} · ****{acc.accountNumber.slice(-4)} · {acc.sortCode}</p>
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedAccountId === acc.id
                              ? 'border-secondary bg-secondary'
                              : 'border-white/20 bg-transparent'
                          }`}>
                            {selectedAccountId === acc.id && <Check size={12} className="text-dark" />}
                          </div>
                        </div>
                      </button>
                    ))}
                    <Link
                      href="/rider/wallet/bank-accounts"
                      className="flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-white/[0.08] text-white/30 hover:text-white/50 hover:border-white/[0.15] transition-all text-sm font-medium"
                    >
                      <Plus size={14} /> Add Another Account
                    </Link>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <Button variant="outline" size="md" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button variant="green" size="lg" className="flex-1" onClick={() => selectedAccountId && setStep(3)} disabled={!selectedAccountId}>
                    Review Withdrawal <ChevronRight size={16} />
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
                    <span className="text-white/50 text-sm">Withdrawal Amount</span>
                    <span className="text-white font-bold text-lg">£{numAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-white/[0.06]">
                    <span className="text-white/50 text-sm">Transfer Fee</span>
                    <span className="text-secondary font-bold text-sm">FREE</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-white/[0.06]">
                    <span className="text-white/50 text-sm">Bank Account</span>
                    <span className="text-white font-semibold text-sm">{selectedAccount?.bankName}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-white/[0.06]">
                    <span className="text-white/50 text-sm">Account Holder</span>
                    <span className="text-white/60 text-sm font-medium">{selectedAccount?.accountName}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-white/[0.06]">
                    <span className="text-white/50 text-sm">Account Number</span>
                    <span className="text-white/60 text-sm font-medium">••••{selectedAccount?.accountNumber.slice(-4)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-white/[0.06]">
                    <span className="text-white/50 text-sm">Sort Code</span>
                    <span className="text-white/60 text-sm font-medium">{selectedAccount?.sortCode}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-white/[0.06]">
                    <span className="text-white/50 text-sm">Estimated Arrival</span>
                    <span className="text-white/60 text-sm font-medium">1-2 business days</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-white/50 text-sm">New Wallet Balance</span>
                    <span className="text-white font-black text-xl">£{(walletBalance - numAmount).toFixed(2)}</span>
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
                      <>Confirm Withdrawal · £{numAmount.toFixed(2)}</>
                    )}
                  </Button>
                </div>

                <div className="flex items-center gap-2 mt-4 justify-center">
                  <Shield size={14} className="text-white/20" />
                  <span className="text-white/20 text-xs">Protected by 2FA verification</span>
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

                <h2 className="text-2xl font-black text-white mb-2">Withdrawal Initiated!</h2>
                <p className="text-white/40 text-sm mb-6 max-w-sm mx-auto">
                  £{numAmount.toFixed(2)} will be transferred to your {selectedAccount?.bankName || 'bank account'} within 1-2 business days.
                </p>

                <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/[0.04] border border-white/[0.08] mb-8">
                  <Wallet size={18} className="text-secondary" />
                  <span className="text-white font-bold">Remaining Balance:</span>
                  <span className="text-secondary font-black text-lg">
                    £{(walletBalance - numAmount).toFixed(2)}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button href="/rider/wallet" variant="green" size="md">
                    <Wallet size={16} /> Back to Wallet
                  </Button>
                  <Button href="/rider/dashboard" variant="outline" size="md">
                    Dashboard <ChevronRight size={14} />
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
