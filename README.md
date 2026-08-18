# DoubleImpactStore

Tienda de videojuegos retro y coleccionables. Sitio web estático (HTML5 + CSS3 + JavaScript Vanilla ES Modules) con PWA, catálogo desde Google Sheets, sección de Instagram, internacionalización ES/EN, modo claro/oscuro, SEO, seguridad y analytics.

La especificación funcional y técnica vive en `.kiro/specs/double-impact-store/` (`requirements.md`, `design.md`, `tasks.md`).

## Comandos

```bash
npm run dev        # servidor local estático (http://localhost:4173)
npm run watch      # minificador en modo watch
npm run minify     # minificación única (Terser + cssnano -> *.min.js / *.min.css)
npm test           # Vitest + fast-check (tests unitarios / property-based)
npm run test:e2e   # Playwright (E2E)
npm run check      # smoke tests: siglas, manifest, marca, minificación
```

Los navegadores resuelven las URLs limpias (`/productos`, `/security-policy`, `/security-acknowledgments`, `/404`) vía `.htaccess` en producción; en el servidor local de pruebas usa los archivos `*.html` directos.

## Configuración que debe completar el administrador

El sitio funciona sin estas configuraciones (los componentes se ocultan o quedan en fallback), pero para habilitar la integración completa hay que proporcionar:

1. **Redes sociales** — `js/social.js` → `SOCIAL_LINKS`: completar las URLs de TikTok, YouTube, Facebook, Threads, Twitter/X y WhatsApp (`https://wa.me/569XXXXXXXX`). Las cuentas de Instagram `@Ropavejero.Retro` y `@nekketsustore` son las originales de la unión que da origen a la tienda y se mantienen.

2. **Analytics** — `js/modules/analytics.js` → `ANALYTICS_CONFIG`:
   - `gtmId`: `GTM-XXXXXXX`
   - `ga4Id`: `G-XXXXXXXXXX`
   - `cloudflareToken`: token del beacon de Cloudflare Web Analytics
   - Si GTM/GA4 están bloqueados, se activa automáticamente el fallback local de analytics.

3. **Contacto de seguridad** — `.well-known/security.txt` y las páginas `security-policy.html` / `security-acknowledgments.html` usan `security@doubleimpactstore.cl`.

4. **Instagram (GitHub Actions)** — secret del repositorio:
   - `INSTAGRAM_TOKEN` — token de larga duración de la Graph API de Instagram (el workflow `update-instagram.yml` corre cada 12 h y busca el hashtag `#DoubleImpactStoreWeb`). `api/update_instagram.py` genera las imágenes WebP responsivas y actualiza `js/instagram_posts.min.js`, el cache busting (`?v=`) y la versión del Service Worker. Nunca guardes el token en el repositorio.

5. **Catálogo** — se carga en tiempo real desde Google Sheets (CSV). La hoja se enlaza en `js/modules/products.js` (`GOOGLE_SHEETS_CSV_URL`).

## Arquitectura

```
index.html / productos.html / 404.html / security-policy.html / security-acknowledgments.html
css/            estilos (fuentes + minificados, modo claro/oscuro vía variables CSS)
js/             index.js (orquestador, <= 20 líneas), siglas.json, i18n, instagram_posts
js/modules/     logger, cache, siglas, utils, ui, products, instagram, efemerides, analytics
api/            update_instagram.py (procesador de posts)
scripts/        check-siglas, check-manifest, check-brand, check-minification
.github/workflows/   update-instagram.yml
watcher.js      minificador (Terser + cssnano), genera los .min.* versionados
```

## Versionado y PWA

- El caché del Service Worker usa `doubleimpact-v{version}`; la versión se actualiza automáticamente (bump en el workflow de Instagram o manual en `service-worker.js` / query strings `?v=YYYY-MM-DD`).
- Iconos, manifest y service worker en raíz. El nombre de caché y estrategias siguen `design.md`.
