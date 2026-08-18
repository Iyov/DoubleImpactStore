# Implementation Plan: DoubleImpactStore

## Overview

Implementación de DoubleImpactStore como sitio web estático (HTML5 + CSS3 + JavaScript Vanilla ES Modules) con capacidades PWA, integración con Google Sheets, automatización de Instagram vía GitHub Actions y soporte bilingüe ES/EN. El plan adapta la arquitectura probada de RopavejeroRetro.cl reemplazando completamente la identidad de marca.

Lenguaje de implementación: **JavaScript Vanilla (ES Modules)**
Framework de tests unitarios/PBT: **Vitest + fast-check**
Tests E2E: **Playwright**

---

## Tasks

- [x] 1. Configurar estructura base del proyecto
  - Crear la estructura de directorios: `css/`, `js/modules/`, `api/`, `.github/workflows/`, `.well-known/`, `scripts/`
  - Inicializar `package.json` con dependencias de desarrollo: `vitest`, `fast-check`, `playwright`, `terser` (para watcher.js)
  - Crear `watcher.js` — minificador automático que detecta cambios en `*.css` y `*.js` (excluyendo `.min.*`) y genera las versiones `.min.css` y `.min.js` correspondientes usando Terser/cssnano, garantizando reducción ≥ 36%
  - Crear `.htaccess` con: redirección HTTPS (301), URLs limpias (`/productos` → `productos.html`), cabeceras de seguridad (CSP, X-Content-Type-Options, X-XSS-Protection, X-Frame-Options, Referrer-Policy)
  - Crear `robots.txt` permitiendo el acceso de todos los crawlers a páginas públicas, con referencia al `sitemap.xml`
  - _Requirements: 1.2, 9.3, 9.4, 10.8, 11.1, 11.3, 11.5_

- [x] 2. Crear archivos de datos JSON
  - [x] 2.1 Verificar `js/siglas.json` — ya existe con 39 siglas bilingüe (ES/EN)
    - Estructura real: `{ "CIB": { "es": "Caja, Juego, Manual", "en": "Box, Game, Manual" }, ... }`
    - El archivo ya contiene: CIB, CIB+, MM, BL, GH, CE, L, S, PAL, 2D, 3D, 4D, PC, PH, K, M, C, CM, CCR, DC, DM, CR, CBB, C/M, S/M, S/C, WD, LW, SCT, JNF, GotY, MO, Holo, SFC, org, alt, Acc, Japo, ESP
    - Si faltan siglas relevantes, agregarlas manteniendo el mismo formato
    - _Requirements: 5.1_
  - [x] 2.2 Verificar `js/efemerides.json` — ya existe con efemérides de gaming retro
    - Estructura real: `{ "efemerides": [{ "date": "DD/MM", "ES": { "title": "...", "text": "...", "det": "..." }, "EN": { ... } }] }`
    - La clave de fecha es `"DD/MM"` (día/mes) — importante: `getTodayEfemeride` debe construir la clave como `padStart(2,'0') + '/' + padStart(2,'0')` (día primero)
    - Verificar que haya cobertura para las fechas más relevantes del año
    - _Requirements: 13.1_
  - [x] 2.3 Verificar `js/console_aliases.json` — ya existe con 25 plataformas
    - Estructura real: `{ "PS1": { "label": "PS1", "aliases": ["[PS1]", "PlayStation 1 |", "PSX", ...] }, ... }`
    - La detección de consola en `instagram.js` busca cada alias como substring en `post.title`
    - Incluye: PS1, PS2, PS3, PS4, PSP, NES, SNES, N64, GCN, Wii, GB, GBC, GBA, DS, 3DS, Genesis, Dreamcast, Xbox, X360, PC, Console, Varios, Accesorios, Manuales, DVD
    - _Requirements: 6.7_

- [x] 3. Implementar módulos JavaScript — Capa de infraestructura
  - [x] 3.1 Implementar `js/modules/logger.js`
    - Exportar objeto `logger` con métodos `log`, `warn`, `error`, `isProduction()`
    - Solo emitir logs cuando `isProduction()` retorna `false` (detectado por hostname o variable)
    - _Requirements: 19.1_
  - [x] 3.2 Implementar `js/modules/cache.js`
    - Exportar `setCache(key, data, ttlMs)`, `getCache(key)` y `clearCache(key)`
    - Manejar gracefully cuando `localStorage` no está disponible (modo privado Safari): `setCache` hace no-op, `getCache` retorna `null`
    - Usar clave `dis_catalog_cache` con TTL de 300 000 ms para el catálogo
    - _Requirements: 4.2, 19.1_
  - [x]* 3.3 Escribir property test para `cache.js` — Property 3
    - **Property 3: Round-trip de caché con TTL**
    - **Validates: Requirements 4.2**
    - `fc.assert(fc.asyncProperty(fc.anything(), fc.integer({ min: 1000 }), ...))`
    - Comentario: `// Feature: double-impact-store, Property 3: Round-trip de caché con TTL`
  - [x] 3.4 Implementar `js/modules/utils.js`
    - Exportar `sanitizeHTML(input)`, `validateSearch(query)`, `debounce(fn, ms)`, `sortProducts(products, field, asc)`, `handleError(context, err)`
    - `sanitizeHTML` debe escapar `<`, `>`, `&`, `"`, `'` para prevenir XSS
    - `handleError` loguea con `logger.error()` y solo notifica al usuario si afecta contenido crítico
    - _Requirements: 11.2, 19.1_
  - [x]* 3.5 Escribir property test para `utils.js` — Property 8
    - **Property 8: Debounce de búsqueda**
    - **Validates: Requirements 4.3**
    - `fc.assert(fc.asyncProperty(fc.array(fc.string(), { minLength: 2 }), ...))`
    - Comentario: `// Feature: double-impact-store, Property 8: Debounce de búsqueda`

