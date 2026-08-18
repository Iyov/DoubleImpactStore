# AGENTS.md — DoubleImpactStore

## Misión actual

Este repositorio contiene el proyecto **DoubleImpactStore**.

La especificación técnica y funcional se encuentra en:

`.kiro/specs/double-impact-store/`

Archivos fuente de verdad:

- `.kiro/specs/double-impact-store/requirements.md`
- `.kiro/specs/double-impact-store/design.md`
- `.kiro/specs/double-impact-store/tasks.md`

## REGLA CRÍTICA — IMPLEMENTACIÓN INCREMENTAL

**NO vuelvas a implementar el proyecto completo.**

El proyecto ya tiene una parte importante implementada por OpenCode.

Antes de modificar cualquier archivo:

1. Lee `requirements.md`.
2. Lee `design.md`.
3. Lee completamente `tasks.md`.
4. Identifica las tareas marcadas `[x]`.
5. Considera las tareas `[x]` como **IMPLEMENTADAS**.
6. Identifica las tareas marcadas `[ ]`.
7. Implementa **solamente las tareas `[ ]` pendientes**, junto con las modificaciones necesarias en código existente para integrarlas correctamente.

### Regla absoluta

Una tarea marcada:

```text
[x]
```

NO debe volver a implementarse.

Una tarea marcada:

```text
[ ]
```

SÍ debe implementarse.

Las tareas opcionales marcadas:

```text
[ ]*
```

también deben implementarse si forman parte del alcance actual, salvo que exista una razón técnica documentada para omitirlas.

---

# Estado actual del proyecto

Según el `tasks.md` actual, las siguientes áreas ya fueron implementadas:

- Tarea 1 — estructura base
- Tarea 2 — archivos JSON
- Tarea 3 — infraestructura JavaScript
- Tarea 4 — lógica de dominio
- Tarea 6 — catálogo
- Tarea 7 — Instagram
- Tarea 8 — analytics
- Tarea 9 — checkpoint de módulos
- Tarea 10 — entry point inicial
- Tarea 13 — PWA
- Tarea 14 — automatización Instagram
- Tarea 15 — SEO e infraestructura
- Tarea 16 — identidad de marca
- Tarea 17 — accesibilidad/calidad HTML
- Tarea 18 — smoke tests
- Tarea 19 — checkpoint de tests
- Tarea 20 — tests E2E

Estas tareas **NO deben rehacerse** salvo que una nueva tarea pendiente requiera modificar una implementación existente para integrarla.

Referencia: `tasks.md` marca estas tareas como `[x]`.

---

# Trabajo pendiente

El trabajo actual comienza en:

## Tarea 5 — `js/modules/ui.js`

Implementar únicamente las partes pendientes de la tarea 5.

### 5.1 Tema claro/oscuro

Implementar:

- `initTheme()`
- `setTheme(theme)`
- `getTheme()`

Requisitos:

- `data-theme` en `<html>`
- persistencia mediante `localStorage`
- clave `dis_theme`
- valores `dark` / `light`
- default `dark`

### 5.2 Property test — Property 1

Implementar el property test definido en `tasks.md`.

### 5.3 Internacionalización

Implementar:

- `initLang()`
- `setLang(lang)`
- `getLang()`
- `t(key)`

Debe existir soporte ES/EN.

Persistencia:

```text
dis_lang
```

Idioma por defecto:

```text
es
```

Debe incluirse obligatoriamente:

```text
whatsapp.tooltip
```

ES:

```text
Comunícate con nosotros
```

EN:

```text
Contact us
```

### 5.4 Property test — Property 2

Implementar el property test de cobertura bilingüe.

### 5.5 Componentes UI

Implementar:

- `initFAQ()`
- `initBlogModals()`
- `initMobileMenu()`
- `setNavActive(path)`

Respetar exactamente el comportamiento definido en `tasks.md`.

### 5.6 Property tests

Implementar:

- Property 7 — FAQ accordion
- Property 10 — navegación activa

### 5.7 Barra de progreso

Implementar:

```text
initScrollProgress()
```

Debe calcular:

```text
(scrollTop / (scrollHeight - clientHeight)) * 100
```

Actualizar:

```text
#scroll-progress
```

y:

```text
aria-valuenow
```

El listener de `scroll` debe ser `passive`.

### 5.8 Back to top

Implementar:

```text
initBackToTop()
initLogoBackToTop()
```

El botón aparece cuando:

```text
scrollY > 300
```

El scroll debe utilizar:

```javascript
window.scrollTo({
    top: 0,
    behavior: 'smooth'
});
```

El logo del header debe ejecutar el mismo comportamiento.

### 5.9 WhatsApp

