'use client';

import { type ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useSocket } from '@/lib/socket-context';
import { notificationsApi } from '@/lib/services/notifications';
import { chatApi } from '@/lib/services/chat';
import { userInfoApi } from '@/lib/services/user';
import { resolveImageUrl } from '@/lib/api';
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
  Shield,
  Package,
  Settings,
  ArrowLeftRight,
  FileCheck,
  Landmark,
  ChevronDown,
  Repeat,
} from 'lucide-react';

interface DashboardLayoutProps {
  role: 'rider' | 'driver' | 'company' | 'admin';
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
    { label: 'Transfer', href: '/rider/wallet/transfer', icon: ArrowLeftRight },
    { label: 'Requests', href: '/rider/wallet/requests', icon: FileCheck },
    { label: 'Bank Accounts', href: '/rider/wallet/bank-accounts', icon: Landmark },
    { label: 'Payment', href: '/rider/payment', icon: CreditCard },
    { label: 'Messages', href: '/rider/chat', icon: MessageSquare },
    { label: 'Notifications', href: '/rider/notifications', icon: Bell },
    { label: 'Support', href: '/rider/support', icon: HelpCircle },
  ],
  driver: [
    { label: 'Dashboard', href: '/driver/dashboard', icon: LayoutDashboard },
    { label: 'Ride Requests', href: '/driver/requests', icon: Navigation },
    { label: 'My Rides', href: '/driver/rides', icon: History },
    { label: 'Profile', href: '/driver', icon: User },
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
  admin: [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Bookings', href: '/admin/bookings', icon: Briefcase },
    { label: 'Drivers', href: '/admin/drivers', icon: Car },
    { label: 'Riders', href: '/admin/riders', icon: Users },
    { label: 'Packages', href: '/admin/packages', icon: Package },
    { label: 'Admins', href: '/admin/admins', icon: Shield },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
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
    { label: 'Requests', href: '/driver/requests', icon: Navigation },
    { label: 'Rides', href: '/driver/rides', icon: History },
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
  admin: [
    { label: 'Home', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Bookings', href: '/admin/bookings', icon: Briefcase },
    { label: 'Drivers', href: '/admin/drivers', icon: Car },
    { label: 'Riders', href: '/admin/riders', icon: Users },
    { label: 'More', href: '/admin/packages', icon: Package },
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
  const { user, logout, refreshUser } = useAuth();
  const links = sidebarLinks[role];
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [switchingMode, setSwitchingMode] = useState(false);
  const { unreadNotifications, unreadChats, setUnreadNotifications, setUnreadChats } = useSocket();

  const hasDriver = !!user?.driver;
  const currentMode = user?.mode || 'PASSENGER';
  const isDriver = currentMode === 'DRIVER';
  const otherRole = isDriver ? 'rider' : 'driver';
  const otherLabel = isDriver ? 'Rider Dashboard' : 'Driver Dashboard';

  // Close profile dropdown when clicking outside
  useEffect(() => {
    if (!profileOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-profile-dropdown]')) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [profileOpen]);

  const handleSwitchMode = async () => {
    if (!user?.id || switchingMode) return;
    const newMode = isDriver ? 'PASSENGER' : 'DRIVER';
    setSwitchingMode(true);
    try {
      await userInfoApi.updateMode(user.id, newMode);
      await refreshUser();
      const target = newMode === 'DRIVER' ? '/driver/dashboard' : '/rider/dashboard';
      router.push(target);
    } catch {
      setSwitchingMode(false);
    }
  };

  // Use real user name if available
  const displayName = userName ?? (user ? `${user.firstName} ${user.lastName}` : 'Guest');
  const avatarUrl = resolveImageUrl(user?.profileImageUrl);
  const [avatarError, setAvatarError] = useState(false);
  const showAvatar = !!avatarUrl && !avatarError;

  // Fetch initial unread counts
  useEffect(() => {
    if (!user?.id) return;
    // Notification count
    notificationsApi.getAll({ userId: user.id, isRead: false })
      .then((res) => {
        const list = Array.isArray(res) ? res : (res as { data?: unknown[] }).data || [];
        setUnreadNotifications(list.length);
      })
      .catch(() => {});
    // Chat unread count
    chatApi.getUnreadCount()
      .then((res) => {
        const count = typeof res === 'number' ? res : (res as { count?: number }).count || 0;
        setUnreadChats(count);
      })
      .catch(() => {});
  }, [user?.id, setUnreadNotifications, setUnreadChats]);

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
                {!collapsed && link.label === 'Messages' && unreadChats > 0 && (
                  <span className="ml-auto min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full bg-secondary text-dark text-[10px] font-bold">
                    {unreadChats > 99 ? '99+' : unreadChats}
                  </span>
                )}
                {!collapsed && link.label === 'Notifications' && unreadNotifications > 0 && (
                  <span className="ml-auto min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full bg-secondary text-dark text-[10px] font-bold">
                    {unreadNotifications > 99 ? '99+' : unreadNotifications}
                  </span>
                )}
                {active && !collapsed && link.label !== 'Messages' && link.label !== 'Notifications' && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-secondary" />
                )}
              </Link>
            );
          })}

          {/* Switch mode — sidebar */}
          {hasDriver && (role === 'rider' || role === 'driver') && (
            <>
              <div className={`my-3 h-px bg-white/5 ${collapsed ? 'mx-1' : 'mx-2'}`} />
              <button
                onClick={handleSwitchMode}
                disabled={switchingMode}
                title={collapsed ? `Switch to ${otherLabel}` : undefined}
                className={`group w-full flex items-center gap-3 rounded-xl transition-all duration-200 text-accent/70 hover:text-accent hover:bg-accent/[0.06] disabled:opacity-50 cursor-pointer ${
                  collapsed ? 'justify-center p-3' : 'px-4 py-3'
                }`}
              >
                <Repeat size={20} className="text-accent/50 group-hover:text-accent" />
                {!collapsed && (
                  <span className="text-sm font-medium">
                    {switchingMode ? 'Switching...' : otherLabel}
                  </span>
                )}
              </button>
            </>
          )}
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
        <div className={`border-t border-white/5 p-4 ${collapsed ? 'flex flex-col items-center gap-2' : ''}`}>
          {collapsed ? (
            <>
              {showAvatar ? (
                <img src={avatarUrl!} alt="" onError={() => setAvatarError(true)} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary text-xs font-bold">
                  {getInitials(displayName)}
                </div>
              )}
              <button onClick={handleLogout} title="Logout" className="p-2 rounded-lg text-white/20 hover:text-error hover:bg-error/10 transition-all">
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              {showAvatar ? (
                <img src={avatarUrl!} alt="" onError={() => setAvatarError(true)} className="w-10 h-10 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary text-xs font-bold shrink-0">
                  {getInitials(displayName)}
                </div>
              )}
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
        <nav className="p-4 space-y-1 flex-1">
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
        <div className="p-4 border-t border-white/5 space-y-2">
          {hasDriver && (role === 'rider' || role === 'driver') && (
            <button
              onClick={() => { setMobileOpen(false); handleSwitchMode(); }}
              disabled={switchingMode}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-accent/70 hover:text-accent hover:bg-accent/[0.06] transition-all cursor-pointer disabled:opacity-50"
            >
              <Repeat size={20} />
              <span className="text-sm font-medium">{switchingMode ? 'Switching...' : `Switch to ${otherLabel}`}</span>
            </button>
          )}
          <button
            onClick={() => { setMobileOpen(false); handleLogout(); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-error/70 hover:text-error hover:bg-error/10 transition-all"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
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
              {unreadNotifications > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-secondary text-dark text-[10px] font-bold ring-2 ring-dark-surface">
                  {unreadNotifications > 99 ? '99+' : unreadNotifications}
                </span>
              )}
            </Link>
            <div className="relative hidden sm:block" data-profile-dropdown>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2.5 pl-3 border-l border-white/[0.08] cursor-pointer hover:bg-white/[0.03] rounded-lg pr-2 py-1.5 transition-colors"
              >
                {showAvatar ? (
                  <img src={avatarUrl!} alt="" onError={() => setAvatarError(true)} className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center text-secondary text-xs font-bold">
                    {getInitials(displayName)}
                  </div>
                )}
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">{displayName}</p>
                  <p className="text-xs text-white/40 capitalize">{role}</p>
                </div>
                <ChevronDown size={14} className={`text-white/30 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-60 rounded-xl border border-white/[0.08] bg-[#0D1420] shadow-2xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-white/[0.06]">
                    <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                    <p className="text-xs text-white/40 truncate">{user?.emailAddress}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      href={`/${role}/profile`}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/[0.04] transition-colors"
                    >
                      <User size={16} />
                      My Profile
                    </Link>
                    <Link
                      href={`/${role}/dashboard`}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/[0.04] transition-colors"
                    >
                      <LayoutDashboard size={16} />
                      Dashboard
                    </Link>
                    {hasDriver && (
                      <button
                        onClick={() => { setProfileOpen(false); handleSwitchMode(); }}
                        disabled={switchingMode}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Repeat size={16} />
                        {switchingMode ? 'Switching...' : `Switch to ${otherLabel}`}
                      </button>
                    )}
                  </div>
                  <div className="border-t border-white/[0.06] py-1">
                    <button
                      onClick={() => { setProfileOpen(false); handleLogout(); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error/80 hover:text-error hover:bg-error/[0.04] transition-colors cursor-pointer"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
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
                <span className="relative">
                  <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                  {tab.label === 'Alerts' && unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1.5 min-w-[14px] h-[14px] px-0.5 flex items-center justify-center rounded-full bg-secondary text-dark text-[8px] font-bold">
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </span>
                  )}
                </span>
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
