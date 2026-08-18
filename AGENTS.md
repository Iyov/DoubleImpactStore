# Implementación completa de DoubleImpactStore

Actúa como **Senior Full-Stack Engineer, Software Architect, QA Engineer y DevOps Engineer** responsable de llevar este repositorio desde su estado actual hasta una implementación completa, funcional, probada y lista para producción.

## 1. Repositorio

El proyecto es:

https://github.com/Iyov/DoubleImpactStore

La especificación funcional y técnica completa se encuentra en:

`.kiro/specs/double-impact-store/`

Debes considerar como documentación fuente de verdad estos tres archivos:

- `.kiro/specs/double-impact-store/requirements.md`
- `.kiro/specs/double-impact-store/design.md`
- `.kiro/specs/double-impact-store/tasks.md`

**IMPORTANTE:** No quiero que simplemente me expliques cómo implementar el proyecto. Quiero que **modifiques directamente el repositorio y ejecutes la implementación completa**.

---

# 2. Objetivo

Implementa completamente **DoubleImpactStore**, respetando la especificación de Kiro y los criterios de aceptación.

El resultado final debe ser un sitio web estático profesional para una tienda de videojuegos retro y coleccionables, construido con:

- HTML5 semántico
- CSS3
- JavaScript Vanilla ES Modules
- PWA
- Google Sheets como fuente de datos del catálogo
- Python + Pillow para procesamiento de imágenes de Instagram
- GitHub Actions para automatización
- Vitest + fast-check para tests unitarios/property-based
- Playwright para pruebas E2E
- Node.js para minificación
- SEO mediante Schema.org, Open Graph y Twitter Cards
- Analytics mediante GTM, GA4 y Cloudflare Analytics
- fallback de analytics
- soporte completo ES/EN
- modo claro/oscuro
- accesibilidad WCAG 2.1
- seguridad mediante CSP y cabeceras HTTP

La documentación ya define la arquitectura y los requisitos. **No inventes una arquitectura alternativa salvo que exista una incompatibilidad técnica real.**

---

# 3. Regla fundamental: primero estudiar, después implementar

Antes de modificar código:

1. Inspecciona todo el repositorio actual.
2. Lee completamente:
   - `requirements.md`
   - `design.md`
   - `tasks.md`
3. Inspecciona los archivos existentes.
4. Identifica qué partes ya están implementadas.
5. Identifica qué partes están incompletas.
6. Identifica código heredado de `RopavejeroRetro`.
7. Identifica archivos que puedan reutilizarse.
8. Compara el estado actual contra los requisitos y tasks.
9. Construye mentalmente un mapa de implementación antes de comenzar.

No reemplaces código funcional innecesariamente.

**La documentación Kiro es la especificación principal.**

---

# 4. Implementación incremental

Implementa las tareas de `tasks.md` en orden lógico y por fases.

No intentes generar todo el proyecto de una sola vez sin verificarlo.

Después de cada fase:

1. Ejecuta los tests correspondientes.
2. Ejecuta lint/verificaciones disponibles.
3. Comprueba que no hayas roto funcionalidades anteriores.
4. Corrige errores.
5. Continúa con la siguiente fase.

Si `tasks.md` contiene tareas marcadas como completadas, verifica que realmente estén implementadas antes de asumir que están terminadas.

No confíes únicamente en el checkbox de la documentación.

---

# 5. Prioridad de las fuentes

Si existe una discrepancia entre diferentes fuentes:

1. `requirements.md` define el comportamiento requerido.
2. `design.md` define la arquitectura y solución técnica.
3. `tasks.md` define el orden y granularidad de implementación.
4. El código existente sirve como referencia y punto de partida.

Si el código contradice la documentación, adapta el código a la especificación.

---

# 6. No hacer una implementación superficial

NO hagas:

- placeholders donde se requiere funcionalidad real
- botones que no hagan nada
- funciones vacías
- `TODO` para evitar implementar funcionalidades
- mocks permanentes
- datos falsos para aparentar que una integración funciona
- código duplicado innecesariamente
- una única aplicación monolítica cuando la especificación exige módulos
- eliminar requisitos difíciles
- cambiar los requisitos para adaptarlos a una implementación más fácil

Si alguna integración externa necesita credenciales que no existen en el repositorio, implementa correctamente el mecanismo de configuración mediante variables de entorno/secrets y deja claramente documentado qué secreto debe proporcionar el administrador.

Nunca hardcodees secretos.

---

# 7. Identidad de marca

El proyecto debe utilizar exclusivamente la identidad:

**DoubleImpactStore**

Elimina/reemplaza referencias antiguas a:

