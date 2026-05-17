'use client';

/* ═══════════════════════════════════════════
   Public Job Board — drivers browse and bid on
   open ride requests (rider-offer rides)
   ═══════════════════════════════════════════ */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Clock,
  Banknote,
  Users,
  Route,
  Send,
  RefreshCw,
  Inbox,
  Loader2,
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useRequireAuth } from '@/lib/use-require-auth';
import { useSocket, SOCKET_EVENTS } from '@/lib/socket-context';
import { dispatchApi } from '@/lib/services/dispatch';
import { bidsApi } from '@/lib/services/bids';
import { toast } from '@/lib/toast';
import type { RideRequest } from '@/lib/types';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.35, ease: 'easeOut' },
  }),
};

function formatMins(seconds?: number): string {
  if (!seconds) return '—';
  const m = Math.round(seconds / 60);
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${m % 60}m`;
}

function formatMiles(meters?: number): string {
  if (!meters) return '—';
  return `${(meters / 1609.34).toFixed(1)} mi`;
}

export default function DriverBoardPage() {
  const { user } = useRequireAuth();
  const router = useRouter();
  const { socket } = useSocket();
  const [jobs, setJobs] = useState<RideRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidAmounts, setBidAmounts] = useState<Record<string, string>>({});
  const [actionId, setActionId] = useState<string | null>(null);

  const driverId =
    user?.driver?.id ||
    (typeof window !== 'undefined' ? localStorage.getItem('rs_driver_id') : '') ||
    '';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await dispatchApi.board(driverId || undefined);
      const list = Array.isArray(res) ? res : (res as unknown as { data?: RideRequest[] })?.data || [];
      setJobs(list);
    } catch (err) {
      console.error('[Board] load failed', err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [driverId]);

  useEffect(() => {
    load();
  }, [load]);

  // Live updates: new jobs posted, bids changed, requests accepted/cancelled
  useEffect(() => {
    if (!socket) return;
    const refresh = () => load();
    socket.on(SOCKET_EVENTS.DISPATCH_POSTED_TO_BOARD, refresh);
    socket.on(SOCKET_EVENTS.REQUEST_UPDATED, refresh);
    socket.on(SOCKET_EVENTS.REQUEST_CANCELLED, refresh);
    socket.on(SOCKET_EVENTS.BID_UPDATED, refresh);
    return () => {
      socket.off(SOCKET_EVENTS.DISPATCH_POSTED_TO_BOARD, refresh);
      socket.off(SOCKET_EVENTS.REQUEST_UPDATED, refresh);
      socket.off(SOCKET_EVENTS.REQUEST_CANCELLED, refresh);
      socket.off(SOCKET_EVENTS.BID_UPDATED, refresh);
    };
  }, [socket, load]);

  const placeBid = async (job: RideRequest) => {
    if (!driverId || !user) {
      toast.error('Not signed in', 'Please sign in as a driver to bid.');
      return;
    }
    const amount = parseFloat(bidAmounts[job.id] || '');
    if (!amount || amount <= 0) {
      toast.error('Invalid bid', 'Enter a valid amount.');
      return;
    }
    setActionId(job.id);
    try {
      await bidsApi.create({
        requestId: job.id,
        driverId,
        bidAmount: amount,
        passengerId: job.passengerId,
      });
      toast.success('Bid placed!', `£${amount.toFixed(2)} submitted.`);
      setBidAmounts((prev) => ({ ...prev, [job.id]: '' }));
      load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to place bid';
      toast.error('Bid failed', msg);
    } finally {
      setActionId(null);
    }
  };

  return (
    <DashboardLayout role="driver" pageTitle="Job Board">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={0}
          variants={fadeUp}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold text-white">Public Job Board</h1>
            <p className="text-white/50 mt-1">
              {jobs.length} open job{jobs.length !== 1 ? 's' : ''} · riders are accepting bids
            </p>
          </div>
          <button
            onClick={load}
            className="flex items-center gap-2 rounded-xl bg-white/[0.04] px-4 py-2 text-sm text-white/80 hover:bg-white/[0.08] transition"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </motion.div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-white/50">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : jobs.length === 0 ? (
          <motion.div
            initial="hidden"
            animate="visible"
            custom={1}
            variants={fadeUp}
            className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02] py-16 text-center"
          >
            <Inbox className="h-10 w-10 text-white/30" />
            <p className="mt-3 text-white/70">No open jobs right now</p>
            <p className="mt-1 text-sm text-white/40">
              Check back soon — new rider offers post here in real time.
            </p>
          </motion.div>
        ) : (
          <AnimatePresence>
            <div className="grid gap-4">
              {jobs.map((job, i) => {
                const fare = job.budget ?? job.totalBill ?? 0;
                const bidCount = job.bids?.length || 0;
                const isBusy = actionId === job.id;
                const rider = job.riderInfo;
                return (
                  <motion.div
                    key={job.id}
                    initial="hidden"
                    animate="visible"
                    custom={i + 1}
                    variants={fadeUp}
                    className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 hover:border-white/[0.12] transition"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-white/40">Rider offer</p>
                        <p className="mt-1 text-3xl font-bold text-emerald-400">
                          £{Number(fare).toFixed(2)}
                        </p>
                        {rider && (
                          <p className="text-sm text-white/60 mt-1">
                            {rider.firstName} {rider.lastName}
                            {typeof rider.ratings === 'number' && rider.ratings > 0 && (
                              <span className="ml-2 text-amber-300">★ {rider.ratings.toFixed(1)}</span>
                            )}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 text-right">
                        {bidCount > 0 && (
                          <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs text-blue-300">
                            {bidCount} bid{bidCount !== 1 ? 's' : ''}
                          </span>
                        )}
                        {job.packageInfo?.name && (
                          <span className="text-xs text-white/40">{job.packageInfo.name}</span>
                        )}
                      </div>
                    </div>

                    {/* Route */}
                    <div className="space-y-2 rounded-xl bg-black/20 p-3 mb-4">
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                        <span className="line-clamp-2 text-white/90">
                          {job.startFrom?.name || '—'}
                        </span>
                      </div>
                      <div className="ml-1.5 h-3 w-px bg-white/15" />
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                        <span className="line-clamp-2 text-white/90">
                          {job.destination?.name || '—'}
                        </span>
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="grid grid-cols-4 gap-2 text-xs text-white/60 mb-4">
                      <div className="flex items-center gap-1">
                        <Route className="h-3.5 w-3.5" />
                        {formatMiles(job.totalDistance)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatMins(job.totalDuration)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {job.totalPersons || 1}
                      </div>
                      <div className="flex items-center gap-1">
                        <Banknote className="h-3.5 w-3.5" />
                        {job.paymentType || 'CASH'}
                      </div>
                    </div>

                    {/* Bid form */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                          £
                        </span>
                        <input
                          type="number"
                          min={0}
                          step={0.5}
                          inputMode="decimal"
                          placeholder={`Your bid (rider asked £${Number(fare).toFixed(2)})`}
                          value={bidAmounts[job.id] || ''}
                          onChange={(e) =>
                            setBidAmounts((prev) => ({ ...prev, [job.id]: e.target.value }))
                          }
                          className="input-dark w-full pl-7"
                        />
                      </div>
                      <button
                        onClick={() => placeBid(job)}
                        disabled={isBusy || !bidAmounts[job.id]}
                        className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 transition disabled:opacity-50"
                      >
                        {isBusy ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                        Place Bid
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </div>
    </DashboardLayout>
  );
}
