'use client';

import { useState } from 'react';
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
  const [selectedVehicle, setSelectedVehicle] = useState('comfort');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('card');
  const [stops, setStops] = useState<string[]>([]);
  const [passengers, setPassengers] = useState(1);

  const addStop = () => {
    if (stops.length < 2) setStops([...stops, '']);
  };
  const removeStop = (idx: number) => setStops(stops.filter((_, i) => i !== idx));

  return (
    <DashboardLayout role="rider" userName="James Rider" pageTitle="Book a Ride">
      <div className="space-y-8">
        {/* ── Header ── */}
        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
          <h1 className="text-2xl font-bold text-text-primary">Where are you going?</h1>
          <p className="text-text-muted mt-1">Plan your trip and choose the perfect ride.</p>
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
              className="bg-white rounded-xl border border-gray-100 p-6 card-premium transition-all duration-200"
            >
              <h2 className="text-lg font-semibold text-text-primary mb-5">Route Details</h2>

              <div className="relative pl-8 space-y-4">
                {/* Vertical line */}
                <div className="absolute left-2.5 top-4 bottom-6 w-0.5 bg-gradient-to-b from-secondary via-accent to-error/60 rounded-full" />

                {/* Pickup dot */}
                <div className="absolute left-0 top-3 w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-secondary" />
                </div>

                <Input icon={MapPin} placeholder="Pickup location" label="Pickup" />

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
                          className="mb-1 p-2 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-colors"
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
                    className="flex items-center gap-2 text-sm font-medium text-accent hover:text-primary transition-colors"
                  >
                    <Plus size={16} /> Add a stop
                  </button>
                )}

                {/* Dropoff dot */}
                <div className="absolute left-0 bottom-5 w-5 h-5 rounded-full bg-error/20 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-error" />
                </div>

                <Input icon={MapPin} placeholder="Drop-off location" label="Drop-off" />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                <Input icon={CalendarDays} type="date" label="Date" />
                <Input icon={Clock} type="time" label="Time" />
              </div>
            </motion.div>

            {/* ── Vehicle Selection ── */}
            <motion.div
              initial="hidden"
              animate="visible"
              custom={2}
              variants={fadeUp}
              className="bg-white rounded-xl border border-gray-100 p-6"
            >
              <h2 className="text-lg font-semibold text-text-primary mb-5">Choose Your Vehicle</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {vehicles.map((v) => {
                  const active = selectedVehicle === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVehicle(v.id)}
                      className={`relative text-left rounded-xl border-2 p-5 transition-all duration-200 cursor-pointer ${
                        active
                          ? 'border-primary bg-primary/[0.03] shadow-md'
                          : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
                      }`}
                    >
                      {active && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      )}
                      <span className="text-2xl">{v.emoji}</span>
                      <h3 className="text-base font-semibold text-text-primary mt-2">{v.name}</h3>
                      <p className="text-xs text-text-muted mt-0.5">{v.desc}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-sm font-bold text-text-primary">from {v.from}</span>
                        <span className="text-xs text-text-muted flex items-center gap-1">
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
              className="bg-white rounded-xl border border-gray-100 p-6"
            >
              <h2 className="text-lg font-semibold text-text-primary mb-5">Payment Method</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`flex items-center gap-4 rounded-xl border-2 p-4 transition-all duration-200 cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'border-primary bg-primary/[0.03]'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    paymentMethod === 'card' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-text-muted'
                  }`}>
                    <CreditCard size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-text-primary">Card</p>
                    <p className="text-xs text-text-muted">Visa ending 4242</p>
                  </div>
                  <div className="ml-auto">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'card' ? 'border-primary' : 'border-gray-300'
                    }`}>
                      {paymentMethod === 'card' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`flex items-center gap-4 rounded-xl border-2 p-4 transition-all duration-200 cursor-pointer ${
                    paymentMethod === 'cash'
                      ? 'border-primary bg-primary/[0.03]'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    paymentMethod === 'cash' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-text-muted'
                  }`}>
                    <Banknote size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-text-primary">Cash</p>
                    <p className="text-xs text-text-muted">Pay driver directly</p>
                  </div>
                  <div className="ml-auto">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'cash' ? 'border-primary' : 'border-gray-300'
                    }`}>
                      {paymentMethod === 'cash' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
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
              className="bg-white rounded-xl border border-gray-100 p-6 card-premium transition-all duration-200 sticky top-6"
            >
              <h2 className="text-lg font-semibold text-text-primary mb-5">Ride Summary</h2>

              {/* Route */}
              <div className="relative pl-7 space-y-3 mb-5">
                <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gradient-to-b from-secondary to-accent rounded-full" />
                <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-secondary/20 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-secondary" />
                </div>
                <p className="text-sm text-text-muted">Pickup location</p>

                <div className="absolute left-0 bottom-1 w-4 h-4 rounded-full bg-accent/20 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                </div>
                <p className="text-sm text-text-muted">Drop-off location</p>
              </div>

              <div className="space-y-3 border-t border-gray-100 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted flex items-center gap-2"><Car size={15} /> Vehicle</span>
                  <span className="font-medium text-text-primary capitalize">{selectedVehicle}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Est. Fare</span>
                  <span className="font-bold text-text-primary">£12 – £16</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted flex items-center gap-2"><Users size={15} /> Passengers</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPassengers(Math.max(1, passengers - 1))}
                      className="w-7 h-7 rounded-md border border-gray-200 text-text-muted hover:border-primary hover:text-primary transition-colors flex items-center justify-center text-sm font-semibold"
                    >
                      −
                    </button>
                    <span className="font-medium text-text-primary w-5 text-center">{passengers}</span>
                    <button
                      onClick={() => setPassengers(Math.min(8, passengers + 1))}
                      className="w-7 h-7 rounded-md border border-gray-200 text-text-muted hover:border-primary hover:text-primary transition-colors flex items-center justify-center text-sm font-semibold"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted flex items-center gap-2"><CreditCard size={15} /> Payment</span>
                  <span className="font-medium text-text-primary capitalize">{paymentMethod}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted flex items-center gap-2"><StickyNote size={15} /> Notes</span>
                  <span className="text-text-muted italic">None</span>
                </div>
              </div>

              <div className="mt-6">
                <Button variant="green" className="w-full" size="lg">
                  Confirm Booking <ChevronRight size={16} />
                </Button>
              </div>
            </motion.div>

            {/* Insurance card */}
            <motion.div
              initial="hidden"
              animate="visible"
              custom={5}
              variants={fadeUp}
              className="bg-gradient-to-br from-primary to-primary-light rounded-xl p-5 text-white"
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