- [x] 4. Implementar módulos JavaScript — Lógica de dominio
  - [x] 4.1 Implementar `js/modules/siglas.js`
    - Exportar `loadSiglas()`, `detectSiglas(productName, dict)`, `renderSiglasTooltips(el, siglas, dict, lang)`, `renderSiglasSection(container, siglas, dict, lang)`
    - `detectSiglas` debe ser case-insensitive: buscar cada clave del diccionario dentro del nombre del producto
    - Tooltips visibles con hover en desktop; sección visible sin hover en móvil
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  - [x]* 4.2 Escribir property test para `siglas.js` — Property 5
    - **Property 5: Detección exhaustiva de siglas**
    - **Validates: Requirements 5.2, 5.4**
    - Generar nombre de producto con sigla conocida insertada; verificar que aparece en resultado
    - Comentario: `// Feature: double-impact-store, Property 5: Detección exhaustiva de siglas`
  - [x] 4.3 Implementar `js/modules/efemerides.js`
    - Exportar `loadEfemerides()`, `getTodayEfemeride(data, date?)`, `renderEfemeride(efemeride, container, lang)`
    - Cuando no existe efeméride para la fecha: ocultar el componente con `display: none`, sin errores visibles
    - _Requirements: 13.1, 13.2, 13.3_
  - [x]* 4.4 Escribir property test para `efemerides.js` — Property 9
    - **Property 9: Efeméride correcta por fecha**
    - **Validates: Requirements 13.1, 13.3**
    - Para toda fecha-clave en el JSON, `getTodayEfemeride` debe retornar la entrada; para fechas sin clave, retornar `null`
    - Comentario: `// Feature: double-impact-store, Property 9: Efeméride correcta por fecha`

- [ ] 5. Implementar módulo `js/modules/ui.js`
  - [ ] 5.1 Implementar control de tema (claro/oscuro)
    - Exportar `initTheme()`, `setTheme(theme)`, `getTheme()`
    - `setTheme` debe: aplicar `data-theme` en `<html>`, persistir en `localStorage` bajo `dis_theme`
    - Default: `'dark'` si `localStorage` no tiene valor previo
    - _Requirements: 3.1, 3.2, 3.6_
  - [ ]* 5.2 Escribir property test para `ui.js` — Property 1
    - **Property 1: Invariante de tema y persistencia**
    - **Validates: Requirements 3.1, 3.2**
    - `fc.constantFrom('dark', 'light')` → verificar `document.documentElement.dataset.theme` y `localStorage.getItem('dis_theme')`
    - Comentario: `// Feature: double-impact-store, Property 1: Invariante de tema y persistencia`
  - [ ] 5.3 Implementar control de idioma y traducciones
    - Exportar `initLang()`, `setLang(lang)`, `getLang()`, `t(key)`
    - Objeto de traducciones ES/EN con todas las cadenas de UI (nav, FAQ, testimonios, blog, catálogo, etc.)
    - Incluir clave `"whatsapp.tooltip"`: ES = "Comunícate con nosotros", EN = "Contact us"
    - Aplicar traducciones al DOM recorriendo elementos con atributo `data-i18n`
    - Default: `'es'` si `localStorage` no tiene valor previo (clave `dis_lang`)
    - _Requirements: 3.3, 3.4, 3.5, 3.6, 25.5_
  - [ ]* 5.4 Escribir property test para `ui.js` — Property 2
    - **Property 2: Cobertura bilingüe de traducciones**
    - **Validates: Requirements 3.3, 3.4**
    - Para toda clave registrada y todo idioma (`'es'` | `'en'`), `t(key)` debe retornar string no vacío
    - Comentario: `// Feature: double-impact-store, Property 2: Cobertura bilingüe de traducciones`
  - [ ] 5.5 Implementar componentes de UI: FAQ, modales de blog, menú móvil y navegación activa
    - Exportar `initFAQ()`, `initBlogModals()`, `initMobileMenu()`, `setNavActive(path)`
    - `initFAQ`: accordion con lógica de exactamente un ítem abierto a la vez; animación CSS suave
    - `initBlogModals`: abrir modal en clic, cerrar con Escape o clic fuera, restaurar foco
    - `setNavActive`: aplicar clase `.nav-active` exactamente al enlace cuyo `href` coincide con la ruta actual
    - _Requirements: 1.7, 14.2, 14.3, 16.1, 16.2, 16.3_
  - [ ]* 5.6 Escribir property test para `ui.js` — Property 7 y Property 10
    - **Property 7: Invariante de accordion FAQ (exactamente uno abierto)**
    - **Property 10: Marcado de navegación activa**
    - **Validates: Requirements 16.2, 1.7**
    - FAQ: después de hacer clic en cualquier ítem, exactamente uno queda abierto
    - Nav: `setNavActive(path)` aplica `.nav-active` solo al enlace correcto
    - Comentario: `// Feature: double-impact-store, Property 7 & 10`
  - [ ] 5.7 Implementar barra de progreso de scroll
    - Exportar `initScrollProgress()`
    - Escuchar evento `scroll` (passive) y calcular: `(scrollTop / (scrollHeight - clientHeight)) * 100`
    - Actualizar `width` del elemento `#scroll-progress` y `aria-valuenow`
    - _Requirements: 23.1, 23.2, 23.3, 23.4_
  - [ ] 5.8 Implementar botón "Volver Arriba" (back to top)
    - Exportar `initBackToTop()`
    - Mostrar botón `#back-to-top` cuando `scrollY > 300` usando clase CSS con transición opacity/transform
    - Al hacer clic: `window.scrollTo({ top: 0, behavior: 'smooth' })`
    - Vincular clic en el logo del header para que ejecute el mismo scroll al inicio
    - Exportar `initLogoBackToTop()`
    - _Requirements: 24.1, 24.2, 24.3, 24.4, 24.5, 24.6, 21.5_
  - [ ] 5.9 Implementar botón flotante de WhatsApp
    - Exportar `initWhatsAppButton()`
    - El botón `#whatsapp-float` ya existe en el HTML; inicializar el tooltip traducido
    - Traducir el tooltip `.whatsapp-tooltip` usando `t('whatsapp.tooltip')` al cargar y al cambiar idioma
    - _Requirements: 25.1, 25.2, 25.3, 25.4, 25.5, 25.6_

