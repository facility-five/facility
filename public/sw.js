const CACHE_NAME = 'facility-cache-v3';
const STATIC_CACHE = 'facility-static-v3';
const DYNAMIC_CACHE = 'facility-dynamic-v3';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/favicon.ico'
];

// Assets that should never be cached (always fresh)
const NO_CACHE_PATTERNS = [
  /\/api\//,
  /supabase/,
  /auth/,
  /realtime/,
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => {
        if (![CACHE_NAME, STATIC_CACHE, DYNAMIC_CACHE].includes(key)) {
          return caches.delete(key);
        }
      })
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  const sameOrigin = url.origin === self.location.origin;
  
  // Never cache these patterns
  if (NO_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // Handle different types of requests
  if (sameOrigin && (url.pathname.endsWith('.js') || url.pathname.endsWith('.css'))) {
    // Cache static assets with network first strategy
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const cloned = response.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(event.request, cloned);
            });
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else if (sameOrigin) {
    // For HTML and other resources, use cache first with quick network fallback
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) {
          // Return cached version immediately
          // But also update cache in background if older than 5 minutes
          const cachedTime = cached.headers.get('sw-cached-time');
          if (!cachedTime || Date.now() - parseInt(cachedTime) > 300000) {
            fetch(event.request).then(async (response) => {
              if (response.ok) {
                const newHeaders = new Headers(response.headers);
                newHeaders.set('sw-cached-time', Date.now().toString());
                const body = await response.clone().arrayBuffer();
                const responseWithTime = new Response(body, {
                  status: response.status,
                  statusText: response.statusText,
                  headers: newHeaders
                });
                caches.open(DYNAMIC_CACHE).then((cache) => {
                  cache.put(event.request, responseWithTime.clone());
                });
              }
            }).catch(() => {});
          }
          return cached;
        }
        
        // No cache, fetch from network
        return fetch(event.request).then(async (response) => {
          if (response.ok && sameOrigin) {
            const newHeaders = new Headers(response.headers);
            newHeaders.set('sw-cached-time', Date.now().toString());
            const body = await response.clone().arrayBuffer();
            const responseWithTime = new Response(body, {
              status: response.status,
              statusText: response.statusText,
              headers: newHeaders
            });
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(event.request, responseWithTime.clone());
            });
            return responseWithTime;
          }
          return response;
        });
      })
    );
  }
});

// Handle messages from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((keys) => {
      keys.forEach((key) => caches.delete(key));
    });
  }
});