'use client';

import { type ReactNode, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  LayoutDashboard,
  Navigation,
  History,
  User,
  CreditCard,
  Bell,
  HelpCircle,
  Car,
  FileText,
  Wallet,
  Upload,
  Users,
  BarChart3,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
  Zap,
  MessageSquare,
} from 'lucide-react';

interface DashboardLayoutProps {
  role: 'rider' | 'driver' | 'company';
  userName?: string;
  pageTitle?: string;
  children: ReactNode;
}

const sidebarLinks = {
  rider: [
    { label: 'Dashboard', href: '/rider/dashboard', icon: LayoutDashboard },
    { label: 'Book a Ride', href: '/rider/book', icon: Navigation },
    { label: 'My Rides', href: '/rider/rides', icon: History },
    { label: 'Profile', href: '/rider/profile', icon: User },
    { label: 'Wallet', href: '/rider/wallet', icon: Wallet },
    { label: 'Payment', href: '/rider/payment', icon: CreditCard },
    { label: 'Messages', href: '/rider/chat', icon: MessageSquare },
    { label: 'Notifications', href: '/rider/notifications', icon: Bell },
    { label: 'Support', href: '/rider/support', icon: HelpCircle },
  ],
  driver: [
    { label: 'Dashboard', href: '/driver/dashboard', icon: LayoutDashboard },
    { label: 'Registration', href: '/driver', icon: FileText },
    { label: 'Vehicle', href: '/driver/vehicle', icon: Car },
    { label: 'Documents', href: '/driver/documents', icon: Upload },
    { label: 'Earnings', href: '/driver/earnings', icon: Wallet },
    { label: 'Messages', href: '/driver/chat', icon: MessageSquare },
    { label: 'Notifications', href: '/driver/notifications', icon: Bell },
  ],
  company: [
    { label: 'Dashboard', href: '/company/dashboard', icon: LayoutDashboard },
    { label: 'Bookings', href: '/company/bookings', icon: Briefcase },
    { label: 'Employees', href: '/company/employees', icon: Users },
    { label: 'Reports', href: '/company/reports', icon: BarChart3 },
    { label: 'Notifications', href: '/company/notifications', icon: Bell },
  ],
};

/* Bottom tabs — the 5 most-used links per role */
const bottomTabs: Record<string, { label: string; href: string; icon: typeof LayoutDashboard }[]> = {
  rider: [
    { label: 'Home', href: '/rider/dashboard', icon: LayoutDashboard },
    { label: 'Book', href: '/rider/book', icon: Navigation },
    { label: 'Wallet', href: '/rider/wallet', icon: Wallet },
    { label: 'Rides', href: '/rider/rides', icon: History },
    { label: 'Profile', href: '/rider/profile', icon: User },
  ],
  driver: [
    { label: 'Home', href: '/driver/dashboard', icon: LayoutDashboard },
    { label: 'Vehicle', href: '/driver/vehicle', icon: Car },
    { label: 'Docs', href: '/driver/documents', icon: Upload },
    { label: 'Earnings', href: '/driver/earnings', icon: Wallet },
    { label: 'Alerts', href: '/driver/notifications', icon: Bell },
  ],
  company: [
    { label: 'Home', href: '/company/dashboard', icon: LayoutDashboard },
    { label: 'Bookings', href: '/company/bookings', icon: Briefcase },
    { label: 'Team', href: '/company/employees', icon: Users },
    { label: 'Reports', href: '/company/reports', icon: BarChart3 },
    { label: 'Alerts', href: '/company/notifications', icon: Bell },
  ],
};

