# Plan de mejoras — DoubleImpactStore

Resultado de la auditoría del 2026-10-28. El sitio cumple casi toda la especificación Kiro (tareas 1–32 marcadas), pero hay fallos que afectan producción. Este plan los ordena por impacto y los agrupa en fases independientes: cada fase se puede mergear por separado.

## Estado de partida (verificado)

| Verificación | Resultado |
|---|---|
| `npm test` | 42/42 OK (7 archivos, incluye propiedades fast-check) |
| `npm run check` | **Falla** `check:brand` por `#RopavejeroRetroWeb` en el caption de un post real (`js/instagram_posts.js`) |
| `npm run test:e2e` | 17/17 fallan por entorno: navegadores de Playwright no instalados. Estado real desconocido |
| Último commit del bot de Instagram | 2026-10-15. El workflow falla desde el 2026-10-18: **el token venció** (`OAuthException 190: Session has expired on 18-Oct-26`). El de `.env` local es el mismo y también está vencido |
| Fuente de GitHub Pages | `Deploy from a branch` (`main` /, `build_type: legacy`), "Enforce HTTPS" **desactivado** (`http://` responde 200 sin redirigir). `/AGENTS.md` es público |

## Resumen de issues

| # | Issue | Severidad | Fase |
|---|---|---|---|
| 1 | Cabeceras de seguridad (CSP, X-Frame-Options, Referrer-Policy, HSTS, redirect HTTPS) no se aplican: GitHub Pages ignora `.htaccess` | Alta | 3 |
| 2 | ~~Commits del bot no se publican~~ **Descartado:** Pages publica desde la rama y `pages-build-deployment` sí corre con los commits del bot. Problema real: cada push se despliega **dos veces** (build de rama + `deploy-pages.yml`, redundante) | Media | 2 |
| 3 | Un cambio de `likes` dispara commit + nuevo `CACHE_VERSION` → todos los usuarios descargan de nuevo el sitio | Alta | 2 |
| 4 | Token de Instagram no se renueva; expira a los 60 días. **Ya ocurrió:** vencido desde el 2026-10-18; un token vencido no se puede refrescar por API, hay que generar uno nuevo en Meta | Alta | 2 |
| 5 | `productos.html` y `404.html` cargan `instagram_posts.min.js?v=2026-09-02_1`; el script solo actualiza `index.html` | Alta | 2 |
| 6 | `check:brand` falla por contenido real de Instagram (falso positivo) | Media | 1 |
| 7 | Módulos minificados no se usan: `index.min.js` importa `./modules/*.js` sin minificar y sin `?v=` | Media | 4 |
| 8 | Service Worker no precachea `js/modules/*` → offline no funciona en la primera visita; `install` traga errores con `.catch(() => skipWaiting())`; `CORE_ASSETS` sin `?v=` no coincide con las URLs pedidas | Media | 4 |
| 9 | `ui.js` (736 líneas) mezcla diccionario i18n y 10 responsabilidades | Media | 6 |
| 10 | `instagram_posts.js` expone una función global vía `<script>` clásico; obliga a `'unsafe-inline'`/global en vez de JSON + `fetch` | Media | 6 |
| 11 | `instagram.js` lee `localStorage('dis_lang')` directamente en lugar de `getLang()` de `ui.js` | Baja | 6 |
| 12 | Deploy publica todo el repo: `.kiro/`, `AGENTS*.md`, `tests/`, `scripts/`, `api/`, `package.json` | Baja | 5 |
| 13 | Sin CI de calidad: ningún workflow corre `npm test`, `npm run check` ni E2E | Baja | 5 |
| 14 | Cobertura E2E incompleta vs `AGENTS.md` §24: faltan accesibilidad automatizada, offline/PWA, 404 con idioma, menú móvil con teclado, siglas | Baja | 5 |
| 15 | `.env.example` referenciado en el README pero no existe | Baja | 1 |
| 16 | Excepciones de `requests` impresas con la URL completa (incluye `access_token`); GitHub enmascara secrets, pero conviene no depender de eso | Baja | 2 |
| 17 | `AGENTS v0.2.md` y `AGENTS v0.3.md` obsoletos en la raíz | Baja | 5 |
| 18 | ~~`cloudflareToken` vacío en `analytics.js`~~ **No aplica:** Cloudflare (proxy) ya inyecta automáticamente el beacon de Web Analytics y funciona (verificado en producción). Dejar `cloudflareToken` vacío para no contar doble | — | — |
| 19 | Cloudflare (ya delante del dominio) inyecta un script inline de "JavaScript Detections" que la CSP bloquea | Baja | 3 |
| 20 | ~~Analytics no mide nada: el contenedor `GTM-NB5CQ3VR` estaba vacío~~ **Resuelto 2026-10-29:** publicada la versión 2 del contenedor con la etiqueta "GA4 - Etiqueta de Google" (`G-CHJJRHE1YK`, Initialization - All Pages). Verificado en producción: `POST /g/collect` con `tid=G-CHJJRHE1YK`, sin violaciones de CSP | Alta | — |
| 21 | ~~Cloudflare cachea `service-worker.js` 4 h~~ **Diagnóstico corregido (2026-10-29), no requiere cambios:** el borde de Cloudflare respeta los 600 s de GitHub (`cf-cache-status: REVALIDATED`, `age: 0`, `expires` a 10 min). El `max-age=14400` es solo el "Browser Cache TTL" que Cloudflare envía al navegador, y los navegadores ignoran la caché HTTP para el script del Service Worker (`updateViaCache: 'imports'` por defecto). Retraso real de un SW nuevo: ≤10 min, igual que GitHub Pages sin Cloudflare | — | — |

