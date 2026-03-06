'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useRequireAuth } from '@/lib/use-require-auth';
import { notificationsApi } from '@/lib/services';
import type { Notification as ApiNotification } from '@/lib/types';
import { Bell, CheckCircle, AlertTriangle, Info, Star, DollarSign, Trash2 } from 'lucide-react';

type DisplayNotification = {
  id: number | string;
  type: string;
  icon: React.ElementType;
  title: string;
  message: string;
  time: string;
  read: boolean;
};

const fallbackNotifications: DisplayNotification[] = [
  { id: 1, type: 'success', icon: CheckCircle, title: 'Ride Completed', message: 'You completed a ride to Canary Wharf. £24.50 earned.', time: '10 min ago', read: false },
  { id: 2, type: 'info', icon: DollarSign, title: 'Weekly Payout Processed', message: 'Your weekly earnings of £823.00 have been transferred to your bank account.', time: '2 hours ago', read: false },
  { id: 3, type: 'warning', icon: AlertTriangle, title: 'Document Expiring', message: 'Your vehicle insurance expires in 14 days. Please upload an updated document.', time: '5 hours ago', read: false },
  { id: 4, type: 'info', icon: Star, title: 'New Rating Received', message: 'You received a 5-star rating from Sarah P. Keep up the great work!', time: '1 day ago', read: true },
  { id: 5, type: 'info', icon: Info, title: 'Platform Update', message: 'RS CAB v2.5 is now available with improved navigation and earning reports.', time: '2 days ago', read: true },
  { id: 6, type: 'success', icon: CheckCircle, title: 'Background Check Passed', message: 'Your annual background check has been approved. No action needed.', time: '3 days ago', read: true },
];

const colorMap = {
  success: 'bg-secondary/10 text-secondary',
  warning: 'bg-amber-500/10 text-amber-400',
  info: 'bg-accent/10 text-accent',
};

export default function DriverNotificationsPage() {
  const { user } = useRequireAuth();
  const [items, setItems] = useState<DisplayNotification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  const mapApiNotification = (n: ApiNotification): DisplayNotification => {
    const title = n.ROC || 'Notification';
    const lowerTitle = title.toLowerCase();
    let type = 'info';
    let icon: React.ElementType = Info;
    if (lowerTitle.includes('complet') || lowerTitle.includes('approved') || lowerTitle.includes('passed')) { type = 'success'; icon = CheckCircle; }
    else if (lowerTitle.includes('expir') || lowerTitle.includes('warn') || lowerTitle.includes('alert')) { type = 'warning'; icon = AlertTriangle; }
    else if (lowerTitle.includes('rating') || lowerTitle.includes('star')) { icon = Star; }
    else if (lowerTitle.includes('pay') || lowerTitle.includes('earn')) { icon = DollarSign; }

    const diff = Date.now() - new Date(n.createdAt).getTime();
    const mins = Math.floor(diff / 60000);
    const time = mins < 60 ? `${mins} min ago` : mins < 1440 ? `${Math.floor(mins / 60)} hours ago` : `${Math.floor(mins / 1440)} days ago`;

    return { id: n.id, type, icon, title, message: n.remarks || '', time, read: n.isRead };
  };

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await notificationsApi.getAll({ userId: user.id });
      const list: ApiNotification[] = Array.isArray(res) ? res : (res as { data?: ApiNotification[] }).data || [];
      if (list.length > 0) setItems(list.map(mapApiNotification));
    } catch { /* keep empty */ }
    finally { setLoadingNotifications(false); }
  }, [user]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markAllRead = async () => {
    setItems(items.map((n) => ({ ...n, read: true })));
    const unread = items.filter(n => !n.read);
    await Promise.allSettled(unread.map(n => notificationsApi.markAsRead(String(n.id))));
  };
  const removeNotification = async (id: number | string) => {
    setItems(items.filter((n) => n.id !== id));
    try { await notificationsApi.remove(String(id)); } catch { /* ok */ }
  };

  return (
    <DashboardLayout role="driver" pageTitle="Notifications">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell size={24} className="text-white" />
            <h2 className="text-xl font-bold text-white">Notifications</h2>
            {items.filter((n) => !n.read).length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary text-xs font-bold">
                {items.filter((n) => !n.read).length} new
              </span>
            )}
          </div>
          <button onClick={markAllRead} className="text-sm text-secondary font-medium hover:underline">
            Mark all as read
          </button>
        </div>

        <div className="space-y-3">
          {items.map((n) => {
            const Icon = n.icon;
            return (
              <div
                key={n.id}
                className={`bg-white/[0.02] rounded-2xl border p-5 flex items-start gap-4 transition-all ${
                  n.read ? 'border-white/[0.06]' : 'border-secondary/20'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorMap[n.type as keyof typeof colorMap]}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-white text-sm">{n.title}</h4>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-secondary shrink-0" />}
                  </div>
                  <p className="text-white/40 text-sm mt-1">{n.message}</p>
                  <p className="text-white/25 text-xs mt-2">{n.time}</p>
                </div>
                <button onClick={() => removeNotification(n.id)} className="p-1.5 text-white/20 hover:text-red-400 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}

          {items.length === 0 && (
            <div className="text-center py-16">
              <Bell size={40} className="mx-auto text-white/20 mb-4" />
              <p className="text-white/40 font-medium">No notifications</p>
              <p className="text-white/25 text-sm mt-1">You&apos;re all caught up!</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