- RopavejeroRetro
- Ropavejero Retro
- RopavejeroRetro.cl
- ropavejeroretro

cuando correspondan a la identidad del sitio.

Debe mantenerse únicamente la referencia histórica a Ropavejero.Retro cuando la documentación explícitamente indique que forma parte del origen/unión de la tienda.

No reemplaces ciegamente URLs de Instagram que deban seguir apuntando a las cuentas originales.

Utiliza los logos existentes de `img/` indicados en la especificación.

---

# 8. Estructura requerida

Verifica e implementa la estructura definida por `design.md`, incluyendo como mínimo:

- `index.html`
- `productos.html`
- `404.html`
- `security-policy.html`
- `security-acknowledgments.html`
- `manifest.json`
- `service-worker.js`
- `sitemap.xml`
- `robots.txt`
- `.htaccess`
- `.well-known/security.txt`
- `css/`
- `js/`
- `js/modules/`
- `api/`
- `.github/workflows/`
- `scripts/`
- `watcher.js`

No crees archivos redundantes si ya existe una implementación compatible.

---

# 9. JavaScript modular

Implementa la arquitectura modular definida en la documentación.

Debe existir separación clara de responsabilidades:

- `logger.js`
- `cache.js`
- `siglas.js`
- `utils.js`
- `ui.js`
- `products.js`
- `instagram.js`
- `efemerides.js`
- `analytics.js`

`js/index.js` debe ser únicamente el entry point/orquestador y respetar el límite establecido por la especificación.

No coloques lógica de negocio importante dentro de `index.js`.

---

# 10. Catálogo

Implementa completamente el catálogo:

- carga desde Google Sheets CSV
- caché en `localStorage`
- TTL de 5 minutos
- búsqueda
- debounce de 300 ms
- filtros por plataforma
- filtro disponible/vendido
- paginación
- ordenamiento
- modal de detalles
- breadcrumb
- manejo de errores
- botón de reintento
- detección y explicación de siglas

Debe funcionar tanto en desktop como en móvil.

No hardcodees el catálogo si la especificación exige Google Sheets.

Si la URL del Google Sheet ya existe en el proyecto, reutilízala.

---

# 11. Sistema de siglas

Respeta exactamente el formato de:

`js/siglas.json`

Verifica las siglas existentes y amplía el diccionario si la especificación lo requiere.

Implementa:

- carga
- detección case-insensitive
- tooltips desktop
- sección visible en móvil
- información en modal
- traducción ES/EN

---

# 12. Instagram

Implementa completamente:

- carga de posts sincronizados
- filtros por consola
- `console_aliases.json`
- links a publicaciones originales
- lazy loading
- WebP
- `srcset`
- fechas relativas
- soporte bilingüe

Implementa también:

`api/update_instagram.py`

y:

`.github/workflows/update-instagram.yml`

El workflow debe ejecutarse según lo definido en la documentación.

El token debe obtenerse exclusivamente desde:

`INSTAGRAM_TOKEN`

Nunca guardes tokens en el repositorio.

Si una API de Instagram requiere una configuración externa que no está disponible, implementa el código y el manejo de configuración correctamente, y documenta el secreto requerido.

---

# 13. PWA

Implementa:

- `manifest.json`
- iconos correctos
- Service Worker
- Cache API
- estrategia cache-first donde corresponda
- fallback offline
- indicador de modo offline
- invalidación de caché mediante versión
- actualización automática del Service Worker

El nombre del caché debe seguir:

`doubleimpact-v{version}`

La versión debe poder actualizarse automáticamente cuando corresponda.

---

# 14. Performance

Implementa:

- WebP
- imágenes responsive
- variantes 400/800/1200
- `loading="lazy"`
- minificación CSS
- minificación JS
- cache busting mediante query strings
- watcher automático
- reducción de tamaño requerida por la especificación

No generes archivos `.min.*` manualmente si deben ser generados por el proceso de build.

Verifica que el minificador realmente funcione.

---

# 15. SEO

Cada página pública debe tener correctamente:

- `<title>`
- meta description
- keywords cuando corresponda
- canonical
- Open Graph
- Twitter Cards
- Schema.org JSON-LD

Implementa:

- `sitemap.xml`
- `robots.txt`
- URLs limpias `/productos`

Verifica que las URLs generadas sean coherentes con el dominio configurado.

---

# 16. Seguridad

Implementa todos los mecanismos definidos en `requirements.md` y `design.md`:

- CSP
- X-Content-Type-Options
- X-XSS-Protection según la especificación
- X-Frame-Options
- Referrer-Policy
- HTTPS redirect
- sanitización de entradas
- validación
- `security.txt`
- páginas de seguridad

