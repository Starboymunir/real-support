'use client';

/* ═══════════════════════════════════════════
   DispatchListener — global dispatch UX

   For drivers: shows a full-screen offer modal with a 5-second
   countdown when a dispatch offer is received. Accept/Reject
   buttons hit POST /dispatch/respond/:requestId.

   For riders: emits toast notifications for dispatch lifecycle
   events (searching, posted to board, accepted) so the user
   always knows what's happening with their pending request.
   ═══════════════════════════════════════════ */

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useSocket, SOCKET_EVENTS } from '@/lib/socket-context';
import { dispatchApi } from '@/lib/services/dispatch';
import { toast } from '@/lib/toast';
import type { RideRequest } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Banknote, CheckCircle, X, Users } from 'lucide-react';

interface OfferPayload {
  requestId: string;
  driverId: string;
  expiresAt: number;
  timeoutMs: number;
  distanceKm?: number;
  request: RideRequest;
}

export default function DispatchListener() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const router = useRouter();

  // Driver-side offer state
  const [offer, setOffer] = useState<OfferPayload | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [responding, setResponding] = useState(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const role = user?.mode; // 'PASSENGER' | 'DRIVER' (from User model)
  const isDriver = role === 'DRIVER';
  const isRider = role === 'PASSENGER';

  // ── Driver: subscribe to incoming offers ──
  useEffect(() => {
    if (!socket || !isDriver) return;

    const onOffered = (data: OfferPayload) => {
      setOffer(data);
    };
    const onExpired = (data: { requestId: string }) => {
      setOffer((cur) => (cur && cur.requestId === data.requestId ? null : cur));
    };
    // If the rider cancels (or the request otherwise leaves PENDING) the
    // active offer modal must close — otherwise the driver sees a ghost
    // card they can't accept.
    const onRequestGone = (data: { id?: string; status?: string } | string) => {
      const id = typeof data === 'string' ? data : data?.id;
      const status = typeof data === 'object' ? data?.status : undefined;
      if (!id) return;
      if (status && status === 'PENDING') return;
      setOffer((cur) => (cur && cur.requestId === id ? null : cur));
    };

    socket.on(SOCKET_EVENTS.DISPATCH_OFFERED_TO_DRIVER, onOffered);
    socket.on(SOCKET_EVENTS.DISPATCH_OFFER_EXPIRED, onExpired);
    socket.on(SOCKET_EVENTS.REQUEST_CANCELLED, onRequestGone);
    socket.on(SOCKET_EVENTS.REQUEST_UPDATED, onRequestGone);

    return () => {
      socket.off(SOCKET_EVENTS.DISPATCH_OFFERED_TO_DRIVER, onOffered);
      socket.off(SOCKET_EVENTS.DISPATCH_OFFER_EXPIRED, onExpired);
      socket.off(SOCKET_EVENTS.REQUEST_CANCELLED, onRequestGone);
      socket.off(SOCKET_EVENTS.REQUEST_UPDATED, onRequestGone);
    };
  }, [socket, isDriver]);

  // Countdown tick
  useEffect(() => {
    if (!offer) {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
      setRemaining(0);
      return;
    }
    const update = () => {
      const ms = Math.max(0, offer.expiresAt - Date.now());
      setRemaining(ms);
      if (ms === 0) {
        setOffer(null);
      }
    };
    update();
    tickRef.current = setInterval(update, 100);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [offer]);

  const respond = async (accept: boolean) => {
    if (!offer || responding) return;
    setResponding(true);
    try {
      await dispatchApi.respond(offer.requestId, accept);
      if (accept) {
        toast.success('Ride accepted!', 'Heading to your active rides.');
        setOffer(null);
        router.push('/driver/rides');
      } else {
        setOffer(null);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to respond';
      toast.error(accept ? 'Accept failed' : 'Reject failed', msg);
    } finally {
      setResponding(false);
    }
  };

  // ── Rider: dispatch lifecycle notifications ──
  useEffect(() => {
    if (!socket || !isRider) return;

    // Backend payload: { requestId, attemptedDrivers, offeredDriverId }.
    // Toast once when the search starts so we don't spam on every cascade step.
    const onSearching = (data: { attemptedDrivers?: number }) => {
      if (!data?.attemptedDrivers || data.attemptedDrivers <= 1) {
        toast.info('Finding you a driver…', 'Contacting the nearest available drivers.');
      }
    };
    const onPosted = () => {
      toast.info('Open for bids', 'No driver accepted — your ride is now on the public job board.');
    };
    const onAccepted = () => {
      toast.success('Driver found!', 'A driver has accepted your ride.');
    };

    socket.on(SOCKET_EVENTS.DISPATCH_SEARCHING_STATUS, onSearching);
    socket.on(SOCKET_EVENTS.DISPATCH_POSTED_TO_BOARD, onPosted);
    socket.on(SOCKET_EVENTS.DISPATCH_OFFER_ACCEPTED, onAccepted);

    return () => {
      socket.off(SOCKET_EVENTS.DISPATCH_SEARCHING_STATUS, onSearching);
      socket.off(SOCKET_EVENTS.DISPATCH_POSTED_TO_BOARD, onPosted);
      socket.off(SOCKET_EVENTS.DISPATCH_OFFER_ACCEPTED, onAccepted);
    };
  }, [socket, isRider]);

  if (!isDriver) return null;

  const totalMs = offer?.timeoutMs || 5000;
  const pct = offer ? Math.max(0, Math.min(100, (remaining / totalMs) * 100)) : 0;
  const req = offer?.request;
  const fare = req?.budget ?? req?.totalBill ?? 0;

  return (
    <AnimatePresence>
      {offer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 shadow-2xl"
          >
            {/* Countdown bar */}
            <div className="h-1.5 w-full bg-white/5">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-400 to-rose-500"
                style={{ width: `${pct}%` }}
                transition={{ duration: 0.1, ease: 'linear' }}
              />
            </div>

            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/50">New ride offer</p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    £{Number(fare).toFixed(2)}
                  </p>
                </div>
                <div className="rounded-full bg-amber-500/20 px-3 py-1 text-sm font-semibold text-amber-300">
                  {(remaining / 1000).toFixed(1)}s
                </div>
              </div>

              {/* Distance to pickup */}
              {offer.distanceKm !== undefined && (
                <p className="mb-3 text-sm text-white/60">
                  Pickup ~{offer.distanceKm.toFixed(1)} km away
                </p>
              )}

              {/* Route */}
              <div className="space-y-2 rounded-xl bg-white/[0.03] p-3">
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <span className="line-clamp-2 text-white/90">{req?.startFrom?.name || '—'}</span>
                </div>
                <div className="ml-1 h-3 w-px bg-white/15" />
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                  <span className="line-clamp-2 text-white/90">{req?.destination?.name || '—'}</span>
                </div>
              </div>

              {/* Meta */}
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-white/60">
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {req?.totalDuration ? `${Math.round(req.totalDuration / 60)} min` : '—'}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {req?.totalPersons || 1}
                </div>
                <div className="flex items-center gap-1">
                  <Banknote className="h-3.5 w-3.5" />
                  {req?.paymentType || 'CASH'}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  onClick={() => respond(false)}
                  disabled={responding}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] py-3 text-sm font-semibold text-white/80 transition hover:bg-white/[0.08] disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                  Reject
                </button>
                <button
                  onClick={() => respond(true)}
                  disabled={responding}
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 disabled:opacity-50"
                >
                  <CheckCircle className="h-4 w-4" />
                  Accept
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
