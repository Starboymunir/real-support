'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Trash2,
  Car,
  CreditCard,
  Bell,
  Save,
  ChevronRight,
  Lock,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Toggle Switch                                                      */
/* ------------------------------------------------------------------ */

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
        checked ? 'bg-secondary' : 'bg-white/[0.1]'
      }`}
    >
      <span
        className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function RiderProfilePage() {
  const [firstName, setFirstName] = useState('John');
  const [lastName, setLastName] = useState('Doe');
  const [phone, setPhone] = useState('+44 7700 900123');
  const [address, setAddress] = useState('12 Baker Street, London W1U 3BU');
  const [preferredVehicle, setPreferredVehicle] = useState('economy');
  const [defaultPayment, setDefaultPayment] = useState('cash');

  const [notifRideUpdates, setNotifRideUpdates] = useState(true);
  const [notifPromotions, setNotifPromotions] = useState(true);
  const [notifPaymentAlerts, setNotifPaymentAlerts] = useState(true);
  const [notifEmail, setNotifEmail] = useState(false);

  const toggles = [
    {
      label: 'Ride Updates',
      desc: 'Real-time status updates for your rides',
      checked: notifRideUpdates,
      toggle: () => setNotifRideUpdates((v) => !v),
    },
    {
      label: 'Promotions & Discounts',
      desc: 'Exclusive offers and promotional codes',
      checked: notifPromotions,
      toggle: () => setNotifPromotions((v) => !v),
    },
    {
      label: 'Payment Alerts',
      desc: 'Receipts, refunds and payment confirmations',
      checked: notifPaymentAlerts,
      toggle: () => setNotifPaymentAlerts((v) => !v),
    },
    {
      label: 'Email Notifications',
      desc: 'Receive all notifications via email',
      checked: notifEmail,
      toggle: () => setNotifEmail((v) => !v),
    },
  ];

  return (
    <DashboardLayout role="rider" userName="John Doe" pageTitle="My Profile">
      {/* ── Profile Header ──────────────────────────────────────── */}
      <div className="bg-white/[0.02] rounded-2xl p-6 sm:p-8 border border-white/[0.06] mb-8 hover:bg-white/[0.04] transition-all">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-3xl font-bold text-white shrink-0 ring-4 ring-secondary/20">
            JD
          </div>

          <div className="text-center sm:text-left flex-1">
            <h2 className="text-2xl font-bold text-white">John Doe</h2>
            <p className="text-white/60 mt-0.5">john.doe@email.com</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-sm text-white/40">
              <span className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.04] px-3 py-1 rounded-full">
                <Calendar size={14} className="text-secondary" /> Member since Jan 2025
              </span>
              <span className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.04] px-3 py-1 rounded-full">
                <Car size={14} className="text-secondary" /> 24 rides
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* ════════ Left Column (2/3) ════════════════════════════ */}
        <div className="lg:col-span-2 space-y-8">
          {/* ── Personal Information ─────────────────────────────── */}
          <div className="bg-white/[0.02] rounded-2xl p-6 sm:p-8 border border-white/[0.06] hover:bg-white/[0.04] transition-all">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                <User size={18} className="text-secondary" />
              </div>
              Personal Information
            </h3>

            <div className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <Input
                  label="First Name"
                  icon={User}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                <Input
                  label="Last Name"
                  icon={User}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>

              <Input
                label="Email"
                type="email"
                icon={Mail}
                value="john.doe@email.com"
                disabled
                className="bg-white/[0.02] cursor-not-allowed opacity-50"
              />

              <Input
                label="Phone Number"
                type="tel"
                icon={Phone}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <Input
                label="Address"
                icon={MapPin}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />

              <div className="pt-2">
                <Button variant="green" size="lg">
                  <Save size={18} /> Save Changes
                </Button>
              </div>
            </div>
          </div>

          {/* ── Ride Preferences ─────────────────────────────────── */}
          <div className="bg-white/[0.02] rounded-2xl p-6 sm:p-8 border border-white/[0.06] hover:bg-white/[0.04] transition-all">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Car size={18} className="text-secondary" />
              </div>
              Ride Preferences
            </h3>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white mb-1.5">
                  Preferred Vehicle Type
                </label>
                <select
                  value={preferredVehicle}
                  onChange={(e) => setPreferredVehicle(e.target.value)}
                  className="input-field appearance-none cursor-pointer"
                >
                  <option value="economy">Economy</option>
                  <option value="comfort">Comfort</option>
                  <option value="premium">Premium</option>
                  <option value="xl">XL / Van</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1.5">
                  Default Payment Method
                </label>
                <select
                  value={defaultPayment}
                  onChange={(e) => setDefaultPayment(e.target.value)}
                  className="input-field appearance-none cursor-pointer"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card on file</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── Notification Preferences ─────────────────────────── */}
          <div className="bg-white/[0.02] rounded-2xl p-6 sm:p-8 border border-white/[0.06] hover:bg-white/[0.04] transition-all">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <Bell size={18} className="text-accent" />
              </div>
              Notification Preferences
            </h3>

            <div className="space-y-3">
              {toggles.map((n) => (
                <div
                  key={n.label}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.04] transition-colors"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{n.label}</p>
                    <p className="text-xs text-white/40 mt-0.5">{n.desc}</p>
                  </div>
                  <Toggle checked={n.checked} onChange={n.toggle} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ════════ Right Column (1/3) ═══════════════════════════ */}
        <div className="space-y-6">
          {/* ── Account Card ─────────────────────────────────────── */}
          <div className="bg-white/[0.02] rounded-2xl p-6 border border-white/[0.06] hover:bg-white/[0.04] transition-all">
            <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Shield size={18} className="text-secondary" />
              </div>
              Account
            </h3>

            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors text-left group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <Lock size={16} className="text-secondary" />
                  </div>
                  <span className="text-sm font-semibold text-white">Change Password</span>
                </div>
                <ChevronRight size={16} className="text-white/40 group-hover:text-secondary transition-colors" />
              </button>

              <button className="w-full flex items-center justify-between p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors text-left group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <CreditCard size={16} className="text-secondary" />
                  </div>
                  <span className="text-sm font-semibold text-white">Payment Methods</span>
                </div>
                <ChevronRight size={16} className="text-white/40 group-hover:text-secondary transition-colors" />
              </button>
            </div>
          </div>

          {/* ── Danger Zone ──────────────────────────────────────── */}
          <div className="bg-white/[0.02] rounded-2xl p-6 border border-error/30">
            <h3 className="text-lg font-semibold text-error mb-2 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-error/10 flex items-center justify-center">
                <Trash2 size={18} className="text-error" />
              </div>
              Danger Zone
            </h3>
            <p className="text-sm text-white/40 mb-5 leading-relaxed">
              Once you delete your account, all of your data will be permanently removed. This action cannot be undone.
            </p>
            <Button
              variant="outline"
              size="md"
              className="!border-error !text-error hover:!bg-error hover:!text-white w-full"
            >
              <Trash2 size={16} /> Delete Account
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
