# Requirements Document

## Introduction

DoubleImpactStore es una tienda en línea especializada en videojuegos retro originales. Nace de la unión de dos tiendas de Instagram:
- **@Ropavejero.Retro**: https://www.instagram.com/ropavejero.retro/
- **@nekketsustore**: https://www.instagram.com/nekketsustore/
El proyecto es una adaptación del sitio web RopavejeroRetro.cl [https://github.com/Iyov/RopavejeroRetro.cl], conservando toda su funcionalidad y arquitectura, con la identidad de marca actualizada a "DoubleImpactStore" en todos los textos, etiquetas, metadatos, nombres de archivos y referencias visuales.

El sitio es una aplicación web estática (HTML5 + CSS3 + JavaScript Vanilla) con capacidades PWA, integración con Google Sheets como base de datos de productos, automatización de Instagram mediante GitHub Actions y soporte completo para español e inglés.

---

## Glossary

- **DoubleImpactStore**: El sistema web principal — tienda de videojuegos retro que reemplaza a RopavejeroRetro en todos los contextos.
- **Catálogo**: El conjunto de productos disponibles en la tienda, almacenados en Google Sheets y presentados en `productos.html`.
- **Service_Worker**: El script de background encargado de la caché inteligente y funcionalidad offline.
- **Instagram_Updater**: El script Python (`api/update_instagram.py`) que sincroniza posts de Instagram con el sitio.
- **PWA**: Progressive Web App — la capacidad del sitio de ser instalado como aplicación nativa en dispositivos.
- **GTM**: Google Tag Manager — el sistema de gestión de etiquetas de analytics.
- **GA4**: Google Analytics 4 — el sistema de métricas de comportamiento de usuarios.
- **CSP**: Content Security Policy — la cabecera HTTP de seguridad contra ataques XSS.
- **EARS**: Easy Approach to Requirements Syntax — el patrón utilizado para redactar requisitos.
- **WebP**: Formato de imagen optimizado para web utilizado para todas las imágenes del sitio.
- **Siglas**: Abreviaturas usadas en nombres de productos del catálogo (ej. CIB, BL, GH).
- **Efemérides**: Eventos históricos del mundo gaming mostrados diariamente en la página principal.
- **Schema_org**: Datos estructurados en formato JSON-LD para SEO.
- **Minificador**: El sistema (`watcher.js`) que comprime archivos JS y CSS automáticamente.

---

## Requirements

### Requirement 1: Estructura y Páginas del Sitio

**User Story:** Como visitante, quiero navegar por un sitio web completo con varias páginas, para encontrar información sobre productos, servicios y la tienda.

#### Acceptance Criteria

1. THE DoubleImpactStore SHALL incluir una página principal (`index.html`) con secciones en el siguiente orden: hero, sobre nosotros, productos destacados, Instagram, efemérides, blog, testimonios, FAQ, servicios y contacto.
2. THE DoubleImpactStore SHALL incluir una página de catálogo independiente (`productos.html`) accesible desde la URL `/productos`.
3. THE DoubleImpactStore SHALL incluir una página de error personalizada (`404.html`) que se muestre cuando el usuario accede a una URL inexistente.
4. THE DoubleImpactStore SHALL incluir una página de política de seguridad (`security-policy.html`) con información sobre divulgación responsable de vulnerabilidades.
5. THE DoubleImpactStore SHALL incluir una página de agradecimientos de seguridad (`security-acknowledgments.html`) que reconozca a investigadores de seguridad.
6. THE DoubleImpactStore SHALL reemplazar toda aparición del texto "RopavejeroRetro" o "Ropavejero Retro" o "RopavejeroRetro.cl" por "DoubleImpactStore" en todos los archivos HTML, CSS, JavaScript, JSON, XML y de configuración.
7. WHEN el usuario navega entre páginas, THE DoubleImpactStore SHALL mantener el ítem de navegación activo visualmente resaltado con la clase `.nav-active`.

---

### Requirement 2: Diseño Responsive y Accesibilidad

**User Story:** Como usuario en cualquier dispositivo, quiero que el sitio se vea y funcione correctamente, para tener una buena experiencia independientemente del dispositivo que use.

#### Acceptance Criteria

1. THE DoubleImpactStore SHALL implementar un diseño responsive que se adapte correctamente a resoluciones móvil (< 768px), tablet (768px–1024px) y desktop (> 1024px).
2. THE DoubleImpactStore SHALL implementar ARIA labels en todos los elementos interactivos para cumplir con estándares de accesibilidad WCAG 2.1.
3. THE DoubleImpactStore SHALL soportar navegación completa por teclado (Tab, Enter, Escape) en todos los componentes interactivos.
4. THE DoubleImpactStore SHALL usar HTML5 semántico (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`) en toda la estructura de páginas.
5. THE DoubleImpactStore SHALL implementar Font Awesome 6.5.1 para todos los íconos del sitio.

---

### Requirement 3: Modo Claro/Oscuro y Multilenguaje

**User Story:** Como usuario, quiero poder cambiar el tema visual y el idioma del sitio, para personalizar mi experiencia de navegación.

#### Acceptance Criteria

1. WHEN el usuario activa el modo oscuro, THE DoubleImpactStore SHALL aplicar variables CSS de tema oscuro a todos los elementos de la página y persistir la preferencia en `localStorage`.
2. WHEN el usuario activa el modo claro, THE DoubleImpactStore SHALL aplicar variables CSS de tema claro a todos los elementos de la página y persistir la preferencia en `localStorage`.
3. WHEN el usuario cambia el idioma a Inglés, THE DoubleImpactStore SHALL traducir todos los textos visibles de la interfaz al inglés usando el sistema de traducciones de `js/modules/ui.js`.
4. WHEN el usuario cambia el idioma a Español, THE DoubleImpactStore SHALL traducir todos los textos visibles de la interfaz al español usando el sistema de traducciones de `js/modules/ui.js`.
5. WHEN el sitio se carga por primera vez, THE DoubleImpactStore SHALL leer el idioma guardado en `localStorage` y aplicarlo antes de renderizar contenido visible.
6. IF el `localStorage` no contiene preferencia de tema o idioma, THEN THE DoubleImpactStore SHALL usar español y modo oscuro como valores predeterminados.

---

### Requirement 4: Catálogo de Productos

**User Story:** Como comprador, quiero explorar el catálogo de productos con filtros y búsqueda, para encontrar fácilmente los artículos que me interesan.

#### Acceptance Criteria

1. WHEN el usuario visita `/productos`, THE DoubleImpactStore SHALL cargar el catálogo de productos desde la integración de Google Sheets publicada como CSV.
2. WHEN los datos del catálogo se obtienen exitosamente, THE DoubleImpactStore SHALL almacenarlos en `localStorage` con un TTL de 5 minutos para evitar solicitudes redundantes.
3. WHEN el usuario escribe en el campo de búsqueda, THE DoubleImpactStore SHALL filtrar los resultados en tiempo real con un debounce de 300ms.
4. WHEN el usuario selecciona uno o más filtros de plataforma, THE DoubleImpactStore SHALL mostrar únicamente los productos que corresponden a las plataformas seleccionadas.
5. WHEN el usuario activa el filtro de estado, THE DoubleImpactStore SHALL separar visualmente los productos disponibles de los vendidos.
6. THE DoubleImpactStore SHALL implementar paginación inteligente que muestre un número configurable de productos por página.
7. WHEN el usuario hace clic en un producto, THE DoubleImpactStore SHALL abrir un modal con todos los detalles del producto, incluyendo nombre, plataforma, precio, estado, descripción y siglas detectadas.
8. IF la carga de datos desde Google Sheets falla, THEN THE DoubleImpactStore SHALL mostrar un mensaje de error descriptivo al usuario y ofrecer la opción de reintentar.
9. THE DoubleImpactStore SHALL mostrar un breadcrumb de navegación en la página de productos para facilitar la orientación del usuario.

---

### Requirement 5: Sistema de Siglas

**User Story:** Como comprador, quiero entender las abreviaturas usadas en los nombres de productos, para saber exactamente qué estoy comprando.

#### Acceptance Criteria

1. THE DoubleImpactStore SHALL cargar un diccionario de 40+ siglas desde `js/siglas.json` con soporte bilingüe (ES/EN) para cada entrada.
2. WHEN el usuario ve un producto en la tabla del catálogo en desktop, THE DoubleImpactStore SHALL mostrar un tooltip interactivo al hacer hover sobre siglas detectadas en el nombre del producto.
3. WHEN el usuario ve un producto en la vista móvil, THE DoubleImpactStore SHALL mostrar una sección de siglas visible sin necesidad de hover.
4. WHEN el usuario abre el modal de detalles de un producto, THE DoubleImpactStore SHALL mostrar una sección dedicada con todas las siglas detectadas y sus definiciones en el idioma activo.
5. WHEN el idioma cambia, THE DoubleImpactStore SHALL resolver las descripciones de siglas en el idioma activo en tiempo de ejecución.

---

### Requirement 6: Sección de Instagram

**User Story:** Como visitante, quiero ver los últimos posts de Instagram de la tienda, para conocer los productos más recientes y el contenido publicado.

#### Acceptance Criteria

1. THE DoubleImpactStore SHALL mostrar los últimos posts de Instagram sincronizados, cargados desde `js/instagram_posts.min.js`.
2. THE DoubleImpactStore SHALL mostrar imágenes de posts en formato WebP con variantes responsive (400px, 800px, 1200px) usando el atributo `srcset`.
3. THE DoubleImpactStore SHALL implementar lazy loading en todas las imágenes de Instagram.
4. THE DoubleImpactStore SHALL mostrar la fecha de cada post en formato relativo (ej. "Hace 3 días") en el idioma activo.
5. THE DoubleImpactStore SHALL incluir botones de filtro por consola que permitan al usuario ver únicamente posts de una plataforma específica.
6. WHEN el usuario hace clic en un post de Instagram, THE DoubleImpactStore SHALL abrir el enlace directo a la publicación original en Instagram en una nueva pestaña.
7. WHEN se construyen los botones de filtro, THE DoubleImpactStore SHALL leer los aliases desde `js/console_aliases.json` para detectar correctamente la consola asociada a cada post.

---

### Requirement 7: Automatización de Instagram (Instagram_Updater)

**User Story:** Como administrador, quiero que los posts de Instagram se sincronicen automáticamente con el sitio, para que el contenido esté siempre actualizado sin intervención manual.

#### Acceptance Criteria

1. THE Instagram_Updater SHALL ejecutarse automáticamente cada 12 horas mediante GitHub Actions.
2. THE Instagram_Updater SHALL seleccionar únicamente los posts que incluyan el hashtag `#DoubleImpactStoreWeb` para sincronización.
3. WHEN se procesan imágenes de Instagram, THE Instagram_Updater SHALL generar variantes WebP en resoluciones 400px, 800px y 1200px usando la librería Pillow.
4. WHEN se completa la sincronización, THE Instagram_Updater SHALL actualizar `js/instagram_posts.min.js`, la versión en `index.html` y el manifiesto del `service-worker.js`.
5. THE Instagram_Updater SHALL leer el token de acceso desde la variable de entorno `INSTAGRAM_TOKEN` y no desde archivos versionados.
6. IF el token de Instagram es inválido o ha expirado, THEN THE Instagram_Updater SHALL terminar con un código de error descriptivo y registrar el problema en los logs de GitHub Actions.

---

### Requirement 8: PWA (Progressive Web App)

**User Story:** Como usuario móvil, quiero poder instalar el sitio como una aplicación, para acceder a él rápidamente desde mi pantalla de inicio y usarlo sin conexión.

#### Acceptance Criteria

1. THE DoubleImpactStore SHALL incluir un `manifest.json` con nombre, íconos, colores y configuración de display para habilitar la instalación como PWA.
2. THE DoubleImpactStore SHALL registrar un Service_Worker que implemente una estrategia de caché inteligente para todos los recursos estáticos del sitio.
3. WHILE el usuario está sin conexión a internet, THE DoubleImpactStore SHALL servir los recursos en caché y mostrar una indicación de modo offline.
4. WHEN se publica una nueva versión del sitio, THE Service_Worker SHALL invalidar la caché anterior usando un nuevo nombre de caché versionado (ej. `doubleimpact-v2026-08-17`).
5. THE DoubleImpactStore SHALL reducir los tiempos de carga entre un 60% y 70% respecto a la carga sin caché, gracias al Service_Worker.

---

### Requirement 9: Performance y Optimización

**User Story:** Como visitante, quiero que el sitio cargue rápidamente, para no perder tiempo esperando y tener una experiencia fluida.

#### Acceptance Criteria

1. THE DoubleImpactStore SHALL implementar lazy loading nativo (`loading="lazy"`) en todas las imágenes que no estén en el viewport inicial.
2. THE DoubleImpactStore SHALL usar imágenes en formato WebP con generación automática de variantes responsive (400, 800, 1200px) para todas las imágenes de contenido.
3. THE DoubleImpactStore SHALL mantener versiones minificadas de todos los archivos CSS y JavaScript (`.min.css`, `.min.js`) con una reducción mínima del 36% respecto al original.
4. THE DoubleImpactStore SHALL usar query strings de versión (ej. `?v=2026-08-17`) en todos los recursos estáticos para control de caché por versión.
5. THE Minificador SHALL detectar cambios en archivos JS y CSS y regenerar automáticamente las versiones minificadas correspondientes.

---

### Requirement 10: SEO e Indexación

**User Story:** Como administrador, quiero que el sitio esté correctamente optimizado para motores de búsqueda, para atraer tráfico orgánico y mejorar la visibilidad de la tienda.

#### Acceptance Criteria

1. THE DoubleImpactStore SHALL incluir meta tags completos (title, description, keywords) en cada página HTML.
2. THE DoubleImpactStore SHALL implementar Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`) en todas las páginas.
3. THE DoubleImpactStore SHALL implementar Twitter Card tags en todas las páginas.
4. THE DoubleImpactStore SHALL incluir datos estructurados Schema.org en formato JSON-LD para la tienda, productos y servicios.
5. THE DoubleImpactStore SHALL incluir un `sitemap.xml` con todas las URLs indexables del sitio.
6. THE DoubleImpactStore SHALL incluir un `robots.txt` configurado para permitir el acceso de crawlers a todas las páginas públicas.
7. THE DoubleImpactStore SHALL implementar canonical URLs en todas las páginas para prevenir contenido duplicado.
8. THE DoubleImpactStore SHALL usar URLs limpias (ej. `/productos` en lugar de `/productos.html`) vía configuración de servidor (`.htaccess` u equivalente).

---

### Requirement 11: Seguridad

**User Story:** Como usuario, quiero que el sitio sea seguro, para navegar con confianza sin riesgo de ataques o robo de datos.

#### Acceptance Criteria

1. THE DoubleImpactStore SHALL implementar una Content Security Policy (CSP) como cabecera HTTP para proteger contra ataques XSS.
2. THE DoubleImpactStore SHALL sanitizar y validar todas las entradas de usuario antes de procesarlas o renderizarlas en el DOM.
3. THE DoubleImpactStore SHALL implementar las cabeceras de seguridad `X-Content-Type-Options` y `X-XSS-Protection`.
4. THE DoubleImpactStore SHALL incluir un archivo `.well-known/security.txt` con la política de divulgación responsable de vulnerabilidades.
5. IF se detecta que la página se carga sin HTTPS, THEN THE DoubleImpactStore SHALL redirigir automáticamente al usuario a la versión HTTPS.
6. THE DoubleImpactStore SHALL incluir un sistema de fallback de analytics que funcione incluso cuando un bloqueador de anuncios deshabilita GTM o GA4.

---

### Requirement 12: Analytics

**User Story:** Como administrador, quiero rastrear el comportamiento de los usuarios en el sitio, para tomar decisiones basadas en datos sobre el contenido y las funcionalidades.

#### Acceptance Criteria

1. THE DoubleImpactStore SHALL integrar Google Tag Manager (GTM) para la gestión centralizada de todas las etiquetas de analytics.
2. THE DoubleImpactStore SHALL integrar Google Analytics 4 (GA4) para el seguimiento de métricas de comportamiento de usuarios.
3. THE DoubleImpactStore SHALL integrar Cloudflare Analytics para métricas de rendimiento y tráfico de red.
4. WHEN GTM o GA4 no están disponibles (por bloqueadores o errores de red), THE DoubleImpactStore SHALL ejecutar un sistema de fallback de analytics que registre eventos básicos de navegación.

---

### Requirement 13: Sección de Efemérides

**User Story:** Como visitante apasionado del gaming retro, quiero ver eventos históricos del videojuego del día de hoy, para aprender curiosidades mientras navego la tienda.

#### Acceptance Criteria

1. WHEN el usuario visita la página principal, THE DoubleImpactStore SHALL mostrar la efeméride gaming correspondiente a la fecha actual, cargada desde `js/efemerides.json`.
2. THE DoubleImpactStore SHALL mostrar la efeméride en el idioma activo del sitio (español o inglés).
3. IF no existe una efeméride para la fecha actual, THEN THE DoubleImpactStore SHALL ocultar el componente de efemérides sin generar errores visibles.
4. THE DoubleImpactStore SHALL implementar la sección `<section id="efemerides">` completamente en `index.html` con los siguientes sub-componentes visibles:
   - Título de la sección ("Efemérides" / "Gaming History") con `data-i18n`
   - Fecha del día formateada (ej. "18 de agosto" / "August 18")
   - Título del evento (`efemeride.ES.title` o `efemeride.EN.title` según idioma activo)
   - Texto breve del evento (`efemeride.ES.text` o `efemeride.EN.text`)
   - Detalle expandible (`efemeride.ES.det` o `efemeride.EN.det`) con botón "Leer más" / "Read more"
5. THE DoubleImpactStore SHALL llamar a `loadEfemerides()` y `renderEfemeride()` desde `js/index.js` dentro del evento `DOMContentLoaded`, garantizando que la sección se puebla con contenido real antes de que el usuario la vea.
6. THE `renderEfemeride` function SHALL buscar la efeméride del día construyendo la clave de fecha como `DD/MM` (ej. `"18/08"` para el 18 de agosto), recorriendo el array `data.efemerides` hasta encontrar la entrada cuyo campo `date` coincida exactamente.
7. THE DoubleImpactStore SHALL aplicar un estilo visual distinto a la sección efemérides (ej. tarjeta con borde de acento, ícono de calendario) que la haga recognocible visualmente en la página principal.

---

### Requirement 14: Blog

**User Story:** Como visitante, quiero leer artículos sobre gaming retro, para aprender más sobre el tema y descubrir coleccionables.

#### Acceptance Criteria

1. THE DoubleImpactStore SHALL mostrar una sección de blog en la página principal con tarjetas de artículos sobre gaming retro (historia de Nintendo, Sega, guías para coleccionistas, etc.).
2. WHEN el usuario hace clic en un artículo del blog, THE DoubleImpactStore SHALL abrir el contenido completo en un diálogo modal sin redirigir a otra página.
3. WHEN el usuario presiona la tecla Escape o hace clic fuera del modal del blog, THE DoubleImpactStore SHALL cerrar el modal y restaurar el foco al elemento que lo abrió.

---

### Requirement 15: Testimonios

**User Story:** Como comprador potencial, quiero ver reseñas de otros clientes, para tener confianza en la calidad y confiabilidad de la tienda.

#### Acceptance Criteria

1. THE DoubleImpactStore SHALL mostrar una sección de testimonios con reseñas de clientes reales, incluyendo nombre, reseña y puntuación.
2. THE DoubleImpactStore SHALL implementar lazy loading en las imágenes de los testimonios.
3. THE DoubleImpactStore SHALL presentar los testimonios con un diseño de tarjetas visualmente atractivo y accesible.

---

### Requirement 16: FAQ Interactivo

**User Story:** Como visitante, quiero encontrar respuestas a preguntas frecuentes de manera rápida, para resolver mis dudas sin tener que contactar a la tienda.

#### Acceptance Criteria

1. THE DoubleImpactStore SHALL mostrar una sección de FAQ con al menos 6 preguntas frecuentes expandibles sobre productos, servicios, envíos, garantías y servicio técnico.
2. WHEN el usuario hace clic en una pregunta del FAQ, THE DoubleImpactStore SHALL expandir la respuesta con una animación suave y colapsar cualquier otra pregunta abierta.
3. THE DoubleImpactStore SHALL mostrar el FAQ en el idioma activo del sitio (español o inglés).

---

### Requirement 17: Servicios Adicionales

**User Story:** Como cliente, quiero conocer los servicios técnicos de la tienda, para poder enviar mi consola o disco a reparar.

#### Acceptance Criteria

1. THE DoubleImpactStore SHALL incluir información sobre el servicio técnico de consolas retro (diagnóstico, reparación, limpieza de conectores, cambio de condensadores, reemplazo de lector óptico) en la página principal.
2. THE DoubleImpactStore SHALL incluir información sobre el servicio de pulido profesional de discos ópticos (PS1, PS2, Xbox, GameCube, Wii) en la página principal.
3. THE DoubleImpactStore SHALL incluir al menos una pregunta del FAQ sobre los servicios técnicos y de pulido de discos, tanto en español como en inglés.
4. THE DoubleImpactStore SHALL incluir los nuevos servicios en los datos estructurados Schema.org (`knowsAbout`) para mejorar el SEO.

---

### Requirement 18: Contacto y Redes Sociales

**User Story:** Como cliente, quiero encontrar fácilmente cómo contactar a la tienda, para hacer consultas o compras.

#### Acceptance Criteria

1. THE DoubleImpactStore SHALL mostrar enlaces a todas las redes sociales de la tienda (Instagram DoubleImpactStore, Instagram @Ropavejero.Retro, Instagram @NekketsuStore, Threads, Twitter/X, YouTube, WhatsApp) en el footer y sección de contacto.
2. THE DoubleImpactStore SHALL incluir un enlace directo a WhatsApp para contacto inmediato.
3. THE DoubleImpactStore SHALL incluir un enlace al catálogo en Google Sheets para que los usuarios descarguen la lista completa de productos.
4. THE DoubleImpactStore SHALL NOT mostrar información de envíos nacionales ni información de lugar de entrega presencial en Santiago en la sección de contacto — estos textos deben eliminarse completamente.
5. THE DoubleImpactStore SHALL presentar cada canal de contacto usando el patrón de tarjeta con ícono grande centrado y texto debajo, siguiendo este HTML de referencia:
   ```html
   <a href="https://www.instagram.com/ropavejero.retro/" target="_blank" rel="noopener noreferrer" class="contact-card">
     <i class="fab fa-instagram"></i>
     <span data-translate="contact-instagram">Instagram</span>
   </a>
   ```

---

### Requirement 19: Módulos JavaScript

**User Story:** Como desarrollador, quiero que el código JavaScript esté organizado en módulos con responsabilidades claras, para facilitar el mantenimiento y la extensión del proyecto.

#### Acceptance Criteria

1. THE DoubleImpactStore SHALL organizar todo el JavaScript en módulos separados bajo `js/modules/`:
   - `logger.js` — control de logs por ambiente (producción/desarrollo)
   - `cache.js` — sistema de caché con localStorage
   - `siglas.js` — carga, detección y renderizado de siglas
   - `utils.js` — sanitize, validate, sort y manejo de errores
   - `ui.js` — tema, idioma, traducciones ES/EN, FAQ, blog, menú móvil
   - `products.js` — catálogo completo: tabla, filtros, paginación, modal
   - `instagram.js` — posts y filtros por consola con console_aliases.json
   - `efemerides.js` — efemérides del día
   - `analytics.js` — CSP, AdBlock y fallback analytics
2. THE DoubleImpactStore SHALL mantener `js/index.js` como punto de entrada único con máximo 20 líneas que únicamente orqueste el `DOMContentLoaded`.
3. WHEN se carga la página, THE DoubleImpactStore SHALL cargar los módulos en el orden correcto de dependencias definido en el HTML.

---

### Requirement 21: Navegación — Menú Solo-Íconos con Tooltip y Logo Sin Texto

**User Story:** Como visitante, quiero ver un menú de navegación compacto con íconos y tooltips en lugar de texto visible, para que quepan todos los ítems sin ocupar demasiado espacio horizontal.

#### Acceptance Criteria

1. THE DoubleImpactStore SHALL mostrar en el menú de navegación principal los siguientes ítems en este orden exacto: Inicio, Nosotros, Productos, Instagram, Efemérides, Blog, Testimonios, FAQ, Servicios, Contacto.
2. THE DoubleImpactStore SHALL hacer que el enlace "Productos" del menú navegue a la página `/productos` y los demás ítems naveguen mediante anchor links (`#nosotros`, `#instagram`, `#efemerides`, `#blog`, `#testimonios`, `#faq`, `#servicios`, `#contacto`) a sus secciones correspondientes en `index.html`.
3. THE DoubleImpactStore SHALL mostrar en el header únicamente el logo (imagen `img/LogoDoubleImpactStore_150.png` o equivalente) SIN el texto "DoubleImpactStore" al lado — el texto ocupa espacio innecesario y debe eliminarse del header.
4. THE DoubleImpactStore SHALL mostrar en los ítems del menú de navegación desktop únicamente el ícono de Font Awesome correspondiente a cada sección, SIN texto visible junto al ícono.
5. WHEN el usuario pasa el mouse sobre un ítem del menú, THE DoubleImpactStore SHALL mostrar un tooltip con el nombre de la sección en el idioma activo (ES/EN), usando CSS puro (`:hover` + pseudo-elemento) o JS mínimo.
6. THE DoubleImpactStore SHALL aplicar atributo `aria-label` con el nombre de la sección a cada ítem del menú para accesibilidad (lectores de pantalla).
7. WHEN el usuario hace clic en un enlace de anchor del menú, THE DoubleImpactStore SHALL realizar scroll suave (`scroll-behavior: smooth`) hasta la sección correspondiente.
8. THE DoubleImpactStore SHALL mostrar el logo de DoubleImpactStore en la parte superior izquierda del header; al hacer clic devuelve al inicio (`scrollTo({ top: 0, behavior: 'smooth' })`).
9. THE DoubleImpactStore SHALL incluir el ítem "Efemérides" en el menú de navegación (ícono: `fa-calendar-day`), enlazando a la sección `#efemerides`.
10. EN el menú hamburguesa móvil, THE DoubleImpactStore SHALL mostrar el ícono Y el texto de cada ítem (el texto es necesario en móvil porque no hay tooltips táctiles).

#### Tabla de íconos por ítem de menú

| Ítem | Anchor / URL | Ícono Font Awesome |
|---|---|---|
| Inicio | `/` | `fa-house` |
| Nosotros | `#nosotros` | `fa-users` |
| Productos | `/productos` | `fa-gamepad` |
| Instagram | `#instagram` | `fa-instagram` |
| Efemérides | `#efemerides` | `fa-calendar-day` |
| Blog | `#blog` | `fa-newspaper` |
| Testimonios | `#testimonios` | `fa-star` |
| FAQ | `#faq` | `fa-circle-question` |
| Servicios | `#servicios` | `fa-screwdriver-wrench` |
| Contacto | `#contacto` | `fa-envelope` |

---

### Requirement 22: Sección Contacto y Redes Sociales — Diseño con Íconos Grandes

**User Story:** Como cliente, quiero ver la información de contacto y redes sociales con íconos grandes y texto descriptivo abajo, para identificar fácilmente cada canal de comunicación.

#### Acceptance Criteria

1. THE DoubleImpactStore SHALL mostrar en la sección de contacto íconos de Font Awesome de tamaño grande (mínimo 3rem / 48px) con el nombre o descripción del canal escrito debajo de cada ícono.
2. THE DoubleImpactStore SHALL incluir los siguientes canales de contacto con sus URLs reales en la sección de contacto y en el footer:
   - Instagram DoubleImpactStore: `https://www.instagram.com/doubleimpactstore/`
   - Instagram @Ropavejero.Retro: `https://www.instagram.com/ropavejero.retro/`
   - Instagram @NekketsuStore: `https://www.instagram.com/nekketsustore/`
   - Threads: `https://www.threads.com/@doubleimpactstore/`
   - Twitter/X: `https://x.com/DoubleImpactSpA`
   - WhatsApp: `https://wa.me/56967691585`
   - YouTube: `https://www.youtube.com/@DoubleImpactStoreSpA`
3. THE DoubleImpactStore SHALL usar el layout de íconos + texto adoptado en RopavejeroRetro.cl: íconos centrados en columnas con el nombre/descripción del canal en texto debajo, sin texto inline al costado del ícono.
4. THE DoubleImpactStore SHALL abrir todos los enlaces de redes sociales en una nueva pestaña (`target="_blank" rel="noopener noreferrer"`).
5. THE DoubleImpactStore SHALL traducir los labels de los canales de contacto al idioma activo (ES/EN).

---

### Requirement 23: Barra de Progreso de Scroll

**User Story:** Como visitante, quiero ver una barra de progreso en la parte superior de la página que indique cuánto he avanzado en el scroll, para saber en qué punto del contenido me encuentro.

#### Acceptance Criteria

1. THE DoubleImpactStore SHALL mostrar una barra de progreso fina (2–4px de alto) fijada en la parte superior del viewport, encima de todo el contenido (z-index alto).
2. WHEN el usuario hace scroll hacia abajo, THE DoubleImpactStore SHALL actualizar el ancho de la barra de progreso proporcionalmente al porcentaje de la página que ha sido desplazado (0% en el inicio, 100% al llegar al final del documento).
3. THE DoubleImpactStore SHALL animar la barra de progreso de forma fluida usando CSS `transition` o `width` calculado en el evento `scroll`.
4. THE DoubleImpactStore SHALL usar el color de acento del tema activo (variable CSS `--accent-color` o `--primary-color`) para la barra de progreso, de modo que sea coherente con el diseño general.

---

### Requirement 24: Botón "Volver Arriba" (Back to Top)

**User Story:** Como visitante, quiero tener un botón visible que me devuelva al inicio de la página cuando he bajado mucho, para no tener que hacer scroll manualmente hasta arriba.

#### Acceptance Criteria

1. THE DoubleImpactStore SHALL mostrar un botón "Volver Arriba" (back to top) que aparezca cuando el usuario ha hecho scroll hacia abajo más de 300px desde el inicio de la página.
2. WHEN el usuario hace clic en el botón "Volver Arriba", THE DoubleImpactStore SHALL realizar scroll suave hasta el inicio de la página (`scrollTo({ top: 0, behavior: 'smooth' })`).
3. THE DoubleImpactStore SHALL ocultar el botón "Volver Arriba" cuando el usuario está en la parte superior de la página (scroll < 300px), usando transición CSS suave (fade/slide).
4. THE DoubleImpactStore SHALL posicionar el botón "Volver Arriba" en la esquina inferior derecha de la pantalla, de forma fija (`position: fixed`), por encima del contenido pero debajo del botón de WhatsApp.
5. THE DoubleImpactStore SHALL implementar el botón con `aria-label="Volver al inicio"` y soporte de navegación por teclado.
6. WHEN el usuario hace clic en el logo del header, THE DoubleImpactStore SHALL realizar la misma acción que el botón "Volver Arriba" (scroll suave al inicio de la página).

---

### Requirement 25: Botón Flotante de WhatsApp

**User Story:** Como visitante, quiero tener acceso rápido al WhatsApp de la tienda desde cualquier punto de la página, para poder hacer consultas de forma inmediata.

#### Acceptance Criteria

1. THE DoubleImpactStore SHALL mostrar un botón flotante con el ícono de WhatsApp (Font Awesome `fa-whatsapp`) posicionado de forma fija en la esquina inferior derecha del viewport (`position: fixed`), siempre visible independientemente del scroll.
2. THE DoubleImpactStore SHALL mostrar un tooltip con el texto "Comunícate con nosotros" al hacer hover sobre el botón flotante de WhatsApp.
3. WHEN el usuario hace clic en el botón flotante de WhatsApp, THE DoubleImpactStore SHALL abrir el enlace `https://wa.me/56967691585` en una nueva pestaña.
4. THE DoubleImpactStore SHALL implementar el botón flotante de WhatsApp con color verde (#25D366) y `aria-label` descriptivo para accesibilidad.
5. THE DoubleImpactStore SHALL traducir el tooltip del botón de WhatsApp al idioma activo: "Comunícate con nosotros" (ES) / "Contact us" (EN).
6. THE DoubleImpactStore SHALL posicionar el botón flotante de WhatsApp por encima del botón "Volver Arriba" cuando ambos estén visibles, sin superponerse visualmente.

---

### Requirement 26: Sección "Productos Destacados" — Categorías por Fabricante

**User Story:** Como visitante, quiero ver una sección de productos destacados organizada por fabricante/plataforma, para identificar rápidamente las consolas disponibles en la tienda.

#### Acceptance Criteria

1. THE DoubleImpactStore SHALL mostrar en la sección `#productos-destacados` tarjetas o bloques visuales organizados por las siguientes categorías de fabricante, en este orden:
   - **Nintendo**: NES, SNES, N64, GameCube, GameBoy / Color / Advance, Wii/U, DS, 3DS
   - **PlayStation**: PS1 / PS2 / PSP / PS3 / PS4
   - **Sega**: Genesis, GameGear, Dreamcast
   - **Xbox**: OG Classic, 360, One
   - **Atari y más**: otras plataformas retro
2. WHEN el usuario hace clic en una categoría, THE DoubleImpactStore SHALL navegar a `/productos` (o mostrar un enlace al catálogo), permitiendo al usuario explorar los productos de esa plataforma.
3. THE DoubleImpactStore SHALL mostrar el nombre de cada categoría en el idioma activo (ES/EN).
4. THE DoubleImpactStore SHALL usar íconos de Font Awesome o texto estilizado para hacer visualmente distinguibles las categorías de fabricante.
5. THE DoubleImpactStore SHALL mostrar las categorías en un layout de grid responsive (múltiples columnas en desktop, 1–2 columnas en móvil).

---

### Requirement 27: Implementación Completa de la Sección Efemérides (Fix Crítico)

**User Story:** Como visitante, quiero ver la sección de Efemérides completamente implementada con contenido real, ya que actualmente solo aparece el menú de navegación pero la sección no muestra ningún contenido.

#### Acceptance Criteria

1. THE DoubleImpactStore SHALL garantizar que `<section id="efemerides">` existe en `index.html` con estructura HTML completa y un contenedor `id="efemerides-content"` donde se inyecta el contenido dinámico.
2. THE DoubleImpactStore SHALL garantizar que `js/modules/efemerides.js` exporta `loadEfemerides()`, `getTodayEfemeride()` y `renderEfemeride()` y que las tres son llamadas en `js/index.js` dentro de `DOMContentLoaded`.
3. THE DoubleImpactStore SHALL cargar `js/efemerides.json` usando `fetch('./js/efemerides.json')` o importación directa; la ruta debe ser correcta relativa al `index.html`.
4. THE DoubleImpactStore SHALL buscar la efeméride del día usando el formato `"DD/MM"` (ej. `"18/08"` para el 18 de agosto), recorriendo `data.efemerides` hasta encontrar `entry.date === clave`.
5. WHEN se encuentra la efeméride, THE DoubleImpactStore SHALL renderizar en `#efemerides-content`: título del evento, texto breve y detalle expandible con botón "Leer más" / "Read more".
6. THE DoubleImpactStore SHALL agregar el ítem "Efemérides" al menú de navegación principal con ícono `fa-calendar-day`, apuntando a `#efemerides`.

---

### Requirement 20: Identidad de Marca DoubleImpactStore

**User Story:** Como propietario de la tienda, quiero que toda la identidad visual y textual refleje exclusivamente la marca DoubleImpactStore, para tener una presencia de marca coherente y profesional.

#### Acceptance Criteria

1. THE DoubleImpactStore SHALL reemplazar todos los logos e imágenes de marca con el logo de DoubleImpactStore en todos los tamaños requeridos. Los logos de DoubleImpactStore están en la carpeta `img/`:
   - `LogoDoubleImpactStore_100pp.png` - Logo al 100% de resolución.
   - `LogoDoubleImpactStore_50pp.png` - Logo al 50% de resolución.
   - `LogoDoubleImpactStore_500.png` - Logo con resolución de 500x500 px.
   - `LogoDoubleImpactStore_250.png` - Logo con resolución de 250x250 px.
   - `LogoDoubleImpactStore_150.png` - Logo con resolución de 150x150 px.
2. THE DoubleImpactStore SHALL reemplazar todas las ocurrencias de "RopavejeroRetro", "Ropavejero Retro", "ropavejeroretro" y "RopavejeroRetro.cl" por "DoubleImpactStore" o "doubleimpactstore" (según contexto de mayúsculas) en todo el proyecto.
3. THE DoubleImpactStore SHALL actualizar el nombre del caché del Service_Worker al formato `doubleimpact-v{version}`.
4. THE DoubleImpactStore SHALL actualizar todas las URLs canónicas, og:url y meta tags para reflejar el dominio de DoubleImpactStore.
5. THE DoubleImpactStore SHALL actualizar el `manifest.json` con el nombre y nombre corto "DoubleImpactStore".
6. THE DoubleImpactStore SHALL actualizar los archivos `sitemap.xml`, `robots.txt` y `.well-known/security.txt` con la nueva identidad de marca y dominio.
7. THE DoubleImpactStore SHALL renombrar el hashtag de sincronización de Instagram de `#RopavejeroRetroWeb` a `#DoubleImpactStoreWeb` en el `Instagram_Updater` y en toda la documentación.
