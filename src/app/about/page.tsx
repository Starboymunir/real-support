import Image from 'next/image';
import Link from 'next/link';
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
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { fetchPublicContent } from '@/app/api/helpers/StaticContent';
import { resolveImageUrl } from '@/lib/api';

/* â”€â”€ data â”€â”€ */
const stats = [
  { icon: Car, value: '15K+', label: 'Rides' },
  { icon: Users, value: '500+', label: 'Drivers' },
  { icon: MapPin, value: '50+', label: 'Cities' },
  { icon: Star, value: '4.9â˜…', label: 'Rating' },
];

const values = [
  { icon: Shield, title: 'Safety First', desc: 'Every driver background-checked, every vehicle inspected, every ride tracked in real time.', color: '#00E676' },
  { icon: Eye, title: 'Transparency', desc: 'No hidden fees, no surge surprises. You see the price before you book â€” always.', color: '#00B0FF' },
  { icon: Clock, title: 'Reliability', desc: 'On-time pickups, every time. Smart dispatch ensures you arrive without delay.', color: '#E040FB' },
  { icon: Zap, title: 'Innovation', desc: 'AI-powered routing, seamless payments, constant improvements to your experience.', color: '#FFD600' },
];

const leaders = [
  { name: 'James Whitfield', role: 'CEO', bio: '15+ years in mobility tech. Previously led operations at a top European ride-sharing platform.', image: '/images/team/james.jpg' },
  { name: 'Sarah Mitchell', role: 'COO', bio: 'Former logistics director with a passion for creating seamless urban transport experiences.', image: '/images/team/sarah.jpg' },
  { name: 'David Chen', role: 'CTO', bio: 'Full-stack architect & ML engineer. Building the tech stack that powers the next generation of rides.', image: '/images/team/david.jpg' },
];

