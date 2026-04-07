'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  ArrowLeftRight,
  Wallet,
  Check,
  ChevronRight,
  Shield,
  Loader2,
  User,
  Mail,
  Phone,
  Search,
} from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/button';
import { useRequireAuth } from '@/lib/use-require-auth';
import { walletApi } from '@/lib/services/wallet';
import { userInfoApi } from '@/lib/services/user';
import { toast } from '@/lib/toast';
import { resolveS3Url } from '@/lib/api';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

type RecipientInfo = {
  id: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  phone_number: string;
  profileImageUrl: string;
  coverImage?: string;
};

export default function TransferPage() {
  const { user } = useRequireAuth();
  const [recipientInput, setRecipientInput] = useState('');
  const [amount, setAmount] = useState('');
  const [narration, setNarration] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [currentBalance, setCurrentBalance] = useState(0);

  // Recipient lookup state
  const [recipient, setRecipient] = useState<RecipientInfo | null>(null);
  const [lookingUp, setLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [step, setStep] = useState<'form' | 'confirm'>('form');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const numAmount = parseFloat(amount) || 0;

  useEffect(() => {
    if (!user?.id) return;
    walletApi.getUserWallet(user.id)
      .then(w => setCurrentBalance(w.balance ?? 0))
      .catch(() => {});
  }, [user?.id]);

  // Auto-correct: trim spaces and lowercase for email input
  const handleRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Auto-correct: remove leading/trailing spaces, lowercase
    const corrected = raw.trimStart().toLowerCase();
    setRecipientInput(corrected);
    setRecipient(null);
    setLookupError('');

    // Debounced lookup
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = corrected.trim();
    const isEmail = trimmed.includes('@') && trimmed.includes('.') && trimmed.length > 5;
    const digits = trimmed.replace(/\D/g, '');
    const isPhone = digits.length >= 8;
    if (isEmail || isPhone) {
      debounceRef.current = setTimeout(() => lookupRecipient(trimmed), 600);
    }
  };

  const lookupRecipient = async (input: string) => {
    setLookingUp(true);
    setLookupError('');
    try {
      const isEmail = input.includes('@');
      const result = isEmail
        ? await userInfoApi.lookupByEmail(input)
        : await userInfoApi.lookupByPhone(input);
      if (result && 'id' in result) {
        if (result.id === user?.id) {
          setLookupError('You cannot transfer to yourself');
          setRecipient(null);
        } else {
          setRecipient(result as RecipientInfo);
        }
      } else {
        setLookupError('No user found with this email or phone number');
        setRecipient(null);
      }
    } catch {
      setLookupError('Could not find recipient');
      setRecipient(null);
    } finally {
      setLookingUp(false);
    }
  };

  const handleProceedToConfirm = () => {
    if (!recipient || numAmount < 1) return;
    if (numAmount > currentBalance) {
      setError('Insufficient balance');
      toast.error('Insufficient balance', 'You do not have enough funds for this transfer.');
      return;
    }
    setError('');
    setStep('confirm');
  };

  const handleTransfer = useCallback(async () => {
    if (!user?.id || !recipient || numAmount < 1) return;
    if (numAmount > currentBalance) {
      setError('Insufficient balance');
      toast.error('Insufficient balance', 'You do not have enough funds for this transfer.');
      return;
    }
    setProcessing(true);
    setError('');
    try {
      await walletApi.walletTransfer({
        payeeId: user.id,
        recipientId: recipient.id,
        amount: numAmount,
        narration: narration.trim() || undefined,
      });
      toast.success('Transfer complete!', `£${numAmount.toFixed(2)} has been sent successfully.`);
      setSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Transfer failed. Please try again.';
      setError(msg);
      toast.error('Transfer failed', msg);
    } finally {
      setProcessing(false);
    }
  }, [user?.id, numAmount, recipient, narration, currentBalance]);

  const initials = recipient
    ? `${recipient.firstName?.[0] || ''}${recipient.lastName?.[0] || ''}`.toUpperCase()
    : '';

  return (
    <DashboardLayout role="rider" pageTitle="Transfer">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back */}
        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
          <Link href="/rider/wallet" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm font-medium transition-colors">
            <ArrowLeft size={16} /> Back to Wallet
          </Link>
        </motion.div>

        {success ? (
          /* ── Success Screen ── */
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
                £{numAmount.toFixed(2)} has been sent to {recipient?.firstName} {recipient?.lastName}
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
                    setStep('form');
                    setRecipient(null);
                    setRecipientInput('');
                    setAmount('');
                    setNarration('');
                  }}
                >
                  Send Another
                </Button>
              </div>
            </div>
          </motion.div>
        ) : step === 'confirm' && recipient ? (
          /* ── Confirmation Screen ── */
          <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}>
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-secondary via-accent to-secondary" />

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <ArrowLeftRight size={22} className="text-accent" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Confirm Transfer</h2>
                  <p className="text-white/30 text-sm">Review details before sending</p>
                </div>
              </div>

              {/* Recipient Card */}
              <div className="p-5 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-6">
                <p className="text-xs text-white/30 uppercase tracking-wider font-semibold mb-3">Sending to</p>
                <div className="flex items-center gap-4">
                  {resolveS3Url(recipient.coverImage || recipient.profileImageUrl) ? (
                    <Image
                      src={resolveS3Url(recipient.coverImage || recipient.profileImageUrl)!}
                      alt={recipient.firstName}
                      width={56}
                      height={56}
                      className="w-14 h-14 rounded-full object-cover border-2 border-white/10"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-secondary/20 border-2 border-secondary/30 flex items-center justify-center text-secondary font-bold text-lg">
                      {initials}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-lg">{recipient.firstName} {recipient.lastName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail size={13} className="text-white/30" />
                      <span className="text-white/40 text-sm truncate">{recipient.emailAddress}</span>
                    </div>
                    {recipient.phone_number && (
                      <div className="flex items-center gap-2 mt-0.5">
                        <Phone size={13} className="text-white/30" />
                        <span className="text-white/40 text-sm">{recipient.phone_number}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Transfer Details */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between p-3 rounded-lg bg-white/[0.02]">
                  <span className="text-white/40 text-sm">Amount</span>
                  <span className="text-white font-bold text-lg">£{numAmount.toFixed(2)}</span>
                </div>
                {narration.trim() && (
                  <div className="flex justify-between p-3 rounded-lg bg-white/[0.02]">
                    <span className="text-white/40 text-sm">Note</span>
                    <span className="text-white/70 text-sm">{narration}</span>
                  </div>
                )}
                <div className="flex justify-between p-3 rounded-lg bg-white/[0.02]">
                  <span className="text-white/40 text-sm">Balance after</span>
                  <span className="text-white/70 font-semibold">£{(currentBalance - numAmount).toFixed(2)}</span>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-4 rounded-xl bg-red-500/[0.08] border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={() => setStep('form')}
                  disabled={processing}
                >
                  <ArrowLeft size={16} /> Back
                </Button>
                <Button
                  variant="green"
                  size="lg"
                  className="flex-1"
                  onClick={handleTransfer}
                  disabled={processing}
                >
                  {processing ? (
                    <><Loader2 size={16} className="animate-spin" /> Sending...</>
                  ) : (
                    <>Confirm & Send £{numAmount.toFixed(2)}</>
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
          /* ── Form Screen ── */
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
                  <label className="block text-sm font-medium text-white/50 mb-2">Recipient Email or Phone</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter email address or last 8 digits of phone"
                      value={recipientInput}
                      onChange={handleRecipientChange}
                      onBlur={() => {
                        const trimmed = recipientInput.trim();
                        if (trimmed && !recipient && !lookingUp) {
                          const isEmail = trimmed.includes('@');
                          const digits = trimmed.replace(/\D/g, '');
                          if (isEmail || digits.length >= 8) {
                            lookupRecipient(trimmed);
                          }
                        }
                      }}
                      className="input-dark w-full pr-10"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {lookingUp ? (
                        <Loader2 size={16} className="text-white/30 animate-spin" />
                      ) : recipient ? (
                        <Check size={16} className="text-secondary" />
                      ) : (
                        <Search size={16} className="text-white/20" />
                      )}
                    </div>
                  </div>
                  {lookupError && (
                    <p className="text-red-400 text-xs mt-1.5">{lookupError}</p>
                  )}
                </div>

                {/* Recipient Preview */}
                {recipient && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 rounded-xl bg-secondary/[0.06] border border-secondary/20"
                  >
                    {resolveS3Url(recipient.coverImage || recipient.profileImageUrl) ? (
                      <Image
                        src={resolveS3Url(recipient.coverImage || recipient.profileImageUrl)!}
                        alt={recipient.firstName}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover border border-white/10"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold text-sm">
                        {initials}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-semibold text-sm">{recipient.firstName} {recipient.lastName}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Mail size={11} className="text-white/30" />
                        <span className="text-white/40 text-xs truncate">{recipient.emailAddress}</span>
                      </div>
                      {recipient.phone_number && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Phone size={11} className="text-white/30" />
                          <span className="text-white/40 text-xs">{recipient.phone_number}</span>
                        </div>
                      )}
                    </div>
                    <Check size={16} className="text-secondary shrink-0" />
                  </motion.div>
                )}

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
                  onClick={handleProceedToConfirm}
                  disabled={!recipient || numAmount < 1}
                >
                  Continue <ChevronRight size={16} />
                </Button>
              </div>

              <div className="flex items-center gap-2 mt-4 justify-center">
                <Shield size={14} className="text-white/20" />
                <span className="text-white/20 text-xs">Transfers are instant and secure</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