- [x] 6. Implementar módulo `js/modules/products.js`
  - [x] 6.1 Implementar carga de catálogo desde Google Sheets CSV
    - URL del Google Sheet: `https://docs.google.com/spreadsheets/d/1ekyKZHhUIwQDFtqEblnJN_5SNeYEqOlKOja1wnCutLY`
    - Parsear CSV mapeando columnas: `Num→num`, `Product→name`, `Platform→platform`, `Price→price`, `Neto→neto`, `Stock→stock`, `Link→instagramLink`, `Sold→sold`
    - Construir `instagramLink` como `"https://www.instagram.com/p/" + row.Link + "/"`
    - Mapear `sold`: `row.Sold === '1'` → `true`; cualquier otro valor → `false`
    - Verificar caché (`dis_catalog_cache`, TTL 5 min) antes de hacer fetch; almacenar en caché si carga exitosa
    - Exportar `initCatalog()`, `retryLoadCatalog()`: en caso de error mostrar mensaje descriptivo + botón "Reintentar"
    - _Requirements: 4.1, 4.2, 4.8_
  - [x] 6.2 Implementar filtros, paginación y renderizado de tabla
    - Exportar `filterProducts(products, query, platforms, showSold)`, `paginateProducts(products, page, perPage)`, `renderProductTable(products, container)`
    - Búsqueda con debounce de 300ms (usando `utils.debounce`)
    - Filtro de plataformas: AND entre plataformas seleccionadas y productos
    - Filtro de estado: separación visual de disponibles vs. vendidos
    - Paginación con número configurable de productos por página
    - Breadcrumb de navegación en la página de catálogo
    - _Requirements: 4.3, 4.4, 4.5, 4.6, 4.9_
  - [x]* 6.3 Escribir property test para `products.js` — Property 4
    - **Property 4: Corrección del filtro de plataformas**
    - **Validates: Requirements 4.4**
    - `fc.array(productArbitrary)` + `fc.array(fc.string(), { minLength: 1 })` → todo resultado debe pertenecer a plataformas seleccionadas
    - Comentario: `// Feature: double-impact-store, Property 4: Corrección del filtro de plataformas`
  - [x] 6.4 Implementar modal de detalle de producto
    - Exportar `openProductModal(product, siglas, lang)`
    - Modal debe mostrar: nombre, plataforma, precio (neto), estado, enlace a Instagram, sección de siglas detectadas con definiciones en idioma activo
    - Cerrar con Escape o clic fuera; restaurar foco al disparador
    - _Requirements: 4.7, 5.4_

