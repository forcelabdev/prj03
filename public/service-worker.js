const CACHE_NAME = 'velobet-v7';

// Minimal cache - sadece manifest
const STATIC_ASSETS = [
  '/manifest.json',
];

// Install - hemen aktif ol
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate - eski cache'leri temizle ve hemen devral
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - minimum mudahale, sadece manifest cache'le
self.addEventListener('fetch', (event) => {
  // POST, PUT vs. - hic dokunma
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Dis origin - hic dokunma
  if (url.origin !== self.location.origin) return;

  // API ve dinamik icerik - hic dokunma
  if (url.pathname.startsWith('/api/') || 
      url.pathname.startsWith('/_next/') ||
      url.pathname.includes('.json') && url.pathname !== '/manifest.json') {
    return;
  }

  // Sadece manifest'i cache'le
  if (url.pathname === '/manifest.json') {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        try {
          const response = await fetch(event.request);
          if (response && response.ok) {
            cache.put(event.request, response.clone());
          }
          return response;
        } catch {
          const cached = await cache.match(event.request);
          return cached || new Response('{}', { 
            status: 200, 
            headers: { 'Content-Type': 'application/json' } 
          });
        }
      })
    );
    return;
  }

  // Diger her sey - tarayici halleder
});

// Message handler
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
