# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proyecto

Sitio estático de **DoubleImpactStore** (tienda de videojuegos retro, Santiago de Chile): HTML + CSS + JavaScript Vanilla ES Modules, PWA, sin backend ni framework. Publicado en GitHub Pages con dominio `doubleimpactstore.cl` (`CNAME`).

- Especificación fuente de verdad: `.kiro/specs/double-impact-store/` (`requirements.md` > `design.md` > `tasks.md`, en ese orden de prioridad). `AGENTS.md` contiene las instrucciones operativas del dueño (en español); `AGENTS v0.2.md` / `AGENTS v0.3.md` son versiones antiguas.
- Problemas conocidos y plan de resolución: [docs/PLAN-MEJORAS.md](docs/PLAN-MEJORAS.md). Léelo antes de tocar despliegue, seguridad, Service Worker o el workflow de Instagram.
- Idioma del proyecto: español (código comentado, commits, documentación).

## Comandos

```bash
npm test                                   # Vitest (jsdom) + fast-check, tests/**/*.test.js
npx vitest run tests/siglas.test.js        # un archivo
npx vitest run -t "nombre del test"        # un test por nombre
npm run test:e2e                           # Playwright; levanta `python -m http.server 4173` solo
npx playwright test tests/e2e/home.spec.js -g "FAQ"   # un E2E
npx playwright install chromium            # necesario la primera vez (si no, todos los E2E fallan)
npm run minify                             # = build = `node watcher.js --once`; regenera todos los *.min.*
npm run watch                              # minificador en modo watch
npm run check                              # check-siglas, check-manifest, check-brand, check-minification
python api/update_instagram.py             # requiere INSTAGRAM_TOKEN (env o .env), pip install -r requirements.txt
```

No hay linter configurado. Para ver el sitio: `python -m http.server 4173` y abrir `http://127.0.0.1:4173/index.html` (las URLs limpias `/productos` funcionan en GitHub Pages, no en el server local).

## Arquitectura

### Lo que realmente carga el navegador

Las páginas HTML referencian **archivos minificados**: `css/style.min.css`, `css/productos.min.css`, `js/index.min.js`, `js/instagram_posts.min.js`. Pero `js/index.min.js` importa los módulos **sin minificar** (`./modules/ui.js`, etc.). Consecuencias:

- Cambios en `js/modules/*.js` se ven de inmediato; cambios en `js/index.js`, `js/instagram_posts.js` o `css/*.css` requieren `npm run minify`.
- Los `*.min.*` están versionados en git: después de editar fuentes, ejecuta `npm run minify` y commitea ambos.
- Cache busting por query string `?v=...` en el HTML; los imports de módulos no llevan `?v=`.

### Flujo de arranque

`js/index.js` (≤20 líneas por requisito R19, solo orquesta) en `DOMContentLoaded`: `initUI()` → `setNavActive()` → `initAnalytics()` → registra `service-worker.js` → efeméride del día → `initCatalog()` si existe `#catalog-container` (solo `productos.html`) → `initInstagramSection(getInstagramPostsData())` si existe `#instagram-root`. Las tres páginas (`index`, `productos`, `404`) usan el mismo entry point; cada módulo se activa según los elementos presentes en el DOM.

`getInstagramPostsData` es una **función global** definida por `js/instagram_posts.min.js`, cargado como `<script>` clásico antes del módulo.

### Módulos (`js/modules/`)

- `ui.js` — concentra tema, idioma, FAQ, blog, menú móvil, nav activa, scroll, offline. Las ~425 primeras líneas son el diccionario `translations = { es, en }`. i18n: atributos `data-i18n`, `data-i18n-aria`, `data-i18n-placeholder` en el HTML + `t(key)`; `setLang` emite el evento `dis:langchange` al que reaccionan catálogo, Instagram y efemérides para re-renderizar. Importa `../social.js` (`SOCIAL_LINKS`, fuente de las redes/contacto).
- `products.js` — catálogo desde Google Sheets (`GOOGLE_SHEETS_CSV_URL`, endpoint `gviz/tq?tqx=out:csv`). Parser CSV propio. La hoja real solo rotula Product/Platform/Link: el mapeo de columnas es **posicional** (`COLUMN_MAP`) con detección de encabezado si existe. `Link` es un shortcode → `https://www.instagram.com/p/{Link}/`; `Sold === '1'` = vendido. Estado de filtros en un objeto `state` a nivel de módulo.
- `cache.js` — `localStorage` con `{data, timestamp, ttl}`; TTL catálogo 5 min (`dis_catalog_cache`).
- `siglas.js` — detecta claves de `js/siglas.json` (`{ SIGLA: { es, en } }`) en nombres de producto; siglas de 1 carácter solo como token aislado.
- `instagram.js` — filtra posts por consola usando `js/console_aliases.json` (substring sobre `post.title`).
- `efemerides.js` — `js/efemerides.json`, clave `DD/MM`; si no hay entrada la sección se oculta.
- `analytics.js` — `ANALYTICS_CONFIG` (IDs de GTM/GA4/Cloudflare). GTM también está inyectado inline en el `<head>` de cada HTML con el mismo ID: si cambias el ID, cambia ambos. Fallback local en `dis_analytics_events` si hay bloqueador.
- `utils.js` — `sanitizeHTML`, `validateSearch` (máx. 100 chars), `debounce`, `sortProducts`, `handleError` (emite `dis:error`).