- [x] 7. Implementar módulo `js/modules/instagram.js`
  - [x] 7.1 Implementar inicialización y renderizado de posts
    - Exportar `initInstagram(posts, aliases)`, `filterPostsByConsole(posts, consoleKey, aliases)`, `formatRelativeDate(date, lang)`
    - Los posts vienen de `getInstagramPostsData()` en `js/instagram_posts.js` con estructura: `{ id, image, title, description, link, media_type, date, likes }`
    - La detección de consola: para cada entrada en `console_aliases.json`, verificar si algún string en `entry.aliases` aparece como substring en `post.title`
    - El campo `post.link` ya contiene la URL completa de Instagram (no requiere construcción)
    - Renderizar posts con lazy loading (`loading="lazy"`) en la imagen
    - Al hacer clic en post: abrir `post.link` en nueva pestaña (`target="_blank" rel="noopener noreferrer"`)
    - Botones de filtro: usar `entry.label` de `console_aliases.json` como texto del botón
    - _Requirements: 6.1, 6.2, 6.3, 6.5, 6.6, 6.7_
  - [x] 7.2 Implementar formateo de fechas relativas bilingüe
    - `formatRelativeDate(date, lang)`: retornar "Hace X días" (ES) / "X days ago" (EN) según diferencia temporal
    - Cubrir: segundos, minutos, horas, días, semanas, meses, años
    - _Requirements: 6.4_
  - [x]* 7.3 Escribir property test para `instagram.js` — Property 6
    - **Property 6: Formato de fecha relativa**
    - **Validates: Requirements 6.4**
    - `fc.date({ max: new Date() })` + `fc.constantFrom('es', 'en')` → resultado debe ser string no vacío
    - Comentario: `// Feature: double-impact-store, Property 6: Formato de fecha relativa`

- [x] 8. Implementar módulo `js/modules/analytics.js`
  - Exportar `initAnalytics()`, `isAdBlockActive()`, `trackEvent(category, action, label?)`, `setupCSPReporting()`
  - Integrar Google Tag Manager (GTM) y Google Analytics 4 (GA4) mediante tags estándar
  - Integrar Cloudflare Analytics mediante script tag
  - `isAdBlockActive()`: detectar si GTM/GA4 están bloqueados (fetch a dominio de Google Analytics)
  - Si AdBlock activo: almacenar eventos en `localStorage` como fallback o enviar a endpoint propio
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 11.6_

- [x] 9. Checkpoint — Módulos JS base completos
  - Asegurarse de que todos los módulos exportan las interfaces definidas en el diseño
  - Ejecutar `vitest --run` para verificar que todos los tests existentes pasan
  - Verificar que ningún módulo importa desde rutas rotas
  - Asegurarse de que todos los tests pasan. Preguntar al usuario si hay dudas.

- [x] 10. Crear punto de entrada `js/index.js`
  - Máximo 20 líneas; únicamente orquestar el evento `DOMContentLoaded`
  - Importar y llamar en orden: `initTheme`, `initLang`, `setNavActive`, módulos de UI, `initInstagram`, `initCatalog` (solo en productos.html), `loadEfemerides`, `initAnalytics`
  - No contener lógica de negocio
  - _Requirements: 19.2, 19.3_

- [ ] 11. Crear CSS principal y de catálogo
  - [ ] 11.1 Crear `css/style.css` — estilos principales
    - Variables CSS para modo oscuro/claro (colores, fuentes, espaciados)
    - Layout responsive con CSS Grid y Flexbox: breakpoints en 768px y 1024px
    - Estilos para: header/nav, hero, secciones de índice (nosotros, instagram, efemérides, blog, testimonios, FAQ, servicios, contacto), footer
    - Clases de tema: `[data-theme="dark"]` y `[data-theme="light"]` en `<html>`
    - Font Awesome 6.5.1 — referenciar el archivo local `css/font-awesome_6.5.1_all.min.css` (ya instalado, NO usar CDN externo)
    - Menú de navegación: en desktop font-size compacto (≤ 0.9rem) y gap reducido para que quepan 10 ítems en una línea
    - Sección contacto: grid/flexbox con íconos `font-size: 3rem` centrados, texto debajo de cada ícono
    - Barra de progreso: `#scroll-progress { position: fixed; top: 0; height: 3px; width: 0%; background: var(--accent-color); z-index: 9999; }`
    - Botón back-to-top: `position: fixed; bottom: 5rem; right: 1.5rem` con transición opacity/transform
    - Botón flotante WhatsApp: `position: fixed; bottom: 1.5rem; right: 1.5rem; background: #25D366` con tooltip en hover/focus
    - _Requirements: 2.1, 2.5, 3.1, 3.2, 21.3, 22.1, 22.3, 23.1, 24.4, 25.1, 25.2_
  - [ ] 11.2 Crear `css/productos.css` — estilos del catálogo
    - Tabla de productos responsive; tarjetas en móvil y tabla en desktop
    - Estilos para filtros, paginación, modal de producto, tooltips de siglas, breadcrumb
    - _Requirements: 2.1, 4.6, 5.2, 5.3_
  - [ ] 11.3 Verificar minificación automática con `watcher.js`
    - Ejecutar `node watcher.js` una vez y comprobar que genera `style.min.css` y `productos.min.css`
    - Verificar reducción de tamaño ≥ 36%
    - _Requirements: 9.3_

