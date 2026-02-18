import Image from "next/image";
import Link from "next/link";
import {
  Shield,
  Eye,
  Clock,
  Zap,
  ArrowRight,
  Car,
  Users,
  MapPin,
  Star,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const stats = [
  { icon: Car, value: "15K+", label: "Rides Completed" },
  { icon: Users, value: "500+", label: "Verified Drivers" },
  { icon: MapPin, value: "50+", label: "Cities Covered" },
  { icon: Star, value: "4.9★", label: "Average Rating" },
];

const values = [
  {
    icon: Shield,
    title: "Safety First",
    description:
      "Every driver is background-checked, every vehicle inspected, and every ride tracked in real time for your peace of mind.",
    gradient: "from-emerald-500 to-green-600",
  },
  {
    icon: Eye,
    title: "Transparency",
    description:
      "No hidden fees, no surge surprises. You see the price before you book. Clear, honest, and straightforward — always.",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    icon: Clock,
    title: "Reliability",
    description:
      "On-time pickups, every time. Our smart dispatch system and dedicated fleet ensure you reach your destination without delay.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: Zap,
    title: "Innovation",
    description:
      "From AI-powered routing to seamless in-app payments, we continuously push the boundaries of what ride-sharing can be.",
    gradient: "from-amber-500 to-orange-600",
  },
];

const leaders = [
  {
    name: "James Whitfield",
    role: "Chief Executive Officer",
    bio: "15+ years in mobility tech. Previously led operations at a top European ride-sharing platform.",
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop&crop=face",
  },
  {
    name: "Sarah Mitchell",
    role: "Chief Operating Officer",
    bio: "Former logistics director with a passion for creating seamless urban transport experiences.",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=face",
  },
  {
    name: "David Chen",
    role: "Chief Technology Officer",
    bio: "Full-stack architect & ML engineer. Building the tech stack that powers the next generation of rides.",
    image:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop&crop=face",
  },
];

export const metadata = {
  title: "About Us — RS CAB",
  description:
    "Learn about RS CAB's mission, values, and the team driving the future of urban mobility.",
};

export default function AboutPage() {
  return (
    <>
      <Navbar />

      {/* ═══════ HERO ═══════ */}
      <section className="hero-dark relative overflow-hidden">
        <div className="dot-grid absolute inset-0 pointer-events-none" />
        {/* Decorative orbs */}
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-secondary/[0.06] rounded-full blur-[160px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent/[0.04] rounded-full blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 pt-36 pb-24 lg:pt-44 lg:pb-32 text-center">
          <span className="badge-green mb-6 inline-block">Our Story</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1] max-w-4xl mx-auto">
            Driving the future of{" "}
            <span className="gradient-text">urban mobility.</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
            RS CAB was founded with a single purpose — to make every journey
            safe, comfortable, and effortless. We&apos;re building the premium
            ride-sharing experience the UK deserves.
          </p>

          <div className="mt-14 relative rounded-2xl overflow-hidden max-w-5xl mx-auto shadow-2xl shadow-black/30">
            <Image
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=600&fit=crop"
              alt="RS CAB team collaborating"
              width={1200}
              height={600}
              className="w-full h-auto object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark/60 via-transparent to-transparent" />
          </div>
        </div>
      </section>

      {/* ═══════ OUR MISSION ═══════ */}
      <section className="bg-light py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Text */}
            <div>
              <span className="badge-green mb-4 inline-block">Our Mission</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-text-primary leading-[1.15]">
                Moving cities forward,{" "}
                <span className="gradient-text">one ride at a time.</span>
              </h2>
              <p className="mt-6 text-lg text-text-secondary leading-relaxed">
                We believe mobility is a right, not a luxury. RS CAB connects
                riders and drivers through cutting-edge technology, fair pricing,
                and an uncompromising commitment to safety.
              </p>
              <p className="mt-4 text-lg text-text-secondary leading-relaxed">
                From airport transfers to cross-city commutes, our mission is to
                become the most trusted name in ride-sharing across the United
                Kingdom — and beyond.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/services" className="btn-green inline-flex items-center gap-2">
                  Explore Services <ArrowRight size={18} />
                </Link>
                <Link href="/contact" className="btn-outline-green inline-flex items-center gap-2">
                  Contact Us
                </Link>
              </div>
            </div>

            {/* Image */}
            <div className="card-premium p-0 overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop"
                alt="London cityscape"
                width={800}
                height={600}
                className="w-full h-[400px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ BY THE NUMBERS ═══════ */}
      <section className="hero-dark relative py-24 lg:py-32">
        <div className="line-grid absolute inset-0 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 text-center">
          <span className="badge-green mb-4 inline-block">By the Numbers</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.15]">
            Trusted by thousands,{" "}
            <span className="gradient-text">every single day.</span>
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-16 stagger-children">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="card-dark text-center group hover:glow-green"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-secondary/10 mb-5 group-hover:bg-secondary/20 transition-colors">
                  <stat.icon className="text-secondary" size={26} />
                </div>
                <p className="text-4xl sm:text-5xl font-black text-white tabular-nums">
                  {stat.value}
                </p>
                <p className="mt-2 text-white/40 text-sm font-medium uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ OUR VALUES ═══════ */}
      <section className="bg-light py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 text-center">
          <span className="badge-green mb-4 inline-block">Our Values</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-text-primary leading-[1.15] max-w-3xl mx-auto">
            Principles that{" "}
            <span className="gradient-text">define every ride.</span>
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16 stagger-children">
            {values.map((v) => (
              <div key={v.title} className="card-premium text-left group">
                <div
                  className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${v.gradient} mb-5 shadow-lg`}
                >
                  <v.icon className="text-white" size={26} />
                </div>
                <h3 className="text-xl font-bold text-text-primary">
                  {v.title}
                </h3>
                <p className="mt-3 text-text-secondary text-sm leading-relaxed">
                  {v.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ LEADERSHIP ═══════ */}
      <section className="hero-dark relative py-24 lg:py-32 overflow-hidden">
        <div className="dot-grid absolute inset-0 pointer-events-none" />
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-accent/[0.04] rounded-full blur-[160px] -translate-y-1/2" />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 text-center">
          <span className="badge-green mb-4 inline-block">Leadership</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.15]">
            Meet the team{" "}
            <span className="gradient-text">behind the wheel.</span>
          </h2>

          <div className="grid sm:grid-cols-3 gap-8 mt-16 stagger-children">
            {leaders.map((person) => (
              <div
                key={person.name}
                className="glass-card rounded-2xl p-8 text-center group hover:border-secondary/20 transition-all duration-400"
              >
                <div className="relative w-28 h-28 mx-auto mb-6 rounded-full overflow-hidden ring-2 ring-white/10 group-hover:ring-secondary/30 transition-all">
                  <Image
                    src={person.image}
                    alt={person.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="badge-green text-xs">{person.role}</span>
                <h3 className="text-xl font-bold text-white mt-3">
                  {person.name}
                </h3>
                <p className="mt-3 text-white/40 text-sm leading-relaxed">
                  {person.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section className="bg-light py-24 lg:py-32">
        <div className="mx-auto max-w-4xl px-5 sm:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-text-primary leading-[1.15]">
            Ready to experience{" "}
            <span className="gradient-text">RS CAB?</span>
          </h2>
          <p className="mt-6 text-lg text-text-secondary max-w-xl mx-auto leading-relaxed">
            Join thousands of riders who trust RS CAB for safe, premium,
            on-demand transport across the UK.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/rider/book"
              className="btn-green inline-flex items-center gap-2 text-lg"
            >
              <Zap size={20} />
              Book a Ride
            </Link>
            <Link
              href="/driver"
              className="btn-primary inline-flex items-center gap-2 text-lg"
            >
              Become a Driver <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
