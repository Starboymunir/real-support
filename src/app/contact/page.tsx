'use client';

import { useState, FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  ArrowRight,
  HelpCircle,
  Headphones,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

/* ── data ── */
const contactCards = [
  { icon: MapPin, label: 'Head Office', value: '71-75 Shelton Street, Covent Garden, London WC2H 9JQ', color: '#00E676' },
  { icon: Phone, label: 'Phone', value: '+44 20 7946 0958', href: 'tel:+442079460958', color: '#00B0FF' },
  { icon: Mail, label: 'Email', value: 'support@rscab.co.uk', href: 'mailto:support@rscab.co.uk', color: '#E040FB' },
  { icon: Clock, label: 'Support Hours', value: 'Mon – Sun, 24 / 7', color: '#FFD600' },
];

const supportLinks = [
  { icon: HelpCircle, title: 'FAQ', description: 'Answers to common questions about rides, payments, and more.', href: '/rider/support' },
  { icon: Headphones, title: 'Driver Support', description: 'Resources and help for RS CAB drivers.', href: '/driver' },
  { icon: Building2, title: 'Company Portal', description: 'Manage corporate accounts and bookings.', href: '/company/company-login' },
];

const subjects = ['General Inquiry', 'Ride Issue', 'Driver Application', 'Corporate Partnership', 'Press & Media', 'Other'];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', subject: '', message: '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <>
      <Navbar />

      {/* ═══════ HERO ═══════ */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #000 0%, #060B14 60%, #0A1628 100%)' }}>
        <div className="absolute top-0 left-1/3 w-[500px] h-[300px] bg-secondary/[0.04] rounded-full blur-[140px] pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-6 sm:px-8 pt-36 pb-20 lg:pt-44 lg:pb-28 text-center">
          <p className="text-secondary text-sm font-semibold tracking-wide uppercase mb-5">Get In Touch</p>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-[-0.03em] text-white leading-[1.05]">
            We&apos;d love to
            <br />
            <span className="text-white/25">hear from you.</span>
          </h1>
          <p className="mt-6 text-lg text-white/40 max-w-2xl mx-auto leading-relaxed">
            Whether it&apos;s a question, feedback, or partnership opportunity — our team is here to help.
          </p>
        </div>
      </section>

      {/* ═══════ CONTACT CARDS ═══════ */}
      <section className="border-y border-white/[0.04]" style={{ background: '#060B14' }}>
        <div className="mx-auto max-w-7xl px-6 sm:px-8 py-14">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {contactCards.map((c) => {
              const Icon = c.icon;
              const inner = (
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 hover:border-white/[0.10] hover:bg-white/[0.04] transition-all h-full">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${c.color}12` }}>
                    <Icon size={18} style={{ color: c.color }} />
                  </div>
                  <p className="text-[11px] uppercase tracking-wider text-white/25 font-semibold mb-1">{c.label}</p>
                  <p className="text-white font-semibold text-sm leading-relaxed">{c.value}</p>
                </div>
              );
              return c.href ? (
                <a key={c.label} href={c.href}>{inner}</a>
              ) : (
                <div key={c.label}>{inner}</div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════ FORM + MAP — Split layout ═══════ */}
      <section className="py-28 lg:py-36" style={{ background: '#0A1628' }}>
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Form (3 cols) */}
            <div className="lg:col-span-3">
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 sm:p-10">
                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="text-center py-16"
                    >
                      <div className="w-16 h-16 rounded-full bg-secondary/[0.1] flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="text-secondary" size={32} />
                      </div>
                      <h3 className="text-2xl font-bold text-white">Message Sent!</h3>
                      <p className="mt-3 text-white/35 max-w-md mx-auto">
                        Our team will get back to you within 24 hours.
                      </p>
                      <button
                        onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', phone: '', subject: '', message: '' }); }}
                        className="mt-8 text-sm font-medium text-white/50 px-6 py-3 rounded-full border border-white/[0.08] hover:border-white/20 hover:text-white/70 transition-all"
                      >
                        Send Another Message
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <h2 className="text-2xl font-bold text-white mb-1">Send us a message</h2>
                      <p className="text-white/35 text-sm mb-8">Fill in the form below and we&apos;ll respond as soon as possible.</p>

                      <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid sm:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-sm font-medium text-white/50 mb-1.5">Full Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="John Doe" className="input-field" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-white/50 mb-1.5">Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="john@example.com" className="input-field" />
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-sm font-medium text-white/50 mb-1.5">Phone</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+44 7700 900000" className="input-field" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-white/50 mb-1.5">Subject</label>
                            <select name="subject" value={formData.subject} onChange={handleChange} required className="input-field">
                              <option value="" disabled>Select a subject</option>
                              {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-white/50 mb-1.5">Message</label>
                          <textarea name="message" value={formData.message} onChange={handleChange} required rows={5} placeholder="Tell us how we can help..." className="input-field resize-none" />
                        </div>
                        <button type="submit" className="inline-flex items-center gap-2 bg-white text-black font-semibold text-sm px-7 py-3.5 rounded-full hover:shadow-[0_0_30px_rgba(255,255,255,0.12)] transition-all">
                          <Send size={16} /> Send Message
                        </button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Map + HQ (2 cols) */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="rounded-2xl overflow-hidden border border-white/[0.06] relative flex-1 min-h-[280px]">
                <Image
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=500&fit=crop"
                  alt="RS CAB HQ location"
                  width={800}
                  height={500}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/80 via-[#0A1628]/30 to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <p className="text-white font-bold">RS CAB HQ</p>
                  <p className="text-white/40 text-sm">Covent Garden, London</p>
                </div>
              </div>

              {/* Quick support links */}
              <div className="space-y-3">
                {supportLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      className="group flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 hover:border-white/[0.10] hover:bg-white/[0.04] transition-all"
                    >
                      <div className="shrink-0 w-10 h-10 rounded-xl bg-secondary/[0.08] flex items-center justify-center group-hover:bg-secondary/[0.14] transition-colors">
                        <Icon size={18} className="text-secondary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-sm group-hover:text-secondary transition-colors">{item.title}</h3>
                        <p className="text-white/30 text-xs truncate">{item.description}</p>
                      </div>
                      <ArrowRight size={14} className="text-white/20 group-hover:text-secondary group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
