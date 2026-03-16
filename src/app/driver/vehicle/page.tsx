'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { useRequireAuth } from '@/lib/use-require-auth';
import { useAuth } from '@/lib/auth-context';
import { driverCarsApi, documentsApi } from '@/lib/services';
import { resolveImageUrl } from '@/lib/api';
import { toast } from '@/lib/toast';
import type { Car as CarType } from '@/lib/types';
import {
  User,
  Car,
  FileText,
  Check,
  Upload,
  Palette,
  Hash,
  Users,
  ChevronDown,
  ArrowLeft,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

const steps = [
  { label: 'Personal Info', icon: User },
  { label: 'Vehicle Details', icon: Car },
  { label: 'Documents', icon: FileText },
];

const carMakes = [
  'Toyota', 'Honda', 'BMW', 'Mercedes', 'Ford', 'Volkswagen',
  'Audi', 'Hyundai', 'Kia', 'Nissan', 'Peugeot', 'Vauxhall', 'Skoda', 'SEAT', 'Tesla',
];

const vehicleTypes = ['Sedan', 'SUV', 'Van', 'Luxury'];

const years = Array.from({ length: 20 }, (_, i) => 2026 - i);

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    ACTIVE: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Active' },
    PENDING: { bg: 'bg-amber-500/10', text: 'text-amber-400', label: 'Pending Approval' },
    ONHOLD: { bg: 'bg-orange-500/10', text: 'text-orange-400', label: 'On Hold' },
    SUSPEND: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Suspended' },
    INACTIVE: { bg: 'bg-white/5', text: 'text-white/40', label: 'Inactive' },
  };
  const s = map[status] || map.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

