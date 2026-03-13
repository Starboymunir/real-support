'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useRequireAuth } from '@/lib/use-require-auth';
import { useSocket } from '@/lib/socket-context';
import { bookingsApi } from '@/lib/services/bookings';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Navigation,
  CheckCircle,
  Loader2,
  Phone,
  MessageSquare,
  CreditCard,
  Banknote,
  ArrowRight,
  Calendar,
  StickyNote,
  Inbox,
  Star,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { Booking, BookingStatus } from '@/lib/types';
import Button from '@/components/ui/button';
import Link from 'next/link';

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: 'easeOut' },
  }),
};

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  PENDING: { label: 'Pending', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  ACCEPTED: { label: 'Accepted', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  WAY_TO_PICKUP: { label: 'On the way', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  ARRIVED: { label: 'Arrived', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  PICKED_UP: { label: 'Picked up', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  WAY_TO_DESTINATION: { label: 'In progress', color: 'text-secondary', bg: 'bg-secondary/10', border: 'border-secondary/20' },
  COMPLETED: { label: 'Completed', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  CANCELLED: { label: 'Cancelled', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
};

const statusFlow: BookingStatus[] = ['ACCEPTED', 'WAY_TO_PICKUP', 'ARRIVED', 'PICKED_UP', 'WAY_TO_DESTINATION', 'COMPLETED'];

function getNextStatus(current: BookingStatus): BookingStatus | null {
  const idx = statusFlow.indexOf(current);
  if (idx === -1 || idx >= statusFlow.length - 1) return null;
  return statusFlow[idx + 1];
}

const nextStatusLabels: Record<string, string> = {
  WAY_TO_PICKUP: 'On my way',
  ARRIVED: 'I\'ve arrived',
  PICKED_UP: 'Passenger picked up',
  WAY_TO_DESTINATION: 'Start ride',
  COMPLETED: 'Complete ride',
};

function formatTime(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

type FilterTab = 'active' | 'completed' | 'cancelled';

export default function DriverRidesPage() {
  const { user } = useRequireAuth();
  const { socket } = useSocket();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [tab, setTab] = useState<FilterTab>('active');
  const [error, setError] = useState('');

  const driverId = user?.driver?.id || (typeof window !== 'undefined' ? localStorage.getItem('rs_driver_id') : '') || '';

  const fetchBookings = useCallback(async () => {
    if (!driverId) return;
    setLoading(true);
    try {
      const result = await bookingsApi.getDriverBookings(driverId);
      const list = Array.isArray(result) ? result : (result as unknown as { data: Booking[] })?.data || [];
      setBookings(list);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [driverId]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Listen for booking updates in realtime
  useEffect(() => {
    if (!socket) return;
    const refresh = () => fetchBookings();
    socket.on('BOOKING_UPDATED', refresh);
    socket.on('BOOKING_CANCELLED', refresh);
    return () => {
      socket.off('BOOKING_UPDATED', refresh);
      socket.off('BOOKING_CANCELLED', refresh);
    };
  }, [socket, fetchBookings]);

  const handleUpdateStatus = async (bookingId: string, newStatus: BookingStatus) => {
    setActionLoading(bookingId);
    setError('');
    try {
      await bookingsApi.update(bookingId, { status: newStatus });
      setBookings(prev => prev.map(b =>
        b.id === bookingId ? { ...b, status: newStatus } : b
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update ride status');
    } finally {
      setActionLoading(null);
    }
  };

  const activeStatuses = ['ACCEPTED', 'WAY_TO_PICKUP', 'ARRIVED', 'PICKED_UP', 'WAY_TO_DESTINATION'];
  const filtered = bookings.filter(b => {
    if (tab === 'active') return activeStatuses.includes(b.status);
    if (tab === 'completed') return b.status === 'COMPLETED';
    return b.status === 'CANCELLED';
  });

  const activeCount = bookings.filter(b => activeStatuses.includes(b.status)).length;
  const completedCount = bookings.filter(b => b.status === 'COMPLETED').length;
  const cancelledCount = bookings.filter(b => b.status === 'CANCELLED').length;

  return (
    <DashboardLayout role="driver" pageTitle="My Rides">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
          <h1 className="text-2xl font-bold text-white">My Rides</h1>
          <p className="text-white/40 mt-1">Manage your accepted bookings</p>
        </motion.div>

        {/* Tabs */}
        <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp} className="flex bg-white/[0.04] rounded-xl p-1 border border-white/[0.06]">
          {([
            { key: 'active' as FilterTab, label: 'Active', count: activeCount },
            { key: 'completed' as FilterTab, label: 'Completed', count: completedCount },
            { key: 'cancelled' as FilterTab, label: 'Cancelled', count: cancelledCount },
          ]).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                tab === t.key
                  ? 'bg-secondary text-white shadow-lg shadow-secondary/30'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              {t.label}
              {t.count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-md text-xs ${
                  tab === t.key ? 'bg-white/20' : 'bg-white/[0.08]'
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
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
            <p className="text-white/40">Loading rides...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp} className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-4">
              <Inbox size={36} className="text-white/20" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">
              {tab === 'active' ? 'No active rides' : tab === 'completed' ? 'No completed rides' : 'No cancelled rides'}
            </h3>
            <p className="text-white/40 max-w-sm">
              {tab === 'active' ? 'Accept ride requests to see them here.' : 'Your ride history will appear here.'}
            </p>
            {tab === 'active' && (
              <Link href="/driver/requests" className="mt-4 text-secondary text-sm font-semibold hover:underline flex items-center gap-1">
                View available rides <ArrowRight size={14} />
              </Link>
            )}
          </motion.div>
        )}

        {/* Booking cards */}
        <div className="space-y-4">
          {filtered.map((booking, i) => {
            const isExpanded = expandedId === booking.id;
            const isActionLoading = actionLoading === booking.id;
            const status = statusConfig[booking.status] || statusConfig.PENDING;
            const nextStatus = getNextStatus(booking.status);

            return (
              <motion.div
                key={booking.id}
                initial="hidden"
                animate="visible"
                custom={i + 2}
                variants={fadeUp}
                className={`bg-white/[0.02] rounded-2xl border ${status.border} overflow-hidden transition-all duration-300`}
              >
                {/* Card header */}
                <div
                  className="p-5 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${status.bg} ${status.color}`}>
                        {status.label}
                      </span>
                      <span className="text-xs text-white/30">#{booking.uniqueId}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-secondary">£{booking.finalBill.toFixed(2)}</span>
                      {isExpanded ? <ChevronUp size={18} className="text-white/30" /> : <ChevronDown size={18} className="text-white/30" />}
                    </div>
                  </div>

                  {/* Route */}
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center pt-1">
                      <div className="w-3 h-3 rounded-full bg-secondary" />
                      <div className="w-0.5 flex-1 bg-gradient-to-b from-secondary to-error/60 my-1" />
                      <div className="w-3 h-3 rounded-full bg-error/80" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <p className="text-xs text-white/40 mb-0.5">Pickup</p>
                        <p className="text-sm font-medium text-white truncate">{booking.startFrom?.name || 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/40 mb-0.5">Drop-off</p>
                        <p className="text-sm font-medium text-white truncate">{booking.destination?.name || 'Unknown'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Quick info */}
                  <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/[0.04]">
                    <div className="flex items-center gap-1.5 text-white/50">
                      <Users size={14} />
                      <span className="text-xs">{booking.riderName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/50">
                      <Calendar size={14} />
                      <span className="text-xs">{new Date(booking.bookingDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/50">
                      {booking.paymentType === 'CASH' ? <Banknote size={14} /> : <CreditCard size={14} />}
                      <span className="text-xs">{booking.paymentType === 'CASH' ? 'Cash' : 'Wallet'}</span>
                    </div>
                  </div>
                </div>

                {/* Expanded */}
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
                        {/* Rider info */}
                        <div className="grid grid-cols-2 gap-3 pt-4">
                          <div>
                            <p className="text-xs text-white/40 mb-1">Rider</p>
                            <p className="text-sm font-medium text-white">{booking.riderName}</p>
                          </div>
                          {booking.riderPhone && (
                            <div>
                              <p className="text-xs text-white/40 mb-1">Phone</p>
                              <a href={`tel:${booking.riderPhone}`} className="text-sm font-medium text-secondary flex items-center gap-1">
                                <Phone size={12} />
                                {booking.riderPhone}
                              </a>
                            </div>
                          )}
                          <div>
                            <p className="text-xs text-white/40 mb-1">Distance</p>
                            <p className="text-sm text-white/70">
                              {booking.totalDistance ? `${(booking.totalDistance / 1609.34).toFixed(1)} mi` : '—'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-white/40 mb-1">Duration</p>
                            <p className="text-sm text-white/70">
                              {booking.totalDuration ? `${Math.round(booking.totalDuration / 60)} min` : '—'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-white/40 mb-1">Fare</p>
                            <p className="text-sm text-white/70">£{booking.totalBill.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-white/40 mb-1">Commission</p>
                            <p className="text-sm text-white/70">£{booking.commission.toFixed(2)} ({booking.commissionPercentage}%)</p>
                          </div>
                        </div>

                        {/* Status timeline */}
                        {tab === 'active' && (
                          <div className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.04]">
                            <p className="text-xs font-semibold text-white/40 mb-3">Progress</p>
                            <div className="flex items-center gap-1">
                              {statusFlow.map((s, idx) => {
                                const currentIdx = statusFlow.indexOf(booking.status);
                                const isDone = idx <= currentIdx;
                                return (
                                  <div key={s} className="flex-1 flex items-center gap-1">
                                    <div className={`w-full h-1.5 rounded-full transition-colors ${isDone ? 'bg-secondary' : 'bg-white/[0.08]'}`} />
                                  </div>
                                );
                              })}
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-white/30">Accepted</span>
                              <span className="text-xs text-white/30">Completed</span>
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        {booking.notes && (
                          <div className="flex items-start gap-2 bg-white/[0.02] rounded-xl p-3 border border-white/[0.04]">
                            <StickyNote size={14} className="text-white/30 mt-0.5" />
                            <p className="text-sm text-white/60">{booking.notes}</p>
                          </div>
                        )}

                        {/* Completed info */}
                        {booking.status === 'COMPLETED' && (
                          <div className="grid grid-cols-2 gap-3">
                            {booking.riderRating && (
                              <div className="flex items-center gap-1.5">
                                <Star size={14} className="text-yellow-400" />
                                <span className="text-sm text-white/70">Rider rated: {booking.riderRating}/5</span>
                              </div>
                            )}
                            {booking.completedAt && (
                              <div className="flex items-center gap-1.5">
                                <CheckCircle size={14} className="text-green-400" />
                                <span className="text-sm text-white/70">Completed at {formatTime(booking.completedAt)}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-3 pt-2">
                          {nextStatus && tab === 'active' && (
                            <Button
                              variant="green"
                              onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleUpdateStatus(booking.id, nextStatus); }}
                              disabled={isActionLoading}
                              className="flex-1"
                            >
                              {isActionLoading ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Navigation size={16} />
                              )}
                              {nextStatusLabels[nextStatus] || nextStatus}
                            </Button>
                          )}
                          <Link
                            href="/driver/chat"
                            onClick={(e) => e.stopPropagation()}
                            className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/40 hover:text-secondary hover:border-secondary/30 transition-all"
                          >
                            <MessageSquare size={18} />
                          </Link>
                          {booking.riderPhone && (
                            <a
                              href={`tel:${booking.riderPhone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/40 hover:text-secondary hover:border-secondary/30 transition-all"
                            >
                              <Phone size={18} />
                            </a>
                          )}
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
