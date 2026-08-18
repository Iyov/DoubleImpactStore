// Efemérides gaming del día
// Feature: double-impact-store, Requirements 13.1–13.3, 19.1

import { sanitizeHTML } from './utils.js';
import { t } from './ui.js';

export async function loadEfemerides() {
  const res = await fetch('js/efemerides.json', { cache: 'no-store' });
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

export function renderEfemeride(efemeride, container, lang) {
  if (!container) return;
  if (!efemeride) {
    container.style.display = 'none';
    return;
  }
  container.style.display = '';
  const content = efemeride[lang] || efemeride.ES || {};
  const title = sanitizeHTML(content.title || '');
  const text = sanitizeHTML(content.text || '');
  const detail = sanitizeHTML(content.det || '');

  container.innerHTML = `
    <article class="efemeride-card">
      <div class="efemeride-header">
        <span class="efemeride-icon" aria-hidden="true"><i class="fa-solid fa-calendar-days"></i></span>
        <div>
          <h3 class="efemeride-title">${title}</h3>
          <p class="efemeride-text">${text}</p>
        </div>
      </div>
      <button type="button" class="efemeride-toggle" aria-expanded="false">
        <span data-i18n="efemerides.read_more">${sanitizeHTML(t('efemerides.read_more'))}</span>
      </button>
      <div class="efemeride-detail" hidden>${detail}</div>
    </article>`;

  const toggle = container.querySelector('.efemeride-toggle');
  const detailEl = container.querySelector('.efemeride-detail');
  if (toggle && detailEl) {
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      detailEl.hidden = expanded;
      toggle.querySelector('[data-i18n]').textContent = expanded
        ? t('efemerides.read_more')
        : t('efemerides.read_less');
    });
  }
}