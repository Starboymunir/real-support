'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/button';
import { useRequireAuth } from '@/lib/use-require-auth';
import { documentsApi } from '@/lib/services';
import {
  User,
  Car,
  FileText,
  Check,
  Upload,
  ArrowLeft,
  ShieldCheck,
  Clock,
  XCircle,
  AlertCircle,
  CreditCard,
  Shield,
  FileCheck,
  Calendar,
  Info,
} from 'lucide-react';

const steps = [
  { label: 'Personal Info', icon: User },
  { label: 'Vehicle Details', icon: Car },
  { label: 'Documents', icon: FileText },
];

type DocStatus = 'approved' | 'pending' | 'rejected' | 'not_uploaded';

interface Document {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  status: DocStatus;
  expiry?: string;
  rejectionMessage?: string;
  hasFrontBack?: boolean;
  fileName?: string;
  frontFileName?: string;
  backFileName?: string;
}

const initialDocuments: Document[] = [
  {
    id: 'driving-license',
    label: 'Driving License',
    description: 'Upload the front and back of your UK driving license',
    icon: CreditCard,
    status: 'not_uploaded',
    hasFrontBack: true,
  },
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
    id: 'phv-license',
    label: 'PHV License',
    description: 'Private Hire Vehicle license from your local council',
    icon: FileText,
    status: 'not_uploaded',
  },
  {
    id: 'dbs-certificate',
    label: 'DBS Certificate',
    description: 'Enhanced DBS (Disclosure and Barring Service) check',
    icon: ShieldCheck,
    status: 'not_uploaded',
  },
];