---

## Fase 1 — Arreglos rápidos (≤1 h) ✅ completada

**Issues:** 6, 15

1. `scripts/check-brand.js`: ignorar solo el campo `description` (captions reales) de `js/instagram_posts.js` / `.min.js`; el resto de esos archivos se sigue verificando.
2. Crear `.env.example` con `INSTAGRAM_TOKEN=` (sin valor).
3. `npx playwright install chromium` y ejecutar `npm run test:e2e` para conocer el estado real de los E2E; corregir lo que falle antes de seguir.

**Criterio de aceptación:** `npm run check` y `npm run test:e2e` en verde.

**Resultado:** `npm run check` OK, 42/42 unitarios, 18/18 E2E. Al ejecutar los E2E apareció un bug extra, corregido en esta fase:
- `instagram.js` ponía como `src` de fallback `img/IG_<id>.webp`, archivo que no existe (solo hay `.jpeg` y `_400/_800/_1200.webp`), y el `<img>` repetía el `srcset` WebP, anulando el fallback para navegadores sin WebP. Ahora el `<img>` usa la imagen original (`post.image`) y, si falla, se elimina el `<source>` antes de mostrar el placeholder (con `<source>` presente el navegador volvía a elegir el WebP roto).
- Nuevo E2E que verifica que el `src` y todas las variantes del `srcset` de Instagram responden 200.

## Fase 2 — Pipeline de Instagram confiable ✅ completada

**Issues:** 2, 3, 4, 5, 16

1. **Despliegue duplicado (2):** eliminado `deploy-pages.yml`; Pages sigue publicando desde la rama `main`, también con los commits del bot. Cuando la fase 5 cambie la fuente a "GitHub Actions", el nuevo workflow de deploy debe dispararse además con `workflow_run` al terminar `Actualizar Instagram Posts` (los pushes con `GITHUB_TOKEN` no activan otros workflows).
2. **Ignorar likes (3):** `SIGNIFICANT_FIELDS = (title, description, image, link)`; `posts_have_changed` y `calculate_changes` comparten `post_differs()`. Los likes se refrescan cuando hay otro cambio.
3. **No invalidar la PWA por datos (3):** `CACHE_VERSION` solo cambia si se agregan o eliminan posts. Los datos se propagan por el `?v=` de `instagram_posts.min.js` (el Service Worker cachea por URL completa). Se eliminó el código que reescribía una lista `INSTAGRAM_IMAGES` inexistente en `service-worker.js`; el precache de imágenes queda para la fase 4.
4. **Renovar token (4):** token nuevo cargado el 2026-10-28. `api/refresh_instagram_token.py` + `.github/workflows/refresh-instagram-token.yml` (días 1 y 15) renuevan el token y reescriben el secret con `GH_PAT`; si falta `GH_PAT`, el workflow falla con un error explícito (GitHub avisa por correo).
5. **Versionado en todas las páginas (5):** `update_html_versions()` recorre todos los `*.html`; se sincronizaron las 4 páginas desfasadas.
6. **Logs sin token (16):** `redact()` en todos los mensajes de error; el token va en `params` de `requests`; en Actions el token renovado se enmascara con `::add-mask::`.
7. `git add` con rutas explícitas; concurrencia en el workflow; `actions/checkout@v5` y `actions/setup-python@v6` (Node 24) con caché de pip.
8. Tests: `tests/python/` (16 tests pytest, `npm run test:py`, dependencias en `requirements-dev.txt`). Además: las descargas de imágenes tienen timeout y, si fallan, el post se omite en vez de publicarse con una imagen rota.

