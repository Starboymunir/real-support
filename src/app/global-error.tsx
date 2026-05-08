'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Auto-recover from stale-chunk errors after a deploy.
  // Browsers cache HTML referencing old chunk hashes; when the user navigates,
  // Next.js tries to load a chunk that no longer exists. We hard-reload once
  // so the browser fetches the fresh HTML + new chunk hashes.
  useEffect(() => {
    const msg = String(_error?.message || _error?.name || '');
    const isChunkError =
      _error?.name === 'ChunkLoadError' ||
      /Loading chunk \d+ failed/i.test(msg) ||
      /Loading CSS chunk/i.test(msg) ||
      /Failed to fetch dynamically imported module/i.test(msg);

    if (!isChunkError || typeof window === 'undefined') return;

    try {
      const KEY = '__rs_chunk_reload_at';
      const last = Number(sessionStorage.getItem(KEY) || 0);
      // Avoid infinite reload loops: only auto-reload if we haven't done so in the last 30s.
      if (Date.now() - last > 30_000) {
        sessionStorage.setItem(KEY, String(Date.now()));
        window.location.reload();
      }
    } catch {
      window.location.reload();
    }
  }, [_error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#0D2137', color: '#fff' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h1 style={{ fontSize: '4rem', fontWeight: 900, background: 'linear-gradient(135deg, #00E676, #00B0FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '1rem' }}>
              Oops!
            </h1>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Something went wrong
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '2rem', maxWidth: '28rem', margin: '0 auto 2rem' }}>
              A critical error occurred. Please try again or refresh the page.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  try { sessionStorage.removeItem('__rs_chunk_reload_at'); } catch {}
                  if (typeof window !== 'undefined') window.location.reload();
                  else reset();
                }}
                style={{ background: '#00E676', color: '#0D2137', fontWeight: 700, padding: '0.875rem 2rem', borderRadius: '0.75rem', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
              >
                Try Again
              </button>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a
                href="/"
                style={{ border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontWeight: 700, padding: '0.875rem 2rem', borderRadius: '0.75rem', textDecoration: 'none', fontSize: '1rem' }}
              >
                Go Home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
