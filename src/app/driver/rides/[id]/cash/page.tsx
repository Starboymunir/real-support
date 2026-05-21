'use client';

/**
 * Cash collection screen
 *
 * Shown right before the driver marks a CASH booking as COMPLETED. Driver
 * confirms the cash they actually collected. If they enter more than the
 * fare, the backend transfers the difference from the driver's wallet to
 * the rider's wallet (as change). Then we mark the booking COMPLETED.
 */

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Banknote,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Info,
  Timer,
  PoundSterling,
} from 'lucide-react';
import { motion } from 'framer-motion';

import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/button';
import { useRequireAuth } from '@/lib/use-require-auth';
import { bookingsApi } from '@/lib/services/bookings';
import { toast } from '@/lib/toast';
import type { Booking } from '@/lib/types';

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: 'easeOut' },
  }),
};

export default function CashCollectionPage() {
  useRequireAuth();
  const params = useParams();
  const router = useRouter();
  const bookingId = params?.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [amount, setAmount] = useState<string>('');

  const fetchBooking = useCallback(async () => {
    if (!bookingId) return;
    setLoading(true);
    try {
      const res = await bookingsApi.getById(bookingId);
      const data = (res as unknown as { data?: Booking })?.data || (res as unknown as Booking);
      if (data && data.id) {
        setBooking(data);
        setAmount(((data.finalBill ?? data.totalBill) || 0).toFixed(2));
      }
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => { fetchBooking(); }, [fetchBooking]);

  const fare = booking ? (booking.finalBill ?? booking.totalBill ?? 0) : 0;
  const entered = Number.parseFloat(amount) || 0;
  const overpayment = Math.max(0, +(entered - fare).toFixed(2));

  const handleSubmit = async () => {
    if (!booking) return;
    if (entered < fare) {
      toast.error('Amount too low', `Minimum cash to collect is £${fare.toFixed(2)}`);
      return;
    }
    setSubmitting(true);
    try {
      await bookingsApi.recordCashCollected(booking.id, entered);
      // Now mark the ride complete
      await bookingsApi.update(booking.id, { status: 'COMPLETED' });
      toast.success(
        'Ride completed',
        overpayment > 0
          ? `£${overpayment.toFixed(2)} change returned to rider's wallet`
          : `Collected £${entered.toFixed(2)}`,
      );
      router.push('/driver/rides');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to record cash collection';
      toast.error('Could not complete', msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="driver" pageTitle="Collect Cash">
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 size={28} className="animate-spin text-secondary mb-3" />
          <p className="text-white/40 text-sm">Loading ride…</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!booking) {
    return (
      <DashboardLayout role="driver" pageTitle="Collect Cash">
        <div className="text-center py-32">
          <p className="text-white/50">Ride not found.</p>
          <Button onClick={() => router.push('/driver/rides')} variant="outline" size="sm" className="mt-4">
            <ArrowLeft size={16} /> Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const presets = [fare, fare + 1, fare + 5, fare + 10].map((v) => +v.toFixed(2));

  return (
    <DashboardLayout role="driver" pageTitle="Collect Cash">
      <div className="max-w-xl mx-auto space-y-6">
        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
          <Button onClick={() => router.back()} variant="ghost" size="sm" className="mb-3">
            <ArrowLeft size={16} /> Back
          </Button>
          <h1 className="text-2xl font-bold text-white">Collect cash</h1>
          <p className="text-white/50 mt-1 text-sm">
            Confirm how much cash you received from {booking.riderName || 'the rider'}.
          </p>
        </motion.div>

        {/* Fare breakdown */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={1}
          variants={fadeUp}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-3"
        >
          <div className="flex justify-between text-sm">
            <span className="text-white/50">Base fare</span>
            <span className="text-white font-medium">£{(booking.totalBill || 0).toFixed(2)}</span>
          </div>
          {(booking.waitingFee ?? 0) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-white/50 flex items-center gap-1.5">
                <Timer size={14} /> Waiting fee ({booking.totalWaitingTime ?? 0} min)
              </span>
              <span className="text-white font-medium">£{(booking.waitingFee || 0).toFixed(2)}</span>
            </div>
          )}
          <div className="border-t border-white/[0.06] pt-3 flex justify-between">
            <span className="text-white font-semibold">Total to collect</span>
            <span className="text-secondary font-bold text-lg">£{fare.toFixed(2)}</span>
          </div>
        </motion.div>

        {/* Amount input */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={2}
          variants={fadeUp}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4"
        >
          <label className="block">
            <span className="text-sm font-semibold text-white">Cash received</span>
            <div className="relative mt-2">
              <PoundSterling size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="number"
                step="0.01"
                min={fare}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl pl-10 pr-4 py-3 text-2xl font-bold text-white tabular-nums focus:outline-none focus:border-secondary"
              />
            </div>
          </label>

          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <button
                key={p}
                onClick={() => setAmount(p.toFixed(2))}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition ${
                  entered === p
                    ? 'bg-secondary text-dark border-secondary'
                    : 'bg-white/[0.04] text-white/70 border-white/[0.08] hover:text-white'
                }`}
              >
                £{p.toFixed(2)}
              </button>
            ))}
          </div>

          {overpayment > 0 && (
            <div className="flex items-start gap-2 rounded-xl bg-success/10 border border-success/20 p-3 text-sm">
              <Info size={16} className="text-success mt-0.5 flex-shrink-0" />
              <p className="text-white/80">
                Change of <span className="font-bold text-success">£{overpayment.toFixed(2)}</span> will be
                transferred from your wallet to the rider&apos;s wallet automatically.
              </p>
            </div>
          )}
        </motion.div>

        {/* Action */}
        <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp}>
          <Button
            onClick={handleSubmit}
            disabled={submitting || entered < fare}
            variant="green"
            className="w-full justify-center"
          >
            {submitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
            Confirm & complete ride
          </Button>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
