// UI: tema, idioma, traducciones, FAQ, blog, menú móvil, navegación activa y offline
// Feature: double-impact-store, Requirements 1.7, 3.1–3.6, 14.2–14.3, 16.1–16.3, 19.1

import { renderSocialLinks } from '../social.js';

export const THEME_KEY = 'dis_theme';
export const LANG_KEY = 'dis_lang';
export const DEFAULT_THEME = 'dark';
export const DEFAULT_LANG = 'es';

const translations = {
  es: {
    'brand.name': 'DoubleImpactStore',
    'skip_link': 'Saltar al contenido',
    'nav.home': 'Inicio',
    'nav.products': 'Productos',
    'nav.services': 'Servicios',
    'nav.blog': 'Blog',
    'nav.contact': 'Contacto',
    'nav.security': 'Seguridad',
    'controls.lang': 'Cambiar idioma a Inglés',
    'controls.theme_dark': 'Activar modo oscuro',
    'controls.theme_light': 'Activar modo claro',
    'controls.menu_open': 'Abrir menú',
    'controls.menu_close': 'Cerrar menú',
    'offline.title': 'Estás sin conexión',
    'offline.text': 'Mostrando contenido guardado en la caché.',
    'hero.badge': 'Videojuegos retro originales y coleccionables',
    'hero.title': 'DoubleImpactStore',
    'hero.subtitle': 'Videojuegos retro originales, coleccionables y servicio técnico de consolas. Nacimos de la unión de @Ropavejero.Retro y @nekketsustore.',
    'hero.cta_catalog': 'Ver catálogo',
    'hero.cta_services': 'Servicios técnicos',
    'about.title': 'Sobre nosotros',
    'about.text1': 'DoubleImpactStore es una tienda dedicada a videojuegos retro originales y coleccionables, nacida de la unión de @Ropavejero.Retro y @nekketsustore.',
    'about.text2': 'Cada juego pasa por una revisión y limpieza antes de publicarse en el catálogo, y se detalla su estado exacto con siglas claras.',
    'about.text3': 'Hacemos envíos a todo Chile y entregas presenciales en Santiago.',
    'featured.title': 'Productos destacados',
    'featured.subtitle': 'Explora el catálogo completo en Google Sheets',
    'featured.card1_title': 'PlayStation 1 y 2',
    'featured.card1_text': 'Clásicos originales con carátulas y manuales.',
    'featured.card2_title': 'Nintendo (NES, SNES, N64)',
    'featured.card2_text': 'Cartuchos y consolas de las generaciones doradas.',
    'featured.card3_title': 'Sega y más',
    'featured.card3_text': 'Mega Drive, Dreamcast, Game Boy y accesorios.',
    'featured.cta': 'Ir al catálogo',
    'instagram.title': 'Instagram',
    'instagram.subtitle': 'Últimos posts publicados',
    'instagram.filter_all': 'Todos',
    'instagram.filters_label': 'Filtrar posts por consola',
    'instagram.open': 'Ver publicación en Instagram',
    'instagram.empty': 'No hay posts disponibles.',
    'efemerides.title': 'Efemérides gaming',
    'efemerides.read_more': 'Leer más',
    'efemerides.read_less': 'Leer menos',
    'blog.title': 'Blog',
    'blog.subtitle': 'Artículos sobre gaming retro',
    'blog.read': 'Leer artículo',
    'blog.close': 'Cerrar',
    'blog.card1_title': 'De cartas a consolas: la historia de Nintendo',
    'blog.card1_date': '12/08/2026',
    'blog.card1_excerpt': 'De las cartas hanafuda de 1889 a la consola que rescató a la industria.',
    'blog.card2_title': 'La era dorada de Sega',
    'blog.card2_date': '05/08/2026',
    'blog.card2_excerpt': 'Mega Drive, Sonic y la legendaria guerra de las consolas de 16 bits.',
    'blog.card3_title': 'Guía para coleccionistas: siglas y estados',
    'blog.card3_date': '29/07/2026',
    'blog.card3_excerpt': 'Aprende a leer las siglas del catálogo y a comprar retro con confianza.',
    'testimonials.title': 'Testimonios',
    'testimonials.notice': 'Contenido de demostración: las reseñas mostradas son ejemplos y no corresponden a clientes reales.',
    'testimonials.card1_name': 'Coleccionista demo',
    'testimonials.card1_review': 'Excelente selección de títulos originales y muy buen trato. El envío llegó rápido y bien embalado.',
    'testimonials.card2_name': 'Jugador demo',
    'testimonials.card2_review': 'Compré varios juegos de PS1 con sus manuales originales, tal cual se describían en el catálogo.',
    'testimonials.card3_name': 'Cliente demo',
    'testimonials.card3_review': 'El servicio técnico recuperó mi SNES. Ahora funciona perfecta. Muy recomendados.',
    'services.title': 'Servicios técnicos',
    'services.subtitle': 'Reparación y mantenimiento de consolas retro y discos ópticos.',
    'services.diagnostico': 'Diagnóstico',
    'services.diagnostico_text': 'Revisión completa de tu consola y presupuesto sin compromiso.',
    'services.reparacion': 'Reparación de consolas retro',
    'services.reparacion_text': 'Reparación de fallas de encendido, video, audio y más.',
    'services.limpieza': 'Limpieza de conectores',
    'services.limpieza_text': 'Limpieza profunda de conectores, pines y ranuras de cartuchos.',
    'services.condensadores': 'Cambio de condensadores',
    'services.condensadores_text': 'Recapping de placas de consolas clásicas (SNES, Mega Drive, PS1...).',
    'services.lector': 'Reemplazo de lectores ópticos',
    'services.lector_text': 'Cambio de lectores láser para PS1, PS2, GameCube y Xbox.',
    'services.pulido': 'Pulido profesional de discos',
    'services.pulido_text': 'Pulido de discos PS1, PS2, Xbox, GameCube y Wii para recuperar juegos rayados.',
    'faq.title': 'Preguntas frecuentes',
    'faq.q1': '¿Hacen envíos a todo Chile?',
    'faq.a1': 'Sí. Enviamos a todas las regiones por encomienda. El costo y el tiempo de entrega dependen del destino y se coordinan por WhatsApp.',
    'faq.q2': '¿Qué significan las siglas en los nombres de los productos?',
    'faq.a2': 'Las siglas describen el estado físico del juego (ej. CIB = caja, juego y manual; MM = sin manual; BL = Black Label). Pasa el cursor sobre una sigla del catálogo o revisa la sección de siglas en el detalle de cada producto.',
    'faq.q3': '¿Los juegos son originales?',
    'faq.a3': 'Sí. Todos los productos del catálogo son originales. Cuando hay elementos repro (carátulas, cajas) se indica explícitamente con las siglas CR o CCR.',
    'faq.q4': '¿Hacen servicio técnico de consolas retro?',
    'faq.a4': 'Sí. Ofrecemos diagnóstico, reparación, limpieza de conectores y cambio de condensadores de consolas clásicas (SNES, Mega Drive, PS1, entre otras). Escríbenos por WhatsApp.',
    'faq.q5': '¿Pulen discos rayados?',
    'faq.a5': 'Sí. Realizamos pulido profesional de discos para PS1, PS2, Xbox, GameCube y Wii. El pulido recupera la gran mayoría de títulos rayados, aunque no garantiza discos en estado extremo.',
    'faq.q6': '¿Cómo compro un producto del catálogo?',
    'faq.a6': 'Escríbenos por WhatsApp indicando el número del producto que te interesa. Confirmamos disponibilidad, coordinamos el pago y el envío o la entrega presencial.',
    'faq.q7': '¿Dónde hacen entregas presenciales?',
    'faq.a7': 'Entregamos en puntos de metro de Santiago. El catálogo completo está disponible en Google Sheets.',
    'contact.title': 'Contacto',
    'contact.subtitle': 'Encuéntranos en redes sociales, WhatsApp o el catálogo.',
    'contact.follow': 'Síguenos',
    'contact.whatsapp': 'WhatsApp',
    'contact.catalog': 'Catálogo Google Sheets',
    'contact.shipping': 'Envíos',
    'contact.shipping_text': 'Enviamos a todo Chile por encomienda.',
    'contact.pickup': 'Entrega presencial',
    'contact.pickup_text': 'Entregas en puntos de metro de Santiago.',
    'footer.tagline': 'Videojuegos retro originales y coleccionables.',
    'footer.rights': 'Todos los derechos reservados.',
    'footer.security': 'Política de seguridad',
    'products.title': 'Catálogo',
    'products.breadcrumb_home': 'Inicio',
    'products.breadcrumb_products': 'Productos',
    'products.search_placeholder': 'Buscar por nombre, número o plataforma...',
    'products.filters_platform': 'Plataforma',
    'products.filters_status': 'Estado',
    'products.status_all': 'Todos',
    'products.status_available': 'Disponibles',
    'products.status_sold': 'Vendidos',
    'products.sort_label': 'Ordenar por',
    'products.sort_num': 'Número',
    'products.sort_name': 'Nombre',
    'products.sort_platform': 'Plataforma',
    'products.sort_price': 'Precio',
    'products.pagination_prev': 'Anterior',
    'products.pagination_next': 'Siguiente',
    'products.page_info': 'Página {current} de {total}',
    'products.loading': 'Cargando catálogo...',
    'products.error_load': 'No se pudo cargar el catálogo. Revisa tu conexión o inténtalo de nuevo.',
    'products.retry': 'Reintentar',
    'products.empty': 'No se encontraron productos con los filtros seleccionados.',
    'products.table_num': 'Nº',
    'products.table_product': 'Producto',
    'products.table_platform': 'Plataforma',
    'products.table_price': 'Precio',
    'products.table_stock': 'Stock',
    'products.table_status': 'Estado',
    'products.status_available_label': 'Disponible',
    'products.status_sold_label': 'Vendido',
    'products.modal_close': 'Cerrar',
    'products.detail_platform': 'Plataforma',
    'products.detail_price': 'Precio',
    'products.detail_stock': 'Stock',
    'products.detail_status': 'Estado',
    'products.detail_instagram': 'Ver en Instagram',
    'products.detail_siglas': 'Siglas detectadas',
    'products.detail_no_siglas': 'Sin siglas detectadas.',
    'products.results_suffix': 'productos encontrados',
    'notfound.title': 'Página no encontrada',
    'notfound.text': 'La página que buscas no existe o fue movida.',
    'notfound.home': 'Volver al inicio',
    'security.title': 'Política de seguridad',
    'security.text1': 'Agradecemos la divulgación responsable de vulnerabilidades.',
    'security.text2': 'Si encuentras una vulnerabilidad, escríbenos a security@doubleimpactstore.cl antes de divulgarla públicamente.',
    'security.text3': 'No intentes acceder a datos de otros usuarios ni exfiltres información más allá de lo necesario para demostrar la vulnerabilidad.',
    'security.acknowledgments_title': 'Agradecimientos de seguridad',
    'security.acknowledgments_empty': 'Aún no hay investigadores reconocidos. ¡Sé el primero en reportar una vulnerabilidad!'
  },
  en: {
    'brand.name': 'DoubleImpactStore',
    'skip_link': 'Skip to content',
    'nav.home': 'Home',
    'nav.products': 'Products',
    'nav.services': 'Services',
    'nav.blog': 'Blog',
    'nav.contact': 'Contact',
    'nav.security': 'Security',
    'controls.lang': 'Switch to Spanish',
    'controls.theme_dark': 'Enable dark mode',
    'controls.theme_light': 'Enable light mode',
    'controls.menu_open': 'Open menu',
    'controls.menu_close': 'Close menu',
    'offline.title': 'You are offline',
    'offline.text': 'Showing cached content.',
    'hero.badge': 'Original retro games and collectibles',
    'hero.title': 'DoubleImpactStore',
    'hero.subtitle': 'Original retro games, collectibles and console repair services. Born from the union of @Ropavejero.Retro and @nekketsustore.',
    'hero.cta_catalog': 'View catalog',
    'hero.cta_services': 'Repair services',
    'about.title': 'About us',
    'about.text1': 'DoubleImpactStore is a store dedicated to original retro games and collectibles, born from the union of @Ropavejero.Retro and @nekketsustore.',
    'about.text2': 'Every game is inspected and cleaned before being published in the catalog, and its exact condition is described with clear acronyms.',
    'about.text3': 'We ship across Chile and offer in-person pickup in Santiago.',
    'featured.title': 'Featured products',
    'featured.subtitle': 'Browse the full catalog on Google Sheets',
    'featured.card1_title': 'PlayStation 1 & 2',
    'featured.card1_text': 'Original classics with covers and manuals.',
    'featured.card2_title': 'Nintendo (NES, SNES, N64)',
    'featured.card2_text': 'Cartridges and consoles from the golden generations.',
    'featured.card3_title': 'Sega and more',
    'featured.card3_text': 'Mega Drive, Dreamcast, Game Boy and accessories.',
    'featured.cta': 'Go to catalog',
    'instagram.title': 'Instagram',
    'instagram.subtitle': 'Latest published posts',
    'instagram.filter_all': 'All',
    'instagram.filters_label': 'Filter posts by console',
    'instagram.open': 'Open post on Instagram',
    'instagram.empty': 'No posts available.',
    'efemerides.title': 'Gaming anniversaries',
    'efemerides.read_more': 'Read more',
    'efemerides.read_less': 'Read less',
    'blog.title': 'Blog',
    'blog.subtitle': 'Retro gaming articles',
    'blog.read': 'Read article',
    'blog.close': 'Close',
    'blog.card1_title': 'From cards to consoles: the story of Nintendo',
    'blog.card1_date': '08/12/2026',
    'blog.card1_excerpt': 'From the Hanafuda cards of 1889 to the console that rescued the industry.',
    'blog.card2_title': 'The golden age of Sega',
    'blog.card2_date': '08/05/2026',
    'blog.card2_excerpt': 'Mega Drive, Sonic and the legendary 16-bit console war.',
    'blog.card3_title': "A collector's guide: acronyms and conditions",
    'blog.card3_date': '07/29/2026',
    'blog.card3_excerpt': 'Learn to read catalog acronyms and buy retro with confidence.',
    'testimonials.title': 'Testimonials',
    'testimonials.notice': 'Demo content: the reviews shown are examples and do not correspond to real customers.',
    'testimonials.card1_name': 'Demo collector',
    'testimonials.card1_review': 'Great selection of original titles and very good service. Shipping arrived fast and well packed.',
    'testimonials.card2_name': 'Demo gamer',
    'testimonials.card2_review': 'Bought several PS1 games with their original manuals, exactly as described in the catalog.',
    'testimonials.card3_name': 'Demo customer',
    'testimonials.card3_review': 'The repair service revived my SNES. Now it works perfectly. Highly recommended.',
    'services.title': 'Repair services',
    'services.subtitle': 'Repair and maintenance of retro consoles and optical discs.',
    'services.diagnostico': 'Diagnosis',
    'services.diagnostico_text': 'Full console inspection and a no-obligation quote.',
    'services.reparacion': 'Retro console repair',
    'services.reparacion_text': 'Repair of power, video, audio and other faults.',
    'services.limpieza': 'Connector cleaning',
    'services.limpieza_text': 'Deep cleaning of connectors, pins and cartridge slots.',
    'services.condensadores': 'Capacitor replacement',
    'services.condensadores_text': 'Recapping of classic console boards (SNES, Mega Drive, PS1...).',
    'services.lector': 'Optical drive replacement',
    'services.lector_text': 'Laser drive replacement for PS1, PS2, GameCube and Xbox.',
    'services.pulido': 'Professional disc resurfacing',
    'services.pulido_text': 'Disc resurfacing for PS1, PS2, Xbox, GameCube and Wii to restore scratched games.',
    'faq.title': 'Frequently asked questions',
    'faq.q1': 'Do you ship across Chile?',
    'faq.a1': 'Yes. We ship to every region by courier. Cost and delivery time depend on the destination and are arranged via WhatsApp.',
    'faq.q2': 'What do the acronyms in product names mean?',
    'faq.a2': 'Acronyms describe the physical condition of a game (e.g. CIB = box, game and manual; MM = missing manual; BL = Black Label). Hover over an acronym in the catalog or check the acronyms section in each product detail.',
    'faq.q3': 'Are the games original?',
    'faq.a3': 'Yes. Every product in the catalog is original. When reproduction parts (covers, boxes) are present, it is explicitly noted with the CR or CCR acronyms.',
    'faq.q4': 'Do you repair retro consoles?',
    'faq.a4': 'Yes. We offer diagnosis, repair, connector cleaning and capacitor replacement for classic consoles (SNES, Mega Drive, PS1, among others). Message us on WhatsApp.',
    'faq.q5': 'Do you resurface scratched discs?',
    'faq.a5': 'Yes. We professionally resurface discs for PS1, PS2, Xbox, GameCube and Wii. Resurfacing recovers most scratched titles, though it cannot guarantee discs in extreme condition.',
    'faq.q6': 'How do I buy a product from the catalog?',
    'faq.a6': 'Message us on WhatsApp with the product number you are interested in. We confirm availability, then arrange payment and shipping or in-person pickup.',
    'faq.q7': 'Where do you offer in-person pickup?',
    'faq.a7': 'We deliver at Santiago metro stations. The full catalog is available on Google Sheets.',
    'contact.title': 'Contact',
    'contact.subtitle': 'Find us on social media, WhatsApp or the catalog.',
    'contact.follow': 'Follow us',
    'contact.whatsapp': 'WhatsApp',
    'contact.catalog': 'Google Sheets catalog',
    'contact.shipping': 'Shipping',
    'contact.shipping_text': 'We ship across Chile by courier.',
    'contact.pickup': 'In-person pickup',
    'contact.pickup_text': 'Delivery at Santiago metro stations.',
    'footer.tagline': 'Original retro games and collectibles.',
    'footer.rights': 'All rights reserved.',
    'footer.security': 'Security policy',
    'products.title': 'Catalog',
    'products.breadcrumb_home': 'Home',
    'products.breadcrumb_products': 'Products',
    'products.search_placeholder': 'Search by name, number or platform...',
    'products.filters_platform': 'Platform',
    'products.filters_status': 'Status',
    'products.status_all': 'All',
    'products.status_available': 'Available',
    'products.status_sold': 'Sold',
    'products.sort_label': 'Sort by',
    'products.sort_num': 'Number',
    'products.sort_name': 'Name',
    'products.sort_platform': 'Platform',
    'products.sort_price': 'Price',
    'products.pagination_prev': 'Previous',
    'products.pagination_next': 'Next',
    'products.page_info': 'Page {current} of {total}',
    'products.loading': 'Loading catalog...',
    'products.error_load': 'Could not load the catalog. Check your connection or try again.',
    'products.retry': 'Retry',
    'products.empty': 'No products match the selected filters.',
    'products.table_num': '#',
    'products.table_product': 'Product',
    'products.table_platform': 'Platform',
    'products.table_price': 'Price',
    'products.table_stock': 'Stock',
    'products.table_status': 'Status',
    'products.status_available_label': 'Available',
    'products.status_sold_label': 'Sold',
    'products.modal_close': 'Close',
    'products.detail_platform': 'Platform',
    'products.detail_price': 'Price',
    'products.detail_stock': 'Stock',
    'products.detail_status': 'Status',
    'products.detail_instagram': 'View on Instagram',
    'products.detail_siglas': 'Detected acronyms',
    'products.detail_no_siglas': 'No acronyms detected.',
    'products.results_suffix': 'products found',
    'notfound.title': 'Page not found',
    'notfound.text': 'The page you are looking for does not exist or was moved.',
    'notfound.home': 'Back to home',
    'security.title': 'Security policy',
    'security.text1': 'We appreciate responsible disclosure of vulnerabilities.',
    'security.text2': 'If you find a vulnerability, write to security@doubleimpactstore.cl before disclosing it publicly.',
    'security.text3': 'Do not attempt to access other users data or exfiltrate more information than needed to demonstrate the vulnerability.',
    'security.acknowledgments_title': 'Security acknowledgments',
    'security.acknowledgments_empty': 'No researchers recognized yet. Be the first to report a vulnerability!'
  }
};

