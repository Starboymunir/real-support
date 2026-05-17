'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AddressAutocomplete, { PlaceResult } from '@/components/maps/AddressAutocomplete';
import { getRoute, formatDistance, formatDuration, estimateFare } from '@/lib/mapbox';
import {
  Shield,
  MapPin,
  Zap,
  Plane,
  CreditCard,
  ArrowRight,
  Star,
  Navigation,
  CheckCircle2,
  Car,
  Fingerprint,
} from 'lucide-react';

/* -- Animated counter -- */
function useCounter(end: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          const s = performance.now();
          const step = (n: number) => {
            const p = Math.min((n - s) / duration, 1);
            setCount(Math.floor((1 - Math.pow(1 - p, 3)) * end));
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [end, duration]);
  return { count, ref };
}

/* -- Data -- */
const features = [
  {
    icon: Shield,
    title: 'Verified Drivers',
    desc: 'DBS-checked, professionally trained, and rated by riders. Every driver meets our strict safety standards.',
    color: '#00E676',
  },
  {
    icon: MapPin,
    title: 'Live Tracking',
    desc: 'Real-time GPS tracking on every ride. Share your journey with family for complete peace of mind.',
    color: '#00B0FF',
  },
  {
    icon: Zap,
    title: 'Instant Booking',
    desc: 'Matched with the nearest driver in under 10 seconds. No waiting, no hassle.',
    color: '#FFD600',
  },
  {
    icon: CreditCard,
    title: 'No Surge Pricing',
    desc: 'Transparent fares shown upfront. Pay by card, wallet, or cash — no hidden charges, ever.',
    color: '#E040FB',
  },
  {
    icon: Fingerprint,
    title: 'Privacy First',
    desc: '256-bit encryption, GDPR compliant. Your data stays yours.',
    color: '#00E5FF',
  },
  {
    icon: Plane,
    title: 'Airport Specialist',
    desc: 'Flight-tracked pickups at all major UK airports. We adjust when your flight does.',
    color: '#FF5252',
  },
];

const airports = [
  { name: 'Heathrow', code: 'LHR' },
  { name: 'Gatwick', code: 'LGW' },
  { name: 'Stansted', code: 'STN' },
  { name: 'Luton', code: 'LTN' },
  { name: 'London City', code: 'LCY' },
  { name: 'Manchester', code: 'MAN' },
];

const testimonials = [
  {
    name: 'Sarah Mitchell',
    role: 'Business Traveller',
    text: 'One App has transformed my airport commute. The driver was already waiting when I landed. Impeccable service, every single time.',
    image: '/images/testimonials/sarah.jpg',
  },
  {
    name: 'James Cooper',
    role: 'Daily Commuter',
    text: "I switched from Uber six months ago. Fixed pricing, no surge — I save about £200 a month. The drivers are genuinely friendly.",
    image: '/images/testimonials/marcus.jpg',
  },
  {
    name: 'Priya Sharma',
    role: 'University Student',
    text: "Reliable at 3am just like 3pm. The app tracking gives my parents peace of mind too.",
    image: '/images/testimonials/emily.jpg',
  },
];

/* -- Stat Counter -- */
function Stat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { count, ref } = useCounter(value);
  return (
    <div ref={ref} className="text-center">
      <p className="text-4xl sm:text-5xl font-black text-white tabular-nums tracking-tight">
        {count.toLocaleString()}
        <span className="text-secondary">{suffix}</span>
      </p>
      <p className="text-white/35 text-sm mt-1.5 font-medium">{label}</p>
    </div>
  );
}

