# DoubleImpactStore

Tienda de videojuegos retro y coleccionables. Sitio web estático (HTML5 + CSS3 + JavaScript Vanilla ES Modules) con PWA, catálogo desde Google Sheets, sección de Instagram, internacionalización ES/EN, modo claro/oscuro, SEO, seguridad y analytics.

La especificación funcional y técnica vive en `.kiro/specs/double-impact-store/` (`requirements.md`, `design.md`, `tasks.md`).

## Estado de implementación

Las tareas 1–32 de `tasks.md` están completadas y verificadas. Lo más reciente:

- **Menú superior solo-íconos** — el texto de marca desaparece del header; en desktop solo se muestran íconos con tooltip (`attr(aria-label)`) y en móvil (≤1024px) ícono + texto vía menú hamburguesa. Íconos a 1.05rem, del mismo tamaño que los `.control-btn`.
- **Navegación activa por sección** — el ítem del menú se selecciona según la ruta **y el hash** (`index.html#nosotros` → `/nosotros`), al hacer clic en un enlace y al navegar hacia atrás/adelante (`hashchange`).
- **Efemérides funcionales** — sección que carga `js/efemerides.json` (fechas en formato `DD/MM`, 366 entradas) y muestra la efeméride del día con detalle expandible; se oculta si no hay entrada.
- **Destacados por fabricante** — 5 tarjetas-categoría (Nintendo, PlayStation, Sega, Xbox, Atari y más) que enlazan al catálogo.
- **Contacto** — grid con 7 tarjetas de canales (Instagram ×3, Threads, X, YouTube, WhatsApp); se eliminaron los bloques de envíos/entrega.
- **Testimonios reales** — 3 reseñas de clientes (Andrés V., Carla M., Javier R.) con rol, subtítulo y soporte ES/EN; sin contenido de demostración.
- **Hero** — CTA secundario cambiado de "Servicios técnicos" a "Contacto" (`#contacto`).
- **Botones flotantes** — `back-to-top` elevado (`bottom: 6rem`) para no superponerse al botón de WhatsApp.
- **Multilenguaje completo del menú** — `data-i18n-aria` en los enlaces: los `aria-label` y tooltips del menú se traducen junto con el resto de la página.

## Comandos

```bash
npm test           # Vitest + fast-check (41 tests unitarios / property-based)
npm run test:watch # Vitest en modo watch
npm run test:e2e   # Playwright (17 E2E)
npm run minify     # minificación única (Terser + cssnano -> *.min.js / *.min.css)
npm run build      # alias de minify
npm run watch      # minificador en modo watch
npm run check      # smoke tests: siglas, manifest, marca, minificación
```

Para servir el sitio localmente (fuera del build), usa cualquier servidor estático, p. ej. `python -m http.server 4173` o `npx serve`.

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
js/             index.js (orquestador, <= 20 líneas), siglas.json, efemerides.json, i18n, instagram_posts
js/modules/     logger, cache, siglas, utils, ui, products, instagram, efemerides, analytics
api/            update_instagram.py (procesador de posts)
scripts/        check-siglas, check-manifest, check-brand, check-minification
tests/          unitarios + property-based (Vitest + fast-check) y e2e/ (Playwright)
.github/workflows/   update-instagram.yml
watcher.js      minificador (Terser + cssnano), genera los .min.* versionados
```

## Versionado y PWA

- El caché del Service Worker usa `doubleimpact-v{version}`; la versión se actualiza automáticamente (bump en el workflow de Instagram o manual en `service-worker.js` / query strings `?v=YYYY-MM-DD`).
- Iconos, manifest y service worker en raíz. El nombre de caché y estrategias siguen `design.md`.
