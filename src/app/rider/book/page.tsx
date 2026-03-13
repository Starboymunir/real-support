'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  X,
  CalendarDays,
  Clock,
  Car,
  CreditCard,
  Banknote,
  Shield,
  Users,
  StickyNote,
  ChevronRight,
  Route,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/button';
import { useRequireAuth } from '@/lib/use-require-auth';
import { requestsApi } from '@/lib/services/bookings';
import { packagesApi } from '@/lib/services/packages';
import { othersApi } from '@/lib/services/others';
import type { Package } from '@/lib/types';
import AddressAutocomplete, { type PlaceResult } from '@/components/maps/AddressAutocomplete';
import MapView from '@/components/maps/MapView';
import { getRoute, formatDistance, formatDuration, type RouteInfo } from '@/lib/mapbox';

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: 'easeOut' },
  }),
};

const packageEmoji: Record<string, string> = {
  economy: '🚗',
  comfort: '🚙',
  premium: '✨',
  xl: '🚐',
  van: '🚐',
};

function getEmoji(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, emoji] of Object.entries(packageEmoji)) {
    if (lower.includes(key)) return emoji;
  }
  return '🚗';
}

/** Fetch fare estimate from backend */
async function fetchFareFromBackend(
  packageId: string,
  distanceMeters: number,
  durationSeconds: number
): Promise<number> {
  try {
    const result = await othersApi.calculatePrice({
      packageId,
      distance: distanceMeters,
      time: durationSeconds,
    });
    return result?.price ?? 0;
  } catch (err) {
    console.error('[BookRide] Backend price calc failed:', err);
    return 0;
  }
}