Claves de `localStorage`: `dis_theme` (default `dark`), `dis_lang` (default `es`), `dis_catalog_cache`, `dis_analytics_events`.

Contenido externo (CSV de Sheets, captions de Instagram) se inserta con `textContent` o pasa por `sanitizeHTML`; mantén esa regla en cualquier `innerHTML` nuevo.

### Pipeline de Instagram

`.github/workflows/update-instagram.yml` (cron cada 12 h + manual) → `api/update_instagram.py`:
1. Lee posts vía Graph API con `INSTAGRAM_TOKEN` (secret; sale con código 1 si falta o es inválido) y conserva solo los que llevan `#DoubleImpactStoreWeb`.
2. Descarga `img/IG_{id}.jpeg` y genera `img/IG_{id}_{400,800,1200}.webp` con Pillow; borra imágenes huérfanas.
3. Reescribe `js/instagram_posts.js` y `.min.js`, actualiza `?v=` en `index.html`, `CACHE_VERSION` y la lista de imágenes en `service-worker.js`, y escribe `commit_message.txt`.
4. El workflow hace `git add .` y commit/push a `main` como `github-actions[bot]`.

Por eso el historial está lleno de commits "Se modificaron N post desde Instagram": son automáticos. No edites a mano `js/instagram_posts*.js`, las imágenes `img/IG_*` ni `CACHE_VERSION`/la lista de imágenes del Service Worker si el script las gestiona: se sobrescriben.

### Service Worker / PWA

`service-worker.js` (caché `doubleimpact-v{CACHE_VERSION}`): navegaciones network-first con fallback a caché y a `/index.html`; CSV de Google Sheets network-first con fallback a caché; resto del mismo origen cache-first. Al no haber caché, avisa a la página con `postMessage({type:'dis-offline'})` (indicador en `ui.js`). Cambiar `CACHE_VERSION` invalida toda la caché de todos los usuarios.

### Despliegue y seguridad

`.github/workflows/deploy-pages.yml` sube el repo completo (`path: '.'`) a GitHub Pages en cada push a `main`. **GitHub Pages ignora `.htaccess`**: la CSP, las cabeceras de seguridad, HSTS y los rewrites de `.htaccess` no se aplican en producción (ver plan). Si añades orígenes externos (scripts, imágenes, `fetch`), actualiza la CSP donde se aplique realmente.

### Tests

- Unitarios en `tests/*.test.js` importan directamente `js/modules/*.js` (no los `.min`). Las propiedades 1–10 de `design.md` están implementadas con fast-check.
- E2E en `tests/e2e/`: interceptan el CSV de Google Sheets con `page.route` y datos de `tests/e2e/fixtures.js`, así que no dependen de la hoja real.
- `scripts/check-brand.js` busca la marca antigua (RopavejeroRetro). Las referencias legítimas a las cuentas originales `@ropavejero.retro` / `@nekketsustore` (origen de la tienda) deben mantenerse; los captions reales de Instagram pueden contener hashtags antiguos.

## Configuración externa

- Secret de GitHub Actions `INSTAGRAM_TOKEN` (token de larga duración de la Graph API; expira a los 60 días).
- Local: `.env` con `INSTAGRAM_TOKEN=...` (gitignored; leído con python-dotenv).
- `js/modules/analytics.js` → `cloudflareToken` vacío hasta que se configure Cloudflare Web Analytics.
- `js/social.js` → URLs de redes; `url` vacía oculta el botón.
