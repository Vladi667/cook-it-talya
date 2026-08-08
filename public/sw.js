/*
 * Offline support for drilling without a signal.
 *
 * Strategy is deliberately conservative:
 *   - navigations: network first, cache as a fallback. A student must never be
 *     stuck on a stale build because a cache won a race.
 *   - /_next/static/*: cache first. These filenames are content-hashed, so a
 *     cached copy is by definition the right copy.
 *   - fonts and icons: cache first, same reasoning.
 * Everything else goes straight to the network.
 */
const VERSION = "v3";
const SHELL = `cook-it-talya-shell-${VERSION}`;
const ASSETS = `cook-it-talya-assets-${VERSION}`;
const ROUTES = ["/", "/patterns", "/exam", "/progress"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((cache) => cache.addAll(ROUTES))
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== SHELL && k !== ASSETS)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isImmutable(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".png")
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          void caches.open(SHELL).then((c) => c.put(request, copy));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached ?? (await caches.match("/")) ?? Response.error();
        }),
    );
    return;
  }

  if (isImmutable(url)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request).then((response) => {
            const copy = response.clone();
            void caches.open(ASSETS).then((c) => c.put(request, copy));
            return response;
          }),
      ),
    );
  }
});
