'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/button';
import { useRequireAuth } from '@/lib/use-require-auth';
import { useSocket } from '@/lib/socket-context';
import { requestsApi, bookingsApi } from '@/lib/services/bookings';
import { bidsApi } from '@/lib/services/bids';
import { toast } from '@/lib/toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Clock,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Route,
  Car,
  CreditCard,
  Banknote,
  ChevronDown,
  ChevronUp,
  Send,
  Inbox,
  Calendar,
  StickyNote,
} from 'lucide-react';
import type { RideRequest } from '@/lib/types';

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: 'easeOut' },
  }),
};

function formatDistance(meters: number): string {
  const miles = meters / 1609.34;
  return miles < 0.1 ? `${Math.round(meters)} m` : `${miles.toFixed(1)} mi`;
}

function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function DriverRequestsPage() {
  const { user } = useRequireAuth();
  const router = useRouter();
  const { socket } = useSocket();
  const [requests, setRequests] = useState<RideRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [bidAmounts, setBidAmounts] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'FIXED' | 'ADJUSTABLE'>('all');

  const driverId = user?.driver?.id || (typeof window !== 'undefined' ? localStorage.getItem('rs_driver_id') : '') || '';

  const fetchRequests = useCallback(async () => {
    if (!driverId) return;
    setLoading(true);
    try {
      const result = await requestsApi.getDriverRequests(driverId);
      const list = Array.isArray(result) ? result : (result as unknown as { data: RideRequest[] })?.data || [];
      setRequests(list);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [driverId]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Listen for new requests in realtime
  useEffect(() => {
    if (!socket) return;
    const handleNewRequest = () => {
      fetchRequests();
    };
    socket.on('NEW_REQUEST', handleNewRequest);
    return () => { socket.off('NEW_REQUEST', handleNewRequest); };
  }, [socket, fetchRequests]);

  const handleAcceptFixed = async (request: RideRequest) => {
    if (!driverId) return;
    setActionLoading(request.id);
    setError('');
    try {
      await bookingsApi.create({ driverId, requestId: request.id });
      toast.success('Ride accepted!', 'You have been assigned to this ride.');
      // Remove from list after accepting
      setRequests(prev => prev.filter(r => r.id !== request.id));
      router.push('/driver/rides');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to accept ride';
      setError(msg);
      toast.error('Accept failed', msg);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBid = async (request: RideRequest) => {
    if (!driverId || !user) return;
    const amount = parseFloat(bidAmounts[request.id] || '');
    if (!amount || amount <= 0) {
      setError('Please enter a valid bid amount');
      toast.error('Invalid bid', 'Please enter a valid bid amount.');
      return;
    }
    const minBid = (request.totalBill || 0) * 0.7;
    if (amount < minBid) {
      setError(`Minimum bid is £${minBid.toFixed(2)} (70% of fare)`);
      toast.error('Bid too low', `Minimum bid is £${minBid.toFixed(2)} (70% of fare).`);
      return;
    }
    setActionLoading(request.id);
    setError('');
    try {
      await bidsApi.create({
        requestId: request.id,
        driverId,
        bidAmount: amount,
        passengerId: request.passengerId,
      });
      toast.success('Bid placed!', `Your bid of £${amount.toFixed(2)} has been submitted.`);
      // Remove from list or mark as bid
      setRequests(prev => prev.filter(r => r.id !== request.id));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to place bid';
      setError(msg);
      toast.error('Bid failed', msg);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (requestId: string) => {
    setActionLoading(requestId);
    setError('');
    try {
      await requestsApi.decline(requestId);
      toast.info('Request declined.');
      setRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to decline request';
      setError(msg);
      toast.error('Decline failed', msg);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredRequests = filter === 'all'
    ? requests
    : requests.filter(r => r.requestType === filter);

  return (
    <DashboardLayout role="driver" pageTitle="Ride Requests">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Available Rides</h1>
            <p className="text-white/40 mt-1">
              {filteredRequests.length} ride{filteredRequests.length !== 1 ? 's' : ''} available near you
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Filter pills */}
            <div className="flex bg-white/[0.04] rounded-xl p-1 border border-white/[0.06]">
              {(['all', 'FIXED', 'ADJUSTABLE'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filter === f
                      ? 'bg-secondary text-white shadow-lg shadow-secondary/30'
                      : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  {f === 'all' ? 'All' : f === 'FIXED' ? 'Fixed' : 'Adjustable'}
                </button>
              ))}
            </div>
            <button
              onClick={fetchRequests}
              disabled={loading}
              className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/60 hover:text-secondary hover:border-secondary/30 transition-all"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-secondary mb-3" />
            <p className="text-white/40">Loading available rides...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredRequests.length === 0 && (
          <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp} className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-4">
              <Inbox size={36} className="text-white/20" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">No rides available</h3>
            <p className="text-white/40 max-w-sm">
              No ride requests at the moment. Stay online and we&apos;ll notify you when new requests come in.
            </p>
          </motion.div>
        )}

        {/* Request cards */}
        <div className="space-y-4">
          {filteredRequests.map((request, i) => {
            const isExpanded = expandedId === request.id;
            const isActionLoading = actionLoading === request.id;
            const isFixed = request.requestType === 'FIXED';

            return (
              <motion.div
                key={request.id}
                initial="hidden"
                animate="visible"
                custom={i + 1}
                variants={fadeUp}
                className="bg-white/[0.02] rounded-2xl border border-white/[0.06] overflow-hidden hover:border-white/[0.12] transition-all duration-300"
              >
                {/* Card header */}
                <div
                  className="p-5 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : request.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {/* Type badge */}
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        isFixed
                          ? 'bg-secondary/15 text-secondary'
                          : 'bg-purple-500/15 text-purple-400'
                      }`}>
                        {isFixed ? 'Fixed' : 'Adjustable'}
                      </span>
                      {/* Package */}
                      {request.packageInfo && (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/[0.06] text-white/70">
                          <Car size={12} className="inline mr-1 -mt-0.5" />
                          {request.packageInfo.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-white/30">
                        <Clock size={12} className="inline mr-1 -mt-0.5" />
                        {timeAgo(request.createdAt)}
                      </span>
                      {isExpanded ? <ChevronUp size={18} className="text-white/30" /> : <ChevronDown size={18} className="text-white/30" />}
                    </div>
                  </div>

                  {/* Route info */}
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center pt-1">
                      <div className="w-3 h-3 rounded-full bg-secondary" />
                      <div className="w-0.5 flex-1 bg-gradient-to-b from-secondary to-error/60 my-1" />
                      <div className="w-3 h-3 rounded-full bg-error/80" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <p className="text-xs text-white/40 mb-0.5">Pickup</p>
                        <p className="text-sm font-medium text-white truncate">{request.startFrom?.name || 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/40 mb-0.5">Drop-off</p>
                        <p className="text-sm font-medium text-white truncate">{request.destination?.name || 'Unknown'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Key metrics */}
                  <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/[0.04]">
                    <div className="flex items-center gap-1.5 text-secondary">
                      <DollarSign size={16} />
                      <span className="text-sm font-bold">£{(request.totalBill || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/50">
                      <Route size={14} />
                      <span className="text-xs">{formatDistance(request.totalDistance)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/50">
                      <Clock size={14} />
                      <span className="text-xs">{formatDuration(request.totalDuration)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/50">
                      {request.paymentType === 'CASH' ? <Banknote size={14} /> : <CreditCard size={14} />}
                      <span className="text-xs">{request.paymentType === 'CASH' ? 'Cash' : 'Wallet'}</span>
                    </div>
                    {request.totalPersons && request.totalPersons > 1 && (
                      <div className="flex items-center gap-1.5 text-white/50">
                        <Users size={14} />
                        <span className="text-xs">{request.totalPersons}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 space-y-4 border-t border-white/[0.04]">
                        {/* Additional details */}
                        <div className="grid grid-cols-2 gap-3 pt-4">
                          {request.clientName && (
                            <div className="flex items-center gap-2 text-white/60">
                              <Users size={14} className="text-white/30" />
                              <span className="text-sm">{request.clientName}</span>
                            </div>
                          )}
                          {request.bookingDate && (
                            <div className="flex items-center gap-2 text-white/60">
                              <Calendar size={14} className="text-white/30" />
                              <span className="text-sm">
                                {new Date(request.bookingDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                          )}
                          {request.bookingTime && (
                            <div className="flex items-center gap-2 text-white/60">
                              <Clock size={14} className="text-white/30" />
                              <span className="text-sm">{request.bookingTime}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-white/60">
                            <DollarSign size={14} className="text-white/30" />
                            <span className="text-sm">Service fee: £{(request.serviceCharge || 0).toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Stops */}
                        {request.stoppages && request.stoppages.length > 0 && (
                          <div className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.04]">
                            <p className="text-xs font-semibold text-white/40 mb-2">Stops</p>
                            {request.stoppages.map((stop, idx) => (
                              <div key={idx} className="flex items-center gap-2 py-1">
                                <MapPin size={12} className="text-blue-400/60" />
                                <span className="text-sm text-white/60">{stop.name}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Notes */}
                        {request.notes && (
                          <div className="flex items-start gap-2 bg-white/[0.02] rounded-xl p-3 border border-white/[0.04]">
                            <StickyNote size={14} className="text-white/30 mt-0.5" />
                            <p className="text-sm text-white/60">{request.notes}</p>
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex items-center gap-3 pt-2">
                          {isFixed ? (
                            /* Fixed ride — Accept directly */
                            <Button
                              variant="green"
                              onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleAcceptFixed(request); }}
                              disabled={isActionLoading}
                              className="flex-1"
                            >
                              {isActionLoading ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <CheckCircle size={16} />
                              )}
                              Accept Ride — £{(request.totalBill || 0).toFixed(2)}
                            </Button>
                          ) : (
                            /* Adjustable ride — Place a bid */
                            <div className="flex-1 flex items-center gap-2">
                              <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">£</span>
                                <input
                                  type="number"
                                  min={0}
                                  step={0.5}
                                  placeholder={(request.totalBill || 0).toFixed(2)}
                                  value={bidAmounts[request.id] || ''}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => setBidAmounts(prev => ({ ...prev, [request.id]: e.target.value }))}
                                  className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-secondary/50 focus:ring-1 focus:ring-secondary/20 placeholder:text-white/20"
                                />
                              </div>
                              <Button
                                variant="green"
                                onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleBid(request); }}
                                disabled={isActionLoading}
                              >
                                {isActionLoading ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  <Send size={16} />
                                )}
                                Bid
                              </Button>
                            </div>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDecline(request.id); }}
                            disabled={isActionLoading}
                            className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/40 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all"
                          >
                            <XCircle size={18} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