export default function BookRide() {
  const { user } = useRequireAuth();
  const router = useRouter();
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('card');
  const [stops, setStops] = useState<{ text: string; place?: PlaceResult }[]>([]);
  const [passengers, setPassengers] = useState(1);
  const [pickupPlace, setPickupPlace] = useState<PlaceResult | null>(null);
  const [dropoffPlace, setDropoffPlace] = useState<PlaceResult | null>(null);
  const [pickupText, setPickupText] = useState('');
  const [dropoffText, setDropoffText] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [note, setNote] = useState('');
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [fareEstimate, setFareEstimate] = useState<number | null>(null);
  const [faresByPackage, setFaresByPackage] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [error, setError] = useState('');

  const selectedPackage = packages.find((p) => p.id === selectedPackageId);

  // Fetch packages once user is authenticated
  useEffect(() => {
    if (!user) return;
    const fetchPackages = async () => {
      setLoadingPackages(true);
      try {
        const raw = await packagesApi.getAll();
        // Handle various response shapes
        const list: Package[] = Array.isArray(raw)
          ? raw
          : raw && typeof raw === 'object' && 'data' in (raw as Record<string, unknown>)
            ? (raw as unknown as { data: Package[] }).data
            : [];
        setPackages(list);
        if (list.length > 0 && !selectedPackageId) {
          setSelectedPackageId(list[0].id);
        }
      } catch (err) {
        console.error('[BookRide] Failed to fetch packages:', err);
      } finally {
        setLoadingPackages(false);
      }
    };
    fetchPackages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const addStop = () => {
    if (stops.length < 2) setStops([...stops, { text: '' }]);
  };
  const removeStop = (idx: number) => setStops(stops.filter((_, i) => i !== idx));

  // Fetch route when pickup and dropoff are set
  useEffect(() => {
    if (!pickupPlace || !dropoffPlace) {
      setRouteInfo(null);
      setFareEstimate(null);
      setFaresByPackage({});
      return;
    }

    const fetchRoute = async () => {
      setLoadingRoute(true);
      const waypoints = stops
        .filter((s) => s.place)
        .map((s) => ({ lng: s.place!.lng, lat: s.place!.lat }));

      const route = await getRoute(
        { lng: pickupPlace.lng, lat: pickupPlace.lat },
        { lng: dropoffPlace.lng, lat: dropoffPlace.lat },
        waypoints.length > 0 ? waypoints : undefined
      );

      if (route) {
        setRouteInfo(route);
        // Fetch fares for ALL packages in parallel
        const faresMap: Record<string, number> = {};
        await Promise.all(
          packages.map(async (pkg) => {
            const fare = await fetchFareFromBackend(pkg.id, route.distance, route.duration);
            faresMap[pkg.id] = fare;
          })
        );
        setFaresByPackage(faresMap);
        if (selectedPackageId && faresMap[selectedPackageId] !== undefined) {
          setFareEstimate(faresMap[selectedPackageId]);
        }
      }
      setLoadingRoute(false);
    };

    fetchRoute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickupPlace, dropoffPlace, stops, packages]);

  // Update fareEstimate when selected vehicle changes
  useEffect(() => {
    if (selectedPackageId && faresByPackage[selectedPackageId] !== undefined) {
      setFareEstimate(faresByPackage[selectedPackageId]);
    }
  }, [selectedPackageId, routeInfo]);

  // Build map markers
  const markers = [];
  if (pickupPlace) {
    markers.push({ lng: pickupPlace.lng, lat: pickupPlace.lat, color: '#00E676', label: 'Pickup' });
  }
  if (dropoffPlace) {
    markers.push({ lng: dropoffPlace.lng, lat: dropoffPlace.lat, color: '#FF5252', label: 'Drop-off' });
  }
  stops.forEach((s, i) => {
    if (s.place) {
      markers.push({ lng: s.place.lng, lat: s.place.lat, color: '#00B0FF', label: `Stop ${i + 1}` });
    }
  });

  const mapCenter: [number, number] = pickupPlace
    ? [pickupPlace.lng, pickupPlace.lat]
    : dropoffPlace
    ? [dropoffPlace.lng, dropoffPlace.lat]
    : [-0.1276, 51.5074];

  const handleConfirmBooking = useCallback(async () => {
    if (!user) return;
    if (!pickupPlace || !dropoffPlace) {
      setError('Please select pickup and drop-off locations');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const stoppageAddresses = stops
        .filter((s) => s.place)
        .map((s) => ({
          name: s.place!.fullAddress,
          city: s.place!.city,
          latitude: String(s.place!.lat),
          longitude: String(s.place!.lng),
        }));

      const bookingDateStr = date || new Date().toISOString().split('T')[0];
      const bookingTimeStr = time || new Date().toTimeString().slice(0, 5);

      const request = await requestsApi.create({
        startFrom: {
          name: pickupPlace.fullAddress,
          city: pickupPlace.city,
          latitude: String(pickupPlace.lat),
          longitude: String(pickupPlace.lng),
        },
        destination: {
          name: dropoffPlace.fullAddress,
          city: dropoffPlace.city,
          latitude: String(dropoffPlace.lat),
          longitude: String(dropoffPlace.lng),
        },
        stoppages: stoppageAddresses.length > 0 ? stoppageAddresses : undefined,
        packageId: selectedPackageId,
        paymentType: paymentMethod === 'card' ? 'WALLET' : 'CASH',
        totalDistance: routeInfo ? Math.round(routeInfo.distance) : 0,
        totalDuration: routeInfo ? Math.round(routeInfo.duration) : 0,
        totalBill: fareEstimate ? Math.round(fareEstimate) : 0,
        totalPersons: passengers,
        totalLuggage: 0,
        notes: note || undefined,
        requestType: 'FIXED',
        bookingDate: new Date(`${bookingDateStr}T${bookingTimeStr}:00`).toISOString(),
        bookingTime: bookingTimeStr,
        clientName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        clientEmail: user.emailAddress || '',
        clientPhone: user.phone_number || '',
        serviceCharge: selectedPackage ? selectedPackage.serviceFee : 0,
        discountAmount: 0,
        cashCollected: 0,
        walletCollected: 0,
      });
      if (request?.id) {
        router.push('/rider/rides');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  }, [user, pickupPlace, dropoffPlace, date, time, selectedPackageId, selectedPackage, fareEstimate, paymentMethod, passengers, note, stops, routeInfo, router]);

  return (
    <DashboardLayout role="rider" pageTitle="Book a Ride">
      <div className="space-y-8">
        {/* ── Header ── */}
        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
          <h1 className="text-2xl font-bold text-white">Where are you going?</h1>
          <p className="text-white/40 mt-1">Plan your trip and choose the perfect ride.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ═══ Left Column ═══ */}
          <div className="lg:col-span-2 space-y-6">
            {/* ── Map ── */}
            <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}>
              <MapView
                center={mapCenter}
                zoom={pickupPlace || dropoffPlace ? 13 : 11}
                markers={markers}
                route={routeInfo?.geometry}
                className="w-full h-[350px]"
              />
            </motion.div>

            {/* ── Route Inputs ── */}
            <motion.div
              initial="hidden"
              animate="visible"
              custom={2}
              variants={fadeUp}
              className="bg-white/[0.02] rounded-2xl border border-white/[0.06] p-6 card-premium transition-all duration-200"
            >
              <h2 className="text-lg font-semibold text-white mb-5">Route Details</h2>

              <div className="relative pl-8 space-y-4">
                {/* Vertical line */}
                <div className="absolute left-2.5 top-4 bottom-6 w-0.5 bg-gradient-to-b from-secondary via-accent to-error/60 rounded-full" />

                {/* Pickup dot */}
                <div className="absolute left-0 top-3 w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-secondary" />
                </div>

                <AddressAutocomplete
                  label="Pickup"
                  placeholder="Where should we pick you up?"
                  value={pickupText}
                  onChange={setPickupText}
                  onSelect={(place) => {
                    setPickupPlace(place);
                    setPickupText(place.fullAddress);
                  }}
                  iconColor="text-secondary"
                />

                {/* Stops */}
                <AnimatePresence>
                  {stops.map((stop, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="relative"
                    >
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <AddressAutocomplete
                            label={`Stop ${idx + 1}`}
                            placeholder={`Stop ${idx + 1}`}
                            value={stop.text}
                            onChange={(text) => {
                              const newStops = [...stops];
                              newStops[idx] = { ...newStops[idx], text };
                              setStops(newStops);
                            }}
                            onSelect={(place) => {
                              const newStops = [...stops];
                              newStops[idx] = { text: place.fullAddress, place };
                              setStops(newStops);
                            }}
                            iconColor="text-accent"
                          />
                        </div>
                        <button
                          onClick={() => removeStop(idx)}
                          className="mb-1 p-2 rounded-lg text-white/40 hover:text-error hover:bg-error/10 transition-colors"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {stops.length < 2 && (
                  <button
                    onClick={addStop}
                    className="flex items-center gap-2 text-sm font-medium text-secondary hover:text-secondary-light transition-colors"
                  >
                    <Plus size={16} /> Add a stop
                  </button>
                )}

                {/* Dropoff dot */}
                <div className="absolute left-0 bottom-5 w-5 h-5 rounded-full bg-error/20 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-error" />
                </div>

                <AddressAutocomplete
                  label="Drop-off"
                  placeholder="Where are you going?"
                  value={dropoffText}
                  onChange={setDropoffText}
                  onSelect={(place) => {
                    setDropoffPlace(place);
                    setDropoffText(place.fullAddress);
                  }}
                  iconColor="text-error"
                />
              </div>

              {/* Route info bar */}
              {routeInfo && (
                <div className="mt-4 p-3 rounded-xl bg-secondary/[0.06] border border-secondary/20 flex items-center gap-4">
                  <Route size={18} className="text-secondary shrink-0" />
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-white font-semibold">{formatDistance(routeInfo.distance)}</span>
                    <span className="text-white/30">•</span>
                    <span className="text-white/60">{formatDuration(routeInfo.duration)}</span>
                  </div>
                  {loadingRoute && <Loader2 size={14} className="text-secondary animate-spin ml-auto" />}
                </div>
              )}

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                <div>
                  <label className="block text-white/50 text-sm font-medium mb-2">Date</label>
                  <div className="relative">
                    <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/25 pointer-events-none" />
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-dark w-full pl-12" />
                  </div>
                </div>
                <div>
                  <label className="block text-white/50 text-sm font-medium mb-2">Time</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/25 pointer-events-none" />
                    <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="input-dark w-full pl-12" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ── Vehicle Selection ── */}
            <motion.div
              initial="hidden"
              animate="visible"
              custom={3}
              variants={fadeUp}
              className="bg-white/[0.02] rounded-2xl border border-white/[0.06] p-6"
            >
              <h2 className="text-lg font-semibold text-white mb-5">Choose Your Vehicle</h2>

              {loadingPackages ? (
                <div className="flex items-center gap-3 text-white/30 text-sm">
                  <Loader2 size={16} className="animate-spin" /> Loading vehicle types...
                </div>
              ) : packages.length === 0 ? (
                <p className="text-white/40 text-sm">No vehicle types available. Please try again later.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {packages.map((pkg) => {
                    const active = selectedPackageId === pkg.id;
                    const fare = faresByPackage[pkg.id] ?? null;
                    return (
                      <button
                        key={pkg.id}
                        onClick={() => setSelectedPackageId(pkg.id)}
                        className={`relative text-left rounded-2xl border-2 p-5 transition-all duration-200 cursor-pointer ${
                          active
                            ? 'border-secondary bg-secondary/[0.06]'
                            : 'border-white/[0.06] hover:border-white/[0.1]'
                        }`}
                      >
                        {active && (
                          <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-secondary flex items-center justify-center">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        )}
                        <span className="text-2xl">{getEmoji(pkg.name)}</span>
                        <h3 className="text-base font-semibold text-white mt-2">{pkg.name}</h3>
                        <p className="text-xs text-white/40 mt-0.5">{pkg.summary}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-sm font-bold text-white">
                            {fare ? `£${fare.toFixed(2)}` : `from £${pkg.minBill.toFixed(0)}`}
                          </span>
                          <span className="text-xs text-white/40 flex items-center gap-1">
                            <Clock size={12} /> {routeInfo ? formatDuration(routeInfo.duration) : '—'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* ── Payment Method ── */}
            <motion.div
              initial="hidden"
              animate="visible"
              custom={4}
              variants={fadeUp}
              className="bg-white/[0.02] rounded-2xl border border-white/[0.06] p-6"
            >
              <h2 className="text-lg font-semibold text-white mb-5">Payment Method</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`flex items-center gap-4 rounded-2xl border-2 p-4 transition-all duration-200 cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'border-secondary bg-secondary/[0.06]'
                      : 'border-white/[0.06] hover:border-white/[0.1]'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    paymentMethod === 'card' ? 'bg-secondary/10 text-secondary' : 'bg-white/[0.06] text-white/40'
                  }`}>
                    <CreditCard size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">Card / Wallet</p>
                    <p className="text-xs text-white/40">Pay via wallet balance</p>
                  </div>
                  <div className="ml-auto">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'card' ? 'border-secondary' : 'border-white/[0.15]'
                    }`}>
                      {paymentMethod === 'card' && <div className="w-2.5 h-2.5 rounded-full bg-secondary" />}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`flex items-center gap-4 rounded-2xl border-2 p-4 transition-all duration-200 cursor-pointer ${
                    paymentMethod === 'cash'
                      ? 'border-secondary bg-secondary/[0.06]'
                      : 'border-white/[0.06] hover:border-white/[0.1]'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    paymentMethod === 'cash' ? 'bg-secondary/10 text-secondary' : 'bg-white/[0.06] text-white/40'
                  }`}>
                    <Banknote size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">Cash</p>
                    <p className="text-xs text-white/40">Pay driver directly</p>
                  </div>
                  <div className="ml-auto">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'cash' ? 'border-secondary' : 'border-white/[0.15]'
                    }`}>
                      {paymentMethod === 'cash' && <div className="w-2.5 h-2.5 rounded-full bg-secondary" />}
                    </div>
                  </div>
                </button>
              </div>
            </motion.div>

            {/* ── Notes ── */}
            <motion.div
              initial="hidden"
              animate="visible"
              custom={5}
              variants={fadeUp}
              className="bg-white/[0.02] rounded-2xl border border-white/[0.06] p-6"
            >
              <h2 className="text-lg font-semibold text-white mb-4">Notes for Driver</h2>
              <div className="relative">
                <StickyNote className="absolute left-4 top-3.5 w-5 h-5 text-white/25 pointer-events-none" />
                <textarea
                  placeholder="Any special instructions? (e.g. meet at door, wheelchair, luggage)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="input-dark w-full pl-12 min-h-[80px] resize-none"
                  rows={3}
                />
              </div>
            </motion.div>
          </div>

          {/* ═══ Right Sidebar ═══ */}
          <div className="space-y-6">
            {/* Ride Summary */}
            <motion.div
              initial="hidden"
              animate="visible"
              custom={6}
              variants={fadeUp}
              className="bg-[#0B1120] rounded-2xl border border-white/[0.06] p-6 card-premium transition-all duration-200 sticky top-6"
            >
              <h2 className="text-lg font-semibold text-white mb-5">Ride Summary</h2>

              {/* Route */}
              <div className="relative pl-7 space-y-3 mb-5">
                <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gradient-to-b from-secondary to-error rounded-full" />
                <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-secondary/20 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-secondary" />
                </div>
                <p className="text-sm text-white/60 truncate">{pickupPlace?.fullAddress || 'Select pickup location'}</p>

                {stops.filter(s => s.place).map((s, i) => (
                  <p key={i} className="text-sm text-accent/60 truncate">↳ {s.place!.fullAddress}</p>
                ))}

                <div className="absolute left-0 bottom-1 w-4 h-4 rounded-full bg-error/20 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-error" />
                </div>
                <p className="text-sm text-white/60 truncate">{dropoffPlace?.fullAddress || 'Select drop-off location'}</p>
              </div>

              <div className="space-y-3 border-t border-white/[0.06] pt-4">
                {routeInfo && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/40 flex items-center gap-2"><Route size={15} /> Distance</span>
                      <span className="font-medium text-white">{formatDistance(routeInfo.distance)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/40 flex items-center gap-2"><Clock size={15} /> Duration</span>
                      <span className="font-medium text-white">{formatDuration(routeInfo.duration)}</span>
                    </div>
                  </>
                )}
                {date && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40 flex items-center gap-2"><CalendarDays size={15} /> Date</span>
                    <span className="font-medium text-white">{new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                )}
                {time && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40 flex items-center gap-2"><Clock size={15} /> Time</span>
                    <span className="font-medium text-white">{time}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-white/40 flex items-center gap-2"><Car size={15} /> Vehicle</span>
                  <span className="font-medium text-white capitalize">{selectedPackage?.name || '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Fare</span>
                  {loadingRoute ? (
                    <Loader2 size={14} className="text-secondary animate-spin" />
                  ) : fareEstimate ? (
                    <span className="font-bold text-white">£{fareEstimate.toFixed(2)}</span>
                  ) : (
                    <span className="text-white/30">—</span>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/40 flex items-center gap-2"><Users size={15} /> Passengers</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPassengers(Math.max(1, passengers - 1))}
                      className="w-7 h-7 rounded-md border border-white/[0.1] text-white/40 hover:border-secondary hover:text-secondary transition-colors flex items-center justify-center text-sm font-semibold"
                    >
                      −
                    </button>
                    <span className="font-medium text-white w-5 text-center">{passengers}</span>
                    <button
                      onClick={() => setPassengers(Math.min(8, passengers + 1))}
                      className="w-7 h-7 rounded-md border border-white/[0.1] text-white/40 hover:border-secondary hover:text-secondary transition-colors flex items-center justify-center text-sm font-semibold"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40 flex items-center gap-2"><CreditCard size={15} /> Payment</span>
                  <span className="font-medium text-white capitalize">{paymentMethod}</span>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 rounded-xl bg-error/10 border border-error/20 text-error text-sm">{error}</div>
              )}
              <div className="mt-6">
                <Button
                  variant="green"
                  className="w-full"
                  size="lg"
                  onClick={handleConfirmBooking}
                  disabled={submitting || !pickupPlace || !dropoffPlace || !selectedPackageId}
                >
                  {submitting ? (
                    <><Loader2 size={16} className="animate-spin" /> Booking...</>
                  ) : (
                    <>Confirm Booking <ChevronRight size={16} /></>
                  )}
                </Button>
              </div>
            </motion.div>

            {/* Insurance card */}
            <motion.div
              initial="hidden"
              animate="visible"
              custom={7}
              variants={fadeUp}
              className="bg-gradient-to-br from-primary to-primary-light rounded-2xl p-5 text-white border border-white/[0.08]"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center">
                  <Shield size={20} />
                </div>
                <h3 className="font-semibold">Your Ride is Insured</h3>
              </div>
              <p className="text-sm text-white/70 leading-relaxed">
                Every RS CAB trip includes complimentary insurance coverage for your peace of mind.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
