'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ArrowRight } from 'lucide-react';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

const portalLinks = [
  { label: 'Rider Dashboard', href: '/rider/dashboard' },
  { label: 'Driver Portal', href: '/driver' },
  { label: 'Company Portal', href: '/company/company-login' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-dark/90 backdrop-blur-xl border-b border-white/5 shadow-2xl shadow-black/10'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto max-w-7xl flex items-center justify-between px-5 sm:px-8 h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group py-2">
            <Image
              src="/images/brand/logo.png"
              alt="RS CAB"
              width={100}
              height={34}
              className="object-contain max-h-10 transition-transform duration-300 group-hover:scale-105"
              priority
            />
          </Link>

          {/* Center nav â€” desktop */}
          <div className="hidden lg:flex items-center gap-1 bg-white/[0.06] backdrop-blur-md rounded-full px-2 py-1.5 border border-white/[0.08]">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-5 py-2 text-sm font-medium text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-all duration-300"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right actions â€” desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-white/70 hover:text-white px-5 py-2.5 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/rider/book"
              className="group relative inline-flex items-center gap-2 bg-secondary text-dark font-bold text-sm px-6 py-2.5 rounded-full overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,230,118,0.4)] hover:scale-105"
            >
              <span className="relative z-10">Book a Ride</span>
              <ArrowRight size={16} className="relative z-10 transition-transform group-hover:translate-x-1" />
              <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary-light to-secondary bg-[length:200%_100%] animate-gradient opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>

          {/* Hamburger â€” mobile */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 text-white/80 hover:text-white transition-colors"
            aria-label="Open menu"
          >
            <Menu size={26} />
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile drawer */}
      <aside
        className={`fixed top-0 right-0 z-[70] h-full w-80 max-w-[calc(100vw-3rem)] bg-dark-surface shadow-2xl transform transition-transform duration-500 ease-out lg:hidden ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 h-20 border-b border-white/5">
          <span className="font-bold text-secondary text-lg tracking-tight">RS CAB</span>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 text-white/50 hover:text-white transition-colors rounded-full hover:bg-white/5"
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* Drawer nav */}
        <nav className="flex flex-col p-6 gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="py-3.5 px-4 rounded-xl text-white/70 hover:text-white hover:bg-white/5 font-medium transition-all"
            >
              {link.label}
            </Link>
          ))}

          <div className="my-5 h-px bg-white/5" />

          <Link
            href="/login"
            onClick={() => setMobileOpen(false)}
            className="py-3.5 px-4 rounded-xl text-center font-semibold text-white/70 border border-white/10 hover:bg-white/5 hover:text-white transition-all"
          >
            Sign In
          </Link>
          <Link
            href="/rider/book"
            onClick={() => setMobileOpen(false)}
            className="mt-2 py-3.5 px-4 rounded-xl text-center font-bold bg-secondary text-dark flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(0,230,118,0.3)] transition-all"
          >
            Book a Ride
            <ArrowRight size={18} />
          </Link>

          <div className="my-5 h-px bg-white/5" />
          <p className="px-4 text-xs text-white/30 uppercase tracking-wider font-semibold mb-2">Portals</p>
          {portalLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="py-3 px-4 rounded-xl text-white/50 hover:text-white hover:bg-white/5 text-sm transition-all"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Drawer footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/5">
          <p className="text-white/30 text-xs text-center">
            &copy; 2026 RS CAB. All rights reserved.
          </p>
        </div>
      </aside>
    </>
  );
}