const statusConfig: Record<DocStatus, { label: string; color: string; bgColor: string; borderColor: string; icon: React.ElementType }> = {
  approved: { label: 'Approved', color: 'text-green-400', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/20', icon: Check },
  pending: { label: 'Pending Review', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/20', icon: Clock },
  rejected: { label: 'Rejected', color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/20', icon: XCircle },
  not_uploaded: { label: 'Not Uploaded', color: 'text-white/40', bgColor: 'bg-white/[0.03]', borderColor: 'border-white/[0.08]', icon: AlertCircle },
};

export default function DocumentsPage() {
  const { user } = useRequireAuth();
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState('');

  // Get IDs from auth context or localStorage fallback
  const getDriverId = (): string => {
    if (user?.driver?.id) return user.driver.id;
    return localStorage.getItem('rs_driver_id') || '';
  };
  const getCarId = (): string => {
    const cars = user?.driver?.cars;
    if (cars?.length) return cars[cars.length - 1].id;
    return localStorage.getItem('rs_car_id') || '';
  };

  // Fetch existing documents from API
  const fetchDocuments = useCallback(async () => {
    const driverId = getDriverId();
    const carId = getCarId();
    if (!driverId) return;
    try {
      const tasks: Promise<unknown>[] = [documentsApi.getDriverDocuments(driverId)];
      if (carId) tasks.push(documentsApi.getCarDocuments(carId));

      const [driverDocs, carDocs] = await Promise.allSettled(tasks);

      const mapDocStatus = (status?: string): DocStatus => {
        if (!status) return 'not_uploaded';
        const s = status.toLowerCase();
        if (s === 'approved' || s === 'verified') return 'approved';
        if (s === 'pending' || s === 'submitted') return 'pending';
        if (s === 'rejected') return 'rejected';
        return 'not_uploaded';
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const allDocs: any[] = [];
      if (driverDocs.status === 'fulfilled' && driverDocs.value) {
        const dd = Array.isArray(driverDocs.value) ? driverDocs.value : (driverDocs.value as { data?: unknown[] }).data || [];
        allDocs.push(...dd);
      }
      if (carDocs.status === 'fulfilled' && carDocs.value) {
        const cd = Array.isArray(carDocs.value) ? carDocs.value : (carDocs.value as { data?: unknown[] }).data || [];
        allDocs.push(...cd);
      }

      if (allDocs.length > 0) {
        setDocuments(prev => prev.map(doc => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const match = allDocs.find((d: any) => {
            const docType = (d.type || d.documentType || '').toLowerCase().replace(/[_\s]/g, '-');
            return docType.includes(doc.id.replace('-', '')) || doc.id.includes(docType);
          });
          if (match) {
            return {
              ...doc,
              status: mapDocStatus(match.status),
              expiry: match.expiryDate || match.expiry || doc.expiry,
              rejectionMessage: match.rejectionReason || match.rejectionMessage,
            };
          }
          return doc;
        }));
      }
    } catch { /* keep initial */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  const handleFileUpload = async (docId: string, file: File, side?: 'front' | 'back') => {
    const driverId = getDriverId();
    const carId = getCarId();
    if (!driverId) {
      setUploadError('Driver profile not found. Please complete registration first.');
      return;
    }
    setUploading(docId);
    setUploadError('');
    try {
      // Step 1: Upload file to S3
      const uploaded = await documentsApi.uploadFile(file);
      // Backend returns { fileUrl: "..." } after envelope unwrap
      const fileUrl = (uploaded as { fileUrl?: string; url?: string })?.fileUrl
        || (uploaded as { url?: string })?.url || '';
      if (!fileUrl) throw new Error('File upload failed — no URL returned');

      // Step 2: Associate the file with the correct document endpoint
      // Backend expects specific field names for each document type
      switch (docId) {
        case 'driving-license':
          // Driving license has front and back — accumulate then submit
          await documentsApi.uploadDrivingLicense({
            driverId,
            ...(side === 'back'
              ? { licenseDocBack: fileUrl }
              : { licenseDocFront: fileUrl }),
            licenseNumber: 'PENDING',
            licenseExpiryDate: new Date(Date.now() + 365 * 86400000).toISOString(),
          });
          break;
        case 'vehicle-insurance':
          if (!carId) { setUploadError('Vehicle not found. Please complete Step 2 first.'); return; }
          await documentsApi.uploadInsurance({
            carId,
            insuranceDoc: fileUrl,
            insuranceExpiryDate: new Date(Date.now() + 365 * 86400000).toISOString(),
          });
          break;
        case 'mot-certificate':
          if (!carId) { setUploadError('Vehicle not found. Please complete Step 2 first.'); return; }
          await documentsApi.uploadMot({
            carId,
            motDoc: fileUrl,
            motPassDate: new Date().toISOString(),
          });
          break;
        case 'phv-license':
          await documentsApi.uploadPCO({
            driverId,
            pcoBadgeDocFront: fileUrl,
            pcoBadgeDocBack: fileUrl,
            pcoBadgeNumber: 'PENDING',
            pcoBadgeExpiryDate: new Date(Date.now() + 365 * 86400000).toISOString(),
            pcoPaperDoc: fileUrl,
          });
          break;
        case 'dbs-certificate':
          await documentsApi.uploadPassport({
            driverId,
            passportDocFront: fileUrl,
            passportDocBack: fileUrl,
            passportNumber: 'PENDING',
            passportExpiryDate: new Date(Date.now() + 365 * 86400000).toISOString(),
          });
          break;
      }

      // Update local state to show pending with file name
      setDocuments(prev => prev.map(d => {
        if (d.id !== docId) return d;
        const update: Partial<Document> = { status: 'pending' as DocStatus };
        if (d.hasFrontBack && side) {
          if (side === 'front') update.frontFileName = file.name;
          else update.backFileName = file.name;
        } else {
          update.fileName = file.name;
        }
        return { ...d, ...update };
      }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(null);
    }
  };

  return (
    <DashboardLayout role="driver" pageTitle="Documents">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Progress Bar */}
        <div className="w-full bg-white/[0.08] rounded-full h-2 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
            style={{ width: '100%' }}
          />
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between">
          {steps.map((step, i) => {
            const StepIcon = step.icon;
            const isActive = i === 2;
            const isDone = i < 2;

            return (
              <div key={step.label} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      isDone
                        ? 'bg-secondary text-white shadow-lg shadow-secondary/30'
                        : isActive
                        ? 'bg-gradient-to-br from-primary to-primary-light text-white shadow-lg shadow-primary/30'
                        : 'bg-white/[0.04] text-white/40 border-2 border-white/[0.08]'
                    }`}
                  >
                    {isDone ? <Check size={20} /> : <StepIcon size={20} />}
                  </div>
                  <span
                    className={`text-xs font-semibold whitespace-nowrap hidden sm:block ${
                      isActive ? 'text-secondary' : isDone ? 'text-secondary' : 'text-white/40'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className="flex-1 mx-4">
                    <div className="h-0.5 rounded-full bg-secondary" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Documents Card */}
        <div className="bg-white/[0.02] rounded-2xl border border-white/[0.06] p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">Required Documents</h2>
            <p className="text-white/60 mt-1">
              Upload missing or rejected documents to complete your application
            </p>
          </div>

          {/* Filter: only show docs that need action (not_uploaded or rejected) */}
          {(() => {
            const actionDocs = documents.filter(d => d.status === 'not_uploaded' || d.status === 'rejected');
            const completedDocs = documents.filter(d => d.status === 'approved' || d.status === 'pending');

            return (
              <>
                {/* Completed summary */}
                {completedDocs.length > 0 && (
                  <div className="mb-6 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <p className="text-white/40 text-xs uppercase tracking-wider font-semibold mb-3">Already submitted</p>
                    <div className="flex flex-wrap gap-2">
                      {completedDocs.map(d => {
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

                {actionDocs.length === 0 ? (
                  <div className="text-center py-12">
                    <Check size={48} className="text-secondary mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">All Documents Submitted!</h3>
                    <p className="text-white/40 text-sm mb-6">All your documents have been submitted. Check your profile for approval status.</p>
                    <Button href="/driver/profile" variant="green" size="md">
                      View Profile
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {actionDocs.map((doc) => {
              const DocIcon = doc.icon;
              const status = statusConfig[doc.status];
              const StatusIcon = status.icon;

              return (
                <div
                  key={doc.id}
                  className={`rounded-2xl border ${status.borderColor} p-6 transition-all duration-200`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center ${status.bgColor}`}
                      >
                        <DocIcon size={20} className={status.color} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{doc.label}</h3>
                        <p className="text-sm text-white/40">{doc.description}</p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${status.bgColor} ${status.color}`}
                    >
                      <StatusIcon size={14} />
                      {status.label}
                    </span>
                  </div>

                  {/* Rejection Message */}
                  {doc.status === 'rejected' && doc.rejectionMessage && (
                    <div className="flex items-start gap-2 mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <XCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
                      <p className="text-sm text-red-400">{doc.rejectionMessage}</p>
                    </div>
                  )}

                  {/* Upload Zones */}
                  {doc.hasFrontBack ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      {(['Front', 'Back'] as const).map((side) => {
                        const sideFileName = side === 'Front' ? doc.frontFileName : doc.backFileName;
                        const isUploaded = !!sideFileName;
                        return (
                          <label
                            key={side}
                            className={`border-2 rounded-xl p-6 text-center transition-all duration-300 cursor-pointer group ${
                              isUploaded
                                ? 'border-solid border-green-500/30 bg-green-500/[0.05]'
                                : 'border-dashed border-white/[0.08] hover:border-secondary/40 hover:bg-secondary/[0.04]'
                            } ${
                              uploading === doc.id ? 'opacity-50 pointer-events-none' : ''
                            }`}
                          >
                            <input
                              type="file"
                              accept="image/png,image/jpeg,application/pdf"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(doc.id, file, side.toLowerCase() as 'front' | 'back');
                              }}
                            />
                            {uploading === doc.id ? (
                              <div className="animate-spin w-6 h-6 border-2 border-secondary border-t-transparent rounded-full mx-auto mb-2" />
                            ) : isUploaded ? (
                              <Check size={22} className="mx-auto mb-2 text-green-400" />
                            ) : (
                              <Upload size={22} className="mx-auto mb-2 text-white/40 group-hover:text-secondary transition-colors" />
                            )}
                            <p className={`text-sm font-medium ${
                              isUploaded ? 'text-green-400' : 'text-white'
                            }`}>
                              {isUploaded ? sideFileName : `Upload ${side}`}
                            </p>
                            <p className="text-xs text-white/40 mt-1">
                              {isUploaded ? 'Click to replace' : 'PNG, JPG (max 5MB)'}
                            </p>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <label className={`block border-2 rounded-xl p-6 text-center transition-all duration-300 cursor-pointer group mb-4 ${
                      doc.fileName
                        ? 'border-solid border-green-500/30 bg-green-500/[0.05]'
                        : 'border-dashed border-white/[0.08] hover:border-secondary/40 hover:bg-secondary/[0.04]'
                    } ${
                      uploading === doc.id ? 'opacity-50 pointer-events-none' : ''
                    }`}>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(doc.id, file);
                        }}
                      />
                      {uploading === doc.id ? (
                        <div className="animate-spin w-6 h-6 border-2 border-secondary border-t-transparent rounded-full mx-auto mb-2" />
                      ) : doc.fileName ? (
                        <Check size={22} className="mx-auto mb-2 text-green-400" />
                      ) : (
                        <Upload size={22} className="mx-auto mb-2 text-white/40 group-hover:text-secondary transition-colors" />
                      )}
                      <p className={`text-sm font-medium ${
                        doc.fileName ? 'text-green-400' : 'text-white'
                      }`}>
                        {doc.fileName || 'Click to upload or drag and drop'}
                      </p>
                      <p className="text-xs text-white/40 mt-1">
                        {doc.fileName ? 'Click to replace' : 'PNG, JPG or PDF (max 5MB)'}
                      </p>
                    </label>
                  )}

                  {/* Expiry Date */}
                  {(doc.expiry || doc.status !== 'not_uploaded') && (
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-white/40" />
                      <label className="text-sm font-medium text-white/60">Expiry Date</label>
                      <input
                        type="date"
                        className="input-field max-w-[200px] text-sm py-2 px-3"
                        defaultValue={doc.expiry || ''}
                      />
                    </div>
                  )}
                </div>
              );
            })}
                  </div>
                )}
              </>
            );
          })()}

          {/* Upload Error */}
          {uploadError && (
            <div className="mt-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {uploadError}
            </div>
          )}

          {/* Review Notice */}
          <div className="mt-8 flex items-center gap-3 p-4 bg-info/5 border border-info/20 rounded-xl">
            <Info size={20} className="text-info shrink-0" />
            <p className="text-sm text-white/60">
              Your application will be reviewed within <strong className="text-white">48 hours</strong> after all documents are submitted. You&apos;ll receive a notification once approved.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-6 mt-6 border-t border-white/[0.06]">
            <Button variant="outline" href="/driver/vehicle">
              <ArrowLeft size={18} />
              Back
            </Button>
            <Button variant="green" href="/driver/dashboard">
              <ShieldCheck size={18} />
              Submit Application
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
