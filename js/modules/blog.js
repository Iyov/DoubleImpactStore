// Blog: artículos ES/EN y modal accesible (Escape, clic fuera, foco)
// Feature: double-impact-store, Requirements 14.1–14.3

import { getLang } from './i18n.js';

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
