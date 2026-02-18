'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/Button';
import {
  Bell,
  Car,
  CreditCard,
  Tag,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Star,
  Gift,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types & Data                                                       */
/* ------------------------------------------------------------------ */

type NotificationType = 'ride' | 'payment' | 'promo' | 'system';

interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  description: string;
  detail?: string;
  time: string;
  read: boolean;
}

const initialNotifications: Notification[] = [
  {
    id: 1,
    type: 'ride',
    title: 'Ride Completed',
    description: 'Your ride RS-1024 to Heathrow Airport has been completed.',
    detail:
      'Driver Michael Smith rated you 5 stars. Total fare: £34.50. Thank you for riding with RS CAB!',
    time: '2 hours ago',
    read: false,
  },
  {
    id: 2,
    type: 'payment',
    title: 'Payment Received',
    description: 'Payment of £34.50 processed for ride RS-1024.',
    detail: 'Charged to Visa ending 4242. Transaction ID: TXN-5001.',
    time: '2 hours ago',
    read: false,
  },
  {
    id: 3,
    type: 'promo',
    title: '20% Off Your Next Ride!',
    description: 'Use code RSCAB20 for 20% off. Valid until 28 Feb 2026.',
    detail:
      'Applicable on all vehicle types. Maximum discount £15. Cannot be combined with other offers.',
    time: '5 hours ago',
    read: false,
  },
  {
    id: 4,
    type: 'ride',
    title: 'Upcoming Ride Reminder',
    description: 'Your scheduled ride RS-1030 to Gatwick Airport is in 2 days.',
    detail:
      'Pickup: 12 Baker Street, London. Date: 20 Feb 2026 at 06:30 AM. Vehicle: Comfort. Please be ready 5 minutes before.',
    time: '1 day ago',
    read: true,
  },
  {
    id: 5,
    type: 'payment',
    title: 'Refund Processed',
    description: 'Refund of £12.80 for cancelled ride RS-1019 has been processed.',
    detail: 'The refund will appear on your Visa ending 4242 within 3–5 business days.',
    time: '2 days ago',
    read: true,
  },
  {
    id: 6,
    type: 'promo',
    title: 'Refer a Friend, Earn £10',
    description: 'Share your referral code JOHN2026 and both of you get £10 credit.',
    detail:
      'Your friend gets £10 off their first ride, and you get £10 ride credit when they complete their first trip.',
    time: '3 days ago',
    read: true,
  },
  {
    id: 7,
    type: 'ride',
    title: 'Rate Your Driver',
    description: 'How was your ride with Sarah Johnson?',
    detail:
      'Your feedback helps us maintain quality. Tap to rate your experience from 1 to 5 stars.',
    time: '4 days ago',
    read: true,
  },
  {
    id: 8,
    type: 'system',
    title: 'Welcome to RS CAB',
    description: 'Your account has been created successfully. Start your first ride today!',
    detail:
      'Explore the app, add a payment method, and book your first ride. Enjoy a 15% discount using code WELCOME15.',
    time: '3 weeks ago',
    read: true,
  },
];

const typeConfig: Record<NotificationType, { icon: typeof Car; color: string; bg: string }> = {
  ride: { icon: Car, color: 'text-primary', bg: 'bg-primary/10' },
  payment: { icon: CreditCard, color: 'text-success', bg: 'bg-success/10' },
  promo: { icon: Tag, color: 'text-warning', bg: 'bg-warning/10' },
  system: { icon: AlertCircle, color: 'text-accent', bg: 'bg-accent/10' },
};

const filterTabs: { label: string; value: string }[] = [
  { label: 'All', value: 'all' },
  { label: 'Rides', value: 'ride' },
  { label: 'Payments', value: 'payment' },
  { label: 'Promos', value: 'promo' },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered =
    activeFilter === 'all'
      ? notifications
      : notifications.filter((n) => n.type === activeFilter);

  const markAllAsRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const toggleExpand = (id: number) => {
    setExpanded((prev) => (prev === id ? null : id));
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <DashboardLayout role="rider" userName="John Doe" pageTitle="Notifications">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Notifications
          </h2>
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center h-7 min-w-7 px-2 rounded-full bg-secondary text-white text-xs font-bold">
              {unreadCount}
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllAsRead}>
            <CheckCheck size={16} /> Mark all as read
          </Button>
        )}
      </div>

      {/* ── Filter Tabs ─────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveFilter(tab.value)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
              activeFilter === tab.value
                ? 'bg-secondary text-dark'
                : 'bg-white/[0.04] text-white/40 hover:bg-white/[0.06]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Notification List ───────────────────────────────────── */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="bg-white/[0.02] rounded-2xl p-12 border border-white/[0.06] text-center">
            <Bell size={40} className="text-white/40 mx-auto mb-3 opacity-30" />
            <p className="text-white/40 text-sm">No notifications in this category.</p>
          </div>
        )}

        {filtered.map((n) => {
          const config = typeConfig[n.type];
          const Icon = config.icon;
          const isOpen = expanded === n.id;

          return (
            <div
              key={n.id}
              className={`bg-white/[0.02] rounded-2xl border transition-all duration-200 cursor-pointer ${
                !n.read
                  ? 'border-l-4 border-l-secondary border-t border-r border-b border-t-white/[0.06] border-r-white/[0.06] border-b-white/[0.06] bg-secondary/[0.04]'
                  : 'border-white/[0.06]'
              } ${isOpen ? 'ring-1 ring-secondary/20' : 'hover:bg-white/[0.04] transition-all'}`}
              onClick={() => toggleExpand(n.id)}
            >
              <div className="p-5 flex items-start gap-4">
                {/* Type Icon */}
                <div
                  className={`w-11 h-11 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}
                >
                  <Icon size={20} className={config.color} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4
                          className={`text-sm font-semibold truncate ${
                            !n.read ? 'text-white' : 'text-white/60'
                          }`}
                        >
                          {n.title}
                        </h4>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-secondary shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-white/40 mt-0.5 line-clamp-1">
                        {n.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-white/40 whitespace-nowrap">{n.time}</span>
                      {isOpen ? (
                        <ChevronUp size={14} className="text-secondary" />
                      ) : (
                        <ChevronDown size={14} className="text-white/40" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Detail */}
              {isOpen && n.detail && (
                <div className="px-5 pb-5 pl-20">
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <p className="text-sm text-white/60 leading-relaxed">
                      {n.detail}
                    </p>
                    {n.type === 'ride' && n.title.includes('Rate') && (
                      <div className="flex items-center gap-1 mt-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={(e) => e.stopPropagation()}
                            className="text-warning hover:scale-110 transition-transform"
                          >
                            <Star size={20} />
                          </button>
                        ))}
                      </div>
                    )}
                    {n.type === 'promo' && (
                      <div className="mt-3">
                        <Button
                          variant="green"
                          size="sm"
                          onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        >
                          <Gift size={14} /> Apply Offer
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
