'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import {
  Shield,
  MapPin,
  Clock,
  Zap,
  Plane,
  CreditCard,
  ArrowRight,
  ChevronRight,
  Star,
  Navigation,
  CheckCircle2,
  Smartphone,
  Users,
  Car,
  Quote,
  Play,
  Sparkles,
} from 'lucide-react';

/* ── Counter hook ── */
function useCounter(end: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const start = performance.now();
          const step = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [end, duration]);
  return { count, ref };
}

/* ── Data ── */
const stats = [
  { value: 15000, suffix: '+', label: 'Rides Completed' },
  { value: 500, suffix: '+', label: 'Professional Drivers' },
  { value: 50, suffix: '+', label: 'Cities Covered' },
  { value: 4.9, suffix: '★', label: 'Average Rating', isDecimal: true },
];

const features = [
  {
    icon: Shield,
    title: 'Verified & Vetted Drivers',
    description: 'Every driver undergoes DBS checks, vehicle inspections, and professional training before they ever pick you up.',
    gradient: 'from-emerald-500/20 to-teal-500/20',
    iconColor: 'text-emerald-400',
  },
  {
    icon: MapPin,
    title: 'Live GPS Tracking',
    description: 'Watch your ride in real-time. Share your live location with loved ones for complete peace of mind.',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    iconColor: 'text-blue-400',
  },
  {
    icon: Zap,
    title: 'Instant Booking',
    description: 'Book in under 10 seconds. Our smart system matches you with the nearest available driver instantly.',
    gradient: 'from-amber-500/20 to-orange-500/20',
    iconColor: 'text-amber-400',
  },
  {
    icon: CreditCard,
    title: 'Transparent Pricing',
    description: 'No surge, no hidden fees. See your exact fare before you confirm. Pay by card, wallet, or cash.',
    gradient: 'from-violet-500/20 to-purple-500/20',
    iconColor: 'text-violet-400',
  },
  {
    icon: Plane,
    title: 'Airport Specialists',
    description: 'Flight-tracked pickups at all major UK airports. We know when you land and adjust automatically.',
    gradient: 'from-rose-500/20 to-pink-500/20',
    iconColor: 'text-rose-400',
  },
  {
    icon: Clock,
    title: '24/7 Availability',
    description: 'Day or night, rain or shine. RS CAB drivers are on every road, every hour, every day of the year.',
    gradient: 'from-secondary/20 to-accent/20',
    iconColor: 'text-secondary',
  },
];