function getInitials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function DashboardLayout({
  role,
  userName,
  pageTitle = 'Dashboard',
  children,
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const links = sidebarLinks[role];
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Use real user name if available
  const displayName = userName ?? (user ? `${user.firstName} ${user.lastName}` : 'Guest');

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-dark">
      {/* â”€â”€ Sidebar (desktop) â”€â”€ */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full bg-dark border-r border-white/5 transition-all duration-300 hidden lg:flex flex-col ${
          collapsed ? 'w-20' : 'w-[260px]'
        }`}
      >
        {/* Logo */}
        <div className={`flex items-center h-20 border-b border-white/5 ${collapsed ? 'justify-center px-2' : 'px-6'}`}>
          {collapsed ? (
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
              <Zap size={20} className="text-secondary" />
            </div>
          ) : (
            <Link href="/" className="flex items-center gap-2 py-3">
              <Image
                src="/images/brand/logo.png"
                alt="RS CAB"
                width={110}
                height={36}
                className="object-contain max-h-10"
              />
            </Link>
          )}
        </div>

        {/* Nav links */}
        <nav className={`flex-1 py-6 space-y-1 overflow-y-auto ${collapsed ? 'px-2' : 'px-3'}`}>
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href + '/'));
            return (
              <Link
                key={link.href}
                href={link.href}
                title={collapsed ? link.label : undefined}
                className={`group flex items-center gap-3 rounded-xl transition-all duration-200 ${
                  collapsed ? 'justify-center p-3' : 'px-4 py-3'
                } ${
                  active
                    ? 'bg-secondary/10 text-secondary'
                    : 'text-white/40 hover:text-white/80 hover:bg-white/[0.04]'
                }`}
              >
                <Icon size={20} className={active ? 'text-secondary' : 'text-white/30 group-hover:text-white/60'} />
                {!collapsed && (
                  <span className="text-sm font-medium">{link.label}</span>
                )}
                {active && !collapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-secondary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="border-t border-white/5 p-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all text-xs"
          >
            {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span>Collapse</span></>}
          </button>
        </div>

        {/* User */}
        <div className={`border-t border-white/5 p-4 ${collapsed ? 'flex justify-center' : ''}`}>
          {collapsed ? (
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary text-xs font-bold">
              {getInitials(displayName)}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary text-xs font-bold shrink-0">
                {getInitials(displayName)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white text-sm font-medium truncate">{displayName}</p>
                <p className="text-white/30 text-xs capitalize">{role}</p>
              </div>
              <button onClick={handleLogout} className="p-1.5 rounded-lg text-white/20 hover:text-white/50 hover:bg-white/[0.04] transition-all">
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* â”€â”€ Mobile header â”€â”€ */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-dark border-b border-white/5 h-16 flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 py-2">
          <Image
            src="/images/brand/logo.png"
            alt="RS CAB"
            width={90}
            height={30}
            className="object-contain max-h-8"
          />
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 text-white/60 hover:text-white"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile drawer */}
      <aside
        className={`fixed top-0 left-0 z-[70] h-full w-72 bg-dark shadow-2xl transform transition-transform duration-300 lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/5">
          <span className="font-bold text-secondary">RS CAB</span>
          <button onClick={() => setMobileOpen(false)} className="p-2 text-white/40 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  active
                    ? 'bg-secondary/10 text-secondary'
                    : 'text-white/40 hover:text-white/80 hover:bg-white/[0.04]'
                }`}
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* â”€â”€ Main content â”€â”€ */}
      <div className={`transition-all duration-300 ${collapsed ? 'lg:ml-20' : 'lg:ml-[260px]'}`}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-dark-surface/80 backdrop-blur-xl border-b border-white/[0.06] h-16 lg:h-20 flex items-center justify-between px-4 sm:px-6 lg:px-8 mt-16 lg:mt-0">
          <div>
            <h1 className="text-lg font-bold text-white">{pageTitle}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/${role}/notifications`}
              className="relative p-2.5 rounded-xl text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-colors"
            >
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-secondary ring-2 ring-dark-surface" />
            </Link>
            <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-white/[0.08]">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center text-secondary text-xs font-bold">
                {getInitials(displayName)}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{displayName}</p>
                <p className="text-xs text-white/40 capitalize">{role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
          {children}
        </main>
      </div>

      {/* ── Bottom Tab Bar (mobile only) ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        {/* Glassmorphism backdrop */}
        <div className="absolute inset-0 bg-dark/80 backdrop-blur-xl border-t border-white/[0.06]" />
        {/* Safe-area bottom for notched devices */}
        <div className="relative flex items-stretch justify-around px-1 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
          {(bottomTabs[role] ?? []).map((tab) => {
            const Icon = tab.icon;
            const active = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href + '/'));
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`relative flex flex-col items-center justify-center gap-0.5 flex-1 py-2 rounded-xl transition-all duration-200 ${
                  active
                    ? 'text-secondary'
                    : 'text-white/35 active:text-white/60'
                }`}
              >
                {active && (
                  <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-[3px] rounded-full bg-secondary" />
                )}
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                <span className={`text-[10px] font-semibold leading-none ${
                  active ? 'text-secondary' : ''
                }`}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
