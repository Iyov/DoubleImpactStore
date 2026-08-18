// Configuración de redes sociales y contacto.
// Completa las URLs pendientes (url vacía = botón oculto).
// NOTA: las cuentas @Ropavejero.Retro y @nekketsustore son las cuentas originales
// de la unión que da origen a DoubleImpactStore (ver requirements.md).

export const SOCIAL_LINKS = [
  {
    id: 'instagram1',
    icon: 'fa-brands fa-instagram',
    label: 'Instagram DoubleImpactStore',
    i18n: 'social.instagram1',
    url: 'https://www.instagram.com/doubleimpactstore/'
  },
  {
    id: 'instagram2',
    icon: 'fa-brands fa-instagram',
    label: 'Instagram @Ropavejero.Retro',
    i18n: 'social.instagram2',
    url: 'https://www.instagram.com/ropavejero.retro/'
  },
  {
    id: 'instagram3',
    icon: 'fa-brands fa-instagram',
    label: 'Instagram @NekketsuStore',
    i18n: 'social.instagram3',
    url: 'https://www.instagram.com/nekketsustore/'
  },
  {
    id: 'threads',
    icon: 'fa-brands fa-threads',
    label: 'Threads',
    i18n: 'social.threads',
    url: 'https://www.threads.com/@doubleimpactstore/'
  },
  {
    id: 'x',
    icon: 'fa-brands fa-x-twitter',
    label: 'Twitter / X',
    i18n: 'social.x',
    url: 'https://x.com/DoubleImpactSpA'
  },
  {
    id: 'youtube',
    icon: 'fa-brands fa-youtube',
    label: 'YouTube',
    i18n: 'social.youtube',
    url: 'https://www.youtube.com/@DoubleImpactStoreSpA'
  },
  {
    id: 'whatsapp',
    icon: 'fa-brands fa-whatsapp',
    label: 'WhatsApp',
    i18n: 'social.whatsapp',
    url: 'https://wa.me/56967691585'
  },
  {
    id: 'catalog',
    icon: 'fa-solid fa-table-list',
    label: 'Catálogo Google Sheets',
    i18n: 'contact.catalog',
    url: 'https://docs.google.com/spreadsheets/d/1ekyKZHhUIwQDFtqEblnJN_5SNeYEqOlKOja1wnCutLY'
  },
  {
    id: 'github',
    icon: 'fa-brands fa-github',
    label: 'GitHub',
    i18n: 'social.github',
    url: 'https://github.com/Iyov/DoubleImpactStore'
  }
];

export function renderSocialLinks(containers) {
  if (!containers) return;
  containers.forEach((container) => {
    if (!container) return;
    container.innerHTML = '';
    const labeled = container.getAttribute('data-social') === 'labeled';
    const links = SOCIAL_LINKS.filter((item) => item.url && item.url.trim() !== '');
    links.forEach((item) => {
      const anchor = document.createElement('a');
      anchor.className = labeled ? 'contact-item' : 'social-link';
      anchor.href = item.url;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      anchor.setAttribute('aria-label', item.label);
      const icon = document.createElement('i');
      icon.className = labeled ? `contact-icon ${item.icon}` : item.icon;
      icon.setAttribute('aria-hidden', 'true');
      anchor.appendChild(icon);
      if (labeled) {
        const label = document.createElement('span');
        label.className = 'contact-label';
        if (item.i18n) label.setAttribute('data-i18n', item.i18n);
        label.textContent = item.label;
        anchor.appendChild(label);
      }
      container.appendChild(anchor);
    });
  });

  // Botón de WhatsApp dedicado (se oculta si no hay número configurado)
  const whatsapp = document.getElementById('whatsapp-cta');
  if (whatsapp) {
    const item = SOCIAL_LINKS.find((entry) => entry.id === 'whatsapp');
    if (item && item.url) {
      whatsapp.href = item.url;
      whatsapp.hidden = false;
    } else {
      whatsapp.hidden = true;
    }
  }
}