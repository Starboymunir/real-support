'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  User,
  Car,
  FileText,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Hash,
  Heart,
  Building2,
  Clock,
  TrendingUp,
  Shield,
  ArrowRight,
} from 'lucide-react';

/* ── data ── */
const steps = [
  { label: 'Personal Info', icon: User },
  { label: 'Vehicle Details', icon: Car },
  { label: 'Documents', icon: FileText },
];

const benefits = [
  { icon: Clock, title: 'Flexible Hours', desc: 'Drive whenever you want — mornings, evenings, or weekends.', color: '#00E676' },
  { icon: TrendingUp, title: 'Competitive Earnings', desc: 'Keep more of what you earn with our transparent pay structure.', color: '#00B0FF' },
  { icon: Car, title: 'Premium Fleet', desc: 'Access top-tier vehicles or bring your own qualifying car.', color: '#E040FB' },
  { icon: Shield, title: 'Full Support', desc: '24/7 driver support, insurance assistance & training resources.', color: '#FFD600' },
];

/* ── Reusable form field ── */
function FormField({
  label, name, type = 'text', icon, placeholder, value, onChange, disabled, required,
}: {
  label: string; name: string; type?: string; icon: React.ReactNode; placeholder?: string;
  value?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; disabled?: boolean; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-white/40 text-sm font-medium mb-2">{label}</label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none">{icon}</span>
        <input
          type={type} name={name} placeholder={placeholder} value={value} onChange={onChange}
          disabled={disabled} required={required}
          className={`input-dark w-full rounded-xl pl-11 pr-4 py-3.5 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
      </div>
    </div>
  );
}

export default function DriverRegistrationPage() {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: 'driver@rscab.co.uk', phone: '', dob: '',
    niNumber: '', taxId: '', address: '', city: '', postcode: '', bio: '', hobby: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen text-white" style={{ background: '#060B14' }}>
      <Navbar />

      {/* ═══════ HERO ═══════ */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #000 0%, #060B14 60%, #0A1628 100%)' }}>
        <div className="absolute top-0 left-[10%] w-[500px] h-[300px] bg-secondary/[0.04] rounded-full blur-[140px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-6 pt-36 pb-24 text-center">
          <p className="text-secondary text-sm font-semibold tracking-wide uppercase mb-5">
            <Car size={14} className="inline mr-1.5 -mt-0.5" />
            Become a Driver
          </p>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-[-0.03em] text-white leading-[1.05]">
            Drive with
            <br />
            <span className="text-white/25">RS&nbsp;CAB.</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-white/40 leading-relaxed">
            Join our elite network of professional drivers. Earn on your schedule, access premium vehicles, and enjoy unmatched support every mile of the way.
          </p>
          <div className="mt-10">
            <a href="#register" className="inline-flex items-center gap-2.5 bg-white text-black font-semibold text-[15px] px-8 py-4 rounded-full hover:shadow-[0_0_40px_rgba(255,255,255,0.12)] transition-all">
              Start Registration <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* ═══════ BENEFITS ═══════ */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 -mt-12 mb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.title} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 flex flex-col gap-3 hover:border-white/[0.10] hover:bg-white/[0.04] transition-all">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${b.color}12` }}>
                  <Icon size={18} style={{ color: b.color }} />
                </div>
                <h3 className="text-white font-semibold text-base">{b.title}</h3>
                <p className="text-white/35 text-sm leading-relaxed">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══════ REGISTRATION FORM ═══════ */}
      <section id="register" className="py-24" style={{ background: '#0A1628' }}>
        <div className="max-w-4xl mx-auto px-6">
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-0 mb-12">
            {steps.map((step, i) => {
              const StepIcon = step.icon;
              const isActive = i === 0;
              return (
                <div key={step.label} className="flex items-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-secondary/[0.15] border-2 border-secondary text-secondary'
                        : 'bg-white/[0.03] text-white/25 border border-white/[0.06]'
                    }`}>
                      <StepIcon size={20} />
                    </div>
                    <span className={`text-xs font-semibold whitespace-nowrap ${isActive ? 'text-secondary' : 'text-white/25'}`}>
                      {step.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-20 sm:w-32 mx-3 mt-[-20px]">
                      <div className="h-px bg-white/[0.06]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Form card */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 sm:p-10">
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-white tracking-[-0.01em]">Personal Information</h2>
              <p className="text-white/35 mt-2">Tell us about yourself to get started as an RS CAB driver.</p>
            </div>

            <form className="space-y-7">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="First Name" name="firstName" icon={<User size={18} />} placeholder="Enter your first name" value={formData.firstName} onChange={handleChange} required />
                <FormField label="Last Name" name="lastName" icon={<User size={18} />} placeholder="Enter your last name" value={formData.lastName} onChange={handleChange} required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Email Address" name="email" type="email" icon={<Mail size={18} />} value={formData.email} disabled />
                <FormField label="Phone Number" name="phone" type="tel" icon={<Phone size={18} />} placeholder="+44 7700 900000" value={formData.phone} onChange={handleChange} required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField label="Date of Birth" name="dob" type="date" icon={<Calendar size={18} />} value={formData.dob} onChange={handleChange} required />
                <FormField label="NI Number" name="niNumber" icon={<Hash size={18} />} placeholder="QQ 12 34 56 C" value={formData.niNumber} onChange={handleChange} required />
                <FormField label="Tax ID" name="taxId" icon={<Hash size={18} />} placeholder="Enter tax ID" value={formData.taxId} onChange={handleChange} />
              </div>

              <FormField label="Address" name="address" icon={<MapPin size={18} />} placeholder="Enter your full address" value={formData.address} onChange={handleChange} required />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="City" name="city" icon={<Building2 size={18} />} placeholder="Enter your city" value={formData.city} onChange={handleChange} required />
                <FormField label="Postcode" name="postcode" icon={<MapPin size={18} />} placeholder="Enter postcode" value={formData.postcode} onChange={handleChange} required />
              </div>

              <div>
                <label className="block text-white/40 text-sm font-medium mb-2">Bio</label>
                <textarea name="bio" rows={4} className="input-dark resize-none w-full rounded-xl px-4 py-3.5" placeholder="Tell riders a bit about yourself..." value={formData.bio} onChange={handleChange} />
              </div>

              <FormField label="Hobby" name="hobby" icon={<Heart size={18} />} placeholder="What do you enjoy doing?" value={formData.hobby} onChange={handleChange} />

              {/* Buttons */}
              <div className="flex items-center justify-between pt-8 border-t border-white/[0.04]">
                <Link href="/login" className="px-7 py-3.5 rounded-full border border-white/[0.08] text-white/40 font-medium text-sm hover:border-white/15 hover:text-white/60 transition-all">
                  Cancel
                </Link>
                <Link href="/driver/vehicle" className="inline-flex items-center gap-2.5 bg-white text-black font-semibold px-7 py-3.5 rounded-full text-sm hover:shadow-[0_0_30px_rgba(255,255,255,0.12)] transition-all">
                  Next: Vehicle Details <Car size={16} />
                </Link>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section className="py-20" style={{ background: '#060B14' }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">Questions?</h3>
          <p className="text-white/35 mb-8 text-lg">Our driver support team is standing by to help you get started.</p>
          <Link href="/contact" className="text-secondary font-semibold text-lg hover:underline underline-offset-4 inline-flex items-center gap-2">
            Contact driver support <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
