"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Plane,
  Building2,
  Route,
  PartyPopper,
  Package,
  Car,
  ArrowRight,
  Zap,
  Check,
  MapPin,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/* ═══════════════ DATA ═══════════════ */
const services = [
  {
    icon: Plane,
    title: "Airport Transfers",
    description:
      "Punctual pick-ups and drop-offs at all major UK airports. Flight tracking, meet-and-greet, and complimentary wait time included.",
    image:
      "https://images.unsplash.com/photo-1436491865332-7a61a109db05?w=600&h=400&fit=crop",
  },
  {
    icon: Car,
    title: "City Rides",
    description:
      "On-demand rides across the city in minutes. Smart routing, transparent pricing, and professional drivers — always.",
    image:
      "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&h=400&fit=crop",
  },
  {
    icon: Building2,
    title: "Corporate Travel",
    description:
      "Dedicated account management, monthly invoicing, and priority dispatch for your entire organisation.",
    image:
      "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=600&h=400&fit=crop",
  },
  {
    icon: Route,
    title: "Long Distance",
    description:
      "Comfortable inter-city journeys with fixed pricing. Sit back and relax while we handle the drive.",
    image:
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&h=400&fit=crop",
  },
  {
    icon: PartyPopper,
    title: "Events & Weddings",
    description:
      "Arrive in style. Luxury vehicles for weddings, galas, proms, and special occasions with white-glove service.",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop",
  },
  {
    icon: Package,
    title: "Parcel Delivery",
    description:
      "Same-day courier service. Tracked, insured, and delivered by trusted RS CAB drivers across the city.",
    image:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&h=400&fit=crop",
  },
];

const fleet = [
  {
    name: "Economy",
    type: "Sedan",
    price: "from £5",
    image:
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&h=400&fit=crop",
    features: ["4 passengers", "2 bags", "AC & WiFi", "Cashless payment"],
  },
  {
    name: "Comfort",
    type: "SUV",
    price: "from £12",
    image:
      "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600&h=400&fit=crop",
    features: ["4 passengers", "3 bags", "Leather seats", "Premium audio"],
  },
  {
    name: "Premium",
    type: "Luxury",
    price: "from £25",
    image:
      "https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&h=400&fit=crop",
    features: [
      "4 passengers",
      "3 bags",
      "Executive class",
      "Complimentary water",
    ],
  },
  {
    name: "XL / Van",
    type: "People Carrier",
    price: "from £18",
    image:
      "https://images.unsplash.com/photo-1543465077-db45d34b88a5?w=600&h=400&fit=crop",
    features: ["6 passengers", "5 bags", "Spacious cabin", "Group travel"],
  },
];

const cities = [
  "London",
  "Manchester",
  "Birmingham",
  "Leeds",
  "Glasgow",
  "Edinburgh",
  "Liverpool",
  "Bristol",
  "Sheffield",
  "Cardiff",
  "Nottingham",
  "Newcastle",
];

/* ═══════════════ REVEAL COMPONENT ═══════════════ */
function RevealSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════ CARD HOVER VARIANTS ═══════════════ */
const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.02,
    y: -6,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

const imageHover = {
  rest: { scale: 1 },
  hover: { scale: 1.08, transition: { duration: 0.5, ease: "easeOut" } },
};