Implementar:

```text
initWhatsAppButton()
```

Debe utilizar el elemento existente:

```text
#whatsapp-float
```

Debe traducir:

```text
.whatsapp-tooltip
```

utilizando:

```text
t('whatsapp.tooltip')
```

y actualizarlo cuando cambie el idioma.

---

# Tarea 11 — CSS

Implementar solamente la tarea pendiente 11.

## 11.1 `css/style.css`

Implementar:

- variables CSS
- dark/light mode
- responsive
- breakpoints 768px y 1024px
- header
- navegación
- hero
- nosotros
- productos destacados
- Instagram
- efemérides
- blog
- testimonios
- FAQ
- servicios
- contacto
- footer

Además implementar específicamente:

### Navegación desktop

Debe permitir que los 10 elementos entren en una sola línea.

Usar:

- font-size ≤ `0.9rem`
- gap/padding reducido
- sin overflow
- sin ocultar elementos

### Scroll progress

```css
#scroll-progress {
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    width: 0%;
    background: var(--accent-color);
    z-index: 9999;
}
```

### Back to top

Posición:

```text
bottom: 5rem
right: 1.5rem
```

con transición de opacity/transform.

### WhatsApp

Posición:

```text
bottom: 1.5rem
right: 1.5rem
```

con:

```text
background: #25D366
```

Debe tener tooltip en hover/focus.

## 11.2 `css/productos.css`

Implementar:

- tabla responsive
- tarjetas móviles
- tabla desktop
- filtros
- paginación
- modal
- tooltips de siglas
- breadcrumb

## 11.3 Minificación

Verificar que `watcher.js` existente siga funcionando.

Ejecutar:

```bash
node watcher.js
```

Comprobar:

```text
style.min.css
productos.min.css
```

y confirmar reducción ≥ 36%.

**No reimplementar `watcher.js` salvo que la implementación existente realmente esté rota.**

---

# Tarea 12 — HTML

Implementar las páginas pendientes:

## 12.1 `index.html`

No reconstruir desde cero si ya existe una versión parcial.

Inspeccionar primero el HTML existente y **modificarlo incrementalmente**.

Debe quedar con las secciones exactamente en este orden:

```text
#hero
#nosotros
#productos-destacados
#instagram
#efemerides
#blog
#testimonios
#faq
#servicios
#contacto
```

El menú debe contener exactamente:

1. Inicio
2. Nosotros
3. Productos
4. Instagram
5. Efemérides
6. Blog
7. Testimonios
8. FAQ
9. Servicios
10. Contacto

El logo debe permitir volver al inicio.

Agregar:

```text
#scroll-progress
```

Agregar:

```text
#back-to-top
```

Agregar:

```text
#whatsapp-float
```

La sección contacto debe utilizar los enlaces especificados en `tasks.md`.

**No inventar URLs.**

Mantener las URLs reales indicadas en la especificación.

## 12.2 `productos.html`

Implementar solamente si todavía no existe.

Debe integrar el catálogo ya implementado.

No modificar `products.js` salvo que sea estrictamente necesario para la integración.

## 12.3 páginas auxiliares

Crear solamente si aún no existen:

- `404.html`
- `security-policy.html`
- `security-acknowledgments.html`

Si ya existen y funcionan, no recrearlas.

---

# Tarea 21 — Checkpoint de integración

Después de implementar 5, 11 y 12:

Verificar `js/index.js`.

La orquestación debe incluir:

```text
initTheme
initLang
setNavActive
initFAQ
initBlogModals
initMobileMenu
initScrollProgress
initBackToTop
initLogoBackToTop
initWhatsAppButton
initInstagram
initCatalog
loadEfemerides
initAnalytics
```

Respetar las condiciones existentes:

- `initCatalog()` solamente en `productos.html`
- no introducir lógica de negocio en `index.js`
- mantenerlo como orquestador

**No reescribir completamente `index.js`; modificarlo solamente para integrar las nuevas funciones.**

---

# Tarea 22 — Navegación

Implementar:

- exactamente 10 ítems
- orden especificado
- desktop en una sola línea
- móvil mediante menú hamburguesa
- todos los anchors funcionando
- `scroll-behavior: smooth` o equivalente JS
- sección Efemérides
- logo → inicio

No modificar funcionalidades de navegación ya correctas.

---

# Tarea 23 — Contacto

Implementar:

- íconos grandes ≥ 3rem
- nombre/descripción debajo
- layout responsive
- `font-awesome_6.5.1_all.min.css` local
- URLs reales
- `target="_blank"`
- `rel="noopener noreferrer"`
- `data-i18n`

Mantener especialmente:

