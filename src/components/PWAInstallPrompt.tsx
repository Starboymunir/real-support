'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const STORAGE_KEY = 'rs-ride-install-dismissed-at';
const REPROMPT_AFTER_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export default function PWAInstallPrompt() {
  const [evt, setEvt] = useState<BIPEvent | null>(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Already installed (running as standalone)?
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // @ts-expect-error iOS
      window.navigator.standalone === true;
    if (isStandalone) return;

    // Respect prior dismissal
    const dismissedAt = Number(localStorage.getItem(STORAGE_KEY) || 0);
    if (dismissedAt && Date.now() - dismissedAt < REPROMPT_AFTER_MS) return;

    // iOS detection (no beforeinstallprompt support)
    const ua = window.navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) && !('MSStream' in window);
    if (ios) {
      setIsIOS(true);
      const t = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(t);
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setEvt(e as BIPEvent);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);

    const onInstalled = () => {
      setShow(false);
      setEvt(null);
    };
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
    setShow(false);
  };

  const install = async () => {
    if (!evt) return;
    try {
      await evt.prompt();
      const choice = await evt.userChoice;
      if (choice.outcome === 'accepted') {
        setShow(false);
      } else {
        dismiss();
      }
    } catch {
      dismiss();
    }
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[9999] rounded-2xl shadow-2xl border border-white/10 bg-[#0a2540] text-white p-4 flex items-start gap-3">
      <div className="shrink-0 w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
        <Download size={22} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">Install One App</p>
        {isIOS ? (
          <p className="text-xs text-white/70 mt-1 leading-relaxed">
            Tap the Share icon in Safari, then choose <b>Add to Home Screen</b> for the
            full app experience.
          </p>
        ) : (
          <p className="text-xs text-white/70 mt-1">
            Add One App to your home screen for faster booking, offline access and
            push notifications.
          </p>
        )}
        <div className="mt-3 flex gap-2">
          {!isIOS && evt && (
            <button
              onClick={install}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white text-[#0a2540] hover:bg-white/90"
            >
              Install
            </button>
          )}
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
        aria-label="Dismiss install prompt"
        className="shrink-0 p-1 rounded-md hover:bg-white/10 text-white/60 hover:text-white"
      >
        <X size={16} />
      </button>
    </div>
  );
}
