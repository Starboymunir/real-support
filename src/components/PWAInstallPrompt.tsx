'use client';

import { useEffect, useState } from 'react';
import { Download, X, ExternalLink } from 'lucide-react';

const STORAGE_KEY = 'rs-ride-install-dismissed-at';
const REPROMPT_AFTER_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.realsupport.app&pli=1';
// TODO: replace with real App Store URL once published; null hides the iOS button.
const APP_STORE_URL: string | null = null;

type Platform = 'ios' | 'android' | 'desktop';

export default function PWAInstallPrompt() {
  const [show, setShow] = useState(false);
  const [platform, setPlatform] = useState<Platform>('desktop');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // @ts-expect-error iOS Safari
      window.navigator.standalone === true;
    if (isStandalone) return;

    const dismissedAt = Number(localStorage.getItem(STORAGE_KEY) || 0);
    if (dismissedAt && Date.now() - dismissedAt < REPROMPT_AFTER_MS) return;

    const ua = window.navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !('MSStream' in window);
    const isAndroid = /Android/i.test(ua);
    setPlatform(isIOS ? 'ios' : isAndroid ? 'android' : 'desktop');

    // Suppress the browser's own install banner so users only see our CTA.
    const suppressBrowserBanner = (e: Event) => e.preventDefault();
    window.addEventListener('beforeinstallprompt', suppressBrowserBanner);

    const t = setTimeout(() => setShow(true), 3000);
    return () => {
      clearTimeout(t);
      window.removeEventListener('beforeinstallprompt', suppressBrowserBanner);
    };
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
    setShow(false);
  };

  if (!show) return null;

  // Decide which store(s) to link to. iOS users with no App Store URL fall back
  // to the "Add to Home Screen" instructions Real Drive uses.
  const showPlayStore = platform !== 'ios';
  const showAppStore = platform === 'ios' && !!APP_STORE_URL;
  const showIOSInstructions = platform === 'ios' && !APP_STORE_URL;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[9999] rounded-2xl shadow-2xl border border-white/10 bg-[#0a2540] text-white p-4 flex items-start gap-3">
      <div className="shrink-0 w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
        <Download size={22} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">Get the RS Ride app</p>
        {showIOSInstructions ? (
          <p className="text-xs text-white/70 mt-1 leading-relaxed">
            Tap the Share icon in Safari, then choose <b>Add to Home Screen</b> for the full app
            experience.
          </p>
        ) : (
          <p className="text-xs text-white/70 mt-1">
            Faster booking, push notifications and a smoother ride — install the official app.
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          {showPlayStore && (
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setShow(false)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white text-[#0a2540] hover:bg-white/90"
            >
              Get on Play Store <ExternalLink size={12} />
            </a>
          )}
          {showAppStore && APP_STORE_URL && (
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setShow(false)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white text-[#0a2540] hover:bg-white/90"
            >
              Get on App Store <ExternalLink size={12} />
            </a>
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
