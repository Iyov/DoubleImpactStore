// Posts de Instagram: renderizado, filtros por consola y fechas relativas
// Feature: double-impact-store, Requirements 6.1–6.7, 19.1

import { t } from './ui.js';

const PLACEHOLDER_IMAGE = 'img/placeholder-post.webp';

let currentPosts = [];
let currentAliases = null;

export async function loadAliases() {
  const res = await fetch('js/console_aliases.json', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`No se pudieron cargar los aliases de consolas (HTTP ${res.status})`);
  }
  return res.json();
}

export function detectConsole(post, aliases) {
  if (!aliases || !post) return null;
  const title = String(post.title || '');
  for (const [key, entry] of Object.entries(aliases)) {
    if (Array.isArray(entry.aliases) && entry.aliases.some((alias) => title.includes(alias))) {
      return key;
    }
  }
  return null;
}

export function filterPostsByConsole(posts, consoleKey, aliases) {
  if (consoleKey === 'all' || !consoleKey) return [...(posts || [])];
  return (posts || []).filter((post) => detectConsole(post, aliases) === consoleKey);
}

const UNIT_MS = {
  minute: 60 * 1000,
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
  year: 365 * 24 * 60 * 60 * 1000
};

const UNIT_NAMES = {
  es: { minute: 'minuto', hour: 'hora', day: 'día', week: 'semana', month: 'mes', year: 'año' },
  en: { minute: 'minute', hour: 'hour', day: 'day', week: 'week', month: 'month', year: 'year' }
};

function pluralize(lang, noun, count) {
  if (lang === 'en') return count === 1 ? noun : `${noun}s`;
  if (noun === 'día') return count === 1 ? 'día' : 'días';
  if (noun === 'mes') return count === 1 ? 'mes' : 'meses';
  return count === 1 ? noun : `${noun}s`;
}

function relativeValue(diffMs) {
  const abs = Math.abs(diffMs);
  if (abs < UNIT_MS.minute) return null;
  if (abs < UNIT_MS.hour) return { value: Math.round(diffMs / UNIT_MS.minute), unit: 'minute' };
  if (abs < UNIT_MS.day) return { value: Math.round(diffMs / UNIT_MS.hour), unit: 'hour' };
  if (abs < UNIT_MS.week) return { value: Math.round(diffMs / UNIT_MS.day), unit: 'day' };
  if (abs < UNIT_MS.month) return { value: Math.round(diffMs / UNIT_MS.week), unit: 'week' };
  if (abs < UNIT_MS.year) return { value: Math.round(diffMs / UNIT_MS.month), unit: 'month' };
  return { value: Math.round(diffMs / UNIT_MS.year), unit: 'year' };
}

export function formatRelativeDate(date, lang) {
  const time = date instanceof Date ? date.getTime() : new Date(date).getTime();
  if (Number.isNaN(time)) return '';
  const diffMs = time - Date.now();
  const rel = relativeValue(diffMs);
  if (!rel) return lang === 'en' ? 'just now' : 'ahora mismo';
  const count = Math.abs(rel.value);
  const noun = pluralize(lang, UNIT_NAMES[lang][rel.unit], count);
  if (lang === 'en') return `${count} ${noun} ago`;
  return `Hace ${count} ${noun}`;
}

function getActiveLang() {
  try {
    return window.localStorage.getItem('dis_lang') || 'es';
  } catch {
    return 'es';
  }
}