- [ ] 12. Crear páginas HTML
  - [ ] 12.1 Crear `index.html` — página principal
    - Estructura semántica: `<header>`, `<nav>`, `<main>`, secciones con `<section>` y `<article>`, `<footer>`
    - Secciones en orden exacto: `#hero`, `#nosotros`, `#productos-destacados`, `#instagram`, `#efemerides`, `#blog`, `#testimonios`, `#faq`, `#servicios`, `#contacto`
    - Menú de navegación con 10 ítems en orden: Inicio, Nosotros, Productos, Instagram, Efemérides, Blog, Testimonios, FAQ, Servicios, Contacto
    - El logo en el header lleva a `#top` (scroll al inicio)
    - Barra de progreso de scroll: `<div id="scroll-progress">` fijada al tope del viewport
    - Botón "Volver Arriba": `<button id="back-to-top">` con ícono `fa-chevron-up`, posición fixed bottom-right
    - Botón flotante WhatsApp: `<a id="whatsapp-float" href="https://wa.me/56967691585">` con ícono `fa-whatsapp`, tooltip "Comunícate con nosotros", position fixed bottom-right por encima del back-to-top
    - Sección `#contacto` con íconos grandes (≥3rem) + texto debajo: Instagram DoubleImpactStore, Instagram @Ropavejero.Retro, Instagram @NekketsuStore, Threads, Twitter/X, WhatsApp, YouTube con sus URLs reales
    - Meta tags completos: title, description, keywords, canonical, og:*, twitter:* (con dominio DoubleImpactStore)
    - Schema.org JSON-LD: `Store`, `Product`, `Service` (incluyendo `knowsAbout` para servicios técnicos y pulido de discos), `FAQPage`
    - Cargar Font Awesome local: `<link rel="stylesheet" href="css/font-awesome_6.5.1_all.min.css">` (NO CDN)
    - Integración GTM, GA4 y Cloudflare Analytics via `<script>` tags en `<head>` y al final del `<body>`
    - Cargar módulos JS con `type="module"` y query string de versión (ej. `?v=2026-08-17`)
    - _Requirements: 1.1, 2.4, 10.1, 10.2, 10.3, 10.4, 10.7, 12.1, 12.2, 12.3, 14.1, 15.1, 16.1, 17.1, 17.2, 18.1, 18.2, 18.3, 18.4, 21.1, 21.2, 21.3, 21.6, 22.1, 22.2, 23.1, 24.1, 25.1_
  - [ ] 12.2 Crear `productos.html` — página de catálogo
    - Tabla/tarjetas de productos con controles de búsqueda, filtros y paginación
    - Breadcrumb de navegación
    - Meta tags y Schema.org correspondientes
    - Cargar `products.js`, `siglas.js`, `cache.js`, `utils.js` en orden correcto
    - _Requirements: 1.2, 4.9, 10.1, 10.2, 10.3, 10.7_
  - [ ] 12.3 Crear `404.html`, `security-policy.html` y `security-acknowledgments.html`
    - `404.html`: diseño coherente con el sitio, enlace de vuelta al inicio
    - `security-policy.html`: política de divulgación responsable de vulnerabilidades
    - `security-acknowledgments.html`: lista de investigadores reconocidos
    - Meta tags básicos en cada página
    - _Requirements: 1.3, 1.4, 1.5_

- [x] 13. Implementar PWA (Service Worker y Manifest)
  - [x] 13.1 Crear `manifest.json`
    - Campos: `name`, `short_name` ambos = `"DoubleImpactStore"`, `start_url`, `display: "standalone"`, `background_color: "#121212"`, `theme_color: "#E63946"`
    - Íconos: `LogoDoubleImpactStore_150.png` (150x150), `LogoDoubleImpactStore_250.png` (250x250), `LogoDoubleImpactStore_500.png` (500x500)
    - _Requirements: 8.1, 20.3, 20.5_
  - [x] 13.2 Crear `service-worker.js`
    - Nombre de caché: `doubleimpact-v{YYYY-MM-DD}` (ej. `doubleimpact-v2026-08-17`)
    - Estrategia cache-first para recursos estáticos (JS, CSS, HTML, imágenes)
    - Network-first con fallback a caché para CSV de Google Sheets
    - En evento `activate`: eliminar todas las cachés con nombre distinto al actual
    - Indicación de modo offline cuando no hay recursos en caché y la red falla
    - _Requirements: 8.2, 8.3, 8.4, 8.5, 20.3_
  - [x] 13.3 Registrar Service Worker desde `index.js`
    - Detectar soporte (`'serviceWorker' in navigator`) y registrar; manejar error gracefully si no registrable
    - _Requirements: 8.2_

- [x] 14. Implementar automatización de Instagram (`Instagram_Updater`)
  - [x] 14.1 Crear `api/update_instagram.py`
    - Leer `INSTAGRAM_TOKEN` desde variable de entorno (nunca desde archivos versionados)
    - Conectar con Instagram Graph API y filtrar posts con hashtag `#DoubleImpactStoreWeb`
    - Usar Instaloader + Pillow para descargar imágenes y generar variantes WebP: 400px, 800px, 1200px
    - Escribir/actualizar `js/instagram_posts.min.js` con los posts procesados
    - Actualizar la versión en `index.html` y el manifiesto de caché en `service-worker.js`
    - Si token inválido/expirado: terminar con `sys.exit(1)` y mensaje descriptivo en stderr
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_
  - [x] 14.2 Crear `.github/workflows/update-instagram.yml`
    - Trigger: `schedule: cron: '0 */12 * * *'` (cada 12 horas)
    - Pasos: checkout → setup Python → install dependencies (Pillow, Instaloader) → run `api/update_instagram.py` → git commit & push si hay cambios
    - Leer `INSTAGRAM_TOKEN` desde GitHub Secrets
    - _Requirements: 7.1, 7.5_