/* ── Quick Book Card (no auth required) ── */
function QuickBookCard() {
  const [pickup, setPickup] = useState<PlaceResult | null>(null);
  const [dropoff, setDropoff] = useState<PlaceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null);
  const [fares, setFares] = useState<Record<string, { min: number; max: number }> | null>(null);

  const computeQuote = useCallback(async (p: PlaceResult, d: PlaceResult) => {
    setLoading(true);
    setFares(null);
    setRouteInfo(null);
    try {
      const route = await getRoute(
        { lat: p.lat, lng: p.lng },
        { lat: d.lat, lng: d.lng }
      );
      if (route) {
        setRouteInfo({ distance: route.distance, duration: route.duration });
        setFares({
          economy: estimateFare(route.distance, 'economy'),
          comfort: estimateFare(route.distance, 'comfort'),
          premium: estimateFare(route.distance, 'premium'),
          xl: estimateFare(route.distance, 'xl'),
        });
      }
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePickup = (place: PlaceResult) => {
    setPickup(place);
    if (dropoff) computeQuote(place, dropoff);
  };

  const handleDropoff = (place: PlaceResult) => {
    setDropoff(place);
    if (pickup) computeQuote(pickup, place);
  };

  const vehicleLabels: Record<string, { label: string; icon: string }> = {
    economy: { label: 'Economy', icon: '🚗' },
    comfort: { label: 'Comfort', icon: '🚙' },
    premium: { label: 'Premium', icon: '✨' },
    xl: { label: 'XL', icon: '🚐' },
  };

  return (
    <div className="relative w-full max-w-sm">
      <div className="absolute -inset-px rounded-[28px] bg-gradient-to-b from-white/[0.12] to-white/[0.02] pointer-events-none" />

      <div className="relative rounded-[28px] border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-7 shadow-2xl shadow-black/40">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center">
            <Navigation size={18} className="text-secondary" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Quick Book</p>
            <p className="text-white/30 text-xs">Get an instant quote</p>
          </div>
        </div>

        <div className="space-y-2.5">
          <AddressAutocomplete
            placeholder="Pickup location"
            onSelect={handlePickup}
            iconColor="text-secondary"
          />
          <AddressAutocomplete
            placeholder="Where to?"
            onSelect={handleDropoff}
            iconColor="text-accent"
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center gap-2 mt-4 py-3">
            <div className="w-4 h-4 border-2 border-white/20 border-t-secondary rounded-full animate-spin" />
            <span className="text-white/40 text-sm">Calculating fares...</span>
          </div>
        )}

        {/* Quote results */}
        {fares && routeInfo && !loading && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-white/40 px-1">
              <span>{formatDistance(routeInfo.distance)}</span>
              <span>{formatDuration(routeInfo.duration)}</span>
            </div>

            <div className="space-y-1.5">
              {Object.entries(fares).map(([key, fare]) => (
                <div
                  key={key}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:border-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{vehicleLabels[key].icon}</span>
                    <span className="text-sm text-white font-medium">{vehicleLabels[key].label}</span>
                  </div>
                  <span className="text-sm text-white font-semibold">
                    £{fare.min.toFixed(2)} – £{fare.max.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <Link
              href="/rider/book"
              className="block w-full text-center bg-white text-black font-semibold py-3 rounded-xl text-sm hover:bg-white/90 transition-colors"
            >
              Book Now
            </Link>
          </div>
        )}

        {/* Initial state — no quote yet */}
        {!fares && !loading && (
          <p className="text-white/20 text-[11px] text-center mt-4 flex items-center justify-center gap-1.5">
            <Shield size={10} />
            No surge pricing · No signup required
          </p>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial((p) => (p + 1) % testimonials.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <Navbar />

      {/* ------- HERO ------- */}
      <section className="relative min-h-screen flex items-center overflow-hidden" style={{ background: 'linear-gradient(180deg, #000 0%, #060B14 50%, #0A1628 100%)' }}>
        {/* Single subtle gradient accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-secondary/[0.07] to-transparent rounded-full blur-[120px] pointer-events-none" />

        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />

        <div
          className="relative z-10 mx-auto max-w-7xl w-full px-6 sm:px-8 pt-32 pb-24 lg:pt-40 lg:pb-36"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            {/* Left */}
            <div className="max-w-xl">
              <div
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] text-[13px] text-white/50 mb-8 animate-slide-up"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                Available 24/7 across the UK
              </div>

              <h1
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-[-0.03em] text-white animate-slide-up"
              >
                Your ride,
                <br />
                <span className="bg-gradient-to-r from-secondary via-accent to-secondary bg-[length:200%_100%] bg-clip-text text-transparent animate-gradient">reimagined.</span>
              </h1>

              <p
                className="mt-6 text-lg text-white/40 max-w-md leading-relaxed animate-slide-up"
              >
                Premium rides with verified drivers, real-time tracking, and transparent pricing. No surge, ever.
              </p>

              <div
                className="flex flex-wrap gap-3 mt-10 animate-slide-up"
              >
                <Link href="/rider/book" className="group relative inline-flex items-center gap-2.5 bg-white text-black font-semibold text-[15px] px-7 py-3.5 rounded-full overflow-hidden transition-all hover:shadow-[0_0_40px_rgba(255,255,255,0.15)]">
                  <span className="relative z-10 flex items-center gap-2.5">
                    Book a Ride
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
                <Link href="/about" className="inline-flex items-center gap-2 text-[15px] font-medium text-white/50 px-6 py-3.5 rounded-full border border-white/[0.08] hover:border-white/20 hover:text-white/70 transition-all">
                  Learn more
                </Link>
              </div>
            </div>

            {/* Right — Booking Card */}
            <div
              className="flex justify-center lg:justify-end animate-slide-up"
            >
              <QuickBookCard />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
        >
          <div
            className="w-5 h-8 rounded-full border border-white/10 flex items-start justify-center p-1.5 animate-bounce"
          >
            <div className="w-1 h-1.5 rounded-full bg-white/40" />
          </div>
        </div>
      </section>

      <section className="border-y border-white/[0.04]" style={{ background: '#060B14' }}>
        <div className="mx-auto max-w-7xl px-6 sm:px-8 py-14">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-4">
            <Stat value={15000} suffix="+" label="Rides Completed" />
            <Stat value={500} suffix="+" label="Professional Drivers" />
            <Stat value={50} suffix="+" label="Cities Covered" />
            <Stat value={49} suffix="?" label="Average Rating" />
          </div>
        </div>
      </section>

      {/* ------- FEATURES — Bento Grid ------- */}
      <section className="py-28 lg:py-36 relative" style={{ background: 'linear-gradient(180deg, #060B14 0%, #0A1628 100%)' }}>
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="max-w-2xl mb-16">
            <p className="text-secondary text-sm font-semibold tracking-wide uppercase mb-4">Why One App</p>
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-[-0.02em] leading-[1.1]">
              Everything you need.
              <br />
              <span className="text-white/30">Nothing you don&apos;t.</span>
            </h2>
          </div>

          {/* Bento layout: 2 featured tall + 4 regular */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => {
              const Icon = f.icon;
              const isFeatured = i < 2;
              return (
                <div
                  key={f.title}
                  className={`group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-7 transition-all duration-500 hover:border-white/[0.12] hover:bg-white/[0.04] ${
                    isFeatured ? 'sm:row-span-2 flex flex-col justify-between min-h-[280px] lg:min-h-[360px]' : ''
                  }`}
                >
                  {/* Top gradient line on hover */}
                  <div className="absolute top-0 inset-x-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(90deg, transparent, ${f.color}60, transparent)` }} />

                  <div>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5" style={{ background: `${f.color}12` }}>
                      <Icon size={22} style={{ color: f.color }} />
                    </div>
                    <h3 className={`font-bold text-white mb-3 ${isFeatured ? 'text-2xl' : 'text-lg'}`}>{f.title}</h3>
                    <p className={`text-white/35 leading-relaxed ${isFeatured ? 'text-base' : 'text-sm'}`}>{f.desc}</p>
                  </div>

                  {isFeatured && (
                    <div className="mt-6">
                      <Link href="/services" className="inline-flex items-center gap-1.5 text-sm font-medium text-white/40 group-hover:text-secondary transition-colors">
                        Learn more <ArrowRight size={14} />
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------- AIRPORTS ------- */}
      <section className="py-28 lg:py-36 relative" style={{ background: '#0A1628' }}>
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14">
            <div>
              <p className="text-secondary text-sm font-semibold tracking-wide uppercase mb-4">Airport Transfers</p>
              <h2 className="text-4xl sm:text-5xl font-black text-white tracking-[-0.02em]">
                All major UK airports.
              </h2>
            </div>
            <Link href="/services" className="inline-flex items-center gap-2 text-sm font-medium text-white/40 hover:text-white/60 transition-colors shrink-0">
              View all services <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {airports.map((a) => (
              <div
                key={a.code}
                className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 text-center transition-all duration-300 hover:border-secondary/20 hover:bg-secondary/[0.04] cursor-default"
              >
                <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-white/[0.04] flex items-center justify-center group-hover:bg-secondary/10 transition-colors">
                  <Plane size={18} className="text-white/30 group-hover:text-secondary transition-colors" />
                </div>
                <p className="text-white font-semibold text-sm">{a.name}</p>
                <p className="text-secondary/60 text-xs font-bold mt-0.5">{a.code}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------- HOW IT WORKS ------- */}
      <section className="py-28 lg:py-36 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #0A1628 0%, #060B14 100%)' }}>
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            {/* Left — Steps */}
            <div>
              <p className="text-secondary text-sm font-semibold tracking-wide uppercase mb-4">How it works</p>
              <h2 className="text-4xl sm:text-5xl font-black text-white tracking-[-0.02em] mb-4">
                Three steps.
                <br />
                <span className="text-white/30">Zero hassle.</span>
              </h2>
              <p className="text-white/35 text-lg mb-12 max-w-md">
                From booking to arrival — no accounts, no complexity.
              </p>

              <div className="space-y-8">
                {[
                  { n: '01', title: 'Enter Destination', desc: 'Type your pickup and drop-off. Smart auto-complete finds your address instantly.', icon: Navigation },
                  { n: '02', title: 'Choose Your Ride', desc: 'Pick from Economy, Comfort, Premium, or XL. See the exact fare before confirming.', icon: Car },
                  { n: '03', title: 'Enjoy the Journey', desc: 'Track in real-time, contact your driver, arrive safely. Rate and go.', icon: CheckCircle2 },
                ].map((s, i) => (
                  <div key={s.n} className="flex gap-5 group">
                    <div className="shrink-0">
                      <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center group-hover:bg-secondary group-hover:border-secondary transition-all duration-300">
                        <span className="text-secondary text-sm font-bold group-hover:text-black transition-colors">{s.n}</span>
                      </div>
                      {i < 2 && <div className="w-px h-8 mx-auto bg-gradient-to-b from-white/[0.06] to-transparent" />}
                    </div>
                    <div className="pt-1">
                      <h3 className="text-white font-bold text-lg mb-1">{s.title}</h3>
                      <p className="text-white/35 text-sm leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Phone */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute -inset-12 bg-gradient-to-b from-secondary/[0.04] to-transparent rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative w-full max-w-[280px] aspect-[1/2] rounded-[3rem] border border-white/[0.08] bg-[#0a0a0a] shadow-2xl shadow-black/50 overflow-hidden">
                  {/* Status bar */}
                  <div className="flex items-center justify-between px-6 pt-3 pb-2">
                    <span className="text-white/40 text-xs font-medium">9:41</span>
                    <div className="flex gap-1">
                      <div className="w-4 h-1.5 rounded-sm bg-white/20" />
                    </div>
                  </div>

                  {/* App header */}
                  <div className="px-5 pt-1">
                    <div className="flex items-center gap-2 mb-5">
                      <div className="w-7 h-7 rounded-lg bg-secondary/15 flex items-center justify-center">
                        <Navigation size={12} className="text-secondary" />
                      </div>
                      <span className="text-white text-xs font-bold">One App</span>
                    </div>

                    {/* Map */}
                    <div className="relative h-[200px] rounded-xl overflow-hidden mb-4">
                      <Image
                        src="/images/unsplash/map-coverage.jpg"
                        alt="Map"
                        fill
                        className="object-cover opacity-50"
                        sizes="280px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 rounded-full bg-secondary flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-black" />
                        </div>
                      </div>
                    </div>

                    {/* Route */}
                    <div className="bg-white/[0.04] rounded-lg p-3 border border-white/[0.04] mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-secondary" />
                          <div className="w-px h-3 bg-white/10" />
                          <div className="w-2 h-2 rounded-full bg-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-[10px] font-medium">Baker Street, London</p>
                          <p className="text-white/25 text-[10px] mt-1.5">Heathrow Airport T5</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg py-2.5 text-center">
                      <span className="text-black font-bold text-xs">Book Now — £34.50</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------- TESTIMONIALS ------- */}
      <section className="py-28 lg:py-36" style={{ background: '#060B14' }}>
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-secondary text-sm font-semibold tracking-wide uppercase mb-4">Testimonials</p>
              <h2 className="text-4xl sm:text-5xl font-black text-white tracking-[-0.02em] mb-5">
                Trusted by thousands.
              </h2>
              <p className="text-white/35 text-lg max-w-md">
                Real feedback from real riders across the UK.
              </p>

              {/* Dots */}
              <div className="flex gap-1.5 mt-8">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTestimonial(i)}
                    className={`h-1.5 rounded-full transition-all duration-400 ${
                      i === activeTestimonial
                        ? 'w-8 bg-secondary'
                        : 'w-1.5 bg-white/15 hover:bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 lg:p-10">
                <div className="flex gap-0.5 mb-5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTestimonial}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-white/80 text-lg leading-relaxed mb-8">
                      &ldquo;{testimonials[activeTestimonial].text}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden ring-1 ring-white/10">
                        <Image
                          src={testimonials[activeTestimonial].image}
                          alt={testimonials[activeTestimonial].name}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">{testimonials[activeTestimonial].name}</p>
                        <p className="text-white/30 text-xs">{testimonials[activeTestimonial].role}</p>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------- APP DOWNLOAD ------- */}
      <section className="py-28 lg:py-36" style={{ background: 'linear-gradient(180deg, #060B14 0%, #0A1628 100%)' }}>
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="relative rounded-3xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            {/* Top gradient line */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-secondary/40 to-transparent" />
            
            <div className="relative p-6 sm:p-10 lg:p-16">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
                <div>
                  <p className="text-secondary text-sm font-semibold tracking-wide uppercase mb-4">Download</p>
                  <h2 className="text-3xl sm:text-4xl font-black text-white tracking-[-0.02em] mb-5">
                    One App in your pocket.
                  </h2>
                  <p className="text-white/35 text-lg leading-relaxed mb-8 max-w-md">
                    Book rides, track drivers, manage payments. Everything in one app.
                  </p>
                  <a
                    href="https://play.google.com/store/apps/details?id=com.realsupport.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3.5 bg-white/[0.05] border border-white/[0.08] text-white px-6 py-3.5 rounded-xl hover:bg-white/[0.08] hover:border-white/[0.12] transition-all"
                  >
                    <svg className="w-7 h-7 text-secondary" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3.61 1.814L13.793 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734c0-.382.218-.72.61-.92zM14.5 12.707l2.55 2.55-8.1 4.61 5.55-7.16zM17.85 8.133l-8.1-4.61 5.55 7.16 2.55-2.55zM20.16 10.94l-2.19-1.24-2.76 2.3 2.76 2.3 2.19-1.24c.77-.44.77-1.68 0-2.12z" />
                    </svg>
                    <div className="text-left">
                      <p className="text-white/40 text-[10px] uppercase tracking-wider">Get it on</p>
                      <p className="text-white font-semibold text-sm -mt-0.5">Google Play</p>
                    </div>
                  </a>
                </div>

                <div className="flex justify-center">
                  <div className="relative w-full max-w-[220px] aspect-[1/2] rounded-[2.5rem] border border-white/[0.06] bg-[#0a0a0a] overflow-hidden shadow-2xl shadow-black/40">
                    <Image
                      src="/images/unsplash/london-city.jpg"
                      alt="One App"
                      fill
                      className="object-cover opacity-20"
                      sizes="220px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mb-3">
                        <Car size={28} className="text-secondary" />
                      </div>
                      <p className="text-white font-bold">One App</p>
                      <p className="text-white/25 text-xs mt-0.5">Available on Android</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------- CTA ------- */}
      <section className="py-28 lg:py-36 relative overflow-hidden" style={{ background: '#060B14' }}>
        {/* Single centered glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-secondary/[0.04] rounded-full blur-[120px] pointer-events-none" />

        <div className="relative mx-auto max-w-3xl px-6 sm:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-[-0.02em] mb-5">
            Ready to ride?
          </h2>
          <p className="text-white/35 text-lg max-w-lg mx-auto mb-10">
            Join thousands of riders across the UK. Your premium ride is one tap away.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/rider/book" className="group inline-flex items-center gap-2.5 bg-white text-black font-semibold text-[15px] px-8 py-4 rounded-full hover:shadow-[0_0_40px_rgba(255,255,255,0.12)] transition-all">
              Book a Ride
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link href="/driver" className="inline-flex items-center gap-2 text-[15px] font-medium text-white/50 px-7 py-4 rounded-full border border-white/[0.08] hover:border-white/20 hover:text-white/70 transition-all">
              Become a Driver
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
