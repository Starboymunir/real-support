'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Bell, CheckCircle, AlertTriangle, Info, Users, BarChart3, Trash2 } from 'lucide-react';

const notifications = [
  { id: 1, type: 'success', icon: CheckCircle, title: 'Monthly Report Ready', message: 'Your December 2025 transportation report is available for download.', time: '1 hour ago', read: false },
  { id: 2, type: 'info', icon: Users, title: 'New Employee Added', message: 'Sarah Mitchell has been added to your company account and can now book rides.', time: '3 hours ago', read: false },
  { id: 3, type: 'warning', icon: AlertTriangle, title: 'Budget Alert', message: 'Your monthly transportation budget is at 85% utilisation. Consider reviewing spending.', time: '1 day ago', read: false },
  { id: 4, type: 'info', icon: BarChart3, title: 'Cost Savings Report', message: 'Last month your company saved £2,340 compared to traditional taxi services.', time: '2 days ago', read: true },
  { id: 5, type: 'success', icon: CheckCircle, title: 'Invoice Paid', message: 'Invoice #INV-2025-0847 for £4,215.00 has been processed successfully.', time: '3 days ago', read: true },
  { id: 6, type: 'info', icon: Info, title: 'Platform Update', message: 'New company analytics dashboard is now available with improved cost tracking.', time: '5 days ago', read: true },
];

const colorMap = {
  success: 'bg-green-50 text-green-600',
  warning: 'bg-amber-50 text-amber-600',
  info: 'bg-blue-50 text-blue-600',
};

export default function CompanyNotificationsPage() {
  const [items, setItems] = useState(notifications);

  const markAllRead = () => setItems(items.map((n) => ({ ...n, read: true })));
  const removeNotification = (id: number) => setItems(items.filter((n) => n.id !== id));

  return (
    <DashboardLayout role="company" userName="Tech Corp" pageTitle="Notifications">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell size={24} className="text-text-primary" />
            <h2 className="text-xl font-bold text-text-primary">Notifications</h2>
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
                className={`bg-white rounded-xl border p-5 flex items-start gap-4 transition-all ${
                  n.read ? 'border-gray-100' : 'border-secondary/20 shadow-sm'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorMap[n.type as keyof typeof colorMap]}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-text-primary text-sm">{n.title}</h4>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-secondary shrink-0" />}
                  </div>
                  <p className="text-text-muted text-sm mt-1">{n.message}</p>
                  <p className="text-text-muted/60 text-xs mt-2">{n.time}</p>
                </div>
                <button onClick={() => removeNotification(n.id)} className="p-1.5 text-gray-300 hover:text-red-400 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}

          {items.length === 0 && (
            <div className="text-center py-16">
              <Bell size={40} className="mx-auto text-gray-300 mb-4" />
              <p className="text-text-muted font-medium">No notifications</p>
              <p className="text-text-muted/60 text-sm mt-1">You&apos;re all caught up!</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
