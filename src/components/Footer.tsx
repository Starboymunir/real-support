import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail, ArrowUpRight, Zap } from 'lucide-react';

const quickLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Contact', href: '/contact' },
  { label: 'Book a Ride', href: '/rider/book' },
];

const driverLinks = [
  { label: 'Drive with Us', href: '/driver' },
  { label: 'Driver Dashboard', href: '/driver/dashboard' },
  { label: 'Company Portal', href: '/company/company-login' },
];

export default function Footer() {
  return (
    <footer className="relative bg-dark overflow-hidden">
      {/* Decorative top edge */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />
      
      {/* Glowing orbs */}
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-secondary/[0.03] rounded-full blur-[150px]" />
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-accent/[0.02] rounded-full blur-[120px]" />

      {/* CTA strip */}
      <div className="relative border-b border-white/5">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-16 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              Ready for your next ride?
            </h3>
            <p className="text-white/40 mt-2 max-w-md">
              Download the app or book online. Your driver is just seconds away.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <Link
              href="/rider/book"
              className="group inline-flex items-center gap-2 bg-secondary text-dark font-bold px-7 py-3.5 rounded-full hover:shadow-[0_0_30px_rgba(0,230,118,0.4)] hover:scale-105 transition-all duration-300"
            >
              <Zap size={18} />
              Book Now
            </Link>
            <a
              href="https://play.google.com/store/apps/details?id=com.psslrscab"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/[0.06] text-white/80 hover:text-white hover:bg-white/10 font-semibold px-7 py-3.5 rounded-full border border-white/[0.08] transition-all duration-300"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.61 1.814L13.793 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734c0-.382.218-.72.61-.92zM14.5 12.707l2.55 2.55-8.1 4.61 5.55-7.16zM17.85 8.133l-8.1-4.61 5.55 7.16 2.55-2.55zM20.16 10.94l-2.19-1.24-2.76 2.3 2.76 2.3 2.19-1.24c.77-.44.77-1.68 0-2.12z" />
              </svg>
              Google Play
            </a>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-5">
              <Image
                src="/images/brand/logo.png"
                alt="RS CAB"
                width={120}
                height={40}
                className="object-contain"
              />
            </Link>
            <p className="text-white/40 text-sm leading-relaxed mb-6 max-w-[260px]">
              Premium ride-sharing trusted by thousands across the UK. Your journey, our priority.
            </p>
            {/* Social */}
            <div className="flex gap-2">
              {['F', 'X', 'I', 'L'].map((letter) => (
                <div
                  key={letter}
                  className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-xs font-bold text-white/40 hover:bg-secondary hover:text-dark hover:border-secondary transition-all duration-300 cursor-pointer"
                >
                  {letter}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-widest mb-6">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-2 text-white/40 hover:text-secondary text-sm transition-colors duration-300"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-secondary transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Drivers */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-widest mb-6">
              For Drivers
            </h4>
            <ul className="space-y-3">
              {driverLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-2 text-white/40 hover:text-secondary text-sm transition-colors duration-300"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-secondary transition-colors" />
                    {link.label}
                    <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-widest mb-6">
              Contact Us
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-white/40">
                <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin size={14} className="text-secondary" />
                </div>
                <span className="leading-relaxed">93 Austin Road,<br />LU3 1TZ Luton</span>
              </li>
              <li>
                <a
                  href="tel:+447769372911"
                  className="flex items-center gap-3 text-sm text-white/40 hover:text-secondary transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
                    <Phone size={14} className="text-secondary" />
                  </div>
                  +44 7769 372 911
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@real-support.co.uk"
                  className="flex items-center gap-3 text-sm text-white/40 hover:text-secondary transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
                    <Mail size={14} className="text-secondary" />
                  </div>
                  info@real-support.co.uk
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/25">
          <span>&copy; 2026 Professional Service Support Ltd. All rights reserved.</span>
          <div className="flex gap-8">
            <Link href="/privacy" className="hover:text-white/50 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white/50 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
