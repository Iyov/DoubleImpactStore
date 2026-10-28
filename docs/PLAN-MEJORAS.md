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
| 18 | `cloudflareToken` vacío en `analytics.js` | Config | — |

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

## Fase 2 — Pipeline de Instagram confiable

**Issues:** 2, 3, 4, 5, 16

1. **Despliegue duplicado (2):** la fuente de Pages es "Deploy from a branch", así que `deploy-pages.yml` es redundante. Opción elegida en coordinación con la fase 5: cambiar la fuente a "GitHub Actions" (necesario para no publicar `AGENTS*.md`, `.kiro/`, `tests/`), y entonces hacer que `deploy-pages.yml` se dispare también con `workflow_run` al terminar `Actualizar Instagram Posts` (los pushes con `GITHUB_TOKEN` no activan otros workflows). Hasta ese cambio, no tocar la fuente.
2. **Ignorar likes (3):** quitar `likes` de `posts_have_changed` y `count_changes` en `api/update_instagram.py`. Si se quiere mostrar likes actualizados, actualizarlos solo cuando ya hay otro cambio.
3. **No invalidar la PWA por datos (3):** subir `CACHE_VERSION` solo cuando cambian assets estáticos. Para datos de Instagram, servir `instagram_posts` con estrategia stale-while-revalidate en el Service Worker en lugar de cache-first + versión global.
4. **Renovar token (4):** primero, el dueño genera un token nuevo en Meta (Instagram API with Instagram Login → token de larga duración) y se carga con `gh secret set INSTAGRAM_TOKEN`. Después, añadir un paso que llame a `GET https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=…` y actualice el secret con `gh secret set INSTAGRAM_TOKEN` (requiere un PAT con permiso de secrets guardado como `GH_PAT`, documentar). Como mínimo, programar un workflow mensual que falle con mensaje claro si el token vence en <10 días.
5. **Versionado en todas las páginas (5):** la regex de `update_instagram.py` debe recorrer `index.html`, `productos.html` y `404.html` (o todo `*.html`).
6. **Logs sin token (16):** no imprimir `str(exc)` de `requests` crudo; imprimir solo tipo de error y código HTTP.
7. Reemplazar `git add .` por rutas explícitas (`js/instagram_posts*.js img/ index.html productos.html 404.html service-worker*.js`).
8. Tests: añadir `tests/python/test_update_instagram.py` (pytest) para `posts_have_changed`, `count_changes` y la actualización de versiones con fixtures.

**Criterio de aceptación:** un post nuevo con `#DoubleImpactStoreWeb` aparece en producción sin intervención manual; cambios de likes no generan commits; las tres páginas comparten `?v=`.

## Fase 3 — Seguridad efectiva en producción

**Issue:** 1

GitHub Pages no permite cabeceras HTTP propias. Opciones:

| Opción | Cubre | Costo |
|---|---|---|
| **A. `<meta>` en cada HTML (recomendada como base)** | CSP (excepto `frame-ancestors`, `report-uri`, `sandbox`), Referrer-Policy | Bajo |
| B. Cloudflare delante del dominio (proxy) + Transform Rules / Worker | Todas las cabeceras, HSTS, redirect HTTPS, `frame-ancestors` | Configuración externa; ya se usa Cloudflare para analytics |
| C. Migrar hosting a Cloudflare Pages / Netlify con archivo `_headers` | Todas las cabeceras | Cambio de hosting |

Pasos (A, y B o C si el dueño lo aprueba):

1. Añadir en `<head>` de `index.html`, `productos.html`, `404.html`, `security-policy.html`, `security-acknowledgments.html`, **antes** del snippet de GTM:
   - `<meta http-equiv="Content-Security-Policy" content="...">` con la misma política de `.htaccess` (sin `frame-ancestors`).
   - `<meta name="referrer" content="strict-origin-when-cross-origin">`.
2. Sustituir `'unsafe-inline'` en `script-src` por el hash `sha256-…` del snippet inline de GTM (es estático). Generar el hash con un script en `scripts/` y verificarlo en `npm run check` para que no se desincronice.
3. Activar "Enforce HTTPS" en Settings → Pages (cubre el redirect HTTPS).
4. Para `X-Frame-Options`/`frame-ancestors`, HSTS y `X-Content-Type-Options`: requiere B o C. Documentar la decisión.
5. Mantener `.htaccess` solo si se planea hosting Apache; si no, eliminarlo y actualizar `design.md` para no dar una falsa sensación de protección.
6. E2E: verificar que no haya violaciones de CSP en consola (`page.on('console')` + `securitypolicyviolation`).

**Criterio de aceptación:** `curl -I https://doubleimpactstore.cl` o DevTools muestran la CSP efectiva; cero violaciones CSP en la consola con GTM/GA4 activos.

## Fase 4 — Build y PWA

**Issues:** 7, 8

