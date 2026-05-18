'use client';

/* ═══════════════════════════════════════════════════════════
   Rider Bids Panel — lets a rider review the bids drivers have
   placed on their open (ADJUSTABLE / custom-priced) request and
   accept one (→ creates the booking) or reject it.
   ═══════════════════════════════════════════════════════════ */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Check, X, Star, Gavel, CheckCircle2, ArrowDown, ArrowUp } from 'lucide-react';
import { bidsApi } from '@/lib/services/bids';
import { useSocket, SOCKET_EVENTS } from '@/lib/socket-context';
import { toast } from '@/lib/toast';
import type { Bid, RideRequest } from '@/lib/types';

interface RiderBidsPanelProps {
  request: RideRequest;
  /** Called after a bid is accepted. Receives the new booking id when available. */
  onBidAccepted: (bookingId?: string) => void;
}

export default function RiderBidsPanel({ request, onBidAccepted }: RiderBidsPanelProps) {
  const { socket } = useSocket();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionBidId, setActionBidId] = useState<string | null>(null);

  const budget = request.budget ?? request.totalBill ?? 0;

  const loadBids = useCallback(async () => {
    try {
      const res = await bidsApi.getByRequestId(request.id);
      const list = Array.isArray(res) ? res : [];
      setBids(list.filter((b) => b.status === 'PENDING'));
    } catch {
      setBids([]);
    } finally {
      setLoading(false);
    }
  }, [request.id]);

  useEffect(() => {
    loadBids();
  }, [loadBids]);

  // Live updates — refresh when a bid is placed, changed, or withdrawn for this request.
  useEffect(() => {
    if (!socket) return;
    const refresh = (payload?: { requestId?: string }) => {
      if (!payload?.requestId || payload.requestId === request.id) loadBids();
    };
    socket.on(SOCKET_EVENTS.BID_CREATED, refresh);
    socket.on(SOCKET_EVENTS.BID_UPDATED, refresh);
    socket.on(SOCKET_EVENTS.BID_CANCELED, refresh);
    return () => {
      socket.off(SOCKET_EVENTS.BID_CREATED, refresh);
      socket.off(SOCKET_EVENTS.BID_UPDATED, refresh);
      socket.off(SOCKET_EVENTS.BID_CANCELED, refresh);
    };
  }, [socket, request.id, loadBids]);

  const handleRespond = async (bid: Bid, accept: boolean) => {
    setActionBidId(bid.id);
    try {
      const res = await bidsApi.update(bid.id, {
        status: accept ? 'ACCEPTED' : 'REJECTED',
      });
      if (accept) {
        toast.success('Bid accepted', 'Your ride is booked with this driver.');
        // The accept response is the new booking; fall back to a plain refetch.
        const bookingId = (res as unknown as { id?: string })?.id;
        onBidAccepted(bookingId);
      } else {
        toast.success('Bid rejected', 'The driver has been notified.');
        loadBids();
      }
    } catch (err) {
      toast.error(
        accept ? 'Could not accept bid' : 'Could not reject bid',
        err instanceof Error ? err.message : 'Something went wrong.',
      );
    } finally {
      setActionBidId(null);
    }
  };

  // Cheapest bids first — best value for the rider on top.
  const sorted = [...bids].sort((a, b) => a.bidAmount - b.bidAmount);

  return (
    <div className="bg-white/[0.02] rounded-2xl border border-white/[0.06] p-6">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Gavel size={18} className="text-secondary" />
          Driver Bids
        </h2>
        {!loading && (
          <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-300">
            {sorted.length} bid{sorted.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      <p className="text-sm text-white/40 mb-5">
        You offered <span className="font-semibold text-white">£{budget.toFixed(2)}</span> — accept a bid to book your ride.
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 size={22} className="animate-spin text-secondary" />
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.06] flex items-center justify-center mb-3">
            <Gavel size={20} className="text-white/40" />
          </div>
          <p className="text-sm font-medium text-white">No bids yet</p>
          <p className="text-xs text-white/40 mt-1">
            Drivers will appear here as they bid on your ride.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {sorted.map((bid) => {
              const driver = bid.driverInfo;
              const driverName =
                [driver?.userInfo?.firstName, driver?.userInfo?.lastName]
                  .filter(Boolean)
                  .join(' ') || 'Driver';
              const initials =
                driverName === 'Driver'
                  ? '?'
                  : driverName.split(' ').map((n) => n[0]).join('').toUpperCase();
              const rating = driver?.ratings ?? 0;
              const trips = driver?.totalJobComplete ?? 0;
              const diff = bid.bidAmount - budget;
              const isBusy = actionBidId === bid.id;

              return (
                <motion.div
                  key={bid.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 shrink-0 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-sm font-bold">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white truncate">{driverName}</p>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-white/40">
                        <span className="flex items-center gap-1">
                          <Star size={12} className="text-warning fill-warning" />
                          {rating > 0 ? rating.toFixed(1) : 'New'}
                        </span>
                        <span>{trips} trip{trips !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xl font-bold text-emerald-400">
                        £{bid.bidAmount.toFixed(2)}
                      </p>
                      {diff !== 0 && (
                        <p
                          className={`text-[11px] flex items-center justify-end gap-0.5 ${
                            diff < 0 ? 'text-emerald-400' : 'text-amber-300'
                          }`}
                        >
                          {diff < 0 ? <ArrowDown size={11} /> : <ArrowUp size={11} />}
                          £{Math.abs(diff).toFixed(2)} {diff < 0 ? 'below' : 'above'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleRespond(bid, true)}
                      disabled={isBusy || !!actionBidId}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-400 transition disabled:opacity-50"
                    >
                      {isBusy ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Check size={15} />
                      )}
                      Accept &amp; Book
                    </button>
                    <button
                      onClick={() => handleRespond(bid, false)}
                      disabled={isBusy || !!actionBidId}
                      className="flex items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-sm font-medium text-white/70 hover:bg-white/[0.08] hover:text-white transition disabled:opacity-50"
                    >
                      <X size={15} />
                      Reject
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          <p className="flex items-center gap-1.5 text-xs text-white/30 pt-1">
            <CheckCircle2 size={12} />
            Accepting a bid books your ride and notifies the driver instantly.
          </p>
        </div>
      )}
    </div>
  );
}