const airports = [
  { name: 'Heathrow', code: 'LHR', image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&h=300&fit=crop' },
  { name: 'Gatwick', code: 'LGW', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109db05?w=400&h=300&fit=crop' },
  { name: 'Stansted', code: 'STN', image: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=400&h=300&fit=crop' },
  { name: 'Luton', code: 'LTN', image: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=400&h=300&fit=crop' },
  { name: 'London City', code: 'LCY', image: 'https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?w=400&h=300&fit=crop' },
  { name: 'Manchester', code: 'MAN', image: 'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=400&h=300&fit=crop' },
];

const testimonials = [
  {
    name: 'Sarah Mitchell',
    role: 'Business Traveller',
    text: 'RS CAB has transformed my airport commute. The driver was already waiting when I landed. Impeccable service, every single time.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
  },
  {
    name: 'James Cooper',
    role: 'Daily Commuter',
    text: 'I switched from Uber to RS CAB six months ago. Fixed pricing, no surge — I save about £200 a month. The drivers are genuinely friendly.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
  },
  {
    name: 'Priya Sharma',
    role: 'University Student',
    text: 'As a student, I need affordable rides at odd hours. RS CAB is reliable at 3am just like 3pm. The app tracking gives my parents peace of mind too.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
  },
];

const steps = [
  { number: '01', title: 'Enter Destination', description: 'Type your pickup and drop-off. Our smart search auto-completes addresses instantly.', icon: Navigation },
  { number: '02', title: 'Choose Your Ride', description: 'Select from Economy, Comfort, Premium or XL. See the fare upfront before confirming.', icon: Car },
  { number: '03', title: 'Enjoy the Journey', description: 'Track in real-time, contact your driver, and arrive safely. Rate and go.', icon: CheckCircle2 },
];

/* ── Stat Counter Block ── */
function StatBlock({ value, suffix, label, isDecimal }: { value: number; suffix: string; label: string; isDecimal?: boolean }) {
  const { count, ref } = useCounter(isDecimal ? Math.floor(value * 10) : value);
  const display = isDecimal ? (count / 10).toFixed(1) : count.toLocaleString();
  return (
    <div ref={ref} className="text-center group">
      <div className="text-4xl sm:text-5xl font-black text-white tabular-nums">
        {display}
        <span className="text-secondary">{suffix}</span>
      </div>
      <p className="text-white/40 text-sm mt-2 font-medium">{label}</p>
    </div>
  );
}

export default function Home() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((p) => (p + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Navbar />

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative min-h-screen flex items-center hero-dark overflow-hidden">
        {/* Dot grid */}
        <div className="absolute inset-0 dot-grid opacity-50" />

        {/* Orbiting decorative elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] hidden lg:block">
          <div className="absolute inset-0 rounded-full border border-white/[0.03]" />
          <div className="animate-orbit">
            <div className="w-10 h-10 rounded-full bg-secondary/20 border border-secondary/30 flex items-center justify-center">
              <Car size={16} className="text-secondary" />
            </div>
          </div>
          <div className="animate-orbit-reverse">
            <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
              <MapPin size={14} className="text-accent" />
            </div>
          </div>
        </div>

        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-[10%] w-[400px] h-[400px] bg-secondary/[0.06] rounded-full blur-[150px] animate-morph" />
        <div className="absolute bottom-1/4 right-[10%] w-[350px] h-[350px] bg-accent/[0.04] rounded-full blur-[120px]" />

        <div className="relative mx-auto max-w-7xl w-full px-5 sm:px-8 pt-32 pb-20 lg:pt-40 lg:pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left copy */}
            <div className="max-w-2xl">
              {/* Badge */}
              <div className="badge-green mb-8">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                Available 24/7 Across the UK
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem] font-black leading-[1.05] tracking-tight text-white">
                Your Ride,
                <br />
                <span className="gradient-text text-glow-green">Reimagined.</span>
              </h1>

              <p className="mt-7 text-lg sm:text-xl text-white/50 max-w-lg leading-relaxed font-light">
                Premium cab service with verified drivers, real-time tracking, and
                transparent pricing. Book in seconds, arrive in style.
              </p>

              {/* CTA buttons */}
              <div className="flex flex-wrap gap-4 mt-10">
                <Link
                  href="/rider/book"
                  className="group relative inline-flex items-center gap-3 bg-secondary text-dark font-bold text-base px-8 py-4 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(0,230,118,0.4)] hover:scale-[1.02]"
                >
                  <Zap size={20} className="relative z-10" />
                  <span className="relative z-10">Book a Ride</span>
                  <ArrowRight size={18} className="relative z-10 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/about"
                  className="btn-secondary text-base !rounded-2xl flex items-center gap-2"
                >
                  <Play size={18} />
                  How It Works
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex items-center gap-6 mt-12 flex-wrap">
                {[
                  { label: '4.9 Rating', icon: Star },
                  { label: '15K+ Rides', icon: Sparkles },
                  { label: '500+ Drivers', icon: Users },
                ].map((b) => (
                  <div key={b.label} className="flex items-center gap-2 text-white/30 text-sm">
                    <b.icon size={15} className="text-secondary/60" />
                    <span>{b.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Booking Card (glassmorphism) */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md">
                {/* Glow behind card */}
                <div className="absolute -inset-4 bg-gradient-to-br from-secondary/20 via-transparent to-accent/10 rounded-[2rem] blur-2xl opacity-60" />
                
                <div className="relative glass-dark rounded-3xl p-8 neon-border">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                      <Navigation size={20} className="text-secondary" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">Quick Book</h3>
                      <p className="text-white/30 text-xs">Get an instant quote</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-secondary glow-green" />
                      <input
                        type="text"
                        placeholder="Pickup location"
                        className="input-dark !pl-10 !rounded-xl"
                        readOnly
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-accent glow-blue" />
                      <input
                        type="text"
                        placeholder="Where to?"
                        className="input-dark !pl-10 !rounded-xl"
                        readOnly
                      />
                    </div>
                    {/* Connector line */}
                    <div className="absolute left-[1.85rem] top-[6.5rem] w-px h-8 bg-gradient-to-b from-secondary/50 to-accent/50 hidden sm:block" style={{ transform: 'translateX(4px)' }} />

                    <Link
                      href="/rider/book"
                      className="block w-full text-center bg-secondary text-dark font-bold py-4 rounded-xl hover:shadow-[0_0_30px_rgba(0,230,118,0.4)] transition-all duration-300 text-base"
                    >
                      Get Quote &rarr;
                    </Link>
                  </div>

                  <p className="text-white/20 text-xs text-center mt-4 flex items-center justify-center gap-2">
                    <Shield size={12} />
                    No surge pricing &bull; Instant confirmation
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-white/20 text-xs tracking-widest uppercase">Scroll</span>
          <div className="w-5 h-8 rounded-full border border-white/10 flex items-start justify-center p-1.5">
            <div className="w-1 h-2 rounded-full bg-secondary animate-bounce" />
          </div>
        </div>
      </section>

      {/* ═══════════ STATS BAR ═══════════ */}
      <section className="relative -mt-1 bg-primary-dark border-y border-white/5">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x lg:divide-white/10">
            {stats.map((s) => (
              <StatBlock key={s.label} {...s} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ WHY RS CAB ═══════════ */}
      <section className="py-24 lg:py-32 bg-light relative overflow-hidden">
        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0)', backgroundSize: '40px 40px' }} />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="text-center mb-20">
            <div className="badge-green mx-auto mb-5">
              <Sparkles size={14} />
              Why Choose Us
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-text-primary tracking-tight">
              Built for riders who
              <br />
              <span className="gradient-text">demand the best.</span>
            </h2>
            <p className="mt-5 text-text-secondary text-lg max-w-2xl mx-auto font-light">
              Every detail crafted for safety, convenience, and reliability.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="card-premium group">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                    <Icon size={26} className={f.iconColor} />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-3">
                    {f.title}
                  </h3>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {f.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ AIRPORT TRANSFERS ═══════════ */}
      <section className="py-24 lg:py-32 hero-dark relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-30" />
        
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="text-center mb-16">
            <div className="badge-green mx-auto mb-5">
              <Plane size={14} />
              Airport Transfers
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
              All Major <span className="gradient-text">UK Airports</span>
            </h2>
            <p className="mt-5 text-white/40 text-lg max-w-xl mx-auto font-light">
              Flight-tracked pickups, meet &amp; greet, and fixed prices. We handle the stress.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {airports.map((a) => (
              <div key={a.code} className="card-dark group cursor-pointer !p-0 overflow-hidden !rounded-2xl">
                <div className="relative h-28 overflow-hidden">
                  <Image
                    src={a.image}
                    alt={a.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="200px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-white font-bold text-sm">{a.name}</p>
                    <p className="text-secondary text-xs font-bold">{a.code}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/services"
              className="btn-outline-green inline-flex items-center gap-2 group !rounded-full"
            >
              View All Services
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="py-24 lg:py-32 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-secondary/[0.03] rounded-full blur-[150px]" />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            {/* Left — steps */}
            <div>
              <div className="badge-green mb-5">
                <Zap size={14} />
                How It Works
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-text-primary tracking-tight mb-4">
                Three steps.
                <br />
                <span className="gradient-text">Zero hassle.</span>
              </h2>
              <p className="text-text-secondary text-lg font-light mb-12 max-w-md">
                From booking to arrival, we&apos;ve stripped away every unnecessary step.
              </p>

              <div className="space-y-8">
                {steps.map((s) => {
                  return (
                    <div key={s.number} className="flex gap-5 group">
                      <div className="shrink-0">
                        <div className="w-14 h-14 rounded-2xl bg-dark flex items-center justify-center group-hover:bg-secondary transition-colors duration-500 relative">
                          <span className="text-secondary font-black text-sm group-hover:text-dark transition-colors">{s.number}</span>
                          <div className="absolute -inset-1 rounded-2xl bg-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity blur-md" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-text-primary mb-1">{s.title}</h3>
                        <p className="text-text-secondary text-sm leading-relaxed">{s.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right — phone mockup with real image */}
            <div className="flex justify-center">
              <div className="relative">
                {/* Outer glow */}
                <div className="absolute -inset-8 bg-gradient-to-br from-secondary/10 to-accent/5 rounded-[3rem] blur-3xl" />
                
                {/* Phone frame */}
                <div className="relative w-[280px] h-[570px] bg-dark rounded-[3rem] border-2 border-white/10 shadow-2xl overflow-hidden">
                  {/* Status bar */}
                  <div className="flex items-center justify-between px-6 pt-4 pb-2">
                    <span className="text-white/40 text-xs font-medium">9:41</span>
                    <div className="flex gap-1">
                      <div className="w-4 h-2 rounded-sm bg-white/30" />
                      <div className="w-1.5 h-2 rounded-sm bg-white/30" />
                    </div>
                  </div>

                  {/* App UI mockup */}
                  <div className="px-4 pt-2">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                        <Navigation size={14} className="text-secondary" />
                      </div>
                      <div>
                        <p className="text-white text-xs font-bold">RS CAB</p>
                        <p className="text-white/30 text-[10px]">Ready to go</p>
                      </div>
                    </div>

                    {/* Map area */}
                    <div className="relative h-[200px] rounded-2xl overflow-hidden mb-4">
                      <Image
                        src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&h=300&fit=crop"
                        alt="Map view"
                        fill
                        className="object-cover opacity-60"
                        sizes="280px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-dark/80 to-transparent" />
                      {/* Pin */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
                        <div className="relative">
                          <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-dark" />
                          </div>
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-secondary" />
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-secondary/20 animate-ping-slow" />
                        </div>
                      </div>
                    </div>

                    {/* Route display */}
                    <div className="bg-white/[0.04] rounded-xl p-3 border border-white/[0.06] mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-2.5 h-2.5 rounded-full bg-secondary" />
                          <div className="w-px h-4 bg-white/10" />
                          <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-[11px] font-medium truncate">Baker Street, London</p>
                          <p className="text-white/30 text-[10px] mt-2 truncate">Heathrow Airport T5</p>
                        </div>
                      </div>
                    </div>

                    {/* Book button */}
                    <div className="bg-secondary rounded-xl py-3 text-center">
                      <span className="text-dark font-bold text-sm">Book Now &mdash; £34.50</span>
                    </div>
                  </div>
                </div>

                {/* Floating notification */}
                <div className="absolute -right-4 top-32 bg-white rounded-xl p-3 shadow-xl animate-float w-48 hidden sm:block">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={16} className="text-secondary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-text-primary">Driver assigned!</p>
                      <p className="text-[9px] text-text-muted">Arriving in 3 min</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      <section className="py-24 lg:py-32 bg-light relative overflow-hidden">
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0)', backgroundSize: '40px 40px' }} />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div>
              <div className="badge-green mb-5">
                <Star size={14} />
                Testimonials
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-text-primary tracking-tight mb-6">
                Loved by <span className="gradient-text">thousands</span>
                <br />of riders.
              </h2>
              <p className="text-text-secondary text-lg font-light mb-8 max-w-md">
                Don&apos;t just take our word for it. Here&apos;s what real RS CAB riders have to say.
              </p>
              
              {/* Testimonial navigation dots */}
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTestimonial(i)}
                    className={`h-2 rounded-full transition-all duration-500 ${
                      i === activeTestimonial
                        ? 'w-10 bg-secondary'
                        : 'w-2 bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Right — testimonial card */}
            <div className="relative">
              <div className="absolute -top-6 -right-6 text-secondary/10">
                <Quote size={100} />
              </div>
              
              <div className="relative card-premium !p-10 !rounded-3xl">
                {/* Stars */}
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={18} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-text-primary text-lg leading-relaxed font-medium mb-8 min-h-[80px]">
                  &ldquo;{testimonials[activeTestimonial].text}&rdquo;
                </p>

                <div className="flex items-center gap-4">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden ring-2 ring-secondary/20">
                    <Image
                      src={testimonials[activeTestimonial].image}
                      alt={testimonials[activeTestimonial].name}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-text-primary">{testimonials[activeTestimonial].name}</p>
                    <p className="text-text-muted text-sm">{testimonials[activeTestimonial].role}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ APP DOWNLOAD ═══════════ */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="hero-dark rounded-[2rem] p-10 lg:p-20 overflow-hidden relative">
            <div className="absolute inset-0 dot-grid opacity-30" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/[0.06] rounded-full translate-x-1/3 -translate-y-1/3 blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/[0.04] rounded-full -translate-x-1/3 translate-y-1/3 blur-[100px]" />

            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="badge-green mb-6">
                  <Smartphone size={14} />
                  Download the App
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-5">
                  RS CAB in
                  <br />
                  <span className="gradient-text">your pocket.</span>
                </h2>
                <p className="text-white/40 text-lg leading-relaxed mb-10 max-w-md font-light">
                  Book rides, track drivers, manage payments, and rate your experience. Everything in one beautifully designed app.
                </p>
                <a
                  href="https://play.google.com/store/apps/details?id=com.psslrscab"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-4 bg-white/[0.06] hover:bg-white/10 text-white border border-white/[0.08] font-semibold px-7 py-4 rounded-2xl transition-all duration-300 hover:border-white/20 group"
                >
                  <svg className="w-8 h-8 text-secondary" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.61 1.814L13.793 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734c0-.382.218-.72.61-.92zM14.5 12.707l2.55 2.55-8.1 4.61 5.55-7.16zM17.85 8.133l-8.1-4.61 5.55 7.16 2.55-2.55zM20.16 10.94l-2.19-1.24-2.76 2.3 2.76 2.3 2.19-1.24c.77-.44.77-1.68 0-2.12z" />
                  </svg>
                  <div className="text-left">
                    <p className="text-white/50 text-xs uppercase tracking-wider">Get it on</p>
                    <p className="text-white text-lg font-bold -mt-0.5 group-hover:text-secondary transition-colors">Google Play</p>
                  </div>
                </a>
              </div>

              <div className="flex justify-center lg:justify-end">
                {/* Phone with app screenshot */}
                <div className="relative">
                  <div className="absolute -inset-6 bg-gradient-to-br from-secondary/10 to-accent/5 rounded-[3rem] blur-3xl" />
                  <div className="relative w-[260px] h-[520px] rounded-[3rem] border-2 border-white/10 overflow-hidden shadow-2xl">
                    <Image
                      src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=800&fit=crop"
                      alt="RS CAB App"
                      fill
                      className="object-cover opacity-30"
                      sizes="260px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/60 to-dark/20" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center mb-4 glow-green">
                        <Car size={32} className="text-secondary" />
                      </div>
                      <p className="text-white font-bold text-xl">RS CAB</p>
                      <p className="text-white/30 text-sm mt-1">Available on Android</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FINAL CTA ═══════════ */}
      <section className="py-24 lg:py-32 hero-dark relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/[0.05] rounded-full blur-[200px]" />

        <div className="relative mx-auto max-w-4xl px-5 sm:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-6">
            Ready to ride
            <br />
            <span className="gradient-text text-glow-green">with the best?</span>
          </h2>
          <p className="text-white/40 text-lg max-w-xl mx-auto mb-12 font-light">
            Join thousands of satisfied riders across the UK. Your premium ride is waiting.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/rider/book"
              className="group inline-flex items-center gap-3 bg-secondary text-dark font-bold text-lg px-10 py-5 rounded-2xl hover:shadow-[0_0_50px_rgba(0,230,118,0.4)] hover:scale-[1.02] transition-all duration-300"
            >
              <Zap size={22} />
              Book a Ride
              <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/driver"
              className="btn-secondary text-lg !rounded-2xl flex items-center gap-2"
            >
              Become a Driver
              <ChevronRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