```text
Instagram DoubleImpactStore
Instagram @Ropavejero.Retro
Instagram @NekketsuStore
Threads
Twitter/X
WhatsApp
YouTube
```

---

# Tarea 24 — Scroll progress

Integrar:

```text
#scroll-progress
```

como primer hijo de `<body>`.

Implementar:

```text
initScrollProgress()
```

en `ui.js`.

Integrarlo en `index.js`.

No duplicar listeners si ya existe alguno.

---

# Tarea 25 — Back to top

Implementar:

```text
#back-to-top
```

y:

```text
initBackToTop()
initLogoBackToTop()
```

Debe mostrarse después de 300px de scroll.

Debe realizar scroll suave al inicio.

No duplicar funcionalidad existente.

---

# Tarea 26 — WhatsApp

Implementar:

```text
#whatsapp-float
```

con:

```text
https://wa.me/56967691585
```

Debe:

- estar siempre visible
- ser accesible
- tener tooltip
- soportar ES/EN
- no superponerse al botón back-to-top

---

# Tarea 27 — Verificación final

Ejecutar:

```bash
npm test
```

Después:

```bash
node scripts/check-siglas.js
node scripts/check-minification.js
node scripts/check-manifest.js
```

Después:

```bash
npx playwright test
```

Verificar visualmente:

- menú con 10 elementos
- navegación correcta
- barra de progreso
- back-to-top
- logo → inicio
- WhatsApp
- tooltip
- contacto
- íconos ≥ 3rem
- idioma ES/EN
- tema dark/light
- catálogo
- FAQ
- Instagram

---

# Reglas de modificación del código existente

## No reescribir funcionalidades terminadas

Si una función o módulo corresponde a una tarea `[x]`, asumir que está implementado.

Antes de modificarlo:

1. comprobar por qué es necesario modificarlo;
2. hacer el cambio mínimo;
3. conservar la funcionalidad existente;
4. ejecutar los tests correspondientes.

## No hacer reemplazos masivos

No ejecutar nuevamente procesos globales de:

- branding
- SEO
- PWA
- Instagram
- catálogo
- analytics
- seguridad

porque esas tareas ya están marcadas como completadas.

---

# Fuente de verdad

Si existe una diferencia entre el código actual y la documentación:

1. revisar `requirements.md`;
2. revisar `design.md`;
3. revisar `tasks.md`;
4. comprobar si la tarea correspondiente está marcada `[x]` o `[ ]`.

Si está `[x]`, **no rehacerla automáticamente**.

Si una tarea nueva requiere modificar una tarea anterior, realizar únicamente el cambio incremental necesario.

---

# Seguridad

Nunca:

- hardcodear tokens
- hardcodear API keys
- eliminar CSP para resolver errores
- deshabilitar tests
- eliminar funcionalidades para hacer pasar tests
- borrar código funcional sin justificación

Mantener:

```text
INSTAGRAM_TOKEN
```

como secret/variable de entorno.

---

# Dependencias

No introducir frameworks frontend nuevos.

Mantener la arquitectura:

```text
HTML5
CSS3
JavaScript Vanilla ES Modules
```

No migrar a:

- React
- Vue
- Angular
- Svelte
- Next.js
- Astro

salvo que una modificación explícita de la especificación lo requiera.

---

# Proceso obligatorio antes de cada cambio

Antes de editar:

```text
1. Leer la tarea pendiente.
2. Inspeccionar el código actual relacionado.
3. Determinar qué ya existe.
4. Implementar únicamente lo que falta.
5. Ejecutar tests.
6. Corregir regresiones.
7. Continuar con la siguiente tarea pendiente.
```

---

# Estado inicial de esta iteración

El trabajo debe comenzar **exactamente en la primera tarea pendiente**:

```text
5. Implementar módulo js/modules/ui.js
```

y continuar en orden hasta:

```text
27. Checkpoint final — Tests actualizados con nuevas funcionalidades
```

No comenzar nuevamente desde la tarea 1.

No repetir tareas `[x]`.

---

# Criterio final

El trabajo estará terminado cuando todas las tareas actualmente `[ ]` de `tasks.md` estén implementadas y verificadas.

Al finalizar:

1. Ejecutar tests unitarios.
2. Ejecutar property tests.
3. Ejecutar smoke tests.
4. Ejecutar Playwright.
5. Revisar errores de consola.
6. Revisar imports.
7. Revisar recursos inexistentes.
8. Revisar que no haya regresiones.
9. Confirmar que las tareas pendientes quedaron implementadas.
10. No marcar como completada una tarea que realmente no haya sido verificada.

**El objetivo de esta sesión es implementar solamente el delta pendiente del proyecto, no reconstruir DoubleImpactStore desde cero.**