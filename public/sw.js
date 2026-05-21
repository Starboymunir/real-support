// RS Ride Service Worker — handles PWA install + push notifications
const CACHE = 'rs-ride-v2';
const OFFLINE_URLS = ['/'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(OFFLINE_URLS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Network-first for navigations, fall back to cache, then offline page
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('/').then((r) => r || new Response('Offline', { status: 503 })))
    );
  }
});

// Push notification handler
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'RS Ride', body: event.data ? event.data.text() : '' };
  }
  const title = data.title || 'RS Ride';
  const options = {
    body: data.body || '',
    icon: data.icon || '/icons/logo-192.png',
    badge: '/icons/logo-192.png',
    data: { url: data.url || '/', extra: data.extra, urgent: !!data.urgent },
    tag: data.tag,
    renotify: data.renotify !== false,
    requireInteraction: data.requireInteraction === true || data.urgent === true,
    vibrate: data.vibrate || (data.urgent ? [300, 120, 300, 120, 600] : undefined),
    actions: Array.isArray(data.actions) ? data.actions : undefined,
    silent: false,
  };
  event.waitUntil(
    self.registration
      .showNotification(title, options)
      .then(() =>
        // Best-effort: ping any open RS Ride client so it can foreground a UI handler
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
          for (const c of list) {
            try {
              c.postMessage({ type: 'PUSH_RECEIVED', payload: data });
            } catch (_) { /* ignore */ }
          }
        }),
      )
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const nData = event.notification.data || {};
  const baseUrl = nData.url || '/';
  // Action button → encode the action in a query string the app can read
  const action = event.action;
  const targetUrl =
    action && action !== ''
      ? `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}action=${encodeURIComponent(action)}`
      : baseUrl;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if (c.url.includes(self.location.origin) && 'focus' in c) {
          try { c.postMessage({ type: 'NOTIFICATION_CLICK', action, payload: nData }); } catch (_) { /* ignore */ }
          c.navigate(targetUrl);
          return c.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});
