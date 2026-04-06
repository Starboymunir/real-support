'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Route,
  Star,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Loader2,
  Inbox,
} from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/button';
import { useRequireAuth } from '@/lib/use-require-auth';
import { bookingsApi, requestsApi } from '@/lib/services/bookings';
import type { Booking, RideRequest } from '@/lib/types';
import dynamic from 'next/dynamic';
const MapView = dynamic(() => import('@/components/maps/MapView'), { ssr: false });
import { getRoute, formatDistance, formatDuration, type RouteInfo } from '@/lib/mapbox';

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: 'easeOut' },
  }),
};

interface FareItem {
  label: string;
  value: string;
  highlight?: boolean;
}

interface TimelineStep {
  label: string;
  time: string;
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getStatusInfo(status: string): { label: string; cls: string } {
  switch (status) {
    case 'COMPLETED': return { label: 'Completed', cls: 'bg-success/10 text-success' };
    case 'CANCELLED':
    case 'REJECTED': return { label: 'Cancelled', cls: 'bg-error/10 text-error' };
    case 'PENDING':
    case 'BIDDING': return { label: 'Pending', cls: 'bg-warning/10 text-warning' };
    default: return { label: 'Scheduled', cls: 'bg-info/10 text-info' };
  }
}

export default function RideDetail() {
  useRequireAuth();
  const params = useParams();
  const rideId = params?.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [request, setRequest] = useState<RideRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [fareBreakdown, setFareBreakdown] = useState<FareItem[]>([]);
  const [timeline, setTimeline] = useState<TimelineStep[]>([]);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);

  const fetchData = useCallback(async () => {
    if (!rideId) return;
    setLoading(true);
    try {
      // Try booking first
      const bData = await bookingsApi.getById(rideId).catch(() => null);
      if (bData && bData.id) {
        setBooking(bData);
        buildBookingFare(bData);
        buildBookingTimeline(bData);
        await fetchRoute(bData.startFrom, bData.destination);
      } else {
        // Fall back to request
        const rData = await requestsApi.getById(rideId).catch(() => null);
        if (rData && rData.id) {
          setRequest(rData);
          buildRequestFare(rData);
          buildRequestTimeline(rData);
          await fetchRoute(rData.startFrom, rData.destination);
        }
      }
    } catch {
      // keep empty
    } finally {
      setLoading(false);
    }
  }, [rideId]);

  function buildBookingFare(b: Booking) {
    const total = b.finalBill ?? b.totalBill ?? 0;
    const service = b.serviceCharge ?? 0;
    const baseFare = Math.max(0, total - service);
    const discount = b.discountAmount ?? 0;
    const items: FareItem[] = [
      { label: 'Fare', value: `£${baseFare.toFixed(2)}` },
      { label: 'Service Charge', value: `£${service.toFixed(2)}` },
    ];
    if (discount > 0) items.push({ label: 'Discount', value: `-£${discount.toFixed(2)}`, highlight: true });
    setFareBreakdown(items);
  }

  function buildRequestFare(r: RideRequest) {
    const total = r.totalBill ?? 0;
    const service = r.serviceCharge ?? 0;
    const baseFare = Math.max(0, total - service);
    const discount = r.discountAmount ?? 0;
    const items: FareItem[] = [
      { label: 'Estimated Fare', value: `£${baseFare.toFixed(2)}` },
      { label: 'Service Charge', value: `£${service.toFixed(2)}` },
    ];
    if (discount > 0) items.push({ label: 'Discount', value: `-£${discount.toFixed(2)}`, highlight: true });
    setFareBreakdown(items);
  }

  function buildBookingTimeline(b: Booking) {
    const tl: TimelineStep[] = [{ label: 'Ride Booked', time: fmtTime(b.createdAt) }];
    if (b.acceptedAt) tl.push({ label: 'Driver Assigned', time: fmtTime(b.acceptedAt) });
    if (b.wayToPickupAt) tl.push({ label: 'Driver En Route', time: fmtTime(b.wayToPickupAt) });
    if (b.arrivedAt) tl.push({ label: 'Driver Arrived', time: fmtTime(b.arrivedAt) });
    if (b.pickedUpAt) tl.push({ label: 'Picked Up', time: fmtTime(b.pickedUpAt) });
    if (b.completedAt) tl.push({ label: 'Dropped Off', time: fmtTime(b.completedAt) });
    if (b.cancelTime) tl.push({ label: 'Cancelled', time: fmtTime(b.cancelTime) });
    setTimeline(tl);
  }