**Criterio de aceptación:** un post nuevo con `#DoubleImpactStoreWeb` aparece en producción sin intervención manual; cambios de likes no generan commits; todas las páginas comparten `?v=`.

**Resultado:** prueba real contra la API con solo cambios de likes → "No hay cambios significativos", sin escribir archivos. `GH_PAT` configurado el 2026-10-28; primera renovación automática: 2026-11-01 09:00 UTC (Instagram exige que el token tenga ≥24 h).

## Fase 3 — Seguridad efectiva en producción ✅ completada

**Issues:** 1, 19

Se eligió la opción A (CSP en `<meta>`). Durante la fase se descubrió que **Cloudflare ya está delante del dominio** (`server: cloudflare`, certificado de Google Trust Services emitido por Cloudflare), así que la opción B solo requiere configuración en el panel de Cloudflare, sin mover DNS.

Hecho:
1. `scripts/csp.js` es la fuente única de la política: escribe `<meta http-equiv="Content-Security-Policy">` + `<meta name="referrer" content="strict-origin-when-cross-origin">` al inicio del `<head>` de cada `*.html` (antes del snippet de GTM) y la cabecera de `.htaccess` (con `frame-ancestors 'none'`). `npm run csp` regenera; `npm run check:csp` (incluido en `npm run check`) falla si algo se desincroniza, si el `<meta>` va después de un `<script>` o si hay manejadores `on*=` inline.
2. `script-src` sin `'unsafe-inline'`: el snippet de GTM se autoriza por hash SHA-256 (calculado con CRLF→LF, como hace el parser HTML). Orígenes de GTM/GA4 según la guía de Google (`*.googletagmanager.com`, `*.google-analytics.com`, `*.analytics.google.com`) y Cloudflare Web Analytics. Se quitaron orígenes sin uso (`www.googleapis.com`, `www.instagram.com` en `img-src`) y se añadió `upgrade-insecure-requests`.
3. "Enforce HTTPS" de GitHub Pages **no se puede activar**: GitHub no emite certificado porque Cloudflare hace de proxy (API: "The certificate does not exist yet"). La redirección se hace en Cloudflare (ver abajo).
4. `.htaccess` se conserva como referencia (Apache/Cloudflare), con un encabezado que aclara que GitHub Pages lo ignora.
5. E2E `tests/e2e/security.spec.js`: cero violaciones de CSP en las 5 páginas, `<meta>` sin `'unsafe-inline'`, y un script inline inyectado queda bloqueado. Verificación puntual con red real: el catálogo carga 25 filas desde Google Sheets y GTM carga, sin violaciones.

Configurado en Cloudflare el 2026-10-29 (verificado con `curl -I` y navegador en producción):
- **Always Use HTTPS: On** → `http://` responde 301 a `https://`.
- **HSTS:** `Strict-Transport-Security: max-age=15552000` (6 meses), sin `includeSubDomains` ni preload. Se activó también **"Encabezado antirrastreo"** del mismo diálogo → `X-Content-Type-Options: nosniff`.
- **Transform Rule "Cabeceras de seguridad"** (Modify Response Header, todas las solicitudes): `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`.

Pendiente (decisión del dueño):
- **Issue 19 — JavaScript Detections:** en el plan Free están siempre activas mientras **Bot Fight Mode** esté encendido (lo está). Su script inline (`window.__CF$cv$params`, distinto en cada petición) es el único error de CSP que queda en consola; el sitio funciona igual. Quitarlo exige apagar Bot Fight Mode (Security → Configuración → Modo Bot Fight), lo que reduce la protección contra bots. Recomendación: mantener Bot Fight Mode y aceptar el aviso.

**Criterio de aceptación:** cero violaciones CSP en la consola con GTM activo (cumplido en local y con red real; en producción, tras desactivar JavaScript Detections); redirección HTTPS y cabeceras visibles en `curl -I` (tras los ajustes de Cloudflare).

## Fase 4 — Build y PWA ✅ completada

**Issues:** 7, 8

