const CACHE_NAME = 'spiegel-ar-v1';

// We explicitly cache the heavy 8th Wall engine and 3D models
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/ar.html',
  '/fav.png',
  // 8th Wall Engine (23MB total)
  '/external/xr/xr.js',
  '/external/xr/xr-slam.js',
  '/external/xr/media-worker.js',
  '/external/xr/semantics-worker.js',
  // Dependencies from CDN (8th Wall)
  'https://cdn.8thwall.com/web/aframe/8frame-1.5.0.min.js',
  'https://cdn.8thwall.com/web/xrextras/xrextras.js',
  'https://cdn.8thwall.com/web/landing-page/landing-page.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('🧊 Service Worker: Pre-caching core AR engine assets...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // We only cache GET requests
  if (event.request.method !== 'GET') return;

  // For 8th Wall engine and 3D models, we use a "Cache First" strategy
  const url = new URL(event.request.url);
  const isEngineOrModel = 
    url.pathname.includes('/external/xr/') || 
    url.pathname.includes('/Models/') ||
    url.hostname.includes('cdn.8thwall.com');

  if (isEngineOrModel) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
  } else {
    // For other assets, use "Network First, falling back to cache"
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
    );
  }
});
