const CACHE_NAME = 'wedding-v4';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './venue.jpg',
  './couple-traditional.jpg',
  './couple-candid.png',
  './app-icon.png',
  './manifest.json',
  './qr-print.html'
];

// Install event: cache resources
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event: Network-first, falling back to cache
self.addEventListener('fetch', (e) => {
  // Only handle local GET requests (or CDNs like Google Fonts/FontAwesome)
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Dynamically cache fonts, icons, and page assets
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // If offline, serve from cache
        return caches.match(e.request);
      })
  );
});
