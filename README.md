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

## Documentación oficial (Kiro)

Los documentos fuente de la especificación viven en `.kiro/specs/double-impact-store/`:

| Documento | Contenido |
|---|---|
| `requirements.md` | Requisitos funcionales y criterios de aceptación (R1–R27) redactados en patrón EARS |
| `design.md` | Arquitectura técnica, interfaces de módulos, modelos de datos, propiedades de corrección y estrategia de testing |
| `tasks.md` | Plan de implementación por fases (tareas 1–32, todas completadas) con trazabilidad a requisitos |

### Requirements (`requirements.md`)

Requisitos definidos en la especificación (todos implementados y verificados):

| # | Requisito | Criterios clave |
|---|---|---|
| R1 | Estructura y páginas | `index.html` con secciones en orden (hero, nosotros, destacados, Instagram, efemérides, blog, testimonios, FAQ, servicios, contacto); `productos.html` (`/productos`), `404.html`, `security-policy.html`, `security-acknowledgments.html`; marca DoubleImpactStore en todo el proyecto; `.nav-active` persistente |
| R2 | Responsive y accesibilidad | Breakpoints móvil (<768px) / tablet (768–1024px) / desktop (>1024px); ARIA labels; navegación por teclado; HTML5 semántico; Font Awesome 6.5.1 local |
| R3 | Claro/oscuro y multilenguaje | Tema y idioma persistentes en `localStorage` (`dis_theme` / `dis_lang`); default `dark` y `es`; traducción dinámica completa ES/EN |
| R4 | Catálogo | Google Sheets CSV, caché `localStorage` con TTL 5 min, búsqueda con debounce 300ms, filtros por plataforma y estado, paginación, modal de detalles, manejo de errores con reintento, breadcrumb |
| R5 | Siglas | Diccionario 40+ en `js/siglas.json` bilingüe; detección case-insensitive; tooltips desktop, sección móvil y sección en modal |
| R6 | Instagram | Posts desde `js/instagram_posts.min.js`; WebP responsive 400/800/1200px con `srcset`; lazy loading; fechas relativas ES/EN; filtros por consola con `console_aliases.json` |
| R7 | Automatización Instagram | GitHub Actions cada 12 h; hashtag `#DoubleImpactStoreWeb`; Pillow genera WebP; token solo desde `INSTAGRAM_TOKEN`; salida con código 1 ante token inválido |
| R8 | PWA | `manifest.json`, Service Worker cache-first, fallback offline, caché versionada `doubleimpact-v{YYYY-MM-DD}`, reducción de carga 60–70% |
| R9 | Performance | `loading="lazy"`, WebP responsive, minificados (reducción ≥36%), query strings `?v=`, `watcher.js` regenera minificados automáticamente |
| R10 | SEO | Meta tags completos, Open Graph, Twitter Cards, Schema.org JSON-LD, `sitemap.xml`, `robots.txt`, canonicals, URLs limpias |
| R11 | Seguridad | CSP, `X-Content-Type-Options`, `X-XSS-Protection`, `X-Frame-Options`, `Referrer-Policy`, redirección HTTPS, `security.txt`, sanitización de entradas, fallback analytics |
| R12 | Analytics | GTM, GA4, Cloudflare Analytics y fallback local si están bloqueados |
| R13 | Efemérides | Carga desde `js/efemerides.json` con clave `DD/MM`; título/fecha/texto/detalle expandible; ocultar sección si no hay entrada |
| R14 | Blog | Tarjetas en la home; contenido completo en modal (Escape / clic fuera / restauración de foco) |
| R15 | Testimonios | Reseñas reales con nombre, reseña y puntuación; lazy loading en imágenes |
| R16 | FAQ | ≥6 preguntas; accordion con exactamente un ítem abierto; animación; ES/EN |
| R17 | Servicios | Diagnóstico, reparación, limpieza, cambio de condensadores, reemplazo de lectores, pulido de discos; incluidos en Schema.org `knowsAbout` |
| R18 | Contacto y redes | 7 canales (Instagram ×3, Threads, X, WhatsApp, YouTube) como tarjetas con ícono ≥3rem; **sin** textos de envíos ni entregas presenciales |
| R19 | Módulos JS | `js/modules/` con una responsabilidad por módulo; `index.js` ≤20 líneas solo orquesta |
| R20 | Identidad de marca | Logos `LogoDoubleImpactStore_*`; sin referencias a RopavejeroRetro; caché `doubleimpact-v*`; manifest, sitemap, robots y security.txt con la nueva marca |
| R21 | Menú solo-íconos | 10 ítems en orden exacto; solo logo sin texto; tooltip CSS en hover; `aria-label`; scroll suave; logo → inicio; hamburguesa con ícono+texto |
| R22 | Contacto íconos grandes | Íconos ≥3rem con texto debajo; URLs reales; `target="_blank" rel="noopener noreferrer"`; labels ES/EN |
| R23 | Barra de progreso | `#scroll-progress` fija al tope (2–4px), `width` proporcional al scroll, color de acento |
| R24 | Back to top | Aparece con scroll >300px; scroll suave al inicio; `position: fixed` debajo del botón de WhatsApp; logo también hace scroll al inicio |
| R25 | WhatsApp flotante | `#whatsapp-float` fijo `bottom: 1.5rem` (verde #25D366), tooltip "Comunícate con nosotros" / "Contact us" ES/EN |
| R26 | Destacados por fabricante | 5 categorías (Nintendo, PlayStation, Sega, Xbox, Atari y más) enlazadas al catálogo; grid responsive |
| R27 | Fix efemérides | Sección completa en `index.html`, carga `DD/MM`, llamadas desde `DOMContentLoaded` en `index.js` |

### Design (`design.md`)

**Pila tecnológica:** HTML5 semántico + CSS3 (variables/grid/flexbox) + JavaScript ES Modules Vanilla · Font Awesome 6.5.1 local · Google Sheets CSV como catálogo · WebP responsive (400/800/1200px) · Service Worker + Manifest · Python (Pillow) + GitHub Actions · GTM → GA4 + Cloudflare + fallback · `watcher.js` (Node) · Schema.org + OG + Twitter Cards + sitemap.

**Principios de diseño:** sin backend propio (Google Sheets como única fuente mutable) · progressive enhancement · cache-first con invalidación versionada · módulos ES desacoplados (`index.js` solo orquesta) · multilenguaje en runtime sin páginas duplicadas.

**Arquitectura de alto nivel:** navegador → CDN/hosting estático; `fetch` de catálogo a Google Sheets; Service Worker con Cache API; GitHub Actions (cron 12h) → `api/update_instagram.py` (Graph API + Pillow) → actualiza `js/instagram_posts.min.js` y `service-worker.js`; eventos → GTM/GA4/Cloudflare/fallback.

**Interfaces de módulos** (firmas principales):

- `logger.js` → `logger.{log,warn,error,isProduction}`
- `cache.js` → `setCache(key, data, ttlMs)` / `getCache(key)` / `clearCache(key)`
- `siglas.js` → `loadSiglas()` / `detectSiglas(name, dict)` / `renderSiglasTooltips(...)` / `renderSiglasSection(...)`
- `utils.js` → `sanitizeHTML` / `validateSearch` / `debounce` / `sortProducts` / `handleError`
- `ui.js` → tema (`initTheme/setTheme/getTheme`), idioma (`initLang/setLang/getLang/t`), `initFAQ` / `initBlogModals` / `initMobileMenu` / `setNavActive` / `initScrollProgress` / `initBackToTop` / `initWhatsAppButton` / `initLogoBackToTop`
- `products.js` → `initCatalog` / `filterProducts` / `paginateProducts` / `openProductModal` / `renderProductTable`
- `instagram.js` → `initInstagram` / `filterPostsByConsole` / `formatRelativeDate`
- `efemerides.js` → `loadEfemerides` / `getTodayEfemeride` / `renderEfemeride`
- `analytics.js` → `initAnalytics` / `isAdBlockActive` / `trackEvent` / `setupCSPReporting`

**Modelos de datos:**

- `Product` — columnas CSV `Num→num`, `Product→name`, `Platform→platform`, `Price→price`, `Neto→neto`, `Stock→stock`, `Link→instagramLink` (`https://www.instagram.com/p/{Link}/`), `Sold→sold` (`'1'` = vendido). Google Sheet: `docs.google.com/spreadsheets/d/1ekyKZHhUIwQDFtqEblnJN_5SNeYEqOlKOja1wnCutLY`.
- `SiglasDict` — `Record<sigla, { es, en }>` (39+ entradas: CIB, CIB+, MM, BL, GH, CE, L, S, PAL, 2D–4D, PC, PH, ...).
- `InstagramPost` — `{ id, image, title, description, link, media_type, date, likes }` con `link` completo (no se construye).
- `ConsoleAliases` — `Record<consola, { label, aliases[] }>` (25 plataformas); la consola se detecta por substring en `post.title`.
- `Efemeride` — `{ date: "DD/MM", ES: {title,text,det}, EN: {title,text,det} }`.
- `CacheEntry` — `{ data, timestamp, ttl }`.
- `manifest.json` — `name`/`short_name` "DoubleImpactStore", `display: standalone`, íconos 150/250/500.

**Propiedades de corrección** (verificadas con fast-check, 100 iteraciones cada una):

| Propiedad | Verifica |
|---|---|
| 1. Invariante de tema y persistencia | R3.1, R3.2 |
| 2. Cobertura bilingüe de traducciones | R3.3, R3.4 |
| 3. Round-trip de caché con TTL | R4.2 |
| 4. Corrección del filtro de plataformas | R4.4 |
| 5. Detección exhaustiva de siglas | R5.2, R5.4 |
| 6. Formato de fecha relativa | R6.4 |
| 7. Invariante de accordion FAQ | R16.2 |
| 8. Debounce de búsqueda | R4.3 |
| 9. Efeméride correcta por fecha | R13.1, R13.3 |
| 10. Marcado de navegación activa | R1.7 |

**Manejo de errores:** `utils.handleError` loguea (solo dev) y notifica solo ante contenido crítico; CSV no disponible → mensaje + "Reintentar"; token inválido → salida 1 del updater; efeméride ausente → sección oculta; `localStorage` no disponible → caché degrada a no-op; GTM/GA4 bloqueados → fallback local; WebP no soportado → `<picture>` con fallback PNG; inputs → `sanitizeHTML`.

**Cabeceras de seguridad (`.htaccess`):** CSP, `X-Content-Type-Options: nosniff`, `X-XSS-Protection: 1; mode=block`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, redirección HTTPS 301.

**Estrategia de caché del Service Worker:** cache-first para estáticos (JS/CSS/HTML/img); network-first con fallback a caché para el CSV de Google Sheets; `activate` limpia cachés antiguas; nombre `doubleimpact-v{YYYY-MM-DD}`.

### Tasks (`tasks.md`)

Plan de implementación en 32 tareas, todas completadas (`[x]`). Fases y estado:

| Fase | Tareas | Estado |
|---|---|---|
| Infraestructura base | 1 (estructura, `package.json`, `watcher.js`, `.htaccess`, `robots.txt`) | ✅ |
| Datos JSON | 2 (`siglas.json`, `efemerides.json`, `console_aliases.json`) | ✅ |
| Módulos infraestructura | 3 (`logger`, `cache`, `utils` + PBT 3 y 8) | ✅ |
| Módulos dominio | 4 (`siglas`, `efemerides` + PBT 5 y 9) | ✅ |
| UI | 5 (`ui.js`: tema, idioma, FAQ, blog, menú móvil, nav activa, scroll progress, back-to-top, WhatsApp + PBT 1, 2, 7, 10) | ✅ |
| Catálogo | 6 (`products.js`: CSV, filtros, paginación, modal + PBT 4) | ✅ |
| Instagram | 7 (`instagram.js` + PBT 6) | ✅ |
| Analytics | 8 (`analytics.js`) | ✅ |
| Entry point | 9–10 (`index.js` ≤20 líneas, checkpoint) | ✅ |
| CSS | 11 (`style.css`, `productos.css`, minificación ≥36%) | ✅ |
| Páginas HTML | 12 (`index`, `productos`, `404`, `security-policy`, `security-acknowledgments`) | ✅ |
| PWA | 13 (`manifest.json`, `service-worker.js`, registro) | ✅ |
| Automatización | 14 (`api/update_instagram.py`, `.github/workflows/update-instagram.yml`) | ✅ |
| SEO / infra | 15 (`sitemap.xml`, `.well-known/security.txt`, meta/canonical) | ✅ |
| Marca | 16 (reemplazo completo de identidad) | ✅ |
| Accesibilidad | 17 (ARIA, teclado, semántica, `alt`, `<picture>`) | ✅ |
| Smoke tests | 18 (`check-siglas`, `check-minification`, `check-manifest`) | ✅ |
| Checkpoint | 19 (tests + verificación de marca) | ✅ |
| E2E Playwright | 20 (responsive, accesibilidad, tema, idioma, catálogo, FAQ, Instagram) | ✅ |
| Integración | 21 (orquestación `index.js`, query strings, URLs limpias, HTTPS) | ✅ |
| Navegación | 22 (10 ítems, anchors, efemérides en menú, logo → inicio) | ✅ |
| Contacto íconos | 23 (`#contacto` con íconos ≥3rem, URLs reales) | ✅ |
| Scroll progress | 24 (`initScrollProgress`) | ✅ |
| Back to top / logo | 25 (`initBackToTop`, `initLogoBackToTop`) | ✅ |
| WhatsApp flotante | 26 (`#whatsapp-float`, tooltip ES/EN) | ✅ |
| Menú solo-íconos | 28 (quitar texto del header, tooltips, nav-text móvil) | ✅ |
| Fix efemérides | 29 (sección completa, carga `DD/MM`, render) | ✅ |
| Contacto sin envíos | 30 (patrón `.contact-card`, quitar info de envíos) | ✅ |
| Destacados | 31 (5 categorías por fabricante) | ✅ |
| Checkpoint final | 32 (verificación integral de la iteración 2) | ✅ |

**Notas del plan:** las tareas marcadas con `*` eran opcionales; cada tarea referencia sus requisitos para trazabilidad; propiedades 1–10 tienen su property test asociado; el orden sigue las dependencias de módulos (infraestructura → lógica → UI → HTML → automatización → SEO → verificación).
