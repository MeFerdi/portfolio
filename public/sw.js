// Service worker tuned for slow and intermittent connections.
// - Pages: network first, but fall back to the cached copy after 3 seconds or when
//   offline. Every page that loads is cached, so visited technical reports work offline.
// - Same-origin static files: served from cache, fetched and cached on first use.
//   Files under /_next/static are content-hashed, so a cached copy is never stale.
// Bump CACHE_NAME whenever PRECACHE changes.
const CACHE_NAME = "portfolio-cache-v3";
const PRECACHE = [
  "/",
  "/manifest.webmanifest",
  "/ferdynand-80.jpg",
  "/nairobi-40.png",
  "/icon-192.svg",
];
const NETWORK_TIMEOUT_MS = 3000;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

function cachePut(request, response) {
  if (response.ok && response.type === "basic") {
    const copy = response.clone();
    caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
  }
  return response;
}

function pageFromNetworkOrCache(request) {
  const network = fetch(request).then((response) =>
    cachePut(request, response),
  );
  network.catch(() => {}); // handled below; avoids an unhandled rejection when the cache wins
  const timeout = new Promise((resolve) =>
    setTimeout(resolve, NETWORK_TIMEOUT_MS),
  );

  const cachedAfterTimeout = timeout.then(() => caches.match(request));
  return Promise.race([
    network,
    cachedAfterTimeout.then((cached) => cached || network),
  ]).catch(() =>
    caches.match(request).then((cached) => cached || caches.match("/")),
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(pageFromNetworkOrCache(request));
    return;
  }

  // Data requests for client-side navigation must stay fresh.
  if (url.searchParams.has("_rsc") || request.headers.get("RSC")) return;

  event.respondWith(
    caches
      .match(request)
      .then(
        (cached) =>
          cached ||
          fetch(request).then((response) => cachePut(request, response)),
      ),
  );
});