export const BLOG_ARTICLES = [
  {
    id: 'nintendo',
    es: {
      title: 'De cartas a consolas: la historia de Nintendo',
      body: [
        'Nintendo nació en 1889 en Kioto como fabricante de cartas hanafuda. Tras décadas explorando juguetes y máquinas de arcade, en 1983 lanzó la Famicom en Japón y en 1985 la NES en Occidente: la consola que rescató a la industria tras la crisis de los videojuegos de 1983.',
        'Su éxito se cimentó en franquicias como Super Mario Bros, The Legend of Zelda y Metroid, además de un estricto sistema de licencias para desarrolladores externos. La SNES (1990) consolidó su dominio durante la era de 16 bits.',
        'Hoy Nintendo sigue siendo un referente del diseño de videojuegos, y sus consolas y cartuchos retro son piezas muy valoradas por los coleccionistas.'
      ]
    },
    en: {
      title: 'From cards to consoles: the story of Nintendo',
      body: [
        'Nintendo was founded in 1889 in Kyoto as a manufacturer of Hanafuda playing cards. After decades exploring toys and arcade machines, in 1983 it launched the Famicom in Japan and in 1985 the NES in the West: the console that rescued the industry after the 1983 video game crash.',
        'Its success was built on franchises like Super Mario Bros, The Legend of Zelda and Metroid, plus a strict licensing system for third-party developers. The SNES (1990) cemented its dominance during the 16-bit era.',
        'Today Nintendo remains a benchmark of game design, and its retro consoles and cartridges are highly prized by collectors.'
      ]
    }
  },
  {
    id: 'sega',
    es: {
      title: 'La era dorada de Sega',
      body: [
        'Sega llegó a occidente con la Master System y alcanzó la cima con la Mega Drive (Genesis en América) en 1988: la consola de 16 bits que desafió a Nintendo con Sonic the Hedgehog como mascota.',
        'La "guerra de consolas" de los 90 impulsó campañas publicitarias memorables y un catálogo legendario: Streets of Rage, Golden Axe, Phantasy Star y Shinobi.',
        'Aunque Sega dejó el hardware en 2001, su legado retro —Mega Drive, Saturn y Dreamcast— sigue siendo muy demandado entre coleccionistas de todo el mundo.'
      ]
    },
    en: {
      title: 'The golden age of Sega',
      body: [
        'Sega reached the West with the Master System and peaked with the Mega Drive (Genesis in America) in 1988: the 16-bit console that challenged Nintendo with Sonic the Hedgehog as its mascot.',
        'The "console war" of the 90s produced memorable ad campaigns and a legendary library: Streets of Rage, Golden Axe, Phantasy Star and Shinobi.',
        'Although Sega left the hardware business in 2001, its retro legacy —Mega Drive, Saturn and Dreamcast— remains highly sought after by collectors worldwide.'
      ]
    }
  },
  {
    id: 'coleccionista',
    es: {
      title: 'Guía para coleccionistas: siglas y estados',
      body: [
        'Al comprar juegos retro originales encontrarás siglas que describen el estado del producto: CIB (caja, juego y manual), L (suelto) o S (sellado). Dominar este vocabulario evita malentendidos y compras equivocadas.',
        'Antes de comprar, revisa carátulas, manuales y el estado de discos o cartuchos. Pide fotos al vendedor y compara precios con plataformas internacionales.',
        'En DoubleImpactStore publicamos en el catálogo el estado exacto de cada juego usando estas siglas, para que sepas exactamente lo que recibirás.'
      ]
    },
    en: {
      title: "A collector's guide: acronyms and conditions",
      body: [
        'When buying original retro games you will find acronyms that describe the product condition: CIB (box, game and manual), L (loose) or S (sealed). Mastering this vocabulary avoids misunderstandings and wrong purchases.',
        'Before buying, check covers, manuals and the condition of discs or cartridges. Ask the seller for photos and compare prices with international platforms.',
        'At DoubleImpactStore we publish the exact condition of every game in the catalog using these acronyms, so you always know exactly what you will receive.'
      ]
    }
  }
];