  function buildRequestTimeline(r: RideRequest) {
    const tl: TimelineStep[] = [{ label: 'Ride Requested', time: fmtTime(r.createdAt) }];
    if (r.status === 'CANCELLED') tl.push({ label: 'Cancelled', time: fmtTime(r.updatedAt) });
    setTimeline(tl);
  }

  async function fetchRoute(start: { latitude?: string; longitude?: string } | undefined, end: { latitude?: string; longitude?: string } | undefined) {
    const sLat = parseFloat(start?.latitude || '0');
    const sLng = parseFloat(start?.longitude || '0');
    const eLat = parseFloat(end?.latitude || '0');
    const eLng = parseFloat(end?.longitude || '0');
    if (sLat && sLng && eLat && eLng) {
      const route = await getRoute({ lng: sLng, lat: sLat }, { lng: eLng, lat: eLat }).catch(() => null);
      if (route) setRouteInfo(route);
    }
  }

  useEffect(() => { fetchData(); }, [fetchData]);

  // Unified data accessors (booking takes priority, fall back to request)
  const data = booking || request;
  const isRequest = !booking && !!request;

  if (loading) {
    return (
      <DashboardLayout role="rider" pageTitle="Ride Details">
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 size={32} className="animate-spin text-secondary mb-4" />
          <p className="text-white/40 text-sm">Loading ride details…</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout role="rider" pageTitle="Ride Details">
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.06] flex items-center justify-center mb-4">
            <Inbox size={28} className="text-white/40" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">Ride not found</h3>
          <p className="text-sm text-white/40 mb-6">This ride may have been removed or the link is invalid.</p>
          <Button href="/rider/rides" variant="outline" size="sm">
            <ArrowLeft size={16} /> Back to My Rides
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const pickup = data.startFrom?.name || data.startFrom?.city || data.startFrom?.postCode || '—';
  const dropoff = data.destination?.name || data.destination?.city || data.destination?.postCode || '—';
  const { label: statusLabel, cls: statusClass } = getStatusInfo(data.status);
  const total = booking ? (booking.finalBill ?? booking.totalBill ?? 0) : (request?.totalBill ?? 0);
  const driverName = booking?.driverName || (isRequest ? 'Awaiting driver' : '—');
  const hasDriver = booking && booking.driverName;
  const driverInitials = hasDriver ? driverName.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
  const driverRating = booking?.driverRating ?? 0;
  const vehicleName = booking?.packageName || request?.packageInfo?.name || '—';
  const plateNumber = booking?.vehicleNumberPlate || '—';
  const rideDate = fmtDate(data.createdAt);
  const displayId = data.id.slice(-6).toUpperCase();
  const paymentType = (booking?.paymentType || request?.paymentType || '').replace('_', ' ');

  const startCoords = data.startFrom?.latitude && data.startFrom?.longitude
    ? { lng: parseFloat(data.startFrom.longitude), lat: parseFloat(data.startFrom.latitude) }
    : null;
  const endCoords = data.destination?.latitude && data.destination?.longitude
    ? { lng: parseFloat(data.destination.longitude), lat: parseFloat(data.destination.latitude) }
    : null;

  return (
    <DashboardLayout role="rider" pageTitle="Ride Details">
      <div className="space-y-6">
        {/* ── Back + Header ── */}
        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
          <Button href="/rider/rides" variant="ghost" size="sm" className="mb-4">
            <ArrowLeft size={16} /> Back to My Rides
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Ride <span className="font-mono text-secondary">{displayId}</span>
              </h1>
              <p className="text-white/40 mt-0.5">{rideDate}</p>
            </div>
            <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${statusClass} self-start`}>
              {statusLabel}
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ═══ Left Column (2/3) ═══ */}
          <div className="lg:col-span-2 space-y-6">
            {/* Route Card */}
            <motion.div
              initial="hidden"
              animate="visible"
              custom={1}
              variants={fadeUp}
              className="bg-white/[0.02] rounded-2xl border border-white/[0.06] p-6"
            >
              <h2 className="text-lg font-semibold text-white mb-5">Route</h2>

              <div className="relative pl-8 space-y-5">
                <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-secondary to-error/70 rounded-full" />

                <div className="absolute left-0 top-1 w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-secondary" />
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider">Pickup</p>
                  <p className="text-sm font-semibold text-white mt-0.5">{pickup}</p>
                </div>

                <div className="absolute left-0 bottom-0.5 w-5 h-5 rounded-full bg-error/20 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-error" />
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider">Drop-off</p>
                  <p className="text-sm font-semibold text-white mt-0.5">{dropoff}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-6 pt-5 border-t border-white/[0.06]">
                <div className="flex items-center gap-2 text-sm text-white/40">
                  <Route size={15} className="text-secondary" />
                  <span className="font-medium text-white">
                    {routeInfo ? formatDistance(routeInfo.distance) : (data.totalDistance ? `${(data.totalDistance / 1609.34).toFixed(1)} mi` : '—')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/40">
                  <Clock size={15} className="text-secondary" />
                  <span className="font-medium text-white">
                    {routeInfo ? formatDuration(routeInfo.duration) : (data.totalDuration ? `${Math.round(data.totalDuration / 60)} min` : '—')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/40">
                  <CalendarDays size={15} className="text-secondary" />
                  <span className="font-medium text-white">{rideDate}</span>
                </div>
              </div>
            </motion.div>

            {/* Map */}
            <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp}>
              <MapView
                center={
                  startCoords
                    ? [startCoords.lng, startCoords.lat]
                    : [-0.1276, 51.5074]
                }
                zoom={12}
                markers={[
                  ...(startCoords ? [{ ...startCoords, color: '#00E676', label: 'Pickup' }] : []),
                  ...(endCoords ? [{ ...endCoords, color: '#FF5252', label: 'Drop-off' }] : []),
                ]}
                route={routeInfo?.geometry}
                className="w-full h-56"
                interactive={false}
              />
            </motion.div>

            {/* Fare Breakdown */}
            <motion.div
              initial="hidden"
              animate="visible"
              custom={3}
              variants={fadeUp}
              className="bg-white/[0.02] rounded-2xl border border-white/[0.06] p-6"
            >
              <h2 className="text-lg font-semibold text-white mb-5">
                {isRequest ? 'Estimated Fare' : 'Fare Breakdown'}
              </h2>

              <div className="space-y-3">
                {fareBreakdown.map((item) => (
                  <div key={item.label} className="flex justify-between text-sm">
                    <span className="text-white/40">{item.label}</span>
                    <span className={`font-medium ${item.highlight ? 'text-success' : 'text-white'}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/[0.06]">
                <span className="text-base font-semibold text-white">Total</span>
                <span className="text-xl font-bold gradient-text">£{total.toFixed(2)}</span>
              </div>

              {paymentType && (
                <div className="flex items-center gap-2 mt-4 text-sm text-white/40">
                  <CreditCard size={15} className="text-secondary" />
                  <span>Payment: <span className="font-medium text-white capitalize">{paymentType.toLowerCase()}</span></span>
                </div>
              )}
            </motion.div>
          </div>

          {/* ═══ Right Column (1/3) ═══ */}
          <div className="space-y-6">
            {/* Driver Card */}
            <motion.div
              initial="hidden"
              animate="visible"
              custom={4}
              variants={fadeUp}
              className="bg-white/[0.02] rounded-2xl border border-white/[0.06] p-6"
            >
              <h2 className="text-lg font-semibold text-white mb-5">Driver</h2>

              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-lg font-bold">
                  {driverInitials}
                </div>
                <div>
                  <p className="font-semibold text-white">{driverName}</p>
                  {hasDriver && driverRating > 0 && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={13}
                            className={s <= Math.round(driverRating) ? 'text-warning fill-warning' : 'text-warning/30 fill-warning/30'}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-white ml-1">{driverRating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/[0.06]">
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Vehicle</span>
                  <span className="font-medium text-white">{vehicleName}</span>
                </div>
                {plateNumber !== '—' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Plate</span>
                    <span className="font-mono font-semibold text-white">{plateNumber}</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Trip Timeline */}
            <motion.div
              initial="hidden"
              animate="visible"
              custom={5}
              variants={fadeUp}
              className="bg-white/[0.02] rounded-2xl border border-white/[0.06] p-6"
            >
              <h2 className="text-lg font-semibold text-white mb-5">Trip Timeline</h2>

              <div className="space-y-0">
                {timeline.map((step, idx) => (
                  <div key={step.label} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full bg-success/10 flex items-center justify-center">
                        <CheckCircle2 size={16} className="text-success" />
                      </div>
                      {idx < timeline.length - 1 && (
                        <div className="w-0.5 h-6 bg-success/20 rounded-full" />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-medium text-white leading-7">{step.label}</p>
                      <p className="text-xs text-white/40">{step.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial="hidden"
              animate="visible"
              custom={6}
              variants={fadeUp}
              className="space-y-3"
            >
              <Button href="/rider/book" variant="green" className="w-full">
                <RotateCcw size={16} /> Book Again
              </Button>
              <Button href="/rider/support" variant="outline" className="w-full">
                <AlertTriangle size={16} /> Report Issue
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}