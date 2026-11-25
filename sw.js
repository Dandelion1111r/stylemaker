// Ton sur Ton service worker: keeps the prototype usable offline.
// Same-origin files only; nothing is sent anywhere.
const CACHE = "tonsurton-v3";
const CORE = [
  "./", "index.html", "impressum.html", "datenschutz.html",
  "img/hero-woman.jpg", "img/woman-suit.jpg", "img/man-suit.jpg", "img/mature-woman.jpg", "img/skin-closeup.jpg", "img/woman-trench.jpg", "img/man-street.jpg", "img/man-coat.jpg", "img/knit.jpg", "img/plaid.jpg",
  "favicon.svg", "favicon-32.png", "apple-touch-icon.png", "icon-192.png", "icon-512.png",
  "fonts/bodoni-moda-latin-400-normal.woff2", "fonts/bodoni-moda-latin-ext-400-normal.woff2",
  "fonts/bodoni-moda-latin-500-normal.woff2", "fonts/bodoni-moda-latin-ext-500-normal.woff2",
  "fonts/bodoni-moda-latin-400-italic.woff2", "fonts/bodoni-moda-latin-ext-400-italic.woff2",
  "fonts/jost-latin-400-normal.woff2", "fonts/jost-latin-ext-400-normal.woff2",
  "fonts/jost-latin-500-normal.woff2", "fonts/jost-latin-ext-500-normal.woff2",
  "fonts/dm-mono-latin-400-normal.woff2", "fonts/dm-mono-latin-ext-400-normal.woff2"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Pages: network first, so updates show at once; everything else: cache first.
self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return;
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res; })
      .catch(() => caches.match(req).then(r => r || caches.match("index.html"))));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  })));
});