export function getTheme() {
  let theme = DEFAULT_THEME;
  try {
    theme = window.localStorage.getItem(THEME_KEY) || DEFAULT_THEME;
  } catch (err) {
    theme = DEFAULT_THEME;
  }
  return theme === 'light' ? 'light' : 'dark';
}

export function setTheme(theme) {
  const value = theme === 'light' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', value);
  try {
    window.localStorage.setItem(THEME_KEY, value);
  } catch (err) {
    // sin almacenamiento: no-op
  }
  const btn = document.getElementById('theme-toggle');
  if (btn) {
    btn.setAttribute('aria-label', t(value === 'dark' ? 'controls.theme_light' : 'controls.theme_dark'));
  }
}

export function initTheme() {
  setTheme(getTheme());
}

export function getLang() {
  let lang = DEFAULT_LANG;
  try {
    lang = window.localStorage.getItem(LANG_KEY) || DEFAULT_LANG;
  } catch (err) {
    lang = DEFAULT_LANG;
  }
  return lang === 'en' ? 'en' : 'es';
}

export function t(key) {
  const lang = getLang();
  const value = translations[lang] && translations[lang][key];
  return value != null ? String(value) : key;
}

export function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
  });
  document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
  });
}

export function setLang(lang) {
  const value = lang === 'en' ? 'en' : 'es';
  try {
    window.localStorage.setItem(LANG_KEY, value);
  } catch (err) {
    // sin almacenamiento: no-op
  }
  document.documentElement.setAttribute('lang', value);
  applyTranslations();
  const btn = document.getElementById('lang-toggle');
  if (btn) {
    btn.textContent = value === 'es' ? 'EN' : 'ES';
    btn.setAttribute('aria-label', t('controls.lang'));
  }
  window.dispatchEvent(new CustomEvent('dis:langchange', { detail: { lang: value } }));
}