1. **Bundle único (7):** `watcher.js` usa esbuild para empaquetar `js/index.js` + módulos + `js/social.js` en `js/index.min.js` (ESM, autocontenido): de 133 KB en 11 peticiones sin minificar a 53 KB en 1. Se eliminaron `js/modules/*.min.js`, `js/social.min.js` y `service-worker.min.js` (ninguna página los usaba) y la dependencia `terser`. `watcher.js` ya no toca `js/instagram_posts*.js` ni el Service Worker más allá de `ASSETS_HASH`. `check:minification` valida que el bundle no importe módulos relativos.
2. **Cache busting por hash de contenido:** el build escribe `?v=<sha256[0:10]>` de los CSS y del bundle en todos los `*.html`, y `ASSETS_HASH` (hash combinado) en `service-worker.js`. Es idempotente: un segundo build no cambia nada (requisito para el check de CI de la fase 5).
3. **Service Worker (8):**
   - Caché `doubleimpact-v{CACHE_VERSION}-{ASSETS_HASH}`: el bot escribe `CACHE_VERSION` y el build `ASSETS_HASH`, sin pisarse.
   - Precache con el bundle, las fuentes de iconos (`webfonts/*.woff2`) y el placeholder de Instagram; `install` ya no oculta errores.
   - Estáticos: cache-first por URL exacta y, sin red, cualquier versión cacheada (`ignoreSearch`). Navegaciones sin red: URL limpia `/productos` → `/productos.html`. No intercepta `/cdn-cgi/` (Cloudflare).
4. **Bugs encontrados por el E2E offline:**
   - El aviso `dis-offline` se enviaba antes de que existiera la página de la navegación y se perdía: ahora se envía a `resultingClientId` cuando aparece, y `ui.js` llama a `startMessages()`.
   - El indicador offline (barra fija arriba) **tapaba los controles del header** (tema, idioma, menú) y bloqueaba los clics: ahora es un aviso flotante abajo a la izquierda con `pointer-events: none`, `role="status"` y `aria-live="polite"`.
5. **E2E `tests/e2e/pwa.spec.js`** (4 tests): caché `doubleimpact-v*` con bundle y fuentes; portada offline con CSS, JS e indicador; `/productos` offline; asset con `?v=` nuevo servido offline.
6. **Estabilidad de E2E:** `scripts/serve.py` reemplaza a `python -m http.server` (cola de 5 conexiones → `ECONNREFUSED` intermitentes con tests en paralelo) y silencia las cancelaciones de descarga del navegador. `playwright.config.js` bloquea el Service Worker salvo en `pwa.spec.js`, porque sus peticiones no pasan por los mocks de `page.route`. 6 ejecuciones completas seguidas en verde.

**Criterio de aceptación:** primera visita + recarga offline funciona; solo un JS minificado cargado por página. Cumplido (Lighthouse PWA queda para la fase 5).

**Verificado en producción (2026-10-29):** un solo JS por página (`index.min.js?v=<hash>`), sin errores de JS. El Service Worker nuevo puede tardar hasta 10 min en activarse (caché de GitHub Pages/Cloudflare, ver issue 21); mientras tanto el anterior sigue funcionando con el HTML nuevo.

## Fase 5 — Calidad y repositorio ✅ completada

**Issues:** 12, 13, 14, 17

1. **CI (13):** `.github/workflows/ci.yml` en push a `main`, PR y manual: `npm ci`, `npm run build` + `git diff --exit-code` (el build commiteado debe estar al día), `npm run check`, Vitest, pytest, `npm run site`, Chromium + E2E; sube el reporte de Playwright si falla. Primera ejecución en GitHub: todo en verde. `watcher.js` normaliza CRLF→LF antes de calcular hashes para que el build sea reproducible entre Windows y Linux.
2. **Publicar solo lo público (12):** `scripts/build-site.js` (`npm run site`) arma `_site/` con una lista explícita de archivos públicos (50 archivos) y falla si alguna referencia local no existe (también cubre la auditoría de "archivos referenciados que no existen"). `deploy.yml` publica `_site/` tras un CI exitoso en `main` (`workflow_run`), cuando el bot de Instagram sube cambios (`gh workflow run`) o a mano. La fuente de Pages pasó a **"GitHub Actions"** (2026-10-29). Verificado en producción: páginas, `/.well-known/security.txt`, sitemap, manifest y SW → 200; `AGENTS.md`, `CLAUDE.md`, `.kiro/`, `docs/`, `tests/`, `api/`, `package.json`, fuentes sin minificar → 404.
3. **E2E faltantes (14):** `tests/e2e/a11y.spec.js` (14 tests): axe WCAG 2.1 AA en las 5 páginas × 2 temas, menú móvil con teclado (Enter/Escape y foco), siglas enfocables con traducción ES/EN, idioma persistido entre páginas, 404 en inglés. Offline/PWA ya estaba en la fase 4. Total: 43 E2E.
   - **Violaciones reales corregidas** (encontradas por axe): contraste de botones con texto blanco sobre el acento (4,16:1 → 4,85:1, `--accent: #d62f3c` en tema oscuro), acento como texto sobre fondos oscuros (3,98:1 → ≥4,7:1, nuevo token `--accent-text`), badge "Disponible" en tema claro (3,03:1 → 4,68:1), rol de testimonios (se quitó `opacity: 0.8`: 4,2:1 → 6,8:1), barra de progreso sin nombre accesible (`aria-label` traducible).
   - **Foco:** Escape en el menú móvil ahora devuelve el foco al botón.
