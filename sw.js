/* YOUSS CONNECT — service worker
   App shell précaché pour l'installation PWA et le démarrage hors ligne.
   Stratégie : network-first pour le code (HTML/JS), cache-first pour les
   icônes. Ainsi chaque déploiement est pris en compte immédiatement quand
   le réseau est disponible, tout en gardant un fallback hors ligne. */
const VERSION = "youss-connect-v7";
const CACHE = VERSION;
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./js/config.js",
  "./js/state.js",
  "./js/backend.js",
  "./js/ui.js",
  "./js/scanner.js",
  "./js/router.js",
  "./js/screens/shell.js",
  "./js/screens/auth.js",
  "./js/screens/home.js",
  "./js/screens/transport.js",
  "./js/screens/wallet.js",
  "./js/screens/rewards.js",
  "./js/screens/activities.js",
  "./js/screens/notifications.js",
  "./js/screens/profile.js",
  "./js/screens/explorer.js",
  "./js/screens/restaurants.js",
  "./js/screens/market.js",
  "./js/screens/events.js",
  "./js/screens/culture.js",
  "./js/screens/delivery.js",
  "./js/screens/business.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(ASSETS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function isSameOrigin(url) {
  return url.origin === self.location.origin;
}

function isCodeRequest(request, url) {
  if (request.mode === "navigate") return true;
  return /\.(js|html|webmanifest|json)$/i.test(url.pathname);
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  /* Ressources tierces (tuiles carte, Wikimedia, CDN) : réseau direct. */
  if (!isSameOrigin(url)) return;

  if (isCodeRequest(req, url)) {
    /* Network-first : code toujours frais, fallback cache hors ligne. */
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match("./index.html")))
    );
    return;
  }

  /* Icônes / images locales : cache-first. */
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      });
    })
  );
});