function buildPostCard(post, lang, aliases) {
  const article = document.createElement('article');
  article.className = 'ig-card';
  const consoleKey = detectConsole(post, aliases);
  if (consoleKey) article.setAttribute('data-console', consoleKey);

  const link = document.createElement('a');
  link.className = 'ig-card__link';
  link.href = post.link || '#';
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.setAttribute('aria-label', `${t('instagram.open')}: ${post.title || ''}`);

  const base = String(post.image || '').replace(/\.[^.]+$/, '');
  const webpSrcset = [400, 800, 1200].map((w) => `${base}_${w}.webp ${w}w`).join(', ');

  const picture = document.createElement('picture');
  const source = document.createElement('source');
  source.type = 'image/webp';
  source.srcset = webpSrcset;
  source.sizes = '(max-width: 768px) 100vw, 360px';

  const img = document.createElement('img');
  img.src = `${base}.webp`;
  img.srcset = webpSrcset;
  img.sizes = '(max-width: 768px) 100vw, 360px';
  img.alt = post.title || 'Post de Instagram';
  img.loading = 'lazy';
  img.width = 800;
  img.height = 800;
  img.addEventListener('error', () => {
    img.removeAttribute('srcset');
    img.src = PLACEHOLDER_IMAGE;
  });
  picture.append(source, img);

  const body = document.createElement('div');
  body.className = 'ig-card__body';
  const title = document.createElement('h3');
  title.className = 'ig-card__title';
  title.textContent = post.title || '';
  const meta = document.createElement('p');
  meta.className = 'ig-card__meta';
  const date = document.createElement('time');
  date.dateTime = post.date || '';
  date.textContent = formatRelativeDate(post.date, lang);
  const likes = document.createElement('span');
  likes.className = 'ig-card__likes';
  likes.textContent = post.likes != null ? `❤ ${post.likes}` : '';
  meta.append(date, likes);
  const desc = document.createElement('p');
  desc.className = 'ig-card__desc';
  desc.textContent = (post.description || '').slice(0, 220);
  body.append(title, meta, desc);

  link.append(picture, body);
  article.appendChild(link);
  return article;
}

export function initInstagram(posts, aliases) {
  const root = document.querySelector('#instagram-root');
  if (!root) return;
  currentPosts = posts || [];
  currentAliases = aliases || null;
  root.dataset.ready = '1';

  if (currentPosts.length === 0) {
    root.innerHTML = `<p class="ig-empty">${t('instagram.empty')}</p>`;
    return;
  }
  root.innerHTML = '';

  const filters = document.createElement('div');
  filters.className = 'ig-filters';
  filters.setAttribute('role', 'group');
  filters.setAttribute('aria-label', t('instagram.filters_label'));

  const buttons = [{ key: 'all', label: t('instagram.filter_all') }];
  const seen = new Set(['all']);
  for (const post of currentPosts) {
    const key = detectConsole(post, currentAliases);
    if (key && !seen.has(key)) {
      seen.add(key);
      buttons.push({ key, label: (currentAliases && currentAliases[key] && currentAliases[key].label) || key });
    }
  }

  const grid = document.createElement('div');
  grid.className = 'ig-grid';

  function render(filterKey) {
    grid.innerHTML = '';
    const filtered = filterPostsByConsole(currentPosts, filterKey, currentAliases);
    filtered.forEach((post) => grid.appendChild(buildPostCard(post, getActiveLang(), currentAliases)));
  }

  buttons.forEach(({ key, label }) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ig-filter-btn';
    btn.textContent = label;
    btn.dataset.filter = key;
    btn.setAttribute('aria-pressed', String(key === 'all'));
    btn.addEventListener('click', () => {
      filters.querySelectorAll('.ig-filter-btn').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === key)));
      render(key);
    });
    filters.appendChild(btn);
  });

  root.append(filters, grid);
  render('all');
}

export function rerenderInstagram() {
  const root = document.querySelector('#instagram-root');
  if (!root || root.dataset.ready !== '1') return;
  const activeBtn = root.querySelector('.ig-filter-btn[aria-pressed="true"]');
  const active = activeBtn ? activeBtn.dataset.filter : 'all';
  initInstagram(currentPosts, currentAliases);
  const restored = root.querySelector(`.ig-filter-btn[data-filter="${active}"]`);
  if (restored) {
    root.querySelectorAll('.ig-filter-btn').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === active)));
    restored.click();
  }
}

export async function initInstagramSection(posts) {
  let aliases = null;
  try {
    aliases = await loadAliases();
  } catch (err) {
    // Sin aliases: los posts se muestran sin filtros por consola.
  }
  initInstagram(posts || [], aliases);
}