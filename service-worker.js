/* DoubleImpactStore — Service Worker
 * Estrategia: cache-first para recursos estáticos, network-first con fallback a caché para el CSV del catálogo.
 * Nombre de caché: doubleimpact-v{YYYY-MM-DD} — la versión la actualiza api/update_instagram.py automáticamente.
 */
const CACHE_VERSION = '2026-08-19_1643';
const CACHE_NAME = `doubleimpact-v${CACHE_VERSION}`;

const CORE_ASSETS = [
  '/',
  '/index.html',
  '/productos.html',
  '/404.html',
  '/security-policy.html',
  '/security-acknowledgments.html',
  '/css/style.min.css',
  '/css/productos.min.css',
  '/css/font-awesome_6.5.1_all.min.css',
  '/js/index.min.js',
  '/js/instagram_posts.min.js',
  '/js/siglas.json',
  '/js/efemerides.json',
  '/js/console_aliases.json',
  '/manifest.json',
  '/img/LogoDoubleImpactStore_150.png',
  '/img/LogoDoubleImpactStore_250.png',
  '/img/LogoDoubleImpactStore_500.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'dis-skip-waiting') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Solo manejar el propio origen y el catálogo de Google Sheets
  const isOwnOrigin = url.origin === self.location.origin;
  const isCatalogCSV = url.hostname.includes('docs.google.com') && request.url.includes('gviz/tq');

  if (!isOwnOrigin && !isCatalogCSV) return;

  if (request.method !== 'GET') return;

  const isNavigation = request.mode === 'navigate';

  // Navegaciones: red primero, caché como fallback, offline como último recurso
  if (isNavigation) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached || caches.match('/index.html'))
            .then((fallback) => {
              if (!fallback) {
                self.clients
                  .matchAll({ includeUncontrolled: true })
                  .then((clients) =>
                    clients.forEach((client) =>
                      client.postMessage({ type: 'dis-offline' })
                    )
                  );
              }
              return fallback || Response.error();
            })
        )
    );
    return;
  }

  // Catálogo CSV: network-first con fallback a caché
  if (isCatalogCSV) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => {
            if (!cached) {
              self.clients
                .matchAll({ includeUncontrolled: true })
                .then((clients) =>
                  clients.forEach((client) => client.postMessage({ type: 'dis-offline' }))
                );
            }
            return cached || Response.error();
          })
        )
    );
    return;
  }

  // Recursos estáticos: cache-first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached || Response.error());
    })
  );
});