export function initLang() {
  setLang(getLang());
}

export function setFaqOpen(items, index) {
  (items || []).forEach((item, i) => {
    const open = i === index;
    item.classList.toggle('open', open);
    const btn = item.querySelector ? item.querySelector('.faq-question') : null;
    if (btn) btn.setAttribute('aria-expanded', String(open));
    const panel = item.querySelector ? item.querySelector('.faq-answer') : null;
    if (panel) panel.setAttribute('aria-hidden', String(!open));
  });
}

export function initFAQ() {
  const accordion = document.querySelector('.faq-accordion');
  if (!accordion) return;
  const items = [...accordion.querySelectorAll('.faq-item')];
  items.forEach((item, index) => {
    const button = item.querySelector('.faq-question');
    if (!button) return;
    button.addEventListener('click', () => setFaqOpen(items, index));
  });
  if (items.length > 0) setFaqOpen(items, 0);
}

let blogTrigger = null;

function openBlogModal(articleId) {
  const modal = document.getElementById('blog-modal');
  const body = document.getElementById('blog-modal-body');
  const article = BLOG_ARTICLES.find((a) => a.id === articleId);
  if (!modal || !body || !article) return;
  blogTrigger = document.activeElement;
  const lang = getLang();
  const content = article[lang] || article.es;
  body.innerHTML = '';
  const h2 = document.createElement('h2');
  h2.id = 'blog-modal-title';
  h2.textContent = content.title;
  const pList = content.body.map((paragraph) => {
    const p = document.createElement('p');
    p.textContent = paragraph;
    return p;
  });
  body.append(h2, ...pList);
  modal.hidden = false;
  document.body.classList.add('modal-open');
  const closeBtn = modal.querySelector('.modal-close');
  if (closeBtn) closeBtn.focus();
}