1. **Bundle único (7):** reemplazar la minificación archivo por archivo de JS por un bundle con `esbuild` (`js/index.js` → `js/index.min.js`, ES module, minificado, sourcemap opcional). Mantener `watcher.js` como entrada (`--once`/watch) para no romper los scripts npm. Eliminar `js/modules/*.min.js` del repo. Ajustar `scripts/check-minification.js` al nuevo artefacto.
   - Alternativa sin dependencia nueva: que `watcher.js` reescriba los imports a `.min.js?v=<hash>` al minificar `index.js`.
   - `watcher.js` también reformatea `js/instagram_posts.min.js` (lo genera `update_instagram.py` con otro formato) y regenera `service-worker.min.js`, que ninguna página usa: excluir ambos de `watcher.js` y borrar `service-worker.min.js`.
2. **Cache busting por hash de contenido:** generar `?v=` desde el hash del archivo en `watcher.js` y reescribirlo en los HTML, en vez de fechas manuales.
3. **Service Worker (8):**
   - Precachear el bundle (y cualquier módulo que siga cargándose).
   - En `install`, dejar que falle si `cache.addAll` falla (sin `.catch` silencioso) o registrar el error.
   - Usar `caches.match(request, { ignoreSearch: true })` para recursos versionados por query, o precachear con las mismas URLs `?v=` que usa el HTML.
   - Fallback offline: servir `404.html`/página offline dedicada en vez de `index.html` para rutas desconocidas.
4. E2E offline: `context.setOffline(true)` tras la primera carga → `/` y `/productos` cargan desde caché y muestran el indicador offline.

**Criterio de aceptación:** primera visita + recarga offline funciona; Lighthouse PWA sin errores; solo un JS minificado cargado por página.

## Fase 5 — Calidad y repositorio

**Issues:** 12, 13, 14, 17

1. **CI (13):** `.github/workflows/ci.yml` en `push`/`pull_request`: `npm ci`, `npm test`, `npm run check`, `npx playwright install --with-deps chromium`, `npm run test:e2e`, y verificar que `npm run minify` no deja diff (`git diff --exit-code`).
2. **Artefacto de deploy (12):** en `deploy-pages.yml`, copiar a `_site/` solo lo público (`*.html`, `css/`, `js/`, `img/`, `webfonts/`, `manifest.json`, `service-worker*.js`, `robots.txt`, `sitemap.xml`, `CNAME`, `.well-known/`) y subir `_site`. Hacer que el deploy dependa de que CI pase.
3. **E2E faltantes (14):** `@axe-core/playwright` en index/productos/404 (cero violaciones serias), offline/PWA, menú móvil con teclado y Escape, tooltips de siglas, idioma persistido en `/productos`, 404 en EN.
4. Borrar `AGENTS v0.2.md` y `AGENTS v0.3.md` (17), con confirmación del dueño.
5. Opcional: ESLint + Prettier con `npm run lint` (AGENTS.md §29 lo menciona "si corresponde").

**Criterio de aceptación:** PRs muestran checks verdes; el sitio publicado no expone `.kiro/`, `tests/` ni `AGENTS*.md`.

## Fase 6 — Refactor de módulos

**Issues:** 9, 10, 11

1. Extraer el diccionario de `ui.js` a `js/i18n/es.json` y `js/i18n/en.json` (o `js/modules/translations.js`), y la lógica de idioma a `js/modules/i18n.js` (`t`, `getLang`, `setLang`, `applyTranslations`). `ui.js` conserva tema, FAQ, blog, menú, scroll.
2. Separar `js/modules/theme.js` si `ui.js` sigue >300 líneas.
3. Cambiar `update_instagram.py` para generar `js/instagram_posts.json`; `instagram.js` lo carga con `fetch` (como `siglas.json`). Eliminar la función global y el `<script>` clásico de las tres páginas; quitar el `typeof getInstagramPostsData` de `index.js`.
4. `instagram.js` usa `getLang()` importado (11).
5. Actualizar `design.md` (interfaces de módulos) y los tests de `ui.test.js` / `instagram.test.js`.

**Criterio de aceptación:** `npm test` y E2E en verde; `index.js` sigue ≤20 líneas; sin variables globales propias en `window`.

---

## Configuración que debe aportar el dueño

| Elemento | Dónde | Necesario para |
|---|---|---|
| `INSTAGRAM_TOKEN` | Secret de Actions | **Urgente:** vencido el 2026-10-18; generar uno nuevo |
| `GH_PAT` con permiso de secrets | Secret de Actions | Renovación automática del token (Fase 2.4) |
| Decisión de hosting/Cloudflare proxy | — | Cabeceras completas (Fase 3.4) |
| Token de Cloudflare Web Analytics | `js/modules/analytics.js` → `cloudflareToken` | Issue 18 |
| Fuente de Pages: hoy "Deploy from a branch"; pasar a "GitHub Actions" | Settings → Pages | Fases 2.1 y 5.2 |

## Orden recomendado

En orden numérico: Fase 1 → 2 → 3 → 4 → 5 → 6. La 2 va antes que la 3 porque afecta directamente el contenido publicado y a los usuarios; la 5 (CI) va antes que la 6 para refactorizar con la red de seguridad de los tests automáticos.
