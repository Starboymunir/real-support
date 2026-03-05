'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin,
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
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useRequireAuth } from '@/lib/use-require-auth';
import { requestsApi } from '@/lib/services/bookings';
import { packagesApi } from '@/lib/services/packages';
import { othersApi } from '@/lib/services/others';
import type { Package } from '@/lib/types';

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: 'easeOut' },
  }),
};

const vehicles = [
  { id: 'economy', name: 'Economy', emoji: '🚗', from: '£8', eta: '3 min', desc: 'Affordable everyday rides' },
  { id: 'comfort', name: 'Comfort', emoji: '🚙', from: '£12', eta: '5 min', desc: 'Extra legroom & comfort' },
  { id: 'premium', name: 'Premium', emoji: '✨', from: '£20', eta: '7 min', desc: 'Luxury vehicles & top drivers' },
  { id: 'xl', name: 'XL / Van', emoji: '🚐', from: '£15', eta: '8 min', desc: 'Groups & extra luggage' },
];

export default function BookRide() {
  const { user } = useRequireAuth();
  const router = useRouter();
  const [selectedVehicle, setSelectedVehicle] = useState('comfort');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('card');
  const [stops, setStops] = useState<string[]>([]);
  const [passengers, setPassengers] = useState(1);
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [note, setNote] = useState('');
  const [estimatedFare, setEstimatedFare] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const addStop = () => {
    if (stops.length < 2) setStops([...stops, '']);
  };
  const removeStop = (idx: number) => setStops(stops.filter((_, i) => i !== idx));

  const handleConfirmBooking = useCallback(async () => {
    if (!user) return;
    if (!pickup || !dropoff) { setError('Please enter pickup and dropoff locations'); return; }
    setSubmitting(true);
    setError('');
    try {
      const stoppageAddresses = stops.filter(Boolean).map(s => ({
        name: s, city: '', latitude: '0', longitude: '0',
      }));
      const request = await requestsApi.create({
        startFrom: { name: pickup, city: '', latitude: '0', longitude: '0' },
        destination: { name: dropoff, city: '', latitude: '0', longitude: '0' },
        stoppages: stoppageAddresses.length > 0 ? stoppageAddresses : undefined,
        packageId: selectedVehicle,
        paymentType: paymentMethod === 'card' ? 'WALLET' : 'CASH',
        totalDistance: 0,
        totalDuration: 0,
        totalPersons: passengers,
        notes: note || undefined,
        requestType: 'FIXED',
        bookingDate: date || new Date().toISOString().split('T')[0],
        bookingTime: new Date().toTimeString().slice(0, 5),
        clientName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        clientEmail: user.emailAddress || '',
        clientPhone: user.phone_number || '',
        serviceCharge: 0,
      });
      if (request?.id) {
        router.push('/rider/rides');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  }, [user, pickup, dropoff, date, selectedVehicle, paymentMethod, passengers, note, router]);

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
            {/* ── Route Inputs ── */}
            <motion.div
              initial="hidden"
              animate="visible"
              custom={1}
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

                <Input icon={MapPin} placeholder="Pickup location" label="Pickup" value={pickup} onChange={(e) => setPickup(e.target.value)} />

                {/* Stops */}
                <AnimatePresence>
                  {stops.map((_, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="relative"
                    >
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <Input icon={MapPin} placeholder={`Stop ${idx + 1}`} label={`Stop ${idx + 1}`} />
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

                <Input icon={MapPin} placeholder="Drop-off location" label="Drop-off" value={dropoff} onChange={(e) => setDropoff(e.target.value)} />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                <Input icon={CalendarDays} type="date" label="Date" value={date} onChange={(e) => setDate(e.target.value)} />
                <Input icon={Clock} type="time" label="Time" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
            </motion.div>

            {/* ── Vehicle Selection ── */}
            <motion.div
              initial="hidden"
              animate="visible"
              custom={2}
              variants={fadeUp}
              className="bg-white/[0.02] rounded-2xl border border-white/[0.06] p-6"
            >
              <h2 className="text-lg font-semibold text-white mb-5">Choose Your Vehicle</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {vehicles.map((v) => {
                  const active = selectedVehicle === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVehicle(v.id)}
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
                      <span className="text-2xl">{v.emoji}</span>
                      <h3 className="text-base font-semibold text-white mt-2">{v.name}</h3>
                      <p className="text-xs text-white/40 mt-0.5">{v.desc}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-sm font-bold text-white">from {v.from}</span>
                        <span className="text-xs text-white/40 flex items-center gap-1">
                          <Clock size={12} /> {v.eta}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* ── Payment Method ── */}
            <motion.div
              initial="hidden"
              animate="visible"
              custom={3}
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
                    <p className="text-sm font-semibold text-white">Card</p>
                    <p className="text-xs text-white/40">Visa ending 4242</p>
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
          </div>

          {/* ═══ Right Sidebar ═══ */}
          <div className="space-y-6">
            {/* Ride Summary */}
            <motion.div
              initial="hidden"
              animate="visible"
              custom={4}
              variants={fadeUp}
              className="bg-white/[0.02] rounded-2xl border border-white/[0.06] p-6 card-premium transition-all duration-200 sticky top-6"
            >
              <h2 className="text-lg font-semibold text-white mb-5">Ride Summary</h2>

              {/* Route */}
              <div className="relative pl-7 space-y-3 mb-5">
                <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gradient-to-b from-secondary to-accent rounded-full" />
                <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-secondary/20 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-secondary" />
                </div>
                <p className="text-sm text-white/40">Pickup location</p>

                <div className="absolute left-0 bottom-1 w-4 h-4 rounded-full bg-accent/20 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                </div>
                <p className="text-sm text-white/40">Drop-off location</p>
              </div>

              <div className="space-y-3 border-t border-white/[0.06] pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-white/40 flex items-center gap-2"><Car size={15} /> Vehicle</span>
                  <span className="font-medium text-white capitalize">{selectedVehicle}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Est. Fare</span>
                  <span className="font-bold text-white">£12 – £16</span>
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
                <div className="flex justify-between text-sm">
                  <span className="text-white/40 flex items-center gap-2"><StickyNote size={15} /> Notes</span>
                  <span className="text-white/40 italic">None</span>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-error text-sm mb-3">{error}</div>
              )}
              <div className="mt-6">
                <Button
                  variant="green"
                  className="w-full"
                  size="lg"
                  onClick={handleConfirmBooking}
                  disabled={submitting}
                >
                  {submitting ? 'Booking...' : 'Confirm Booking'} <ChevronRight size={16} />
                </Button>
              </div>
            </motion.div>

            {/* Insurance card */}
            <motion.div
              initial="hidden"
              animate="visible"
              custom={5}
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