4. Borrados `AGENTS v0.2.md` y `AGENTS v0.3.md` (17), con confirmación del dueño.
5. ESLint/Prettier: no se agregó (opcional; el código ya tiene checks y tests en CI).

**Criterio de aceptación:** PRs muestran checks verdes; el sitio publicado no expone `.kiro/`, `tests/` ni `AGENTS*.md`. Cumplido.

## Fase 6 — Refactor de módulos ✅ completada

**Issues:** 9, 10, 11

1. **`ui.js` dividido (9):** de 743 a 186 líneas. `translations.js` (diccionario ES/EN), `i18n.js` (`getLang`/`setLang`/`t`/`applyTranslations`), `theme.js` (tema) y `blog.js` (artículos + modal); `ui.js` conserva FAQ, menú, nav activa, scroll, botones flotantes, offline e `initUI()`. `products.js`, `instagram.js` y `efemerides.js` importan de `i18n.js`.
2. **Instagram a JSON (10):** `api/update_instagram.py` genera `js/instagram_posts.json`; `instagram.js` lo carga con `fetch`. Se eliminaron `js/instagram_posts.js`, `.min.js`, la función global `getInstagramPostsData` y el `<script>` clásico de las 5 páginas; el bot ya no modifica HTML. El Service Worker sirve todos los `*.json` con red primero, lo que además arregla un bug latente: `siglas.json`, `efemerides.json` y `console_aliases.json` eran cache-first y sus cambios no llegaban a quien ya tenía el SW instalado.
3. **`instagram.js` usa `getLang()` (11)** en lugar de leer `localStorage` directamente.
4. **`js/index.js`: 16 líneas** (antes 23, el requisito R19 exige ≤20), solo orquesta: cada `init*` comprueba si su sección existe.
5. **Bugs encontrados en el refactor:**
   - Instagram y la efeméride **no se re-renderizaban al cambiar de idioma** (`rerenderInstagram` existía pero nadie la llamaba): ahora ambos escuchan `dis:langchange`.
   - La efeméride **nunca se mostraba en inglés**: el JSON usa claves `ES`/`EN` y el código buscaba `efemeride['en']`. Las 366 traducciones existían pero no se usaban.
6. Tests: unitario de regresión de la efeméride en inglés, E2E de cambio de idioma en Instagram + efeméride, pytest adaptados al JSON. `design.md`, `CLAUDE.md` y `README.md` actualizados.

**Criterio de aceptación:** `npm test` y E2E en verde; `index.js` ≤20 líneas; sin variables globales propias en `window`. Cumplido: 43 unitarios, 44 E2E, 16 pytest.

---

## Configuración que debe aportar el dueño

| Elemento | Dónde | Necesario para |
|---|---|---|
| `INSTAGRAM_TOKEN` | Secret de Actions | Renovado el 2026-10-28 (vence ~2026-12-27 si no corre la renovación automática) |
| `GH_PAT`: PAT fine-grained, solo este repo, permiso "Secrets: Read and write" | Secret de Actions | Configurado el 2026-10-28. Renovación automática del token (Fase 2.4) |
| Decidir si se apaga Bot Fight Mode para eliminar el aviso de CSP de JavaScript Detections | Panel de Cloudflare | Issue 19 (opcional) |
| Fuente de Pages: hoy "Deploy from a branch"; pasar a "GitHub Actions" | Settings → Pages | Fases 2.1 y 5.2 |

## Orden recomendado

En orden numérico: Fase 1 → 2 → 3 → 4 → 5 → 6. La 2 va antes que la 3 porque afecta directamente el contenido publicado y a los usuarios; la 5 (CI) va antes que la 6 para refactorizar con la red de seguridad de los tests automáticos.
