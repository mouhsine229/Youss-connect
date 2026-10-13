// Service worker. Le shell (HTML, JS, CSS, vendors, icônes) est précaché pour démarrer hors ligne.
// La page et le service worker passent par le réseau. Les scripts déjà en cache s'affichent tout de suite.
// les images locales en cache-first, les polices Google et les tuiles de carte en stale-while-revalidate.
const VERSION = "youss-connect-v32";
const SHELL = VERSION + "-shell";
const IMAGES = VERSION + "-images";
const RUNTIME = VERSION + "-runtime";
const SHELL_ASSETS = [
  "./", "./index.html", "./manifest.webmanifest", "./css/app.css",
  "./vendor/leaflet/leaflet.js", "./vendor/leaflet/leaflet.css", "./vendor/jsQR.js", "./vendor/qrcode.js",
  "./js/config.js", "./js/i18n.js", "./js/i18n-en.js", "./js/data.js", "./js/guard.js", "./js/state.js", "./js/backend.js", "./js/kitchen.js", "./js/sheet.js", "./js/providers.js", "./js/biometric.js", "./js/ui.js", "./js/receipt.js", "./js/scanner.js", "./js/map.js", "./js/demo.js", "./js/shell.js", "./js/router.js",
  "./js/screens/auth.js", "./js/screens/home.js", "./js/screens/explorer.js", "./js/screens/transport.js", "./js/screens/delivery.js", "./js/screens/restaurants.js", "./js/screens/orders.js", "./js/screens/events.js", "./js/screens/market.js", "./js/screens/culture.js", "./js/screens/wallet.js", "./js/screens/rewards.js", "./js/screens/business.js", "./js/screens/activities.js", "./js/screens/notifications.js", "./js/screens/profile.js", "./js/screens/ops.js", "./js/screens/pro.js",
  "./icons/icon-192.png", "./icons/icon-512.png", "./assets/youss-logo-full.png", "./assets/youss-logo-transparent.png", "./assets/youss-logo-on-dark.png", "./assets/img/brand/placeholder.svg"
];
const RUNTIME_LIMIT = 400;

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(SHELL).then((c) => c.addAll(SHELL_ASSETS).catch(() => {})).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k.indexOf(VERSION) !== 0).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

function trim(cacheName, limit) {
  caches.open(cacheName).then((c) => c.keys().then((keys) => { if (keys.length > limit) c.delete(keys[0]).then(() => trim(cacheName, limit)); }));
}
const isLocalImage = (url) => /\/assets\/img\/|\/icons\/|\/assets\/.*\.(png|jpg|svg)$/i.test(url.pathname);
const isFont = (url) => /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
const isTile = (url) => /tile\.openstreetmap\.(org|fr)$/.test(url.hostname);

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  if (sameOrigin && (req.mode === "navigate" || /sw\.js$/i.test(url.pathname))) {
    event.respondWith(fetch(req).then((res) => { if (res && res.ok) { const copy = res.clone(); caches.open(SHELL).then((c) => c.put(req, copy)).catch(() => {}); } return res; })
      .catch(() => caches.match(req).then((cached) => cached || (req.mode === "navigate" ? caches.match("./index.html") : undefined))));
    return;
  }
  if (sameOrigin && /\.(js|css|webmanifest)$/i.test(url.pathname)) {
    event.respondWith(caches.open(SHELL).then((c) => c.match(req).then((cached) => {
      const network = fetch(req).then((res) => { if (res && res.ok) c.put(req, res.clone()).catch(() => {}); return res; }).catch(() => cached);
      return cached || network;
    })));
    return;
  }
  if (sameOrigin && isLocalImage(url)) {
    event.respondWith(caches.match(req).then((cached) => cached || fetch(req).then((res) => { if (res && res.ok) { const copy = res.clone(); caches.open(IMAGES).then((c) => c.put(req, copy)).catch(() => {}); } return res; }).catch(() => caches.match("./assets/img/brand/placeholder.svg"))));
    return;
  }
  if (isFont(url) || isTile(url)) {
    event.respondWith(caches.open(RUNTIME).then((c) => c.match(req).then((cached) => {
      const network = fetch(req).then((res) => { if (res && (res.ok || res.type === "opaque")) { c.put(req, res.clone()).catch(() => {}); trim(RUNTIME, RUNTIME_LIMIT); } return res; }).catch(() => cached);
      return cached || network;
    })));
  }
});