function closeBlogModal() {
  const modal = document.getElementById('blog-modal');
  if (!modal) return;
  modal.hidden = true;
  document.body.classList.remove('modal-open');
  if (blogTrigger && typeof blogTrigger.focus === 'function') blogTrigger.focus();
}

export function initBlogModals() {
  const modal = document.getElementById('blog-modal');
  if (!modal) return;
  document.querySelectorAll('[data-blog-card]').forEach((card) => {
    card.addEventListener('click', () => openBlogModal(card.getAttribute('data-blog-card')));
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openBlogModal(card.getAttribute('data-blog-card'));
      }
    });
  });
  const closeBtn = modal.querySelector('.modal-close');
  if (closeBtn) closeBtn.addEventListener('click', closeBlogModal);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeBlogModal();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.hidden) closeBlogModal();
  });
}

export function initMobileMenu() {
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('main-nav');
  if (!toggle || !nav) return;
  const close = () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', t('controls.menu_open'));
  };
  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? t('controls.menu_close') : t('controls.menu_open'));
  });
  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', close));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('open')) close();
  });
}

export function setNavActive(path) {
  const target = path || getCurrentPath();
  document.querySelectorAll('[data-nav]').forEach((link) => {
    const active = link.getAttribute('data-nav') === target;
    link.classList.toggle('nav-active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

function getCurrentPath() {
  const path = window.location.pathname.replace(/\/+$/, '');
  if (path.endsWith('productos.html') || path === '/productos') return '/productos';
  if (path.endsWith('security-policy.html') || path === '/security-policy') return '/security-policy';
  if (path.endsWith('security-acknowledgments.html') || path === '/security-acknowledgments') return '/security-acknowledgments';
  if (path.endsWith('404.html')) return '';
  return '/';
}

function initToggles() {
  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) themeBtn.addEventListener('click', () => setTheme(getTheme() === 'dark' ? 'light' : 'dark'));
  const langBtn = document.getElementById('lang-toggle');
  if (langBtn) langBtn.addEventListener('click', () => setLang(getLang() === 'es' ? 'en' : 'es'));
}

function initOfflineIndicator() {
  const indicator = document.getElementById('offline-indicator');
  if (!indicator) return;
  const show = () => {
    indicator.hidden = false;
  };
  const hide = () => {
    indicator.hidden = true;
  };
  window.addEventListener('offline', show);
  window.addEventListener('online', hide);
  if (navigator.onLine === false) show();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'dis-offline') show();
    });
  }
}

export function initUI() {
  initTheme();
  initLang();
  initToggles();
  initMobileMenu();
  initFAQ();
  initBlogModals();
  initOfflineIndicator();
  renderSocialLinks(document.querySelectorAll('[data-social]'));
}

export function getTranslations() {
  return translations;
}