export default async function AboutPage() {
  const content = await fetchPublicContent('aboutUs');
  const hasDbContent = !!(content?.description);

  return (
    <>
      <Navbar />

      {/* â•â•â•â•â•â•â• HERO â•â•â•â•â•â•â• */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #000 0%, #060B14 60%, #0A1628 100%)' }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-secondary/[0.05] rounded-full blur-[140px] pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-6 sm:px-8 pt-36 pb-20 lg:pt-44 lg:pb-28">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-secondary text-sm font-semibold tracking-wide uppercase mb-5">Our Story</p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-[-0.03em] text-white leading-[1.05]">
              {content?.title || <>Driving the future of
              <br />
              <span className="text-white/25">urban mobility.</span></>}
            </h1>
            <p className="mt-6 text-lg text-white/40 max-w-2xl mx-auto leading-relaxed">
              One App was built with one purpose â€” to make every journey safe, comfortable, and effortless. We&apos;re creating the ride-sharing experience the UK deserves.
            </p>
          </div>

          {/* Hero image */}
          <div className="mt-16 relative rounded-2xl overflow-hidden max-w-5xl mx-auto border border-white/[0.06]">
            <Image
              src={content?.coverImage ? (resolveImageUrl(content.coverImage) || "/images/unsplash/team-collab.jpg") : "/images/unsplash/team-collab.jpg"}
              alt="One App team collaborating"
              width={1200}
              height={500}
              className="w-full h-auto object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060B14]/60 via-transparent to-transparent" />
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â• MISSION â€” Split layout â•â•â•â•â•â•â• */}
      <section className="py-28 lg:py-36" style={{ background: '#0A1628' }}>
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-secondary text-sm font-semibold tracking-wide uppercase mb-4">Our Mission</p>
              {hasDbContent ? (
                <div className="prose prose-invert max-w-none prose-p:text-white/35 prose-headings:text-white" dangerouslySetInnerHTML={{ __html: content.description }} />
              ) : (
                <>
                  <h2 className="text-4xl sm:text-5xl font-black text-white tracking-[-0.02em] leading-[1.1] mb-6">
                    Moving cities forward,
                    <br />
                    <span className="text-white/25">one ride at a time.</span>
                  </h2>
                  <p className="text-white/35 text-lg leading-relaxed mb-4">
                    We believe mobility is a right, not a luxury. One App connects riders and drivers through cutting-edge tech, fair pricing, and an uncompromising commitment to safety.
                  </p>
                  <p className="text-white/35 text-lg leading-relaxed mb-8">
                    From airport transfers to cross-city commutes, our goal is to become the most trusted name in ride-sharing across the United Kingdom.
                  </p>
                </>
              )}
              <div className="flex flex-wrap gap-3 mt-8">
                <Link href="/services" className="inline-flex items-center gap-2 bg-white text-black font-semibold text-sm px-6 py-3 rounded-full hover:shadow-[0_0_30px_rgba(255,255,255,0.12)] transition-all">
                  Explore Services <ArrowRight size={14} />
                </Link>
                <Link href="/contact" className="inline-flex items-center gap-2 text-sm font-medium text-white/50 px-6 py-3 rounded-full border border-white/[0.08] hover:border-white/20 hover:text-white/70 transition-all">
                  Contact Us
                </Link>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden border border-white/[0.06]">
              <Image
                src="/images/unsplash/london-city.jpg"
                alt="London cityscape"
                width={800}
                height={600}
                className="w-full h-[400px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â• STATS â€” Inline â•â•â•â•â•â•â• */}
      <section className="border-y border-white/[0.04]" style={{ background: '#060B14' }}>
        <div className="mx-auto max-w-7xl px-6 sm:px-8 py-14">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-white/[0.04] flex items-center justify-center">
                  <s.icon size={18} className="text-secondary" />
                </div>
                <p className="text-3xl sm:text-4xl font-black text-white">{s.value}</p>
                <p className="text-white/30 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â• VALUES â€” Horizontal cards with left accent â•â•â•â•â•â•â• */}
      <section className="py-28 lg:py-36" style={{ background: 'linear-gradient(180deg, #060B14 0%, #0A1628 100%)' }}>
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="max-w-2xl mb-16">
            <p className="text-secondary text-sm font-semibold tracking-wide uppercase mb-4">Our Values</p>
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-[-0.02em] leading-[1.1]">
              Principles behind
              <br />
              <span className="text-white/25">every ride.</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div
                  key={v.title}
                  className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-7 transition-all duration-400 hover:border-white/[0.10] hover:bg-white/[0.03]"
                >
                  <div className="flex items-start gap-5">
                    <div className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${v.color}12` }}>
                      <Icon size={22} style={{ color: v.color }} />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg mb-2">{v.title}</h3>
                      <p className="text-white/35 text-sm leading-relaxed">{v.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â• LEADERSHIP â•â•â•â•â•â•â• */}
      <section className="py-28 lg:py-36" style={{ background: '#0A1628' }}>
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="text-center mb-16">
            <p className="text-secondary text-sm font-semibold tracking-wide uppercase mb-4">Leadership</p>
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-[-0.02em]">
              Meet the team.
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {leaders.map((p) => (
              <div
                key={p.name}
                className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 text-center transition-all duration-400 hover:border-white/[0.10]"
              >
                <div className="w-24 h-24 mx-auto mb-5 rounded-full overflow-hidden ring-1 ring-white/[0.06] group-hover:ring-secondary/20 transition-all">
                  <Image src={p.image} alt={p.name} width={96} height={96} className="object-cover w-full h-full" />
                </div>
                <p className="inline-block text-[11px] uppercase tracking-wider text-secondary font-semibold px-3 py-1 rounded-full bg-secondary/[0.08] mb-3">{p.role}</p>
                <h3 className="text-white font-bold text-lg">{p.name}</h3>
                <p className="text-white/30 text-sm leading-relaxed mt-2">{p.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â• CTA â•â•â•â•â•â•â• */}
      <section className="py-28 lg:py-36 relative overflow-hidden" style={{ background: '#060B14' }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[250px] bg-secondary/[0.04] rounded-full blur-[100px] pointer-events-none" />

        <div className="relative mx-auto max-w-3xl px-6 sm:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-[-0.02em] mb-5">
            Experience One App.
          </h2>
          <p className="text-white/35 text-lg max-w-lg mx-auto mb-10">
            Safe, premium, on-demand transport across the UK.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/rider/book" className="group inline-flex items-center gap-2.5 bg-white text-black font-semibold text-[15px] px-8 py-4 rounded-full hover:shadow-[0_0_40px_rgba(255,255,255,0.12)] transition-all">
              Book a Ride <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
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
