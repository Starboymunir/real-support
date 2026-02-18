import Image from "next/image";
import Link from "next/link";
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

export const metadata = {
  title: "Services — RS CAB",
  description:
    "Explore RS CAB's ride-sharing services: airport transfers, city rides, corporate travel, long distance, events, and parcel delivery.",
};

export default function ServicesPage() {
  return (
    <>
      <Navbar />

      {/* ═══════ HERO ═══════ */}
      <section className="hero-dark relative overflow-hidden">
        <div className="dot-grid absolute inset-0 pointer-events-none" />
        <div className="absolute top-10 right-1/4 w-[600px] h-[600px] bg-secondary/[0.06] rounded-full blur-[180px]" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-accent/[0.04] rounded-full blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 pt-36 pb-24 lg:pt-44 lg:pb-32 text-center">
          <span className="badge-green mb-6 inline-block">What We Offer</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1] max-w-4xl mx-auto">
            Every ride,{" "}
            <span className="gradient-text">tailored to you.</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
            From quick city hops to luxury airport transfers — RS CAB offers a
            complete suite of ride-sharing services designed around your needs.
          </p>
        </div>
      </section>

      {/* ═══════ OUR SERVICES ═══════ */}
      <section className="bg-light py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="text-center mb-16">
            <span className="badge-green mb-4 inline-block">Services</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-text-primary leading-[1.15]">
              A ride for{" "}
              <span className="gradient-text">every occasion.</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
            {services.map((s) => (
              <div key={s.title} className="card-premium p-0 overflow-hidden group">
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={s.image}
                    alt={s.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  {/* Icon badge */}
                  <div className="absolute bottom-4 left-4 inline-flex items-center justify-center w-11 h-11 rounded-xl bg-secondary/90 shadow-lg">
                    <s.icon className="text-dark" size={22} />
                  </div>
                </div>
                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-text-primary">
                    {s.title}
                  </h3>
                  <p className="mt-3 text-text-secondary text-sm leading-relaxed">
                    {s.description}
                  </p>
                  <Link
                    href="/rider/book"
                    className="inline-flex items-center gap-1.5 mt-5 text-sm font-semibold text-secondary-dark hover:text-secondary transition-colors"
                  >
                    Learn More <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FLEET ═══════ */}
      <section className="hero-dark relative py-24 lg:py-32 overflow-hidden">
        <div className="line-grid absolute inset-0 pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-secondary/[0.04] rounded-full blur-[150px] -translate-y-1/2" />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="text-center mb-16">
            <span className="badge-green mb-4 inline-block">Our Fleet</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.15]">
              Choose your{" "}
              <span className="gradient-text">perfect ride.</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {fleet.map((v) => (
              <div key={v.name} className="card-dark p-0 overflow-hidden group">
                <div className="relative h-44 overflow-hidden">
                  <Image
                    src={v.image}
                    alt={v.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark/70 to-transparent" />
                  {/* Price tag */}
                  <div className="absolute bottom-3 right-3 badge-green text-xs font-bold">
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
                        <Check size={14} className="text-secondary shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ COVERAGE ═══════ */}
      <section className="bg-light py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Map placeholder */}
            <div className="card-premium p-0 overflow-hidden relative">
              <Image
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=500&fit=crop"
                alt="Coverage map"
                width={800}
                height={500}
                className="w-full h-[380px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-primary/20 to-transparent" />
              <div className="absolute bottom-6 left-6 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-secondary animate-pulse-glow" />
                <span className="text-white font-semibold text-sm">
                  Live coverage across 50+ cities
                </span>
              </div>
            </div>

            {/* City list */}
            <div>
              <span className="badge-green mb-4 inline-block">Coverage</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-text-primary leading-[1.15]">
                Wherever you are,{" "}
                <span className="gradient-text">we&apos;re there.</span>
              </h2>
              <p className="mt-6 text-lg text-text-secondary leading-relaxed">
                RS CAB operates across major cities in the United Kingdom, with
                new locations launching every month.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-10">
                {cities.map((city) => (
                  <div
                    key={city}
                    className="flex items-center gap-2.5 py-2.5 px-4 rounded-xl bg-white border border-gray-100 hover:border-secondary/30 hover:shadow-sm transition-all"
                  >
                    <MapPin size={15} className="text-secondary shrink-0" />
                    <span className="text-sm font-medium text-text-primary">
                      {city}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section className="hero-dark relative py-24 lg:py-32">
        <div className="dot-grid absolute inset-0 pointer-events-none" />

        <div className="relative mx-auto max-w-4xl px-5 sm:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.15]">
            Your next ride is{" "}
            <span className="gradient-text">just a tap away.</span>
          </h2>
          <p className="mt-6 text-lg text-white/50 max-w-xl mx-auto leading-relaxed">
            Download the RS CAB app or book online. Experience the premium
            ride-sharing service trusted by thousands.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
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
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
