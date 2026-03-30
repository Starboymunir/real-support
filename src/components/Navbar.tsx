'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ArrowRight, User, LogOut, LayoutDashboard, Repeat } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { userInfoApi } from '@/lib/services/user';

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

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function Navbar() {
  const { user, admin, logout, refreshUser } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [switchingMode, setSwitchingMode] = useState(false);

  const displayName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '';
  const isAdmin = !!admin;
  const userRole = user?.mode?.toLowerCase() || 'passenger';
  const dashboardHref = isAdmin ? '/admin/dashboard' : userRole === 'driver' ? '/driver/dashboard' : '/rider/dashboard';
  const hasDriver = !!user?.driver;
  const isDriverMode = userRole === 'driver';
  const otherDashLabel = isDriverMode ? 'Rider Dashboard' : 'Driver Dashboard';

  const handleSwitchMode = async () => {
    if (!user?.id || switchingMode) return;
    const newMode = isDriverMode ? 'PASSENGER' : 'DRIVER';
    setSwitchingMode(true);
    try {
      await userInfoApi.updateMode(user.id, newMode);
      await refreshUser();
      const target = newMode === 'DRIVER' ? '/driver/dashboard' : '/rider/dashboard';
      window.location.href = target;
    } catch {
      setSwitchingMode(false);
    }
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    if (!profileOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-profile-menu]')) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [profileOpen]);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    setMobileOpen(false);
  };

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

          {/* Center nav — desktop */}
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

          {/* Right actions — desktop */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <>
                {!isAdmin && (
                <Link
                  href="/rider/book"
                  className="group relative inline-flex items-center gap-2 bg-secondary text-dark font-bold text-sm px-6 py-2.5 rounded-full overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,230,118,0.4)] hover:scale-105"
                >
                  <span className="relative z-10">Book a Ride</span>
                  <ArrowRight size={16} className="relative z-10 transition-transform group-hover:translate-x-1" />
                  <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary-light to-secondary bg-[length:200%_100%] animate-gradient opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                )}

                {/* Profile dropdown */}
                <div className="relative" data-profile-menu>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] transition-all duration-200 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-secondary/15 flex items-center justify-center text-secondary text-xs font-bold">
                      {getInitials(displayName || 'U')}
                    </div>
                    <span className="text-sm font-medium text-white/80 max-w-[120px] truncate">
                      {displayName || 'Account'}
                    </span>
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-white/[0.08] bg-[#0D1420] shadow-2xl overflow-hidden">
                      <div className="px-4 py-3 border-b border-white/[0.06]">
                        <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                        <p className="text-xs text-white/40 truncate">{user.emailAddress}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          href={dashboardHref}
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/[0.04] transition-colors"
                        >
                          <LayoutDashboard size={16} />
                          Dashboard
                        </Link>
                        {!isAdmin && (
                        <Link
                          href="/rider/profile"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/[0.04] transition-colors"
                        >
                          <User size={16} />
                          Profile
                        </Link>
                        )}
                        {hasDriver && !isAdmin && (
                          <button
                            onClick={() => { setProfileOpen(false); handleSwitchMode(); }}
                            disabled={switchingMode}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <Repeat size={16} />
                            {switchingMode ? 'Switching...' : otherDashLabel}
                          </button>
                        )}
                      </div>
                      <div className="border-t border-white/[0.06] py-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error/80 hover:text-error hover:bg-error/[0.04] transition-colors cursor-pointer"
                        >
                          <LogOut size={16} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>

          {/* Hamburger — mobile */}
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

          {user ? (
            <>
              {/* Logged-in user info */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-3">
                <div className="w-10 h-10 rounded-full bg-secondary/15 flex items-center justify-center text-secondary text-xs font-bold shrink-0">
                  {getInitials(displayName || 'U')}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{displayName}</p>
                  <p className="text-xs text-white/40 truncate">{user.emailAddress}</p>
                </div>
              </div>

              <Link
                href={dashboardHref}
                onClick={() => setMobileOpen(false)}
                className="py-3.5 px-4 rounded-xl text-white/70 hover:text-white hover:bg-white/5 font-medium transition-all flex items-center gap-3"
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
              {!isAdmin && (
              <>
              <Link
                href="/rider/book"
                onClick={() => setMobileOpen(false)}
                className="mt-2 py-3.5 px-4 rounded-xl text-center font-bold bg-secondary text-dark flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(0,230,118,0.3)] transition-all"
              >
                Book a Ride
                <ArrowRight size={18} />
              </Link>
              {hasDriver && (
                <button
                  onClick={() => { setMobileOpen(false); handleSwitchMode(); }}
                  disabled={switchingMode}
                  className="mt-2 py-3.5 px-4 rounded-xl text-center font-semibold text-accent/70 border border-accent/20 hover:bg-accent/5 hover:text-accent transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Repeat size={18} />
                  {switchingMode ? 'Switching...' : otherDashLabel}
                </button>
              )}
              </>
              )}
              <button
                onClick={handleLogout}
                className="mt-2 py-3.5 px-4 rounded-xl text-center font-semibold text-error/70 border border-error/20 hover:bg-error/5 hover:text-error transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </>
          ) : (
            <>
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
            </>
          )}
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
