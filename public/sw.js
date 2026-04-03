const CACHE_NAME = "pasbills-v1";
const urlsToCache = ["/", "/offline.html"];

// Install event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch(() => {
        // Continue even if some URLs fail (e.g., offline.html might not exist yet)
      });
    }),
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
  self.clients.claim();
});

// Fetch event - Network first, fall back to cache
self.addEventListener("fetch", (event) => {
  // Skip API calls and external requests
  if (
    event.request.url.includes("/api/") ||
    event.request.method !== "GET" ||
    event.request.url.includes("supabase")
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response && response.status === 200 && response.type !== "error") {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Return cached version or offline page
        return caches.match(event.request).then((response) => {
          return response || caches.match("/offline.html");
        });
      }),
  );
});
