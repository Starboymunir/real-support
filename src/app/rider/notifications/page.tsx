'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/Button';
import { useRequireAuth } from '@/lib/use-require-auth';
import { notificationsApi } from '@/lib/services/notifications';
import type { Notification as ApiNotification } from '@/lib/types';
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

const initialNotifications: Notification[] = [];

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

function mapApiNotification(n: ApiNotification, idx: number): Notification {
  let type: NotificationType = 'system';
  const title = n.ROC || 'Notification';
  const titleLower = title.toLowerCase();
  if (titleLower.includes('ride') || titleLower.includes('booking') || titleLower.includes('driver')) type = 'ride';
  else if (titleLower.includes('payment') || titleLower.includes('refund') || titleLower.includes('wallet')) type = 'payment';
  else if (titleLower.includes('promo') || titleLower.includes('discount') || titleLower.includes('offer')) type = 'promo';

  const createdAt = new Date(n.createdAt);
  const diff = Date.now() - createdAt.getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const time = days > 0 ? `${days} day${days > 1 ? 's' : ''} ago` : hours > 0 ? `${hours} hour${hours > 1 ? 's' : ''} ago` : 'Just now';

  return {
    id: idx + 1000,
    type,
    title,
    description: n.remarks || '',
    detail: n.remarks,
    time,
    read: n.isRead ?? true,
  };
}

export default function NotificationsPage() {
  const { user } = useRequireAuth();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await notificationsApi.getAll({ userId: user.id });
      const list: ApiNotification[] = Array.isArray(res) ? res : (res as { data?: ApiNotification[] }).data || [];
      if (list.length > 0) {
        setNotifications(list.map(mapApiNotification));
      }
    } catch { /* keep fallback */ }
  }, [user?.id]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered =
    activeFilter === 'all'
      ? notifications
      : notifications.filter((n) => n.type === activeFilter);

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    // Mark each unread notification as read on the server
    if (user?.id) {
      try {
        const unread = notifications.filter(n => !n.read);
        await Promise.allSettled(unread.map(n => notificationsApi.markAsRead(String(n.id))));
      } catch { /* best effort */ }
    }
  };

  const toggleExpand = (id: number) => {
    setExpanded((prev) => (prev === id ? null : id));
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <DashboardLayout role="rider" pageTitle="Notifications">
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
