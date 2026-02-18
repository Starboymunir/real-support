'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/Button';
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
}

const initialDocuments: Document[] = [
  {
    id: 'driving-license',
    label: 'Driving License',
    description: 'Upload the front and back of your UK driving license',
    icon: CreditCard,
    status: 'approved',
    expiry: '2028-06-15',
    hasFrontBack: true,
  },
  {
    id: 'vehicle-insurance',
    label: 'Vehicle Insurance',
    description: 'Valid hire & reward or fleet insurance certificate',
    icon: Shield,
    status: 'pending',
    expiry: '2027-03-01',
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
    status: 'rejected',
    expiry: '2027-01-20',
    rejectionMessage: 'The document is blurry and the license number is not readable. Please re-upload a clear photo.',
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
  const [documents] = useState<Document[]>(initialDocuments);

  return (
    <DashboardLayout role="driver" userName="New Driver" pageTitle="Documents">
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
                    className={`text-xs font-semibold whitespace-nowrap ${
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
              Upload all required documents to complete your application
            </p>
          </div>

          <div className="space-y-6">
            {documents.map((doc) => {
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
                      {['Front', 'Back'].map((side) => (
                        <div
                          key={side}
                          className="border-2 border-dashed border-white/[0.08] rounded-xl p-6 text-center hover:border-secondary/40 hover:bg-secondary/[0.04] transition-all duration-300 cursor-pointer group"
                        >
                          <Upload
                            size={22}
                            className="mx-auto mb-2 text-white/40 group-hover:text-secondary transition-colors"
                          />
                          <p className="text-sm font-medium text-white">
                            Upload {side}
                          </p>
                          <p className="text-xs text-white/40 mt-1">PNG, JPG (max 5MB)</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-white/[0.08] rounded-xl p-6 text-center hover:border-secondary/40 hover:bg-secondary/[0.04] transition-all duration-300 cursor-pointer group mb-4">
                      <Upload
                        size={22}
                        className="mx-auto mb-2 text-white/40 group-hover:text-secondary transition-colors"
                      />
                      <p className="text-sm font-medium text-white">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-white/40 mt-1">PNG, JPG or PDF (max 5MB)</p>
                    </div>
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

          {/* Review Notice */}
          <div className="mt-8 flex items-center gap-3 p-4 bg-info/5 border border-info/20 rounded-xl">
            <Info size={20} className="text-info shrink-0" />
            <p className="text-sm text-white/60">
              Your application will be reviewed within <strong className="text-white">48 hours</strong> after all documents are submitted. You&apos;ll receive a notification once approved.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-white/[0.06]">
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
