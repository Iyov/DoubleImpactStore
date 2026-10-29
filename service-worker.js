/* DoubleImpactStore — Service Worker
 * Estrategias:
 *  - Navegaciones: network-first; sin red, la página cacheada (también con URL limpia: /productos -> /productos.html) o /index.html.
 *  - Datos (CSV del catálogo en Google Sheets y *.json propios): network-first con fallback a caché,
 *    para que un cambio en los datos llegue sin cache busting.
 *  - Recursos estáticos del propio sitio: cache-first por URL exacta (los ?v= cambian con cada versión);
 *    sin red, cualquier versión cacheada del mismo archivo.
 * Nombre de caché: doubleimpact-v{CACHE_VERSION}-{ASSETS_HASH}
 *  - CACHE_VERSION lo actualiza api/update_instagram.py cuando cambian las imágenes de Instagram.
 *  - ASSETS_HASH lo actualiza `npm run build` (watcher.js) cuando cambia el CSS o el JS.
 * Cualquier cambio en el nombre reinstala el Service Worker y descarta la caché anterior.
 */
const CACHE_VERSION = '2026-10-28_2103';
const ASSETS_HASH = 'ae07c432c7';
const CACHE_NAME = `doubleimpact-v${CACHE_VERSION}-${ASSETS_HASH}`;

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
  '/webfonts/fa-brands-400.woff2',
  '/webfonts/fa-regular-400.woff2',
  '/webfonts/fa-solid-900.woff2',
  '/js/index.min.js',
  '/js/instagram_posts.json',
  '/js/siglas.json',
  '/js/efemerides.json',
  '/js/console_aliases.json',
  '/manifest.json',
  '/img/LogoDoubleImpactStore_150.png',
  '/img/LogoDoubleImpactStore_250.png',
  '/img/LogoDoubleImpactStore_500.png',
  '/img/placeholder-post.webp'
];

self.addEventListener('install', (event) => {
  // Si falla el precache, la instalación falla y el Service Worker anterior sigue activo
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
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

function notifyOffline() {
  self.clients
    .matchAll({ includeUncontrolled: true })
    .then((clients) => clients.forEach((client) => client.postMessage({ type: 'dis-offline' })));
}

function cacheCopy(request, response) {
  if (!response.ok) return;
  const copy = response.clone();
  caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
}

// La página de una navegación todavía no existe mientras se responde: se espera
// a que aparezca su cliente para avisarle que se sirvió sin conexión.
async function notifyNavigationOffline(clientId) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const client = clientId && (await self.clients.get(clientId));
    if (client) {
      client.postMessage({ type: 'dis-offline' });
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
}

async function offlineNavigation(request) {
  const url = new URL(request.url);
  const cached =
    (await caches.match(request, { ignoreSearch: true })) ||
    (!/\.[a-z0-9]+$/i.test(url.pathname) && (await caches.match(`${url.pathname.replace(/\/$/, '')}.html`))) ||
    (await caches.match('/index.html'));
  return cached || Response.error();
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const isOwnOrigin = url.origin === self.location.origin;
  const isCatalogCSV = url.hostname === 'docs.google.com' && url.pathname.includes('/gviz/tq');

  // Solo el propio origen y el catálogo; /cdn-cgi/ es de Cloudflare (detección de bots, analytics)
  if (!(isOwnOrigin || isCatalogCSV) || url.pathname.startsWith('/cdn-cgi/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          cacheCopy(request, response);
          return response;
        })
        .catch(() => {
          event.waitUntil(notifyNavigationOffline(event.resultingClientId));
          return offlineNavigation(request);
        })
    );
    return;
  }

  if (isCatalogCSV || (isOwnOrigin && url.pathname.endsWith('.json'))) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          cacheCopy(request, response);
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => {
            if (!cached) notifyOffline();
            return cached || Response.error();
          })
        )
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request)
          .then((response) => {
            cacheCopy(request, response);
            return response;
          })
          .catch(() =>
            caches.match(request, { ignoreSearch: true }).then((fallback) => fallback || Response.error())
          )
    )
  );
});
