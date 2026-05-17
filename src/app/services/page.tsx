import Image from 'next/image';
import Link from 'next/link';
import {
  Plane,
  Building2,
  Route,
  PartyPopper,
  Package,
  Car,
  ArrowRight,
  Check,
  MapPin,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { fetchPublicContent } from '@/app/api/helpers/StaticContent';
import { resolveImageUrl } from '@/lib/api';

/* â”€â”€ data â”€â”€ */
const services = [
  {
    icon: Plane,
    title: 'Airport Transfers',
    description: 'Punctual pick-ups and drop-offs at all major UK airports. Flight tracking, meet-and-greet, and complimentary wait time included.',
    image: '/images/services/airport.jpg',
    color: '#00E676',
  },
  {
    icon: Car,
    title: 'City Rides',
    description: 'On-demand rides across the city in minutes. Smart routing, transparent pricing, and professional drivers â€” always.',
    image: '/images/services/city-rides.jpg',
    color: '#00B0FF',
  },
  {
    icon: Building2,
    title: 'Corporate Travel',
    description: 'Dedicated account management, monthly invoicing, and priority dispatch for your entire organisation.',
    image: '/images/services/corporate.jpg',
    color: '#E040FB',
  },
  {
    icon: Route,
    title: 'Long Distance',
    description: 'Comfortable inter-city journeys with fixed pricing. Sit back and relax while we handle the drive.',
    image: '/images/services/long-distance.jpg',
    color: '#FFD600',
  },
  {
    icon: PartyPopper,
    title: 'Events & Weddings',
    description: 'Arrive in style. Luxury vehicles for weddings, galas, proms, and special occasions with white-glove service.',
    image: '/images/services/wedding.jpg',
    color: '#FF5252',
  },
  {
    icon: Package,
    title: 'Parcel Delivery',
    description: 'Same-day courier service. Tracked, insured, and delivered by trusted One App drivers across the city.',
    image: '/images/services/parcel.jpg',
    color: '#00E5FF',
  },
];

const fleet = [
  {
    name: 'Economy',
    type: 'Sedan',
    price: 'from Â£5',
    image: '/images/fleet/economy.jpg',
    features: ['4 passengers', '2 bags', 'AC & WiFi', 'Cashless payment'],
  },
  {
    name: 'Comfort',
    type: 'SUV',
    price: 'from Â£12',
    image: '/images/fleet/comfort.jpg',
    features: ['4 passengers', '3 bags', 'Leather seats', 'Premium audio'],
  },
  {
    name: 'Premium',
    type: 'Luxury',
    price: 'from Â£25',
    image: '/images/fleet/premium.jpg',
    features: ['4 passengers', '3 bags', 'Executive class', 'Complimentary water'],
  },
  {
    name: 'XL / Van',
    type: 'People Carrier',
    price: 'from Â£18',
    image: '/images/fleet/xl-van.jpg',
    features: ['6 passengers', '5 bags', 'Spacious cabin', 'Group travel'],
  },
];

const cities = [
  'London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow', 'Edinburgh',
  'Liverpool', 'Bristol', 'Sheffield', 'Cardiff', 'Nottingham', 'Newcastle',
];

export default async function ServicesPage() {
  const content = await fetchPublicContent('services');
  const hasDbContent = !!(content?.description);

  return (
    <>
      <Navbar />

      {/* â•â•â•â•â•â•â• HERO â•â•â•â•â•â•â• */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #000 0%, #060B14 60%, #0A1628 100%)' }}>
        <div className="absolute top-0 right-1/4 w-[600px] h-[350px] bg-secondary/[0.04] rounded-full blur-[140px] pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-6 sm:px-8 pt-36 pb-20 lg:pt-44 lg:pb-28 text-center">
          <p className="text-secondary text-sm font-semibold tracking-wide uppercase mb-5">What We Offer</p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-[-0.03em] text-white leading-[1.05]">
            {content?.title || <>Every ride,
            <br />
            <span className="text-white/25">tailored to you.</span></>}
          </h1>
          <p className="mt-6 text-lg text-white/40 max-w-2xl mx-auto leading-relaxed">
            From quick city hops to luxury airport transfers â€” One App offers a complete suite of ride-sharing services designed around your needs.
          </p>
        </div>
      </section>


      {/* DB Content Section */}
      {hasDbContent && (
        <section className="py-20 lg:py-28" style={{ background: '#0A1628' }}>
          <div className="mx-auto max-w-4xl px-6 sm:px-8">
            {content.coverImage && (
              <div className="mb-10 rounded-2xl overflow-hidden border border-white/[0.06]">
                <Image
                  src={resolveImageUrl(content.coverImage) || content.coverImage}
                  alt={content.title || 'Services'}
                  width={1200}
                  height={500}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}
            <div className="prose prose-invert max-w-none prose-p:text-white/40 prose-headings:text-white prose-a:text-secondary" dangerouslySetInnerHTML={{ __html: content.description }} />
          </div>
        </section>
      )}
      {/* â•â•â•â•â•â•â• SERVICES â€” Alternating rows â•â•â•â•â•â•â• */}
      <section className="py-28 lg:py-36" style={{ background: '#0A1628' }}>
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="max-w-2xl mb-20">
            <p className="text-secondary text-sm font-semibold tracking-wide uppercase mb-4">Services</p>
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-[-0.02em] leading-[1.1]">
              A ride for
              <br />
              <span className="text-white/25">every occasion.</span>
            </h2>
          </div>

          <div className="space-y-6">
            {services.map((s, i) => {
              const Icon = s.icon;
              const isEven = i % 2 === 0;
              return (
                <div
                  key={s.title}
                  className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden transition-all duration-400 hover:border-white/[0.10] hover:bg-white/[0.03]"
                >
                  <div className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-stretch`}>
                    {/* Image */}
                    <div className="lg:w-2/5 relative overflow-hidden">
                      <Image
                        src={s.image}
                        alt={s.title}
                        width={600}
                        height={400}
                        className="w-full h-56 lg:h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-${isEven ? 'r' : 'l'} from-transparent to-[#0A1628]/80 hidden lg:block`} />
                    </div>

                    {/* Content */}
                    <div className="lg:w-3/5 p-8 lg:p-10 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}12` }}>
                          <Icon size={20} style={{ color: s.color }} />
                        </div>
                        <h3 className="text-xl font-bold text-white">{s.title}</h3>
                      </div>
                      <p className="text-white/35 leading-relaxed mb-6">{s.description}</p>
                      <div>
                        <Link
                          href="/rider/book"
                          className="inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:gap-3 transition-all"
                        >
                          Book Now <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â• FLEET â€” Horizontal cards â•â•â•â•â•â•â• */}
      <section className="py-28 lg:py-36" style={{ background: 'linear-gradient(180deg, #060B14 0%, #0A1628 100%)' }}>
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="text-center mb-16">
            <p className="text-secondary text-sm font-semibold tracking-wide uppercase mb-4">Our Fleet</p>
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-[-0.02em]">
              Choose your perfect ride.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {fleet.map((v) => (
              <div
                key={v.name}
                className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden transition-all duration-400 hover:border-white/[0.10]"
              >
                <div className="relative h-44 overflow-hidden">
                  <Image
                    src={v.image}
                    alt={v.name}
                    width={600}
                    height={400}
                    className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#060B14]/70 to-transparent" />
                  <span className="absolute bottom-3 right-3 text-xs font-bold text-secondary bg-secondary/[0.12] px-3 py-1 rounded-full">
                    {v.price}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-white">{v.name}</h3>
                  <p className="text-white/30 text-sm mb-4">{v.type}</p>
                  <ul className="space-y-2">
                    {v.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-white/35">
                        <Check size={13} className="text-secondary shrink-0" />
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

      {/* â•â•â•â•â•â•â• COVERAGE â€” Split layout â•â•â•â•â•â•â• */}
      <section className="py-28 lg:py-36" style={{ background: '#0A1628' }}>
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Map image */}
            <div className="rounded-2xl overflow-hidden border border-white/[0.06] relative">
              <Image
                src="/images/unsplash/map-coverage.jpg"
                alt="Coverage map"
                width={800}
                height={500}
                className="w-full h-[240px] sm:h-[320px] lg:h-[380px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/70 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" />
                <span className="text-white text-sm font-medium">Live across 50+ cities</span>
              </div>
            </div>

            {/* City list */}
            <div>
              <p className="text-secondary text-sm font-semibold tracking-wide uppercase mb-4">Coverage</p>
              <h2 className="text-4xl sm:text-5xl font-black text-white tracking-[-0.02em] leading-[1.1] mb-6">
                Wherever you are,
                <br />
                <span className="text-white/25">we&apos;re there.</span>
              </h2>
              <p className="text-white/35 text-lg leading-relaxed mb-10">
                One App operates across major cities in the United Kingdom, with new locations launching every month.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {cities.map((city) => (
                  <div
                    key={city}
                    className="flex items-center gap-2.5 py-2.5 px-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.10] hover:bg-white/[0.04] transition-all"
                  >
                    <MapPin size={14} className="text-secondary shrink-0" />
                    <span className="text-sm font-medium text-white/50">{city}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â• CTA â•â•â•â•â•â•â• */}
      <section className="py-28 lg:py-36 relative overflow-hidden" style={{ background: '#060B14' }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[250px] bg-secondary/[0.04] rounded-full blur-[100px] pointer-events-none" />

        <div className="relative mx-auto max-w-3xl px-6 sm:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-[-0.02em] mb-5">
            Your next ride is just a tap away.
          </h2>
          <p className="text-white/35 text-lg max-w-lg mx-auto mb-10">
            Download One App or book online. Experience the premium ride-sharing service trusted by thousands.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/rider/book" className="group inline-flex items-center gap-2.5 bg-white text-black font-semibold text-[15px] px-8 py-4 rounded-full hover:shadow-[0_0_40px_rgba(255,255,255,0.12)] transition-all">
              Book Now <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-2 text-[15px] font-medium text-white/50 px-7 py-4 rounded-full border border-white/[0.08] hover:border-white/20 hover:text-white/70 transition-all">
              Get in Touch
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