- [x] 15. Implementar SEO y archivos de infraestructura
  - [x] 15.1 Crear `sitemap.xml`
    - Incluir todas las URLs indexables: `/`, `/productos`, `/security-policy`, `/security-acknowledgments`
    - Usar dominio de DoubleImpactStore en todas las entradas
    - _Requirements: 10.5, 20.6_
  - [x] 15.2 Crear `.well-known/security.txt`
    - Incluir: `Contact`, `Preferred-Languages`, `Policy` apuntando a `security-policy.html`
    - Usar identidad de marca DoubleImpactStore y dominio actualizado
    - _Requirements: 11.4, 20.6_
  - [x] 15.3 Verificar todos los meta tags, canonical URLs y datos estructurados
    - Confirmar que todas las páginas tienen `<link rel="canonical">` con dominio DoubleImpactStore
    - Confirmar que `og:url` y `twitter:` tags reflejan el dominio correcto
    - Confirmar que Schema.org incluye servicios técnicos en `knowsAbout`
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.7, 17.4, 20.4_

- [x] 16. Actualizar identidad de marca DoubleImpactStore
  - [x] 16.1 Reemplazar todas las ocurrencias de la marca anterior en el proyecto
    - Buscar y reemplazar en todos los archivos (`.html`, `.js`, `.css`, `.json`, `.xml`, `.txt`, `.md`, `.py`, `.yml`):
      - `RopavejeroRetro` → `DoubleImpactStore`
      - `Ropavejero Retro` → `Double Impact Store`
      - `ropavejeroretro` → `doubleimpactstore`
      - `RopavejeroRetro.cl` → `doubleimpactstore.cl` (o el dominio definitivo)
      - Hashtag `#RopavejeroRetroWeb` → `#DoubleImpactStoreWeb`
    - _Requirements: 1.6, 20.2, 20.7_
  - [x] 16.2 Actualizar referencias de logos en HTML y manifest
    - En todos los `<img>` y `<link rel="icon">`: reemplazar logos anteriores por los de `img/LogoDoubleImpactStore_*`
    - Verificar que `manifest.json` ya usa los íconos correctos (tarea 13.1)
    - _Requirements: 20.1_
  - [x] 16.3 Actualizar nombre de caché del Service Worker
    - Confirmar formato `doubleimpact-v{version}` en `service-worker.js`
    - _Requirements: 20.3_

