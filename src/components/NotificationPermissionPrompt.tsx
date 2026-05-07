'use client';

import { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { api, getToken } from '@/lib/api';

const STORAGE_KEY = 'rs-ride-notif-prompt-dismissed-at';
const REPROMPT_AFTER_MS = 1000 * 60 * 60 * 24 * 14; // 14 days
const FIRST_SHOW_DELAY_MS = 6000;

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) out[i] = raw.charCodeAt(i);
  return out;
}

export default function NotificationPermissionPrompt() {
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return;

    if (Notification.permission !== 'default') return;

    // Only ask logged-in users (we need a token to register the subscription server-side)
    if (!getToken()) return;

    const dismissedAt = Number(localStorage.getItem(STORAGE_KEY) || 0);
    if (dismissedAt && Date.now() - dismissedAt < REPROMPT_AFTER_MS) return;

    const t = setTimeout(() => setShow(true), FIRST_SHOW_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
    setShow(false);
  };

  const enable = async () => {
    setBusy(true);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') {
        dismiss();
        return;
      }

      // Subscribe to push if VAPID key is configured (best-effort)
      if (VAPID_PUBLIC_KEY && 'serviceWorker' in navigator) {
        try {
          const reg = await navigator.serviceWorker.ready;
          const sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
          });
          // POST subscription to backend (auth token attached by api helper)
          const json = sub.toJSON();
          try {
            await api.post('/push/subscribe', {
              endpoint: json.endpoint,
              keys: json.keys,
              userAgent: navigator.userAgent,
            });
          } catch {
            // ignore — subscription will be retried next session
          }
        } catch {}
      }
      setShow(false);
    } catch {
      dismiss();
    } finally {
      setBusy(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-4 md:right-auto md:w-96 z-[9998] rounded-2xl shadow-2xl border border-white/10 bg-[#0a2540] text-white p-4 flex items-start gap-3">
      <div className="shrink-0 w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
        <Bell size={22} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">Stay updated on your rides</p>
        <p className="text-xs text-white/70 mt-1">
          Allow notifications to get driver arrival alerts, booking updates and important
          messages from RS Ride.
        </p>
        <div className="mt-3 flex gap-2">
          <button
            onClick={enable}
            disabled={busy}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white text-[#0a2540] hover:bg-white/90 disabled:opacity-60"
          >
            {busy ? 'Enabling…' : 'Enable notifications'}
          </button>
          <button
            onClick={dismiss}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15"
          >
            Not now
          </button>
        </div>
      </div>
      <button
        onClick={dismiss}
        aria-label="Dismiss notification prompt"
        className="shrink-0 p-1 rounded-md hover:bg-white/10 text-white/60 hover:text-white"
      >
        <X size={16} />
      </button>
    </div>
  );
}
