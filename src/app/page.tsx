'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
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
  Gauge,
  Globe,
  Fingerprint,
  Layers,
} from 'lucide-react';

/* ── Animated counter hook ── */
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

/* ── Section reveal wrapper ── */
function RevealSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Data ── */
const stats = [
  { value: 15000, suffix: '+', label: 'Rides Completed', icon: Gauge },
  { value: 500, suffix: '+', label: 'Professional Drivers', icon: Users },
  { value: 50, suffix: '+', label: 'Cities Covered', icon: Globe },
  { value: 4.9, suffix: '★', label: 'Average Rating', isDecimal: true, icon: Star },
];

const features = [
  {
    icon: Shield,
    title: 'Verified & Vetted Drivers',
    description: 'Every driver undergoes DBS checks, vehicle inspections, and professional training before they ever pick you up.',
    accent: '#00E676',
  },
  {
    icon: MapPin,
    title: 'Live GPS Tracking',
    description: 'Watch your ride in real-time. Share your live location with loved ones for complete peace of mind.',
    accent: '#00B0FF',
  },
  {
    icon: Zap,
    title: 'Instant Booking',
    description: 'Book in under 10 seconds. Our smart system matches you with the nearest available driver instantly.',
    accent: '#FFD600',
  },
  {
    icon: CreditCard,
    title: 'Transparent Pricing',
    description: 'No surge, no hidden fees. See your exact fare before you confirm. Pay by card, wallet, or cash.',
    accent: '#E040FB',
  },
  {
    icon: Plane,
    title: 'Airport Specialists',
    description: 'Flight-tracked pickups at all major UK airports. We know when you land and adjust automatically.',
    accent: '#FF5252',
  },
  {
    icon: Fingerprint,
    title: 'Privacy & Security',
    description: '256-bit encryption, GDPR compliant. Your data is yours. We protect every ride and every detail.',
    accent: '#00E5FF',
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
function StatBlock({ value, suffix, label, isDecimal, icon: Icon }: { value: number; suffix: string; label: string; isDecimal?: boolean; icon: React.ElementType }) {
  const { count, ref } = useCounter(isDecimal ? Math.floor(value * 10) : value);
  const display = isDecimal ? (count / 10).toFixed(1) : count.toLocaleString();
  return (
    <motion.div
      ref={ref}
      whileHover={{ scale: 1.05 }}
      className="text-center group relative"
    >
      <div className="absolute inset-0 bg-secondary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative p-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-secondary/10 mb-4 group-hover:bg-secondary/20 transition-colors">
          <Icon size={22} className="text-secondary" />
        </div>
        <div className="text-4xl sm:text-5xl font-black text-white tabular-nums">
          {display}
          <span className="text-secondary">{suffix}</span>
        </div>
        <p className="text-white/40 text-sm mt-2 font-medium">{label}</p>
      </div>
    </motion.div>
  );
}

/* ── Marquee strip ── */
const marqueeItems = ['Airport Transfers', 'City Rides', 'Corporate Travel', 'Premium Fleet', 'Live Tracking', '24/7 Support', 'No Surge', 'Verified Drivers'];

export default function Home() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

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
      <section ref={heroRef} className="relative min-h-screen flex items-center hero-dark overflow-hidden noise-overlay">
        {/* Dot grid */}
        <div className="absolute inset-0 dot-grid opacity-40" />

        {/* Animated gradient orbs */}
        <motion.div
          animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/4 left-[5%] w-[500px] h-[500px] bg-secondary/[0.08] rounded-full blur-[180px]"
        />
        <motion.div
          animate={{ x: [0, -30, 40, 0], y: [0, 50, -30, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-1/4 right-[5%] w-[450px] h-[450px] bg-accent/[0.06] rounded-full blur-[160px]"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-secondary/[0.04] rounded-full blur-[100px]"
        />

        {/* Orbiting rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] hidden lg:block pointer-events-none">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border border-white/[0.03]"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-8 rounded-full border border-dashed border-white/[0.04]"
          />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0"
            style={{ transformOrigin: 'center' }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-3 h-3 rounded-full bg-secondary/60 glow-green" />
            </div>
          </motion.div>
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-12"
            style={{ transformOrigin: 'center' }}
          >
            <div className="absolute bottom-0 right-0">
              <div className="w-2 h-2 rounded-full bg-accent/60 glow-blue" />
            </div>
          </motion.div>
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 mx-auto max-w-7xl w-full px-5 sm:px-8 pt-32 pb-20 lg:pt-40 lg:pb-32"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left copy */}
            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="pill mb-8">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                  <span className="text-secondary font-bold">LIVE</span>
                  <span className="h-3 w-px bg-white/20" />
                  Available 24/7 Across the UK
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="text-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem] font-black leading-[1.05] tracking-tight text-white"
              >
                Your Ride,
                <br />
                <span className="gradient-text text-glow-green">Reimagined.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.6 }}
                className="mt-7 text-lg sm:text-xl text-white/50 max-w-lg leading-relaxed font-light"
              >
                Premium cab service with verified drivers, real-time tracking, and
                transparent pricing. Book in seconds, arrive in style.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="flex flex-wrap gap-4 mt-10"
              >
                <Link href="/rider/book">
                  <motion.div
                    whileHover={{ scale: 1.04, boxShadow: '0 0 50px rgba(0,230,118,0.5)' }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative inline-flex items-center gap-3 bg-secondary text-dark font-bold text-base px-8 py-4 rounded-2xl overflow-hidden transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <Zap size={20} className="relative z-10" />
                    <span className="relative z-10">Book a Ride</span>
                    <ArrowRight size={18} className="relative z-10 transition-transform group-hover:translate-x-1" />
                  </motion.div>
                </Link>
                <Link
                  href="/about"
                  className="btn-secondary text-base !rounded-2xl flex items-center gap-2 hover:border-secondary/50"
                >
                  <Play size={18} />
                  How It Works
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                className="flex items-center gap-3 mt-12 flex-wrap"
              >
                {[
                  { label: '4.9 Rating', icon: Star },
                  { label: '15K+ Rides', icon: Sparkles },
                  { label: '500+ Drivers', icon: Users },
                ].map((b) => (
                  <div key={b.label} className="pill !py-2 !px-4 !text-xs">
                    <b.icon size={13} className="text-secondary/70" />
                    <span>{b.label}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right — Booking Card */}
            <motion.div
              initial={{ opacity: 0, x: 60, rotateY: 8 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 1, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="flex justify-center lg:justify-end"
            >
              <div className="relative w-full max-w-md">
                <div className="absolute -inset-4 bg-gradient-to-br from-secondary/20 via-transparent to-accent/10 rounded-[2rem] blur-2xl opacity-60 animate-glow-pulse" />
                
                <motion.div
                  whileHover={{ y: -4 }}
                  className="relative glass-dark rounded-3xl p-8 neon-border bezel"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center"
                    >
                      <Navigation size={20} className="text-secondary" />
                    </motion.div>
                    <div>
                      <h3 className="text-white font-bold text-lg">Quick Book</h3>
                      <p className="text-white/30 text-xs">Get an instant quote</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-secondary glow-green" />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-secondary animate-ripple" />
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
                    <div className="absolute left-[1.85rem] top-[6.5rem] w-px h-8 bg-gradient-to-b from-secondary/50 to-accent/50 hidden sm:block" style={{ transform: 'translateX(4px)' }} />

                    <Link href="/rider/book">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="block w-full text-center bg-secondary text-dark font-bold py-4 rounded-xl hover:shadow-[0_0_30px_rgba(0,230,118,0.4)] transition-all duration-300 text-base"
                      >
                        Get Quote →
                      </motion.div>
                    </Link>
                  </div>

                  <p className="text-white/20 text-xs text-center mt-4 flex items-center justify-center gap-2">
                    <Shield size={12} />
                    No surge pricing • Instant confirmation
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
        >
          <span className="text-white/20 text-xs tracking-widest uppercase">Scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-5 h-8 rounded-full border border-white/10 flex items-start justify-center p-1.5"
          >
            <div className="w-1 h-2 rounded-full bg-secondary" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════ MARQUEE STRIP ═══════════ */}
      <section className="relative bg-dark border-y border-white/5 overflow-hidden py-5">
        <div className="marquee-container">
          <div className="marquee-content">
            {[...marqueeItems, ...marqueeItems].map((item, i) => (
              <span key={i} className="inline-flex items-center gap-4 mx-8 text-white/20 text-sm font-semibold uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary/40" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ STATS BAR ═══════════ */}
      <section className="relative bg-primary-dark border-b border-white/5">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
            {stats.map((s) => (
              <StatBlock key={s.label} {...s} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ WHY RS CAB ═══════════ */}
      <section className="py-24 lg:py-36 hero-dark relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-20" />
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-1/4 right-[10%] w-[400px] h-[400px] bg-secondary/[0.04] rounded-full blur-[140px]"
        />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <RevealSection className="text-center mb-20">
            <div className="pill mx-auto mb-6">
              <Sparkles size={14} className="text-secondary" />
              Why Choose RS CAB
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
              Built for riders who
              <br />
              <span className="gradient-text">demand the best.</span>
            </h2>
            <p className="mt-5 text-white/40 text-lg max-w-2xl mx-auto font-light">
              Every detail crafted for safety, convenience, and reliability.
            </p>
          </RevealSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <RevealSection key={f.title} delay={i * 0.1}>
                  <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="card-dark group cursor-default relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(90deg, transparent, ${f.accent}, transparent)` }} />

                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110" style={{ background: `${f.accent}15` }}>
                      <Icon size={26} style={{ color: f.accent }} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">
                      {f.title}
                    </h3>
                    <p className="text-white/40 text-sm leading-relaxed">
                      {f.description}
                    </p>

                    <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700" style={{ background: f.accent }} />
                  </motion.div>
                </RevealSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ AIRPORT TRANSFERS ═══════════ */}
      <section className="py-24 lg:py-36 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #060B14 0%, #0D1B2A 50%, #060B14 100%)' }}>
        <div className="absolute inset-0 line-grid opacity-30" />
        
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <RevealSection className="text-center mb-16">
            <div className="pill mx-auto mb-6">
              <Plane size={14} className="text-secondary" />
              Airport Transfers
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
              All Major <span className="gradient-text">UK Airports</span>
            </h2>
            <p className="mt-5 text-white/40 text-lg max-w-xl mx-auto font-light">
              Flight-tracked pickups, meet &amp; greet, and fixed prices. We handle the stress.
            </p>
          </RevealSection>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {airports.map((a, i) => (
              <RevealSection key={a.code} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -6, scale: 1.03 }}
                  className="group cursor-pointer overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]"
                >
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
                </motion.div>
              </RevealSection>
            ))}
          </div>

          <RevealSection delay={0.3} className="text-center mt-12">
            <Link href="/services">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="btn-outline-green inline-flex items-center gap-2 group !rounded-full"
              >
                View All Services
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </motion.div>
            </Link>
          </RevealSection>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="py-24 lg:py-36 hero-dark relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-15" />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-secondary/[0.04] rounded-full blur-[180px]" />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <RevealSection>
                <div className="pill mb-6">
                  <Zap size={14} className="text-secondary" />
                  How It Works
                </div>
                <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">
                  Three steps.
                  <br />
                  <span className="gradient-text">Zero hassle.</span>
                </h2>
                <p className="text-white/40 text-lg font-light mb-12 max-w-md">
                  From booking to arrival, we&apos;ve stripped away every unnecessary step.
                </p>
              </RevealSection>

              <div className="space-y-6">
                {steps.map((s, i) => (
                  <RevealSection key={s.number} delay={i * 0.15}>
                    <motion.div
                      whileHover={{ x: 8 }}
                      className="flex gap-5 group"
                    >
                      <div className="shrink-0 relative">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center group-hover:bg-secondary group-hover:border-secondary transition-all duration-500 relative overflow-hidden"
                        >
                          <span className="text-secondary font-black text-sm group-hover:text-dark transition-colors">{s.number}</span>
                        </motion.div>
                        {i < steps.length - 1 && (
                          <div className="absolute top-14 left-1/2 -translate-x-1/2 w-px h-6 bg-gradient-to-b from-white/10 to-transparent" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-secondary transition-colors">{s.title}</h3>
                        <p className="text-white/40 text-sm leading-relaxed">{s.description}</p>
                      </div>
                    </motion.div>
                  </RevealSection>
                ))}
              </div>
            </div>

            {/* Right — phone mockup */}
            <RevealSection delay={0.3}>
              <div className="flex justify-center">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative"
                >
                  <div className="absolute -inset-8 bg-gradient-to-br from-secondary/10 to-accent/5 rounded-[3rem] blur-3xl" />
                  
                  <div className="relative w-[280px] h-[570px] bg-dark rounded-[3rem] border-2 border-white/10 shadow-2xl overflow-hidden bezel">
                    <div className="flex items-center justify-between px-6 pt-4 pb-2">
                      <span className="text-white/40 text-xs font-medium">9:41</span>
                      <div className="flex gap-1">
                        <div className="w-4 h-2 rounded-sm bg-white/30" />
                        <div className="w-1.5 h-2 rounded-sm bg-white/30" />
                      </div>
                    </div>

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

                      <div className="relative h-[200px] rounded-2xl overflow-hidden mb-4">
                        <Image
                          src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&h=300&fit=crop"
                          alt="Map view"
                          fill
                          className="object-cover opacity-60"
                          sizes="280px"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-dark/80 to-transparent" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
                          <motion.div
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-dark" />
                            </div>
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-secondary" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-secondary/20 animate-ping-slow" />
                          </motion.div>
                        </div>
                      </div>

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

                      <div className="bg-secondary rounded-xl py-3 text-center">
                        <span className="text-dark font-bold text-sm">Book Now — £34.50</span>
                      </div>
                    </div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.5, duration: 0.6 }}
                    className="absolute -right-4 top-32 glass-dark rounded-xl p-3 shadow-xl animate-float w-48 hidden sm:block border border-white/[0.08]"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={16} className="text-secondary" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-white">Driver assigned!</p>
                        <p className="text-[9px] text-white/40">Arriving in 3 min</p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      <section className="py-24 lg:py-36 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #0A1628 0%, #0D1B2A 50%, #060B14 100%)' }}>
        <div className="absolute inset-0 line-grid opacity-20" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent/[0.04] rounded-full blur-[180px]" />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <RevealSection>
              <div className="pill mb-6">
                <Star size={14} className="text-secondary" />
                Testimonials
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-6">
                Loved by <span className="gradient-text">thousands</span>
                <br />of riders.
              </h2>
              <p className="text-white/40 text-lg font-light mb-8 max-w-md">
                Don&apos;t just take our word for it. Here&apos;s what real RS CAB riders have to say.
              </p>
              
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTestimonial(i)}
                    className={`h-2 rounded-full transition-all duration-500 ${
                      i === activeTestimonial
                        ? 'w-10 bg-secondary glow-green'
                        : 'w-2 bg-white/20 hover:bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </RevealSection>

            <RevealSection delay={0.2}>
              <div className="relative">
                <div className="absolute -top-6 -right-6 text-secondary/10">
                  <Quote size={100} />
                </div>
                
                <div className="relative glass-dark rounded-3xl p-10 neon-border">
                  <div className="flex gap-1 mb-6">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={18} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTestimonial}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4 }}
                    >
                      <p className="text-white text-lg leading-relaxed font-medium mb-8 min-h-[80px]">
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
                          <p className="font-bold text-white">{testimonials[activeTestimonial].name}</p>
                          <p className="text-white/40 text-sm">{testimonials[activeTestimonial].role}</p>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ═══════════ APP DOWNLOAD ═══════════ */}
      <section className="py-24 lg:py-36 hero-dark">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <RevealSection>
            <div className="relative rounded-[2rem] overflow-hidden bezel" style={{ background: 'linear-gradient(135deg, #0A1628 0%, #0D2137 50%, #0F1F35 100%)' }}>
              <div className="absolute inset-0 dot-grid opacity-30" />
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/[0.06] rounded-full translate-x-1/3 -translate-y-1/3 blur-[120px]" />
              <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/[0.04] rounded-full -translate-x-1/3 translate-y-1/3 blur-[100px]" />
              <div className="absolute inset-0 rounded-[2rem] border border-white/[0.06]" />
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />

              <div className="relative p-10 lg:p-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                  <div>
                    <div className="pill mb-6">
                      <Smartphone size={14} className="text-secondary" />
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
                    >
                      <motion.div
                        whileHover={{ scale: 1.04, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-flex items-center gap-4 bg-white/[0.06] hover:bg-white/10 text-white border border-white/[0.08] font-semibold px-7 py-4 rounded-2xl transition-all duration-300 hover:border-secondary/30 group"
                      >
                        <svg className="w-8 h-8 text-secondary" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3.61 1.814L13.793 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734c0-.382.218-.72.61-.92zM14.5 12.707l2.55 2.55-8.1 4.61 5.55-7.16zM17.85 8.133l-8.1-4.61 5.55 7.16 2.55-2.55zM20.16 10.94l-2.19-1.24-2.76 2.3 2.76 2.3 2.19-1.24c.77-.44.77-1.68 0-2.12z" />
                        </svg>
                        <div className="text-left">
                          <p className="text-white/50 text-xs uppercase tracking-wider">Get it on</p>
                          <p className="text-white text-lg font-bold -mt-0.5 group-hover:text-secondary transition-colors">Google Play</p>
                        </div>
                      </motion.div>
                    </a>
                  </div>

                  <div className="flex justify-center lg:justify-end">
                    <motion.div
                      animate={{ y: [0, -12, 0] }}
                      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                      className="relative"
                    >
                      <div className="absolute -inset-6 bg-gradient-to-br from-secondary/10 to-accent/5 rounded-[3rem] blur-3xl" />
                      <div className="relative w-[260px] h-[520px] rounded-[3rem] border-2 border-white/10 overflow-hidden shadow-2xl bezel">
                        <Image
                          src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=800&fit=crop"
                          alt="RS CAB App"
                          fill
                          className="object-cover opacity-30"
                          sizes="260px"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/60 to-dark/20" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <motion.div
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center mb-4 glow-green"
                          >
                            <Car size={32} className="text-secondary" />
                          </motion.div>
                          <p className="text-white font-bold text-xl">RS CAB</p>
                          <p className="text-white/30 text-sm mt-1">Available on Android</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══════════ FINAL CTA ═══════════ */}
      <section className="py-24 lg:py-36 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #060B14 0%, #0A1628 100%)' }}>
        <div className="absolute inset-0 dot-grid opacity-15" />
        
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/[0.06] rounded-full blur-[200px]"
        />

        <div className="relative mx-auto max-w-4xl px-5 sm:px-8 text-center">
          <RevealSection>
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 6, repeat: Infinity }}
              className="inline-block mb-8"
            >
              <div className="w-20 h-20 rounded-3xl bg-secondary/10 flex items-center justify-center glow-green mx-auto">
                <Layers size={36} className="text-secondary" />
              </div>
            </motion.div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-6">
              Ready to ride
              <br />
              <span className="gradient-text text-glow-green">with the best?</span>
            </h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto mb-12 font-light">
              Join thousands of satisfied riders across the UK. Your premium ride is waiting.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/rider/book">
                <motion.div
                  whileHover={{ scale: 1.05, boxShadow: '0 0 60px rgba(0,230,118,0.5)' }}
                  whileTap={{ scale: 0.97 }}
                  className="group inline-flex items-center gap-3 bg-secondary text-dark font-bold text-lg px-10 py-5 rounded-2xl transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <Zap size={22} className="relative z-10" />
                  <span className="relative z-10">Book a Ride</span>
                  <ArrowRight size={20} className="relative z-10 transition-transform group-hover:translate-x-1" />
                </motion.div>
              </Link>
              <Link
                href="/driver"
                className="btn-secondary text-lg !rounded-2xl flex items-center gap-2 hover:border-secondary/40"
              >
                Become a Driver
                <ChevronRight size={20} />
              </Link>
            </div>
          </RevealSection>
        </div>
      </section>

      <Footer />
    </>
  );
}