Revisa especialmente cualquier uso de:

- `innerHTML`
- contenido proveniente de Google Sheets
- query parameters
- datos externos
- contenido de Instagram

Evita XSS y DOM injection.

No desactives las protecciones de seguridad para hacer que una funcionalidad funcione.

---

# 17. Analytics

Implementa:

- Google Tag Manager
- GA4
- Cloudflare Analytics
- fallback analytics

Si faltan IDs/configuraciones externas, utiliza variables/configuración claramente separadas y documentadas.

No inventes IDs reales.

El sitio debe seguir funcionando aunque GTM/GA4 estén bloqueados.

---

# 18. Internacionalización

Implementa ES/EN completamente.

Debe traducirse:

- navegación
- botones
- mensajes
- catálogo
- filtros
- FAQ
- blog
- servicios
- testimonios
- Instagram
- efemérides
- modales
- errores
- estados vacíos

El idioma predeterminado debe ser:

`es`

Debe persistirse en `localStorage`.

El cambio de idioma debe ser dinámico.

No dupliques las páginas para cada idioma.

---

# 19. Tema visual

Implementa:

- dark mode
- light mode
- persistencia
- variables CSS
- aplicación antes del render visible cuando sea posible
- controles accesibles

Predeterminado:

**modo oscuro**

---

# 20. Accesibilidad

Cumple como mínimo con los requisitos definidos:

- HTML semántico
- ARIA labels
- navegación por teclado
- focus management
- Escape para cerrar modales
- focus restoration
- contraste adecuado
- botones accesibles
- formularios accesibles
- imágenes con `alt`
- estados `aria-expanded`
- navegación lógica mediante Tab

Presta especial atención a:

- menú móvil
- modales
- FAQ
- tooltips
- filtros
- paginación
- cambio de tema
- cambio de idioma

---

# 21. Blog, FAQ, testimonios y servicios

Implementa completamente:

### Blog

- tarjetas
- modal
- contenido completo
- Escape
- click fuera
- restauración del foco
- ES/EN

### FAQ

Al menos 6 preguntas.

Debe existir comportamiento accordion:

- una pregunta abierta
- las demás se cierran
- animación
- teclado
- ES/EN

### Testimonios

- nombre
- reseña
- puntuación
- imagen
- lazy loading
- diseño accesible

No inventes testimonios presentándolos como clientes reales si no existen datos reales en el repositorio. Si la especificación contiene contenido de ejemplo, respétalo como contenido de demostración y evita atribuciones engañosas.

### Servicios

Implementa la información de:

- diagnóstico
- reparación de consolas retro
- limpieza
- cambio de condensadores
- reemplazo de lectores ópticos
- pulido profesional de discos

Incluye estos servicios en Schema.org según la documentación.

---

# 22. Contacto y redes

Implementa correctamente los enlaces definidos en la especificación:

- Instagram
- TikTok
- YouTube
- Facebook
- Threads
- Twitter/X
- WhatsApp
- catálogo Google Sheets

No inventes URLs que no estén disponibles en el repositorio/documentación.

Si existe una URL en el proyecto, reutilízala.

---

# 23. Tests

No consideres terminado el proyecto hasta implementar y ejecutar los tests definidos en `tasks.md`.

Utiliza:

- Vitest
- fast-check
- Playwright

Implementa los property tests indicados por la especificación.

Especialmente verifica las propiedades relacionadas con:

- tema
- idioma
- caché TTL
- siglas
- debounce
- efemérides
- filtrado
- paginación
- sanitización
- etc.

Los tests deben comprobar comportamiento real, no simplemente comprobar que una función existe.

---

# 24. E2E

Crea pruebas Playwright para los flujos críticos:

1. Página principal
2. Navegación
3. `/productos`
4. carga del catálogo
5. búsqueda
6. filtros
7. paginación
8. modal de producto
9. cambio de idioma
10. cambio de tema
11. FAQ
12. blog
13. Instagram
14. navegación móvil
15. accesibilidad básica
16. 404
17. comportamiento offline/PWA cuando sea razonablemente testeable

---

# 25. Verificación contra Requirements

Al finalizar la implementación:

Lee nuevamente `requirements.md`.

Para **cada requisito**, verifica si está implementado.

No basta con que los tests pasen.

Haz una auditoría de:

- Requirements 1–20
- todos sus acceptance criteria
- todas las tareas de `tasks.md`

Si encuentras algo pendiente, impleméntalo.

---

# 26. Verificación contra Design

Lee nuevamente `design.md` y verifica:

