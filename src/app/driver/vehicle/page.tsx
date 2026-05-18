'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
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
  ArrowRight,
  Trash2,
  AlertTriangle,
  Shield,
  FileCheck,
  Clock,
  XCircle,
  AlertCircle,
  Calendar,
  Info,
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

type DocStatus = 'approved' | 'pending' | 'rejected' | 'not_uploaded';

interface VehicleDocument {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  status: DocStatus;
  expiry?: string;
  rejectionMessage?: string;
  fileName?: string;
}

const initialVehicleDocuments: VehicleDocument[] = [
  {
    id: 'vehicle-insurance',
    label: 'Vehicle Insurance',
    description: 'Valid hire & reward or fleet insurance certificate',
    icon: Shield,
    status: 'not_uploaded',
  },
  {
    id: 'mot-certificate',
    label: 'MOT Certificate',
    description: 'Current MOT certificate for your vehicle',
    icon: FileCheck,
    status: 'not_uploaded',
  },
  {
    id: 'pco-vehicle-license',
    label: 'PCO Vehicle License',
    description: 'Private Hire Vehicle license for your vehicle',
    icon: FileCheck,
    status: 'not_uploaded',
  },
  {
    id: 'vehicle-log-book',
    label: 'Vehicle Log Book',
    description: 'V5C vehicle registration certificate (log book)',
    icon: FileText,
    status: 'not_uploaded',
  },
];

