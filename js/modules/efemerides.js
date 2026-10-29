// Efemérides gaming del día
// Feature: double-impact-store, Requirements 13.1–13.3, 19.1

import { sanitizeHTML } from './utils.js';
import { getLang, t } from './i18n.js';

export async function loadEfemerides() {
  const res = await fetch('./js/efemerides.json', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`No se pudo cargar el archivo de efemérides (HTTP ${res.status})`);
  }
  return res.json();
}

export function getTodayEfemeride(data, date = new Date()) {
  if (!data || !Array.isArray(data.efemerides)) return null;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const key = `${day}/${month}`;
  return data.efemerides.find((entry) => entry.date === key) || null;
}

// "18/08" -> "18 de agosto" (es) / "August 18" (en)
export function formatEfemerideDate(ddmm, lang) {
  const [day, month] = String(ddmm || '').split('/').map(Number);
  if (!day || !month) return ddmm || '';
  const locale = lang === 'en' ? 'en-US' : 'es-CL';
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long' }).format(new Date(2000, month - 1, day));
}

export function renderEfemeride(efemeride, container, lang) {
  if (!container) return;
  const section = container.closest('section');
  if (!efemeride) {
    if (section) section.style.display = 'none';
    return;
  }
  if (section) section.style.display = '';
  const dateEl = document.getElementById('efemerides-date');
  if (dateEl) dateEl.textContent = formatEfemerideDate(efemeride.date, lang);
  // El JSON usa claves ES/EN; getLang() devuelve 'es'/'en'
  const content = efemeride[String(lang).toUpperCase()] || efemeride.ES || {};
  const title = sanitizeHTML(content.title || '');
  const text = sanitizeHTML(content.text || '');
  const detail = sanitizeHTML(content.det || '');

  container.innerHTML = `
    <article class="efemeride-item">
      <div class="efemeride-header">
        <span class="efemeride-icon" aria-hidden="true"><i class="fa-solid fa-calendar-day"></i></span>
        <div>
          <h3 class="efemeride-title">${title}</h3>
          <p class="efemeride-text">${text}</p>
        </div>
      </div>
      <details class="efemeride-details">
        <summary data-i18n="efemerides.read_more">${sanitizeHTML(t('efemerides.read_more'))}</summary>
        <p class="efemeride-detail">${detail}</p>
      </details>
    </article>`;
}

export async function initEfemerides() {
  const container = document.getElementById('efemerides-content');
  if (!container) return;
  let efemeride;
  try {
    efemeride = getTodayEfemeride(await loadEfemerides());
  } catch {
    const section = container.closest('section');
    if (section) section.style.display = 'none';
    return;
  }
  renderEfemeride(efemeride, container, getLang());
  window.addEventListener('dis:langchange', (event) => renderEfemeride(efemeride, container, event.detail.lang));
}