- arquitectura
- estructura de archivos
- interfaces
- responsabilidades
- dependencias
- flujos
- seguridad
- integración
- comportamiento esperado

Si la implementación difiere del diseño, corrígela salvo que exista una razón técnica clara.

---

# 27. Calidad del código

El código final debe:

- ser legible
- ser mantenible
- evitar duplicación
- utilizar funciones pequeñas
- respetar separación de responsabilidades
- manejar errores
- evitar variables globales innecesarias
- utilizar ES Modules
- utilizar `async/await` cuando corresponda
- no contener código muerto
- no contener TODOs que sustituyan funcionalidades requeridas
- no contener secretos
- no contener URLs inventadas
- no contener referencias accidentales a RopavejeroRetro

---

# 28. Compatibilidad con el proyecto existente

IMPORTANTE:

Este proyecto deriva de RopavejeroRetro.cl.

Antes de reescribir componentes, identifica qué código existente ya resuelve correctamente:

- layout
- responsive
- navegación
- catálogo
- PWA
- Instagram
- estilos
- imágenes
- fuentes
- utilidades

Reutiliza/adapta código funcional cuando sea compatible con la nueva especificación.

No destruyas funcionalidades existentes solamente para implementar una versión nueva.

---

# 29. Comandos y herramientas

Primero inspecciona:

- `package.json`
- configuración existente
- scripts npm
- estructura de carpetas

Después instala solamente las dependencias necesarias.

Usa los scripts existentes cuando sea apropiado.

Si faltan scripts, crea los necesarios, por ejemplo:

- test
- test:watch
- test:e2e
- build
- minify
- lint, si corresponde

No introduzcas frameworks frontend innecesarios.

La arquitectura especificada es:

**HTML + CSS + Vanilla JavaScript ES Modules.**

---

# 30. Manejo de errores durante la implementación

Si encuentras un error:

1. Investígalo.
2. Determina la causa.
3. Corrígelo.
4. Ejecuta nuevamente los tests.
5. Comprueba regresiones.
6. Continúa.

No ocultes errores simplemente eliminando tests o deshabilitando funcionalidades.

No cambies un requisito para hacer que un test pase.

---

# 31. Criterio de finalización

NO declares el proyecto terminado porque hayas creado los archivos.

Decláralo terminado únicamente cuando:

- la aplicación arranque correctamente
- las páginas existan
- la navegación funcione
- el catálogo funcione
- los módulos funcionen
- las integraciones estén implementadas
- PWA esté implementada
- SEO esté implementado
- seguridad esté implementada
- internacionalización funcione
- dark/light mode funcione
- Instagram esté implementado
- GitHub Actions esté configurado
- minificación funcione
- tests unitarios funcionen
- property tests funcionen
- E2E funcionen
- no existan errores críticos de consola
- no existan errores de JavaScript
- no existan referencias accidentales a la marca antigua
- los requisitos de `requirements.md` estén cubiertos
- el diseño de `design.md` esté respetado
- las tareas de `tasks.md` estén completadas

---

# 32. Auditoría final obligatoria

Antes de finalizar ejecuta una auditoría automática del repositorio.

Busca especialmente:

- `RopavejeroRetro`
- `Ropavejero Retro`
- `RopavejeroRetro.cl`
- `ropavejeroretro`
- `TODO`
- `FIXME`
- `console.log`
- URLs rotas
- imports rotos
- archivos referenciados que no existen
- imágenes inexistentes
- scripts inexistentes
- CSS inexistente
- funciones no utilizadas
- errores de sintaxis
- secretos
- tokens
- claves API
- referencias a CDN no permitidas por la arquitectura
- dependencias innecesarias

Corrige los problemas encontrados.

---

# 33. Resultado esperado

Cuando hayas terminado:

1. Implementa todo directamente en el repositorio.
2. Ejecuta los tests.
3. Corrige todos los errores.
4. Ejecuta nuevamente los tests.
5. Haz la auditoría final contra requirements/design/tasks.
6. Corrige cualquier incumplimiento restante.

Finalmente proporciona un resumen conciso con:

- funcionalidades implementadas
- archivos principales creados/modificados
- tests ejecutados
- resultado de los tests
- integraciones externas que requieren configuración
- variables/secrets que deben configurarse
- cualquier limitación externa que no pueda resolverse sin credenciales

**No me entregues solamente instrucciones ni pseudocódigo. Implementa el proyecto.**

Empieza ahora por inspeccionar el repositorio y leer completamente:

`.kiro/specs/double-impact-store/requirements.md`

`.kiro/specs/double-impact-store/design.md`

`.kiro/specs/double-impact-store/tasks.md`

y luego procede con la implementación.