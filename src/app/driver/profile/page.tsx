'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/button';
import { useRequireAuth } from '@/lib/use-require-auth';
import { driverApi } from '@/lib/services';
import { resolveImageUrl } from '@/lib/api';
import type { Driver, Car, Document as DriverDocument } from '@/lib/types';
import {
  User,
  Car as CarIcon,
  FileText,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Hash,
  Heart,
  Building2,
  Star,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  CreditCard,
  Palette,
  Users,
  Trash2,
} from 'lucide-react';

/* ── Status badge ── */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    ACTIVE: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Active' },
    PENDING: { bg: 'bg-amber-500/10', text: 'text-amber-400', label: 'Pending' },
    ONHOLD: { bg: 'bg-orange-500/10', text: 'text-orange-400', label: 'On Hold' },
    SUSPEND: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Suspended' },
    INACTIVE: { bg: 'bg-white/5', text: 'text-white/40', label: 'Inactive' },
  };
  const s = map[status] || map.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.text === 'text-emerald-400' ? 'bg-emerald-400' : s.text === 'text-amber-400' ? 'bg-amber-400' : s.text === 'text-orange-400' ? 'bg-orange-400' : s.text === 'text-red-400' ? 'bg-red-400' : 'bg-white/40'}`} />
      {s.label}
    </span>
  );
}

/* ── Doc verification badge ── */
function DocBadge({ details }: { details?: { isVerified?: boolean; isSubmitted?: boolean; status?: string; isReturned?: boolean } }) {
  if (!details) return <span className="text-white/20 text-xs">Not submitted</span>;
  if (details.isVerified) return (
    <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-semibold">
      <CheckCircle size={14} /> Verified
    </span>
  );
  if (details.status === 'Rejected' || details.isReturned) return (
    <span className="inline-flex items-center gap-1 text-red-400 text-xs font-semibold">
      <XCircle size={14} /> Rejected
    </span>
  );
  if (details.isSubmitted) return (
    <span className="inline-flex items-center gap-1 text-amber-400 text-xs font-semibold">
      <Clock size={14} /> Pending Review
    </span>
  );
  return <span className="text-white/20 text-xs">Not submitted</span>;
}

/* ── Info row ── */
function InfoRow({ icon: Icon, label, value }: { icon: typeof User; label: string; value?: string | null }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0">
        <Icon size={15} className="text-white/30" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-white/30 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-sm text-white/80 mt-0.5 break-all">{value || '—'}</p>
      </div>
    </div>
  );
}

export default function DriverProfilePage() {
  const { user } = useRequireAuth();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!user?.driver?.id) { setLoading(false); return; }
    try {
      const res = await driverApi.getById(user.driver.id);
      // unwrap if wrapped
      const d = (res as unknown as { data?: Driver })?.data ?? res;
      setDriver(d);
    } catch { /* silent */ }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  if (loading) {
    return (
      <DashboardLayout role="driver" pageTitle="Profile">
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!driver) {
    return (
      <DashboardLayout role="driver" pageTitle="Profile">
        <div className="max-w-2xl mx-auto text-center py-24">
          <AlertCircle size={48} className="text-white/20 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No Driver Profile</h2>
          <p className="text-white/40 mb-6">Complete your driver registration to view your profile.</p>
          <Link href="/driver" className="inline-flex items-center gap-2 bg-white text-black font-semibold px-6 py-3 rounded-full text-sm hover:shadow-[0_0_30px_rgba(255,255,255,0.12)] transition-all">
            Start Registration
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const userInfo = driver.userInfo || user;
  const cars = driver.cars || [];
  const activeCar = cars.find(c => c.status === 'ACTIVE') || cars[0] || null;
  const doc = driver.document;
  const carDoc = activeCar?.carDocument;
  const assignedPackages = Array.isArray(driver.packageInfos)
    ? driver.packageInfos.map((pkg) => pkg.name).filter(Boolean)
    : [];
  const assignedCompany = driver.companyInfo?.companyName;

  const personalDocs = [
    { name: 'Driving License', details: doc?.drivingLicense?.details, hasDoc: !!doc?.drivingLicense?.licenseDocFront },
    { name: 'PCO Badge', details: doc?.pcoDocuments?.details, hasDoc: !!doc?.pcoDocuments?.pcoBadgeDocFront },
    { name: 'Passport', details: doc?.passport?.details, hasDoc: !!doc?.passport?.passportDocFront },
    { name: 'Bank Details', details: doc?.bankDocuments?.details, hasDoc: !!doc?.bankDocuments?.sortCode },
    { name: 'Address Proof', details: doc?.addressProfDocs?.details, hasDoc: !!doc?.addressProfDocs?.addressProfDoc },
  ];

  const vehicleDocs = [
    { name: 'MOT Certificate', details: carDoc?.motDocument?.details, hasDoc: !!carDoc?.motDocument?.motDoc },
    { name: 'Insurance', details: carDoc?.insuranceDocument?.details, hasDoc: !!carDoc?.insuranceDocument?.insuranceDoc },
    { name: 'PCO Vehicle License', details: carDoc?.pCOVehicleLicense?.details, hasDoc: !!carDoc?.pCOVehicleLicense?.pcoVehicleLicenseDoc },
    { name: 'Vehicle Log Book', details: carDoc?.vehicleLogBook?.details, hasDoc: !!carDoc?.vehicleLogBook?.vehicleLogBookDoc },
  ];

  return (
    <DashboardLayout role="driver" pageTitle="Profile">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ═══ HEADER CARD ═══ */}
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-secondary/[0.06] rounded-full blur-[80px] pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center shrink-0 overflow-hidden">
              {(userInfo?.coverImage || userInfo?.profileImageUrl) && !imgError ? (
                <img src={resolveImageUrl(userInfo.coverImage || userInfo.profileImageUrl) ?? undefined} alt="Profile" onError={() => setImgError(true)} className="w-full h-full object-cover" />
              ) : (
                <User size={32} className="text-white/30" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-2xl font-black text-white">
                  {userInfo?.firstName} {userInfo?.lastName}
                </h1>
                <StatusBadge status={driver.status} />
              </div>
              <p className="text-white/40 text-sm">{userInfo?.emailAddress}</p>
              <div className="flex flex-wrap items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5">
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-white text-sm font-bold">{driver.ratings?.toFixed(1) ?? '5.0'}</span>
                </div>
                <span className="text-white/10">·</span>
                <span className="text-white/40 text-sm">{driver.totalJobComplete} rides completed</span>
                <span className="text-white/10">·</span>
                <span className="text-white/40 text-sm capitalize">{driver.subscription?.toLowerCase()} plan</span>
              </div>
            </div>

          </div>
        </div>

        {/* ═══ PERSONAL INFO + DRIVER STATUS ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Info */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center">
                <User size={18} className="text-secondary" />
              </div>
              <h2 className="text-lg font-bold text-white">Personal Information</h2>
            </div>
            <div className="space-y-0.5">
              <InfoRow icon={Mail} label="Email" value={userInfo?.emailAddress} />
              <InfoRow icon={Phone} label="Phone" value={userInfo?.phone_number} />
              <InfoRow icon={Calendar} label="Date of Birth" value={driver.dateOfBirth ? new Date(driver.dateOfBirth).toLocaleDateString('en-GB') : undefined} />
              <InfoRow icon={Hash} label="NI Number" value={driver.nationalInsuranceNumber} />
              <InfoRow icon={Hash} label="Tax ID" value={driver.selfAssessmentTaxId} />
              <InfoRow icon={MapPin} label="Address" value={driver.address} />
              <InfoRow icon={Building2} label="City" value={driver.city} />
              <InfoRow icon={MapPin} label="Postcode" value={driver.postcode} />
              <InfoRow icon={Heart} label="Bio" value={driver.bio} />
              <InfoRow icon={Heart} label="Hobby" value={driver.hobby} />
            </div>
          </div>

          {/* Driver Status */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Shield size={18} className="text-accent" />
                </div>
                <h2 className="text-lg font-bold text-white">Driver Status</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <span className="text-white/40 text-sm">Account Status</span>
                  <StatusBadge status={driver.status} />
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-white/40 text-sm">Deposit Paid</span>
                  {driver.depositPaid ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-semibold"><CheckCircle size={14} /> Yes (£{driver.depositAmount?.toFixed(2)})</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-400 text-xs font-semibold"><XCircle size={14} /> No</span>
                  )}
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-white/40 text-sm">Commission Rate</span>
                  <span className="text-white/80 text-sm font-semibold">{((driver.commissionPercentage || 0) * 100).toFixed(0)}%</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-white/40 text-sm">Rating</span>
                  <div className="flex items-center gap-1.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className={i < Math.round(driver.ratings || 5) ? 'text-yellow-400 fill-yellow-400' : 'text-white/10'} />
                    ))}
                    <span className="text-white/60 text-sm ml-1">{driver.ratings?.toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-white/40 text-sm">Total Rides</span>
                  <span className="text-white/80 text-sm font-semibold">{driver.totalJobComplete}</span>
                </div>
                <div className="flex items-center justify-between py-2 gap-4">
                  <span className="text-white/40 text-sm">Assigned Company</span>
                  <span className="text-white/80 text-sm font-semibold text-right break-words">
                    {assignedCompany || 'Not assigned'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 gap-4">
                  <span className="text-white/40 text-sm">Assigned Packages</span>
                  <span className="text-white/80 text-sm font-semibold text-right break-words">
                    {assignedPackages.length ? assignedPackages.join(', ') : 'None'}
                  </span>
                </div>
              </div>
            </div>

            {/* Member Since */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
              <div className="flex items-center justify-between">
                <span className="text-white/40 text-sm">Member Since</span>
                <span className="text-white/80 text-sm font-semibold">
                  {new Date(driver.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ VEHICLE INFO ═══ */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                <CarIcon size={18} className="text-indigo-400" />
              </div>
              <h2 className="text-lg font-bold text-white">Vehicle Information</h2>
            </div>
          </div>
          {cars.length > 0 ? (
            <div className="space-y-4">
              {cars.map((car) => (
              <div key={car.id} className="flex flex-col md:flex-row gap-6 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              {car.carImage && (
                <div className="w-full md:w-48 h-36 rounded-xl overflow-hidden bg-white/[0.04] shrink-0">
                  <img src={resolveImageUrl(car.carImage) ?? undefined} alt="Vehicle" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4">
                <InfoRow icon={CarIcon} label="Make" value={car.make} />
                <InfoRow icon={CarIcon} label="Model" value={car.model} />
                <InfoRow icon={Calendar} label="Year" value={car.year} />
                <InfoRow icon={Palette} label="Color" value={car.color} />
                <InfoRow icon={CreditCard} label="Reg Plate" value={car.numberPlate} />
                <InfoRow icon={Users} label="Seats" value={car.seats?.toString()} />
                <div className="flex items-start gap-3 py-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0">
                    <Shield size={15} className="text-white/30" />
                  </div>
                  <div>
                    <p className="text-[11px] text-white/30 font-medium uppercase tracking-wider">Status</p>
                    <div className="mt-0.5"><StatusBadge status={car.status} /></div>
                  </div>
                </div>
              </div>
              </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CarIcon size={32} className="text-white/10 mx-auto mb-3" />
              <p className="text-white/30 text-sm mb-4">No vehicle registered yet</p>
              <Link href="/driver/vehicle" className="text-secondary text-sm font-semibold hover:underline">
                Register Vehicle →
              </Link>
            </div>
          )}
        </div>

        {/* ═══ APPROVED DOCUMENTS ═══ */}
        {(() => {
          const missingPersonal = personalDocs.filter((d) => !d.hasDoc);
          const missingVehicle = vehicleDocs.filter((d) => !d.hasDoc);
          const hasMissing = missingPersonal.length > 0 || missingVehicle.length > 0;

          return (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Documents */}
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
                      <FileText size={18} className="text-amber-400" />
                    </div>
                    <h2 className="text-lg font-bold text-white">Personal Documents</h2>
                  </div>
                  {personalDocs.some(d => d.hasDoc) ? (
                    <div className="space-y-3">
                      {personalDocs.filter(d => d.hasDoc).map((d) => (
                        <div key={d.name} className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                          <div className="flex items-center gap-3">
                            <FileText size={16} className="text-white/40" />
                            <span className="text-sm font-medium text-white/70">{d.name}</span>
                          </div>
                          <DocBadge details={d.details} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white/30 text-sm text-center py-6">No documents uploaded yet</p>
                  )}
                </div>

                {/* Vehicle Documents */}
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                      <FileText size={18} className="text-indigo-400" />
                    </div>
                    <h2 className="text-lg font-bold text-white">Vehicle Documents</h2>
                  </div>
                  {activeCar && vehicleDocs.some(d => d.hasDoc) ? (
                    <div className="space-y-3">
                      {vehicleDocs.filter(d => d.hasDoc).map((d) => (
                        <div key={d.name} className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                          <div className="flex items-center gap-3">
                            <FileText size={16} className="text-white/40" />
                            <span className="text-sm font-medium text-white/70">{d.name}</span>
                          </div>
                          <DocBadge details={d.details} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white/30 text-sm text-center py-6">
                      {activeCar ? 'No vehicle documents uploaded yet' : 'Register a vehicle first'}
                    </p>
                  )}
                </div>
              </div>

              {/* ═══ MISSING / PENDING ITEMS ═══ */}
              {hasMissing && driver.status !== 'ACTIVE' && (
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
                      <AlertCircle size={18} className="text-amber-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">Pending Approval</h2>
                      <p className="text-white/40 text-xs">These items need to be submitted or approved before your account is activated</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {cars.length === 0 && (
                      <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-white/[0.02]">
                        <XCircle size={14} className="text-red-400 shrink-0" />
                        <span className="text-white/60 text-sm">Vehicle registration required</span>
                      </div>
                    )}
                    {missingPersonal.map((d) => (
                      <div key={d.name} className="flex items-center gap-2 py-2 px-3 rounded-lg bg-white/[0.02]">
                        {d.details?.isSubmitted ? (
                          <Clock size={14} className="text-amber-400 shrink-0" />
                        ) : d.details?.isReturned || d.details?.status === 'Rejected' ? (
                          <XCircle size={14} className="text-red-400 shrink-0" />
                        ) : (
                          <AlertCircle size={14} className="text-white/30 shrink-0" />
                        )}
                        <span className="text-white/60 text-sm">{d.name}</span>
                        <span className="ml-auto text-xs text-white/30">
                          {d.details?.isSubmitted ? 'Pending review' : d.details?.isReturned || d.details?.status === 'Rejected' ? 'Rejected' : 'Not submitted'}
                        </span>
                      </div>
                    ))}
                    {activeCar && missingVehicle.map((d) => (
                      <div key={d.name} className="flex items-center gap-2 py-2 px-3 rounded-lg bg-white/[0.02]">
                        {d.details?.isSubmitted ? (
                          <Clock size={14} className="text-amber-400 shrink-0" />
                        ) : d.details?.isReturned || d.details?.status === 'Rejected' ? (
                          <XCircle size={14} className="text-red-400 shrink-0" />
                        ) : (
                          <AlertCircle size={14} className="text-white/30 shrink-0" />
                        )}
                        <span className="text-white/60 text-sm">{d.name}</span>
                        <span className="ml-auto text-xs text-white/30">
                          {d.details?.isSubmitted ? 'Pending review' : d.details?.isReturned || d.details?.status === 'Rejected' ? 'Rejected' : 'Not submitted'}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-center">
                    <Link href="/driver/documents" className="text-secondary text-sm font-semibold hover:underline">
                      Upload Missing Documents →
                    </Link>
                  </div>
                </div>
              )}
            </>
          );
        })()}

        {/* ── Danger Zone ──────────────────────────────────────── */}
        <div className="bg-white/[0.02] rounded-2xl p-6 border border-red-500/30">
          <h3 className="text-lg font-semibold text-red-400 mb-2 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <Trash2 size={18} className="text-red-400" />
            </div>
            Danger Zone
          </h3>
          <p className="text-sm text-white/40 mb-5 leading-relaxed">
            Once you delete your account, all of your data will be permanently removed. This action cannot be
            undone.
          </p>
          <Button
            variant="outline"
            size="md"
            href="/delete-account"
            className="!border-red-500 !text-red-400 hover:!bg-red-500 hover:!text-white w-full"
          >
            <Trash2 size={16} /> Delete Account
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