export default function VehiclePage() {
  const { user } = useRequireAuth();
  const { refreshUser } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [vehiclePhoto, setVehiclePhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    color: '',
    regNumber: '',
    vehicleType: '',
    seats: '',
  });
  const [wheelchairAccessible, setWheelchairAccessible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Existing cars from the driver profile
  const existingCar: CarType | undefined = user?.driver?.car;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Photo must be under 5MB');
      return;
    }
    setVehiclePhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const getDriverId = (): string => {
    if (user?.driver?.id) return user.driver.id;
    return localStorage.getItem('rs_driver_id') || '';
  };

  const handleDeleteCar = async (carId: string) => {
    setDeleting(true);
    try {
      await driverCarsApi.remove(carId);
      await refreshUser();
      setConfirmDelete(null);
      toast.success('Vehicle removed', 'The vehicle has been deleted.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete vehicle.';
      toast.error('Delete failed', msg);
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const driverId = getDriverId();
    if (!driverId) {
      setError('Driver profile not found. Please complete Step 1 first.');
      return;
    }

    setSubmitting(true);
    try {
      let carImageUrl: string | undefined;
      if (vehiclePhoto) {
        const uploaded = await documentsApi.uploadFile(vehiclePhoto);
        carImageUrl = (uploaded as { fileUrl?: string; url?: string })?.fileUrl
          || (uploaded as { url?: string })?.url;
      }

      const createData = {
        make: formData.make,
        model: formData.model,
        year: formData.year,
        color: formData.color,
        numberPlate: formData.regNumber,
        engine: formData.vehicleType || 'Petrol',
        seats: formData.seats ? parseInt(formData.seats, 10) : 4,
        driverId,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: any = await driverCarsApi.create(carImageUrl ? { ...createData, carImage: carImageUrl } as any : createData);

      if (result?.id) {
        localStorage.setItem('rs_car_id', result.id);
      }
      await refreshUser();
      toast.success('Vehicle registered!', 'Proceeding to document uploads...');
      router.push('/driver/documents');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save vehicle details.';
      setError(msg);
      toast.error('Registration failed', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout role="driver" pageTitle="Vehicle Registration">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Progress Bar */}
        <div className="w-full bg-white/[0.06] rounded-full h-2 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
            style={{ width: '66%' }}
          />
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between">
          {steps.map((step, i) => {
            const StepIcon = step.icon;
            const isActive = i === 1;
            const isDone = i < 1;

            return (
              <div key={step.label} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      isDone
                        ? 'bg-secondary/[0.15] border-2 border-secondary text-secondary'
                        : isActive
                        ? 'bg-secondary/[0.15] border-2 border-secondary text-secondary'
                        : 'bg-white/[0.03] text-white/25 border border-white/[0.06]'
                    }`}
                  >
                    {isDone ? <Check size={20} /> : <StepIcon size={20} />}
                  </div>
                  <span
                    className={`text-xs font-semibold whitespace-nowrap hidden sm:block ${
                      isActive ? 'text-secondary' : isDone ? 'text-secondary' : 'text-white/25'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className="flex-1 mx-4">
                    <div
                      className={`h-px rounded-full ${
                        i < 1 ? 'bg-secondary/50' : 'bg-white/[0.06]'
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ═══ EXISTING CAR ═══ */}
        {existingCar && (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                  <Car size={18} className="text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Submitted Vehicle</h3>
                  <p className="text-white/30 text-xs">This car data has been sent for admin approval</p>
                </div>
              </div>
              <StatusBadge status={existingCar.status} />
            </div>

            <div className="flex flex-col md:flex-row gap-5">
              {existingCar.carImage && (
                <div className="w-full md:w-40 h-28 rounded-xl overflow-hidden bg-white/[0.04] shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={resolveImageUrl(existingCar.carImage) ?? undefined} alt="Vehicle" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2">
                <div><p className="text-[11px] text-white/30 uppercase">Make</p><p className="text-sm text-white/80">{existingCar.make || '—'}</p></div>
                <div><p className="text-[11px] text-white/30 uppercase">Model</p><p className="text-sm text-white/80">{existingCar.model || '—'}</p></div>
                <div><p className="text-[11px] text-white/30 uppercase">Year</p><p className="text-sm text-white/80">{existingCar.year || '—'}</p></div>
                <div><p className="text-[11px] text-white/30 uppercase">Color</p><p className="text-sm text-white/80">{existingCar.color || '—'}</p></div>
                <div><p className="text-[11px] text-white/30 uppercase">Reg Plate</p><p className="text-sm text-white/80">{existingCar.numberPlate || '—'}</p></div>
                <div><p className="text-[11px] text-white/30 uppercase">Seats</p><p className="text-sm text-white/80">{existingCar.seats || '—'}</p></div>
              </div>
            </div>

            {/* Delete button */}
            <div className="mt-4 pt-4 border-t border-white/[0.06]">
              {confirmDelete === existingCar.id ? (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/[0.06] border border-red-500/20">
                  <AlertTriangle size={16} className="text-red-400 shrink-0" />
                  <span className="text-red-400 text-sm">Are you sure? This cannot be undone.</span>
                  <div className="ml-auto flex gap-2">
                    <button
                      onClick={() => setConfirmDelete(null)}
                      disabled={deleting}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/[0.06] text-white/60 hover:bg-white/[0.1] transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDeleteCar(existingCar.id)}
                      disabled={deleting}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all disabled:opacity-50"
                    >
                      {deleting ? 'Deleting...' : 'Confirm Delete'}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(existingCar.id)}
                  className="inline-flex items-center gap-2 text-red-400/60 text-sm font-medium hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} /> Delete this vehicle
                </button>
              )}
            </div>
          </div>
        )}

        {/* ═══ NEW CAR FORM ═══ */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 sm:p-10">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white tracking-[-0.01em]">
              {existingCar ? 'Register a New Vehicle' : 'Vehicle Information'}
            </h2>
            <p className="text-white/35 mt-2">
              {existingCar
                ? 'Submit a new vehicle for admin approval'
                : 'Provide details about the vehicle you\'ll be driving'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Make / Model */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="w-full">
                <label className="block text-sm font-medium text-white/40 mb-1.5">
                  Make
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">
                    <Car size={18} />
                  </span>
                  <select
                    name="make"
                    value={formData.make}
                    onChange={handleChange}
                    className="input-field appearance-none cursor-pointer pl-10 pr-10 [&>option]:bg-[#0d1526] [&>option]:text-white"
                  >
                    <option value="">Select make</option>
                    {carMakes.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">
                    <ChevronDown size={18} />
                  </span>
                </div>
              </div>
              <Input
                label="Model"
                name="model"
                icon={Car}
                placeholder="e.g. Corolla, Civic"
                value={formData.model}
                onChange={handleChange}
                required
              />
            </div>

            {/* Year / Color */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="w-full">
                <label className="block text-sm font-medium text-white/40 mb-1.5">
                  Year
                </label>
                <div className="relative">
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="input-field appearance-none cursor-pointer pr-10 [&>option]:bg-[#0d1526] [&>option]:text-white"
                  >
                    <option value="">Select year</option>
                    {years.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">
                    <ChevronDown size={18} />
                  </span>
                </div>
              </div>
              <Input
                label="Color"
                name="color"
                icon={Palette}
                placeholder="e.g. Black, White, Silver"
                value={formData.color}
                onChange={handleChange}
                required
              />
            </div>

            {/* Reg Number / Vehicle Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Registration Number"
                name="regNumber"
                icon={Hash}
                placeholder="AB12 CDE"
                value={formData.regNumber}
                onChange={handleChange}
                required
              />
              <div className="w-full">
                <label className="block text-sm font-medium text-white/40 mb-1.5">
                  Vehicle Type
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">
                    <Car size={18} />
                  </span>
                  <select
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleChange}
                    className="input-field appearance-none cursor-pointer pl-10 pr-10 [&>option]:bg-[#0d1526] [&>option]:text-white"
                  >
                    <option value="">Select type</option>
                    {vehicleTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">
                    <ChevronDown size={18} />
                  </span>
                </div>
              </div>
            </div>

            {/* Seats / Wheelchair */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Number of Seats"
                name="seats"
                type="number"
                icon={Users}
                placeholder="4"
                value={formData.seats}
                onChange={handleChange}
                required
              />
              <div className="w-full">
                <label className="block text-sm font-medium text-white/40 mb-1.5">
                  Wheelchair Accessible
                </label>
                <button
                  type="button"
                  onClick={() => setWheelchairAccessible(!wheelchairAccessible)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border-[1.5px] transition-all duration-200 cursor-pointer ${
                    wheelchairAccessible
                      ? 'border-secondary bg-secondary/[0.08] text-secondary'
                      : 'border-white/10 bg-white/[0.04] text-white/60 hover:border-white/20'
                  }`}
                >
                  <span className="font-medium">
                    {wheelchairAccessible ? 'Yes — Accessible' : 'No — Not Accessible'}
                  </span>
                  <div
                    className={`w-12 h-6 rounded-full flex items-center transition-all duration-200 ${
                      wheelchairAccessible ? 'bg-secondary justify-end' : 'bg-white/10 justify-start'
                    }`}
                  >
                    <div className="w-5 h-5 bg-white rounded-full shadow mx-0.5" />
                  </div>
                </button>
              </div>
            </div>

            {/* Vehicle Photo Upload */}
            <div className="w-full">
              <label className="block text-sm font-medium text-white/40 mb-1.5">
                Vehicle Photo
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handlePhotoSelect}
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-secondary/50 hover:bg-secondary/[0.04] transition-all duration-300 cursor-pointer group"
              >
                {photoPreview ? (
                  <div className="flex flex-col items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photoPreview} alt="Vehicle preview" className="w-32 h-24 object-cover rounded-lg" />
                    <p className="text-sm text-secondary font-medium">{vehiclePhoto?.name || 'Current photo'}</p>
                    <p className="text-xs text-white/35">Click to change photo</p>
                  </div>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-full bg-white/[0.04] group-hover:bg-secondary/10 flex items-center justify-center mx-auto mb-4 transition-colors">
                      <Upload size={24} className="text-white/40 group-hover:text-secondary transition-colors" />
                    </div>
                    <p className="text-white font-semibold mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-white/35 text-sm">
                      PNG, JPG or WEBP (max. 5MB)
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
            )}

            {/* Buttons */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-6 border-t border-white/[0.06]">
              <Button variant="outline" href="/driver">
                <ArrowLeft size={18} />
                Back
              </Button>
              <button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 bg-secondary text-dark font-semibold px-5 py-3 rounded-xl text-sm hover:bg-secondary-light transition-all disabled:opacity-50">
                {submitting ? 'Saving...' : existingCar ? 'Register New Vehicle' : 'Next: Documents'}
                <FileText size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
