// Configuración de redes sociales y contacto.
// Completa las URLs pendientes (url vacía = botón oculto).
// NOTA: las cuentas @Ropavejero.Retro y @nekketsustore son las cuentas originales
// de la unión que da origen a DoubleImpactStore (ver requirements.md).

export const SOCIAL_LINKS = [
  {
    id: 'instagram1',
    icon: 'fa-brands fa-instagram',
    label: 'Instagram @Ropavejero.Retro',
    url: 'https://www.instagram.com/ropavejero.retro/'
  },
  {
    id: 'instagram2',
    icon: 'fa-brands fa-instagram',
    label: 'Instagram @nekketsustore',
    url: 'https://www.instagram.com/nekketsustore/'
  },
  {
    id: 'tiktok',
    icon: 'fa-brands fa-tiktok',
    label: 'TikTok',
    url: ''
  },
  {
    id: 'youtube',
    icon: 'fa-brands fa-youtube',
    label: 'YouTube',
    url: ''
  },
  {
    id: 'facebook',
    icon: 'fa-brands fa-facebook',
    label: 'Facebook',
    url: ''
  },
  {
    id: 'threads',
    icon: 'fa-brands fa-threads',
    label: 'Threads',
    url: ''
  },
  {
    id: 'x',
    icon: 'fa-brands fa-x-twitter',
    label: 'Twitter / X',
    url: ''
  },
  {
    id: 'whatsapp',
    icon: 'fa-brands fa-whatsapp',
    label: 'WhatsApp',
    url: '' // Pendiente: configurar el número en formato https://wa.me/569XXXXXXXX
  },
  {
    id: 'catalog',
    icon: 'fa-solid fa-table-list',
    label: 'Catálogo Google Sheets',
    url: 'https://docs.google.com/spreadsheets/d/1ekyKZHhUIwQDFtqEblnJN_5SNeYEqOlKOja1wnCutLY'
  },
  {
    id: 'github',
    icon: 'fa-brands fa-github',
    label: 'GitHub',
    url: 'https://github.com/Iyov/DoubleImpactStore'
  }
];

export function renderSocialLinks(containers) {
  if (!containers) return;
  containers.forEach((container) => {
    if (!container) return;
    container.innerHTML = '';
    const links = SOCIAL_LINKS.filter((item) => item.url && item.url.trim() !== '');
    links.forEach((item) => {
      const anchor = document.createElement('a');
      anchor.className = 'social-link';
      anchor.href = item.url;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      anchor.setAttribute('aria-label', item.label);
      anchor.innerHTML = `<i class="${item.icon}" aria-hidden="true"></i>`;
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