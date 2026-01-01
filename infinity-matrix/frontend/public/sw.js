
/* eslint-disable no-restricted-globals */
const CACHE_NAME = 'infinity-x-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install event: Cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Fetch event: Network first strategy for API, Stale-while-revalidate for assets
self.addEventListener('fetch', (event) => {
  // Navigation requests for SPA routing (return index.html)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then((response) => {
        return response || fetch(event.request);
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached response if found
        if (response) {
          return response;
        }
        // Otherwise fetch from network
        return fetch(event.request).then(
          (response) => {
            // Don't cache if not a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone response to cache it
            const responseToCache = response.clone();
            // Cache new requests dynamically (optional, good for images)
            // caches.open(CACHE_NAME).then((cache) => {
            //   cache.put(event.request, responseToCache);
            // });

            return response;
          }
        );
      })
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});
