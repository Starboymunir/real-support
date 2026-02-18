'use client';

import { useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  User,
  Car,
  FileText,
  Check,
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

/* ─── Scroll-reveal wrapper ─── */
function RevealSection({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Data ─── */
const steps = [
  { label: 'Personal Info', icon: User },
  { label: 'Vehicle Details', icon: Car },
  { label: 'Documents', icon: FileText },
];

const benefits = [
  {
    icon: Clock,
    title: 'Flexible Hours',
    desc: 'Drive whenever you want — mornings, evenings, or weekends.',
  },
  {
    icon: TrendingUp,
    title: 'Competitive Earnings',
    desc: 'Keep more of what you earn with our transparent pay structure.',
  },
  {
    icon: Car,
    title: 'Premium Fleet',
    desc: 'Access top-tier vehicles or bring your own qualifying car.',
  },
  {
    icon: Shield,
    title: 'Full Support',
    desc: '24/7 driver support, insurance assistance & training resources.',
  },
];

/* ─── Framer variants ─── */
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const heroText = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const heroLine = {
  hidden: { opacity: 0, y: 40, filter: 'blur(8px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

/* ────────────────────────────────────────────────────── */
export default function DriverRegistrationPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: 'driver@rscab.co.uk',
    phone: '',
    dob: '',
    niNumber: '',
    taxId: '',
    address: '',
    city: '',
    postcode: '',
    bio: '',
    hobby: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-dark text-white">
      <Navbar />

      {/* ══════════ HERO ══════════ */}
      <section className="relative hero-dark overflow-hidden">
        {/* dot-grid overlay */}
        <div className="absolute inset-0 dot-grid pointer-events-none" />

        {/* gradient orbs */}
        <div className="absolute top-[-20%] left-[10%] w-[500px] h-[500px] rounded-full bg-secondary/10 blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[5%] w-[400px] h-[400px] rounded-full bg-accent/10 blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-36 pb-24 text-center">
          <motion.div variants={heroText} initial="hidden" animate="show">
            {/* pill badge */}
            <motion.div variants={heroLine} className="flex justify-center mb-8">
              <span className="pill">
                <Car size={14} className="text-secondary" />
                Become a Driver
              </span>
            </motion.div>

            {/* heading */}
            <motion.h1
              variants={heroLine}
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.08] tracking-tight mb-6"
            >
              Drive with{' '}
              <span className="gradient-text">RS&nbsp;CAB</span>
            </motion.h1>

            {/* subtext */}
            <motion.p
              variants={heroLine}
              className="max-w-2xl mx-auto text-lg sm:text-xl text-white/50 leading-relaxed"
            >
              Join our elite network of professional drivers. Earn on your schedule,
              access premium vehicles, and enjoy unmatched support every mile of the way.
            </motion.p>

            {/* CTA arrow */}
            <motion.div variants={heroLine} className="mt-10">
              <motion.a
                href="#register"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-3 bg-secondary text-dark font-bold px-8 py-4 rounded-xl text-lg transition-shadow hover:shadow-[0_8px_40px_rgba(0,230,118,0.35)]"
              >
                Start Registration
                <ArrowRight size={20} />
              </motion.a>
            </motion.div>
          </motion.div>
        </div>

        {/* bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark to-transparent" />
      </section>

      {/* ══════════ BENEFITS STRIP ══════════ */}
      <RevealSection>
        <section className="relative z-10 max-w-6xl mx-auto px-6 -mt-12 mb-20">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-40px' }}
          >
            {benefits.map((b) => {
              const Icon = b.icon;
              return (
                <motion.div
                  key={b.title}
                  variants={fadeUp}
                  whileHover={{ y: -6, borderColor: 'rgba(0,230,118,0.25)' }}
                  className="glass-dark rounded-2xl p-6 flex flex-col gap-3 cursor-default"
                >
                  <div className="w-11 h-11 rounded-xl bg-secondary/10 flex items-center justify-center">
                    <Icon size={20} className="text-secondary" />
                  </div>
                  <h3 className="text-white font-semibold text-base">{b.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{b.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </section>
      </RevealSection>

      {/* ══════════ REGISTRATION FORM ══════════ */}
      <section id="register" className="relative hero-dark overflow-hidden py-24">
        <div className="absolute inset-0 line-grid pointer-events-none" />
        <div className="absolute top-[30%] right-[-5%] w-[500px] h-[500px] rounded-full bg-secondary/5 blur-[160px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto px-6">
          {/* ── Step indicator ── */}
          <RevealSection className="mb-12">
            <div className="flex items-center justify-center gap-0">
              {steps.map((step, i) => {
                const StepIcon = step.icon;
                const isActive = i === 0;
                const isDone = false;

                return (
                  <div key={step.label} className="flex items-center">
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                          isDone
                            ? 'bg-secondary text-dark shadow-lg shadow-secondary/30'
                            : isActive
                            ? 'bg-secondary/20 border-2 border-secondary text-secondary shadow-lg shadow-secondary/10'
                            : 'bg-white/5 text-white/30 border border-white/10'
                        }`}
                      >
                        {isDone ? <Check size={20} /> : <StepIcon size={20} />}
                      </div>
                      <span
                        className={`text-xs font-semibold whitespace-nowrap ${
                          isActive
                            ? 'text-secondary'
                            : isDone
                            ? 'text-secondary'
                            : 'text-white/30'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {i < steps.length - 1 && (
                      <div className="w-20 sm:w-32 mx-3 mt-[-20px]">
                        <div
                          className={`h-0.5 rounded-full ${
                            isDone ? 'bg-secondary' : 'bg-white/10'
                          }`}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </RevealSection>

          {/* ── Form card ── */}
          <RevealSection delay={0.15}>
            <div className="glass-dark rounded-3xl neon-border p-8 sm:p-10">
              <div className="mb-10">
                <h2 className="text-3xl font-bold text-white tracking-tight">
                  Personal Information
                </h2>
                <p className="text-white/40 mt-2 text-base">
                  Tell us about yourself to get started as an RS CAB driver.
                </p>
              </div>

              <motion.form
                className="space-y-7"
                variants={stagger}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
              >
                {/* First Name / Last Name */}
                <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    label="First Name"
                    name="firstName"
                    icon={<User size={18} />}
                    placeholder="Enter your first name"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                  <FormField
                    label="Last Name"
                    name="lastName"
                    icon={<User size={18} />}
                    placeholder="Enter your last name"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </motion.div>

                {/* Email / Phone */}
                <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    label="Email Address"
                    name="email"
                    type="email"
                    icon={<Mail size={18} />}
                    value={formData.email}
                    disabled
                  />
                  <FormField
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    icon={<Phone size={18} />}
                    placeholder="+44 7700 900000"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </motion.div>

                {/* DOB / NI / Tax */}
                <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    label="Date of Birth"
                    name="dob"
                    type="date"
                    icon={<Calendar size={18} />}
                    value={formData.dob}
                    onChange={handleChange}
                    required
                  />
                  <FormField
                    label="NI Number"
                    name="niNumber"
                    icon={<Hash size={18} />}
                    placeholder="QQ 12 34 56 C"
                    value={formData.niNumber}
                    onChange={handleChange}
                    required
                  />
                  <FormField
                    label="Tax ID"
                    name="taxId"
                    icon={<Hash size={18} />}
                    placeholder="Enter tax ID"
                    value={formData.taxId}
                    onChange={handleChange}
                  />
                </motion.div>

                {/* Address */}
                <motion.div variants={fadeUp}>
                  <FormField
                    label="Address"
                    name="address"
                    icon={<MapPin size={18} />}
                    placeholder="Enter your full address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </motion.div>

                {/* City / Postcode */}
                <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    label="City"
                    name="city"
                    icon={<Building2 size={18} />}
                    placeholder="Enter your city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                  <FormField
                    label="Postcode"
                    name="postcode"
                    icon={<MapPin size={18} />}
                    placeholder="Enter postcode"
                    value={formData.postcode}
                    onChange={handleChange}
                    required
                  />
                </motion.div>

                {/* Bio */}
                <motion.div variants={fadeUp}>
                  <label className="block text-white/60 text-sm font-medium mb-2">Bio</label>
                  <textarea
                    name="bio"
                    rows={4}
                    className="input-dark resize-none w-full rounded-xl px-4 py-3.5"
                    placeholder="Tell riders a bit about yourself..."
                    value={formData.bio}
                    onChange={handleChange}
                  />
                </motion.div>

                {/* Hobby */}
                <motion.div variants={fadeUp}>
                  <FormField
                    label="Hobby"
                    name="hobby"
                    icon={<Heart size={18} />}
                    placeholder="What do you enjoy doing?"
                    value={formData.hobby}
                    onChange={handleChange}
                  />
                </motion.div>

                {/* Buttons */}
                <motion.div
                  variants={fadeUp}
                  className="flex items-center justify-between pt-8 border-t border-white/[0.06]"
                >
                  <motion.a
                    href="/login"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-7 py-3.5 rounded-xl border border-white/10 text-white/50 font-semibold text-sm transition-colors hover:border-white/20 hover:text-white/70"
                  >
                    Cancel
                  </motion.a>
                  <motion.a
                    href="/driver/vehicle"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2.5 bg-secondary text-dark font-bold px-7 py-3.5 rounded-xl text-sm transition-shadow hover:shadow-[0_8px_30px_rgba(0,230,118,0.35)]"
                  >
                    Next: Vehicle Details
                    <Car size={18} />
                  </motion.a>
                </motion.div>
              </motion.form>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ══════════ CTA ══════════ */}
      <RevealSection>
        <section className="relative bg-dark py-20">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">Questions?</h3>
            <p className="text-white/40 mb-8 text-lg">
              Our driver support team is standing by to help you get started.
            </p>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-secondary font-semibold text-lg hover:underline underline-offset-4"
              >
                Contact driver support
                <ArrowRight size={18} />
              </Link>
            </motion.div>
          </div>
        </section>
      </RevealSection>

      <Footer />
    </div>
  );
}

/* ─── Reusable dark form field with left icon ─── */
function FormField({
  label,
  name,
  type = 'text',
  icon,
  placeholder,
  value,
  onChange,
  disabled,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  icon: React.ReactNode;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-white/60 text-sm font-medium mb-2">{label}</label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none">
          {icon}
        </span>
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`input-dark w-full rounded-xl pl-11 pr-4 py-3.5 ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        />
      </div>
    </div>
  );
}
