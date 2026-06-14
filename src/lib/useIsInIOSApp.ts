/* ═══════════════════════════════════════════════════════════
   Detect whether the page is running inside the iOS app
   wrapper (WKWebView / PWABuilder / standalone PWA on iOS).

   We use this to disable web-OAuth social logins, which is what
   Apple App Review flagged in Submission 6b89a241 — when the
   user tapped "Sign in with Google", the OAuth redirect was
   bouncing into the default browser, which fails Apple's
   Guideline 4 "no external browser for sign-in".

   Strategy: if we can't reliably make OAuth stay in-app, hide
   the social buttons inside the iOS wrapper so the user just
   uses email/password.
   ═══════════════════════════════════════════════════════════ */
'use client';

import { useEffect, useState } from 'react';

/**
 * True when the page is loaded inside the iOS app shell.
 *
 * Detection signals we OR together:
 *  - `navigator.standalone === true` — iOS WKWebView wrappers and PWAs
 *    added to the Home Screen on iOS expose this. Reliable on iOS.
 *  - `display-mode: standalone` media query — set by the PWA manifest
 *    when the app is installed; matches inside PWABuilder iOS too.
 *  - User-Agent contains `RSRideApp` — opt-in marker the iOS shell can
 *    set in `WKWebViewConfiguration.applicationNameForUserAgent` if we
 *    later want a hard signal. Harmless on web.
 *
 * Server-side render returns `false` to avoid hydration mismatch — the
 * real value lands on the first effect run.
 */
export function useIsInIOSApp(): boolean {
  const [inApp, setInApp] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const nav = window.navigator as Navigator & { standalone?: boolean };
    const ua = nav.userAgent || '';
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !('MSStream' in window);
    const isStandalone =
      nav.standalone === true ||
      window.matchMedia?.('(display-mode: standalone)').matches === true;
    const hasMarker = /RSRideApp/i.test(ua);
    setInApp(hasMarker || (isIOS && isStandalone));
  }, []);

  return inApp;
}
