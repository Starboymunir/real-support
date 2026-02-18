'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Bell, CheckCircle, AlertTriangle, Info, Star, DollarSign, Trash2 } from 'lucide-react';

const notifications = [
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
  const [items, setItems] = useState(notifications);

  const markAllRead = () => setItems(items.map((n) => ({ ...n, read: true })));
  const removeNotification = (id: number) => setItems(items.filter((n) => n.id !== id));

  return (
    <DashboardLayout role="driver" userName="James Wilson" pageTitle="Notifications">
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