/* ═══════════════ PAGE ═══════════════ */
export default function ServicesPage() {
  return (
    <>
      <Navbar />

      {/* ═══════ HERO ═══════ */}
      <section className="hero-dark relative overflow-hidden">
        <div className="dot-grid absolute inset-0 pointer-events-none" />
        <div className="noise-overlay absolute inset-0 pointer-events-none" />
        <div className="absolute top-10 right-1/4 w-[600px] h-[600px] bg-secondary/[0.06] rounded-full blur-[180px]" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-accent/[0.04] rounded-full blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 pt-36 pb-24 lg:pt-44 lg:pb-32 text-center">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="pill mb-6 inline-block"
          >
            What We Offer
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1] max-w-4xl mx-auto"
          >
            Every ride,{" "}
            <span className="gradient-text">tailored to you.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
            className="mt-6 text-lg sm:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed"
          >
            From quick city hops to luxury airport transfers — RS CAB offers a
            complete suite of ride-sharing services designed around your needs.
          </motion.p>
        </div>
      </section>

      {/* ═══════ OUR SERVICES ═══════ */}
      <section className="hero-dark relative py-24 lg:py-32 overflow-hidden">
        <div className="line-grid absolute inset-0 pointer-events-none" />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent/[0.04] rounded-full blur-[160px]" />
        <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-secondary/[0.05] rounded-full blur-[140px]" />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <RevealSection className="text-center mb-16">
            <span className="pill mb-4 inline-block">Services</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.15]">
              A ride for{" "}
              <span className="gradient-text">every occasion.</span>
            </h2>
          </RevealSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((s, i) => (
              <RevealSection key={s.title} delay={i * 0.1}>
                <motion.div
                  variants={cardHover}
                  initial="rest"
                  whileHover="hover"
                  className="card-dark p-0 overflow-hidden group h-full"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden bezel rounded-b-none">
                    <motion.div
                      variants={imageHover}
                      className="absolute inset-0"
                    >
                      <Image
                        src={s.image}
                        alt={s.title}
                        fill
                        className="object-cover"
                      />
                    </motion.div>
                    <div className="absolute inset-0 bg-gradient-to-t from-dark/60 to-transparent" />
                    {/* Icon badge */}
                    <div className="absolute bottom-4 left-4 inline-flex items-center justify-center w-11 h-11 rounded-xl bg-secondary/90 shadow-lg glow-green">
                      <s.icon className="text-dark" size={22} />
                    </div>
                  </div>
                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white">{s.title}</h3>
                    <p className="mt-3 text-white/40 text-sm leading-relaxed">
                      {s.description}
                    </p>
                    <Link
                      href="/rider/book"
                      className="inline-flex items-center gap-1.5 mt-5 text-sm font-semibold text-secondary hover:text-secondary-light transition-colors"
                    >
                      Learn More <ArrowRight size={16} />
                    </Link>
                  </div>
                </motion.div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FLEET ═══════ */}
      <section className="hero-dark relative py-24 lg:py-32 overflow-hidden">
        <div className="dot-grid absolute inset-0 pointer-events-none" />
        <div className="noise-overlay absolute inset-0 pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-secondary/[0.04] rounded-full blur-[150px] -translate-y-1/2" />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <RevealSection className="text-center mb-16">
            <span className="pill mb-4 inline-block">Our Fleet</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.15]">
              Choose your{" "}
              <span className="gradient-text">perfect ride.</span>
            </h2>
          </RevealSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {fleet.map((v, i) => (
              <RevealSection key={v.name} delay={i * 0.12}>
                <motion.div
                  variants={cardHover}
                  initial="rest"
                  whileHover="hover"
                  className="card-dark p-0 overflow-hidden group h-full"
                >
                  <div className="relative h-44 overflow-hidden bezel rounded-b-none">
                    <motion.div
                      variants={imageHover}
                      className="absolute inset-0"
                    >
                      <Image
                        src={v.image}
                        alt={v.name}
                        fill
                        className="object-cover"
                      />
                    </motion.div>
                    <div className="absolute inset-0 bg-gradient-to-t from-dark/70 to-transparent" />
                    {/* Price tag */}
                    <div className="absolute bottom-3 right-3 pill text-xs font-bold text-secondary">
                      {v.price}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-white">{v.name}</h3>
                    <p className="text-white/40 text-sm">{v.type}</p>
                    <ul className="mt-4 space-y-2">
                      {v.features.map((f) => (
                        <li
                          key={f}
                          className="flex items-center gap-2 text-sm text-white/50"
                        >
                          <Check
                            size={14}
                            className="text-secondary shrink-0"
                          />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ COVERAGE ═══════ */}
      <section className="hero-dark relative py-24 lg:py-32 overflow-hidden">
        <div className="line-grid absolute inset-0 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/[0.04] rounded-full blur-[160px]" />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Map */}
            <RevealSection>
              <div className="glass-dark rounded-2xl p-0 overflow-hidden relative bezel">
                <Image
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=500&fit=crop"
                  alt="Coverage map"
                  width={800}
                  height={500}
                  className="w-full h-[380px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark/70 via-dark/30 to-transparent" />
                <div className="absolute bottom-6 left-6 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-secondary animate-pulse-glow" />
                  <span className="text-white font-semibold text-sm">
                    Live coverage across 50+ cities
                  </span>
                </div>
              </div>
            </RevealSection>

            {/* City list */}
            <RevealSection delay={0.15}>
              <span className="pill mb-4 inline-block">Coverage</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.15]">
                Wherever you are,{" "}
                <span className="gradient-text">we&apos;re there.</span>
              </h2>
              <p className="mt-6 text-lg text-white/40 leading-relaxed">
                RS CAB operates across major cities in the United Kingdom, with
                new locations launching every month.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-10">
                {cities.map((city, i) => (
                  <motion.div
                    key={city}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{
                      duration: 0.5,
                      ease: "easeOut",
                      delay: i * 0.05,
                    }}
                    whileHover={{
                      scale: 1.05,
                      borderColor: "rgba(0, 230, 118, 0.3)",
                    }}
                    className="flex items-center gap-2.5 py-2.5 px-4 rounded-xl glass-card hover:bg-secondary/[0.06] transition-all cursor-default"
                  >
                    <MapPin size={15} className="text-secondary shrink-0" />
                    <span className="text-sm font-medium text-white/70">
                      {city}
                    </span>
                  </motion.div>
                ))}
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section className="hero-dark relative py-24 lg:py-32 overflow-hidden">
        <div className="dot-grid absolute inset-0 pointer-events-none" />
        <div className="noise-overlay absolute inset-0 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-secondary/[0.06] rounded-full blur-[200px]" />

        <RevealSection className="relative mx-auto max-w-4xl px-5 sm:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.15]">
            Your next ride is{" "}
            <span className="gradient-text">just a tap away.</span>
          </h2>
          <p className="mt-6 text-lg text-white/50 max-w-xl mx-auto leading-relaxed">
            Download the RS CAB app or book online. Experience the premium
            ride-sharing service trusted by thousands.
          </p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            <Link
              href="/rider/book"
              className="btn-green inline-flex items-center gap-2 text-lg"
            >
              <Zap size={20} />
              Book Now
            </Link>
            <Link
              href="/contact"
              className="btn-secondary inline-flex items-center gap-2 text-lg"
            >
              Get in Touch <ArrowRight size={20} />
            </Link>
          </motion.div>
        </RevealSection>
      </section>

      <Footer />
    </>
  );
}