- [x] 17. Implementar accesibilidad y calidad HTML
  - Agregar `aria-label` a todos los elementos interactivos (botones, links, inputs, toggles de tema/idioma)
  - Verificar soporte de navegación por teclado: Tab en todos los controles interactivos, Enter para activar, Escape para cerrar modales
  - Confirmar uso de HTML5 semántico en todas las páginas (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`)
  - Agregar `alt` descriptivo a todas las imágenes; `loading="lazy"` en imágenes fuera del viewport inicial
  - Usar `<picture>` con fallback PNG para imágenes WebP (compatibilidad con navegadores sin soporte WebP)
  - _Requirements: 2.2, 2.3, 2.4, 9.1, 9.2_

- [x] 18. Crear scripts de verificación (smoke tests de infraestructura)
  - [x] 18.1 Crear `scripts/check-siglas.js`
    - Leer `js/siglas.json`, verificar ≥ 40 entradas, que cada entrada tenga campos `es` y `en` no vacíos
    - Salir con código 1 y mensaje descriptivo si la validación falla
    - _Requirements: 5.1_
  - [x] 18.2 Crear `scripts/check-minification.js`
    - Para cada par `(style.css → style.min.css)` y `(productos.css → productos.min.css)`, verificar que el minificado tiene ≤ 64% del tamaño del original
    - _Requirements: 9.3_
  - [x] 18.3 Crear `scripts/check-manifest.js`
    - Leer `manifest.json` y verificar `name === "DoubleImpactStore"` y `short_name === "DoubleImpactStore"`
    - _Requirements: 20.5_
  - [x] 18.4 Configurar Vitest en `package.json` / `vite.config.js`
    - Agregar script `"test": "vitest --run"` y configurar cobertura con c8/v8
    - Instalar fast-check como devDependency
    - _Requirements: 19.1_

- [x] 19. Checkpoint final — Tests y verificación de marca
  - Ejecutar `vitest --run` y verificar que todos los tests de unidad y property-based tests pasan
  - Ejecutar todos los scripts de smoke test: `check-siglas.js`, `check-minification.js`, `check-manifest.js`
  - Ejecutar `grep -r "RopavejeroRetro" . --include="*.html" --include="*.js" --include="*.css" --include="*.json"` y confirmar resultado vacío
  - Ejecutar `grep "doubleimpact-v" service-worker.js` y confirmar que el patrón de nombre de caché es correcto
  - Asegurarse de que todos los tests pasan y smoke tests son exitosos. Preguntar al usuario si hay dudas.

- [x] 20. Tests E2E con Playwright
  - [x]* 20.1 Configurar Playwright e implementar tests E2E clave
    - Instalar `@playwright/test` y crear `playwright.config.js`
    - _Requirements: 2.1, 2.3, 3.1, 3.3, 3.4, 4.4, 5.4, 6.3, 16.2_
  - [x]* 20.2 Escribir tests E2E para responsive y accesibilidad
    - Test: menú hamburguesa visible en viewport 375px
    - Test: menú horizontal en viewport 1280px
    - Test: navegación completa por teclado (Tab, Enter, Escape en modales)
    - _Requirements: 2.1, 2.3_
  - [x]* 20.3 Escribir tests E2E para tema, idioma y catálogo
    - Test: modo oscuro persiste entre recargas de página
    - Test: cambio de idioma traduce todos los textos visibles
    - Test: filtro de plataforma en catálogo muestra solo productos correctos
    - Test: modal de producto muestra sección de siglas
    - _Requirements: 3.1, 3.3, 3.4, 4.4, 5.4_
  - [x]* 20.4 Escribir tests E2E para FAQ, Instagram y accesibilidad de imágenes
    - Test: accordion FAQ colapsa ítems previos al abrir uno nuevo
    - Test: lazy loading activo en imágenes de Instagram (atributo `loading="lazy"` presente)
    - _Requirements: 6.3, 16.2_

- [ ] 21. Checkpoint final de integración
  - Verificar que `index.js` orquesta correctamente todos los módulos en el orden de dependencias (incluyendo `initScrollProgress`, `initBackToTop`, `initLogoBackToTop`, `initWhatsAppButton`)
  - Confirmar que query strings de versión (`?v=...`) están presentes en todos los recursos estáticos referenciados en HTML
  - Confirmar que `productos.html` accesible desde URL limpia `/productos` (vía `.htaccess`)
  - Confirmar redirección HTTPS funciona en el entorno de despliegue
  - Asegurarse de que todo está integrado correctamente. Preguntar al usuario si hay dudas antes de concluir.

- [ ] 22. Implementar navegación completa y ordenada
  - [ ] 22.1 Asegurar que el menú de navegación tiene exactamente 10 ítems en el orden correcto
    - Orden: Inicio (`/`), Nosotros (`#nosotros`), Productos (`/productos`), Instagram (`#instagram`), Efemérides (`#efemerides`), Blog (`#blog`), Testimonios (`#testimonios`), FAQ (`#faq`), Servicios (`#servicios`), Contacto (`#contacto`)
    - En desktop: ajustar `font-size` (≤ 0.9rem) y `gap/padding` para que quepan en una sola línea sin overflow ni ítems ocultos
    - En móvil: menú hamburguesa con todos los ítems en columna vertical
    - _Requirements: 21.1, 21.2, 21.3_
  - [ ] 22.2 Verificar que todos los anchor links del menú llevan a sus secciones correspondientes
    - Confirmar que `index.html` tiene `<section id="nosotros">`, `<section id="instagram">`, `<section id="efemerides">`, `<section id="blog">`, `<section id="testimonios">`, `<section id="faq">`, `<section id="servicios">`, `<section id="contacto">`
    - Confirmar que el CSS tiene `scroll-behavior: smooth` en `html` o que se aplica vía JS
    - _Requirements: 21.2, 21.4_
  - [ ] 22.3 Agregar sección Efemérides al HTML y al menú
    - Verificar que existe `<section id="efemerides">` en `index.html`
    - Verificar que el ítem "Efemérides" está presente en el menú apuntando a `#efemerides`
    - _Requirements: 21.6, 13.1_
  - [ ] 22.4 Vincular el logo del header al scroll al inicio
    - El `<a>` o `<button>` que envuelve el logo en el header debe llamar a `initLogoBackToTop()` (scroll suave a `top: 0`)
    - `href="/"` o `href="#top"` con `preventDefault` + `scrollTo({ top: 0, behavior: 'smooth' })`
    - _Requirements: 21.5, 24.6_

- [ ] 23. Implementar sección Contacto con íconos grandes
  - [ ] 23.1 Actualizar HTML de la sección `#contacto` con layout de íconos grandes
    - Cada canal de contacto: `<a>` con `<i class="fa-brands fa-...">` (3rem o mayor) y `<span>` con el nombre/descripción debajo
    - Layout: CSS grid o flexbox con `justify-content: center; flex-wrap: wrap`
    - URLs reales:
      - Instagram DoubleImpactStore: `https://www.instagram.com/doubleimpactstore/`
      - Instagram @Ropavejero.Retro: `https://www.instagram.com/ropavejero.retro/`
      - Instagram @NekketsuStore: `https://www.instagram.com/nekketsustore/`
      - Threads: `https://www.threads.com/@doubleimpactstore/`
      - Twitter/X: `https://x.com/DoubleImpactSpA`
      - WhatsApp: `https://wa.me/56967691585`
      - YouTube: `https://www.youtube.com/@DoubleImpactStoreSpA`
    - Todos los enlaces con `target="_blank" rel="noopener noreferrer"`
    - Labels con `data-i18n` para traducción ES/EN
    - _Requirements: 22.1, 22.2, 22.3, 22.4, 22.5, 18.1, 18.2_
  - [ ] 23.2 Actualizar estilos CSS de la sección contacto
    - `.contact-icon { font-size: 3rem; }` (mínimo 48px)
    - `.contact-item { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }`
    - `.contact-grid { display: flex; flex-wrap: wrap; gap: 2rem; justify-content: center; }`
    - _Requirements: 22.1, 22.3_

- [ ] 24. Implementar barra de progreso de scroll
  - Agregar `<div id="scroll-progress" role="progressbar" aria-label="Progreso de lectura" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>` como primer hijo de `<body>` en `index.html`
  - Implementar `initScrollProgress()` en `js/modules/ui.js`: escuchar `scroll` (passive), calcular `(scrollTop / totalScrollable) * 100`, actualizar `width` y `aria-valuenow`
  - Agregar estilos CSS: `position: fixed; top: 0; left: 0; height: 3px; width: 0%; background: var(--accent-color); z-index: 9999; transition: width 0.1s linear`
  - Llamar `initScrollProgress()` desde `js/index.js` en `DOMContentLoaded`
  - _Requirements: 23.1, 23.2, 23.3, 23.4_

- [ ] 25. Implementar botón "Volver Arriba" y logo como back-to-top
  - Agregar `<button id="back-to-top" aria-label="Volver al inicio" hidden><i class="fa-solid fa-chevron-up"></i></button>` antes del cierre de `</body>` en `index.html`
  - Implementar `initBackToTop()` en `js/modules/ui.js`:
    - Escuchar `scroll` (passive); mostrar/ocultar botón cuando `scrollY > 300` con transición CSS
    - Al hacer clic: `window.scrollTo({ top: 0, behavior: 'smooth' })`
  - Implementar `initLogoBackToTop()`: seleccionar el `<a>` del logo en el header y agregar listener para scroll al inicio con `preventDefault`
  - Agregar estilos CSS: `position: fixed; bottom: 5rem; right: 1.5rem` con transición opacity/transform
  - Llamar `initBackToTop()` y `initLogoBackToTop()` desde `js/index.js`
  - _Requirements: 24.1, 24.2, 24.3, 24.4, 24.5, 24.6, 21.5_

- [ ] 26. Implementar botón flotante de WhatsApp
  - Agregar en `index.html` antes del cierre de `</body>`:
    ```html
    <a id="whatsapp-float" href="https://wa.me/56967691585" target="_blank" rel="noopener noreferrer"
       aria-label="Comunícate con nosotros por WhatsApp" class="whatsapp-float-btn">
      <i class="fa-brands fa-whatsapp" aria-hidden="true"></i>
      <span class="whatsapp-tooltip" data-i18n="whatsapp.tooltip">Comunícate con nosotros</span>
    </a>
    ```
  - Agregar estilos CSS: `position: fixed; bottom: 1.5rem; right: 1.5rem; background: #25D366; border-radius: 50%; width: 3.5rem; height: 3.5rem; display: flex; align-items: center; justify-content: center; z-index: 9998`
  - Tooltip: visible en `:hover` y `:focus` con CSS (position absolute, transform translateX(-100%))
  - Agregar clave `"whatsapp.tooltip"` al objeto de traducciones en `ui.js`: ES = "Comunícate con nosotros", EN = "Contact us"
  - Implementar `initWhatsAppButton()` para traducir el tooltip al cambiar idioma
  - _Requirements: 25.1, 25.2, 25.3, 25.4, 25.5, 25.6_

- [ ] 27. Checkpoint final — Tests actualizados con nuevas funcionalidades
  - Ejecutar `vitest --run` y verificar que todos los tests pasan incluyendo los nuevos de `ui.js`
  - Ejecutar smoke tests: `check-siglas.js`, `check-minification.js`, `check-manifest.js`
  - Verificar visualmente que el menú tiene 10 ítems en el orden correcto
  - Verificar que la barra de progreso aparece y se mueve al hacer scroll
  - Verificar que el botón back-to-top aparece después de 300px y desaparece al volver arriba
  - Verificar que el botón WhatsApp es siempre visible y el tooltip aparece en hover
  - Verificar que los íconos de contacto son ≥ 3rem con texto debajo
  - Verificar que el clic en el logo hace scroll suave al inicio
  - _Requirements: 21–25_

---

## Notes

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Las propiedades 1–10 del documento de diseño tienen cada una su tarea de property test asociada
- Cada tarea referencia requisitos específicos para trazabilidad completa
- El orden de las tareas sigue las dependencias de módulos: infraestructura → lógica → UI → HTML → automatización → SEO → verificación
- Los scripts de smoke test (`scripts/`) son herramientas de CI/CD, no requieren framework de testing
- Para correr los tests unitarios/PBT: `npm test` (alias de `vitest --run`)
- Para correr los tests E2E: `npx playwright test`
- Para iniciar el minificador en modo watch: `node watcher.js` (ejecutar manualmente en terminal)
- Las tareas 22–26 implementan los nuevos requisitos 21–25 (navegación, contacto, scroll progress, back-to-top, WhatsApp flotante)
- El botón WhatsApp (`bottom: 1.5rem`) está por debajo del botón back-to-top (`bottom: 5rem`) para no superponerse
