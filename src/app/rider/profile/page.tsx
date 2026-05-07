'use client';

import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
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
  Loader2,
  LogOut,
  Camera,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/lib/use-require-auth';
import { authApi } from '@/lib/services/auth';
import { documentsApi } from '@/lib/services/documents';
import { ApiError, resolveImageUrl } from '@/lib/api';

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
        className={`absolute left-0 top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-200 ${
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
  const { user } = useRequireAuth();
  const { refreshUser, logout } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [preferredVehicle, setPreferredVehicle] = useState('economy');
  const [defaultPayment, setDefaultPayment] = useState('cash');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const [notifRideUpdates, setNotifRideUpdates] = useState(true);
  const [notifPromotions, setNotifPromotions] = useState(true);
  const [notifPaymentAlerts, setNotifPaymentAlerts] = useState(true);
  const [notifEmail, setNotifEmail] = useState(false);

  // Populate from user
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setPhone(user.phone_number || '');
      setAddress((user as any).address || '');
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      await authApi.updateCurrentUser({
        firstName,
        lastName,
        phone_number: phone,
        address,
      } as any);
      await refreshUser();
      setSaveMsg('Profile updated successfully!');
    } catch (err) {
      setSaveMsg(err instanceof ApiError ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(''), 3000);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setSaveMsg('Photo must be under 5 MB');
      setTimeout(() => setSaveMsg(''), 3000);
      return;
    }
    setUploadingPhoto(true);
    setSaveMsg('');
    try {
      // Show preview immediately from the file
      const preview = URL.createObjectURL(file);
      setLocalPreview(preview);
      setImgError(false);

      const res = await documentsApi.uploadFile(file) as { fileUrl?: string };
      const fileUrl = res?.fileUrl;
      if (!fileUrl) throw new Error('Upload failed');
      await authApi.updateCurrentUser({ coverImage: fileUrl });
      await refreshUser();
      setSaveMsg('Photo updated successfully!');
    } catch (err) {
      setLocalPreview(null);
      setSaveMsg(err instanceof ApiError ? err.message : 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
      setTimeout(() => setSaveMsg(''), 3000);
    }
  };

  const initials = user ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() : 'RS';
  const email = user?.emailAddress || '';
  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : '';

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
    <DashboardLayout role="rider" pageTitle="My Profile">
      {/* ── Profile Header ──────────────────────────────────────── */}
      <div className="bg-white/[0.02] rounded-2xl p-6 sm:p-8 border border-white/[0.06] mb-8 hover:bg-white/[0.04] transition-all">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative group">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handlePhotoUpload}
            />
            {(localPreview || resolveImageUrl(user?.coverImage || user?.profileImageUrl)) && !imgError ? (
              <img
                src={localPreview || resolveImageUrl(user?.coverImage || user?.profileImageUrl)!}
                alt="Profile"
                onError={() => { setLocalPreview(null); setImgError(true); }}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-secondary/20"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-3xl font-bold text-white shrink-0 ring-4 ring-secondary/20">
                {initials}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
            >
              {uploadingPhoto ? (
                <Loader2 size={20} className="text-white animate-spin" />
              ) : (
                <Camera size={20} className="text-white" />
              )}
            </button>
          </div>

          <div className="text-center sm:text-left flex-1">
            <h2 className="text-2xl font-bold text-white">{firstName} {lastName}</h2>
            <p className="text-white/60 mt-0.5">{email}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-sm text-white/40">
              {memberSince && (
                <span className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.04] px-3 py-1 rounded-full">
                  <Calendar size={14} className="text-secondary" /> Member since {memberSince}
                </span>
              )}
              <span className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.04] px-3 py-1 rounded-full">
                <Car size={14} className="text-secondary" /> {user?.ratings?.toFixed(1) || '0'} rating
              </span>
            </div>
          </div>
        </div>
      </div>

      {saveMsg && (
        <div className={`rounded-xl p-4 text-sm mb-6 ${saveMsg.includes('success') ? 'bg-secondary/10 border border-secondary/20 text-secondary' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
          {saveMsg}
        </div>
      )}

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
                value={user?.emailAddress || ''}
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
                <Button variant="green" size="lg" onClick={handleSave} disabled={saving}>
                  {saving ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : <><Save size={18} /> Save Changes</>}
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

          {/* ── Logout ──────────────────────────────────────────── */}
          <button
            onClick={() => { logout(); router.push('/login'); }}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-white/[0.02] border border-white/5 text-white/60 hover:text-error hover:border-error/30 hover:bg-error/5 transition-all"
          >
            <LogOut size={18} />
            <span className="text-sm font-semibold">Logout</span>
          </button>

          {/* ── Become a Driver ──────────────────────────────────── */}
          {!user?.driver && (
            <div className="bg-gradient-to-br from-secondary/[0.06] to-accent/[0.04] rounded-2xl p-6 border border-secondary/20">
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Car size={18} className="text-secondary" />
                </div>
                Become a Driver
              </h3>
              <p className="text-sm text-white/40 mb-4 leading-relaxed">
                Earn on your own schedule. Register as a driver and start accepting rides.
              </p>
              <Button variant="green" size="md" href="/driver" className="w-full">
                <Car size={16} /> Start Registration
              </Button>
            </div>
          )}

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
              href="/delete-account"
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
