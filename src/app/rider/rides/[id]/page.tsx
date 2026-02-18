'use client';

import {
  ArrowLeft,
  MapPin,
  CalendarDays,
  Clock,
  Route,
  Star,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/Button';

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: 'easeOut' },
  }),
};

const fareBreakdown = [
  { label: 'Base Fare', value: '£3.50' },
  { label: 'Distance (18.4 mi)', value: '£22.00' },
  { label: 'Time (42 min)', value: '£5.50' },
  { label: 'Surge Pricing', value: '£0.00' },
  { label: 'Discount', value: '-£2.00', highlight: true },
  { label: 'Driver Tip', value: '£5.50' },
];

const timeline = [
  { label: 'Ride Booked', time: '08:52 AM' },
  { label: 'Driver Assigned', time: '08:55 AM' },
  { label: 'Driver Arrived', time: '09:08 AM' },
  { label: 'Picked Up', time: '09:15 AM' },
  { label: 'Dropped Off', time: '09:57 AM' },
];

export default function RideDetail() {
  return (
    <DashboardLayout role="rider" userName="James Rider" pageTitle="Ride Details">
      <div className="space-y-6">
        {/* ── Back + Header ── */}
        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
          <Button href="/rider/rides" variant="ghost" size="sm" className="mb-4">
            <ArrowLeft size={16} /> Back to My Rides
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">
                Ride <span className="font-mono">RS-1024</span>
              </h1>
              <p className="text-text-muted mt-0.5">14 February 2026</p>
            </div>
            <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-success/10 text-success self-start">
              Completed
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
              className="bg-white rounded-xl border border-gray-100 p-6"
            >
              <h2 className="text-lg font-semibold text-text-primary mb-5">Route</h2>

              <div className="relative pl-8 space-y-5">
                <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-secondary to-error/70 rounded-full" />

                <div className="absolute left-0 top-1 w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-secondary" />
                </div>
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wider">Pickup</p>
                  <p className="text-sm font-semibold text-text-primary mt-0.5">12 Baker Street, London W1U 3BW</p>
                </div>

                <div className="absolute left-0 bottom-0.5 w-5 h-5 rounded-full bg-error/20 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-error" />
                </div>
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wider">Drop-off</p>
                  <p className="text-sm font-semibold text-text-primary mt-0.5">Heathrow Airport Terminal 5, TW6 2GA</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-6 pt-5 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <Route size={15} className="text-primary" />
                  <span className="font-medium text-text-primary">18.4 mi</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <Clock size={15} className="text-primary" />
                  <span className="font-medium text-text-primary">42 min</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <CalendarDays size={15} className="text-primary" />
                  <span className="font-medium text-text-primary">14 Feb 2026, 09:15 AM</span>
                </div>
              </div>
            </motion.div>

            {/* Map Placeholder */}
            <motion.div
              initial="hidden"
              animate="visible"
              custom={2}
              variants={fadeUp}
              className="bg-gray-200 rounded-xl h-56 flex flex-col items-center justify-center gap-2"
            >
              <MapPin size={32} className="text-text-muted" />
              <p className="text-sm text-text-muted font-medium">Map View</p>
            </motion.div>

            {/* Fare Breakdown */}
            <motion.div
              initial="hidden"
              animate="visible"
              custom={3}
              variants={fadeUp}
              className="bg-white rounded-xl border border-gray-100 p-6"
            >
              <h2 className="text-lg font-semibold text-text-primary mb-5">Fare Breakdown</h2>

              <div className="space-y-3">
                {fareBreakdown.map((item) => (
                  <div key={item.label} className="flex justify-between text-sm">
                    <span className="text-text-muted">{item.label}</span>
                    <span className={`font-medium ${item.highlight ? 'text-success' : 'text-text-primary'}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                <span className="text-base font-semibold text-text-primary">Total</span>
                <span className="text-xl font-bold gradient-text">£34.50</span>
              </div>

              <div className="flex items-center gap-2 mt-4 text-sm text-text-muted">
                <CreditCard size={15} className="text-primary" />
                <span>Paid via <span className="font-medium text-text-primary">Visa •••• 4242</span></span>
              </div>
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
              className="bg-white rounded-xl border border-gray-100 p-6 card-premium transition-all duration-200"
            >
              <h2 className="text-lg font-semibold text-text-primary mb-5">Driver</h2>

              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-lg font-bold">
                  MS
                </div>
                <div>
                  <p className="font-semibold text-text-primary">Michael Smith</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={13}
                          className={s <= 4 ? 'text-warning fill-warning' : 'text-warning/40 fill-warning/40'}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-text-primary ml-1">4.9</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Trips</span>
                  <span className="font-medium text-text-primary">1,247</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Vehicle</span>
                  <span className="font-medium text-text-primary">Toyota Camry 2024</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Plate</span>
                  <span className="font-mono font-semibold text-text-primary">AB12 CDE</span>
                </div>
              </div>
            </motion.div>

            {/* Trip Timeline */}
            <motion.div
              initial="hidden"
              animate="visible"
              custom={5}
              variants={fadeUp}
              className="bg-white rounded-xl border border-gray-100 p-6"
            >
              <h2 className="text-lg font-semibold text-text-primary mb-5">Trip Timeline</h2>

              <div className="space-y-0">
                {timeline.map((step, idx) => (
                  <div key={step.label} className="flex gap-3">
                    {/* Left column: icon + connector */}
                    <div className="flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full bg-success/10 flex items-center justify-center">
                        <CheckCircle2 size={16} className="text-success" />
                      </div>
                      {idx < timeline.length - 1 && (
                        <div className="w-0.5 h-6 bg-success/20 rounded-full" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="pb-4">
                      <p className="text-sm font-medium text-text-primary leading-7">{step.label}</p>
                      <p className="text-xs text-text-muted">{step.time}</p>
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
              <Button variant="outline" className="w-full">
                <AlertTriangle size={16} /> Report Issue
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}