const statusConfig: Record<DocStatus, { label: string; color: string; bgColor: string; borderColor: string; icon: React.ElementType }> = {
  approved: { label: 'Approved', color: 'text-green-400', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/20', icon: Check },
  pending: { label: 'Pending Review', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/20', icon: Clock },
  rejected: { label: 'Rejected', color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/20', icon: XCircle },
  not_uploaded: { label: 'Not Uploaded', color: 'text-white/40', bgColor: 'bg-white/[0.03]', borderColor: 'border-white/[0.08]', icon: AlertCircle },
};

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

  // Vehicle documents state
  const [vehicleDocs, setVehicleDocs] = useState<VehicleDocument[]>(initialVehicleDocuments);
  const [docUploading, setDocUploading] = useState<string | null>(null);
  const [docUploadError, setDocUploadError] = useState('');
  const [docDates, setDocDates] = useState<Record<string, string>>({});

  // Existing cars from the driver profile
  const existingCars: CarType[] = user?.driver?.cars || [];

  const getCarId = (): string => {
    const cars = user?.driver?.cars;
    if (cars?.length) return cars[cars.length - 1].id;
    return localStorage.getItem('rs_car_id') || '';
  };

  // Fetch vehicle documents from API
  const fetchVehicleDocs = useCallback(async () => {
    const carId = getCarId();
    if (!carId) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const carDoc: any = await documentsApi.getCarDocuments(carId);

      const mapDocStatus = (status?: string): DocStatus => {
        if (!status) return 'not_uploaded';
        const s = status.toLowerCase();
        if (s === 'approved' || s === 'verified') return 'approved';
        if (s === 'pending' || s === 'submitted') return 'pending';
        if (s === 'rejected') return 'rejected';
        return 'not_uploaded';
      };

      const fieldMap: Record<string, { field: string; expiryKey?: string }> = {
        'vehicle-insurance': { field: 'insuranceDocument', expiryKey: 'insuranceExpiryDate' },
        'mot-certificate': { field: 'motDocument' },
        'pco-vehicle-license': { field: 'pCOVehicleLicense' },
        'vehicle-log-book': { field: 'vehicleLogBook' },
      };

      setVehicleDocs(prev => prev.map(doc => {
        const mapping = fieldMap[doc.id];
        if (!mapping || !carDoc) return doc;
        const sub = carDoc[mapping.field];
        if (!sub) return doc;
        const details = sub.details;
        const status = details?.status || (details?.isSubmitted ? 'Pending' : null);
        if (!status) return doc;
        return {
          ...doc,
          status: mapDocStatus(status),
          expiry: mapping.expiryKey ? sub[mapping.expiryKey] : doc.expiry,
          rejectionMessage: details?.rejectionReason || doc.rejectionMessage,
        };
      }));
    } catch { /* keep initial */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => { fetchVehicleDocs(); }, [fetchVehicleDocs]);

  const handleDocUpload = async (docId: string, file: File) => {
    const carId = getCarId();
    if (!carId) {
      setDocUploadError('Vehicle not found. Please register a vehicle first.');
      return;
    }
    setDocUploading(docId);
    setDocUploadError('');
    try {
      const uploaded = await documentsApi.uploadFile(file);
      const fileUrl = (uploaded as { fileUrl?: string; url?: string })?.fileUrl
        || (uploaded as { url?: string })?.url || '';
      if (!fileUrl) throw new Error('File upload failed — no URL returned');

      switch (docId) {
        case 'vehicle-insurance':
          await documentsApi.uploadInsurance({
            carId,
            insuranceDoc: fileUrl,
            ...(docDates['vehicle-insurance'] ? { insuranceExpiryDate: new Date(docDates['vehicle-insurance']).toISOString() } : {}),
          });
          break;
        case 'mot-certificate':
          await documentsApi.uploadMot({
            carId,
            motDoc: fileUrl,
            ...(docDates['mot-certificate'] ? { motPassDate: new Date(docDates['mot-certificate']).toISOString() } : {}),
          });
          break;
        case 'pco-vehicle-license':
          await documentsApi.uploadCarPCO({
            carId,
            pcoVehicleLicenseDoc: fileUrl,
            ...(docDates['pco-vehicle-license'] ? { pcoVehicleLicenseExpiryDate: new Date(docDates['pco-vehicle-license']).toISOString() } : {}),
          });
          break;
        case 'vehicle-log-book':
          await documentsApi.uploadCarLogBook({
            carId,
            vehicleLogBookDoc: fileUrl,
          });
          break;
      }

      setVehicleDocs(prev => prev.map(d =>
        d.id === docId ? { ...d, fileName: file.name, status: 'pending' as DocStatus } : d
      ));
    } catch (err) {
      setDocUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setDocUploading(null);
    }
  };

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

        {/* ═══ EXISTING CARS ═══ */}
        {existingCars.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Your Vehicles ({existingCars.length})</h3>
            {existingCars.map((ec) => (
            <div key={ec.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                  <Car size={18} className="text-indigo-400" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-white truncate">{ec.make} {ec.model}</h3>
                  <p className="text-white/30 text-xs truncate">{ec.numberPlate} · {ec.year}</p>
                </div>
              </div>
              <div className="shrink-0"><StatusBadge status={ec.status} /></div>
            </div>

            <div className="flex flex-col md:flex-row gap-5">
              {ec.carImage && (
                <div className="w-full md:w-40 h-28 rounded-xl overflow-hidden bg-white/[0.04] shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={resolveImageUrl(ec.carImage) ?? undefined} alt="Vehicle" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2">
                <div><p className="text-[11px] text-white/30 uppercase">Make</p><p className="text-sm text-white/80">{ec.make || '—'}</p></div>
                <div><p className="text-[11px] text-white/30 uppercase">Model</p><p className="text-sm text-white/80">{ec.model || '—'}</p></div>
                <div><p className="text-[11px] text-white/30 uppercase">Year</p><p className="text-sm text-white/80">{ec.year || '—'}</p></div>
                <div><p className="text-[11px] text-white/30 uppercase">Color</p><p className="text-sm text-white/80">{ec.color || '—'}</p></div>
                <div><p className="text-[11px] text-white/30 uppercase">Reg Plate</p><p className="text-sm text-white/80">{ec.numberPlate || '—'}</p></div>
                <div><p className="text-[11px] text-white/30 uppercase">Seats</p><p className="text-sm text-white/80">{ec.seats || '—'}</p></div>
              </div>
            </div>

            {/* Delete button */}
            <div className="mt-4 pt-4 border-t border-white/[0.06]">
              {confirmDelete === ec.id ? (
                <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-red-500/[0.06] border border-red-500/20">
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
                      onClick={() => handleDeleteCar(ec.id)}
                      disabled={deleting}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all disabled:opacity-50"
                    >
                      {deleting ? 'Deleting...' : 'Confirm Delete'}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(ec.id)}
                  className="inline-flex items-center gap-2 text-red-400/60 text-sm font-medium hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} /> Delete this vehicle
                </button>
              )}
            </div>
          </div>
            ))}
          </div>
        )}

        {/* ═══ NEW CAR FORM ═══ */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 sm:p-8 lg:p-10">
          <div className="mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-[-0.01em]">
              {existingCars.length > 0 ? 'Register a New Vehicle' : 'Vehicle Information'}
            </h2>
            <p className="text-white/35 mt-2">
              {existingCars.length > 0
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
                {submitting ? 'Saving...' : existingCars.length > 0 ? 'Register New Vehicle' : 'Next: Documents'}
                <FileText size={18} />
              </button>
            </div>
          </form>
        </div>

        {/* ═══ VEHICLE DOCUMENTS ═══ */}
        {existingCars.length > 0 && (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Car size={20} className="text-secondary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Vehicle Documents</h2>
                <p className="text-white/50 text-sm mt-0.5">Upload required documents for your vehicle</p>
              </div>
            </div>

            {/* Completed summary */}
            {vehicleDocs.filter(d => d.status === 'approved' || d.status === 'pending').length > 0 && (
              <div className="mb-6 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <p className="text-white/40 text-xs uppercase tracking-wider font-semibold mb-3">Already submitted</p>
                <div className="flex flex-wrap gap-2">
                  {vehicleDocs.filter(d => d.status === 'approved' || d.status === 'pending').map(d => {
                    const sc = statusConfig[d.status];
                    const SIcon = sc.icon;
                    return (
                      <span key={d.id} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${sc.bgColor} ${sc.color}`}>
                        <SIcon size={13} /> {d.label}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {vehicleDocs.filter(d => d.status === 'not_uploaded' || d.status === 'rejected').length === 0 ? (
              <div className="text-center py-8">
                <Check size={36} className="text-secondary mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-1">All vehicle documents submitted!</h3>
                <p className="text-white/40 text-sm">Check your profile for approval status.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {vehicleDocs.filter(d => d.status === 'not_uploaded' || d.status === 'rejected').map(doc => {
                  const DocIcon = doc.icon;
                  const status = statusConfig[doc.status];
                  const StatusIcon = status.icon;
                  return (
                    <div
                      key={doc.id}
                      className={`rounded-2xl border ${status.borderColor} p-4 sm:p-6 transition-all duration-200`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${status.bgColor}`}>
                            <DocIcon size={20} className={status.color} />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-white">{doc.label}</h3>
                            <p className="text-sm text-white/40">{doc.description}</p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${status.bgColor} ${status.color}`}>
                          <StatusIcon size={14} />
                          {status.label}
                        </span>
                      </div>

                      {doc.status === 'rejected' && doc.rejectionMessage && (
                        <div className="flex items-start gap-2 mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                          <XCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
                          <p className="text-sm text-red-400">{doc.rejectionMessage}</p>
                        </div>
                      )}

                      <label className={`block border-2 rounded-xl p-6 text-center transition-all duration-300 cursor-pointer group mb-4 ${
                        doc.fileName
                          ? 'border-solid border-green-500/30 bg-green-500/[0.05]'
                          : 'border-dashed border-white/[0.08] hover:border-secondary/40 hover:bg-secondary/[0.04]'
                      } ${docUploading === doc.id ? 'opacity-50 pointer-events-none' : ''}`}>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,application/pdf"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleDocUpload(doc.id, file);
                          }}
                        />
                        {docUploading === doc.id ? (
                          <div className="animate-spin w-6 h-6 border-2 border-secondary border-t-transparent rounded-full mx-auto mb-2" />
                        ) : doc.fileName ? (
                          <Check size={22} className="mx-auto mb-2 text-green-400" />
                        ) : (
                          <Upload size={22} className="mx-auto mb-2 text-white/40 group-hover:text-secondary transition-colors" />
                        )}
                        <p className={`text-sm font-medium ${doc.fileName ? 'text-green-400' : 'text-white'}`}>
                          {doc.fileName || 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-xs text-white/40 mt-1">
                          {doc.fileName ? 'Click to replace' : 'PNG, JPG or PDF (max 5MB)'}
                        </p>
                      </label>

                      {doc.id !== 'vehicle-log-book' && (
                        <div className="flex flex-wrap items-center gap-2">
                          <Calendar size={16} className="text-white/40" />
                          <label className="text-sm font-medium text-white/60">
                            {doc.id === 'vehicle-insurance' ? 'Insurance Expiry' : doc.id === 'mot-certificate' ? 'MOT Pass Date' : 'PCO Expiry'}
                          </label>
                          <input
                            type="date"
                            className="input-field w-full sm:w-auto sm:max-w-[200px] text-sm py-2 px-3"
                            value={docDates[doc.id] || doc.expiry?.slice(0, 10) || ''}
                            onChange={(e) => setDocDates(prev => ({ ...prev, [doc.id]: e.target.value }))}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {docUploadError && (
              <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {docUploadError}
              </div>
            )}

            <div className="flex items-center gap-3 mt-6 p-4 bg-info/5 border border-info/20 rounded-xl">
              <Info size={20} className="text-info shrink-0" />
              <p className="text-sm text-white/60">
                Vehicle documents will be reviewed along with your personal documents.
              </p>
            </div>
          </div>
        )}

        {/* Next step navigation when car already exists */}
        {existingCars.length > 0 && (
          <div className="flex justify-end">
            <Button variant="green" href="/driver/documents">
              Next: Personal Documents
              <ArrowRight size={18} />
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
