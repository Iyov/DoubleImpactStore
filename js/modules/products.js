// Catálogo: carga desde Google Sheets CSV, filtros, paginación, tabla y modal
// Feature: double-impact-store, Requirements 4.1–4.9, 5.2–5.4, 19.1

import { setCache, getCache, clearCache, CACHE_KEY, CATALOG_TTL_MS } from './cache.js';
import { sanitizeHTML, validateSearch, debounce, sortProducts, handleError } from './utils.js';
import { loadSiglas, detectSiglas, renderSiglasTooltips, renderSiglasSection } from './siglas.js';
import { getLang, t } from './ui.js';
import { logger } from './logger.js';

export const GOOGLE_SHEETS_CSV_URL = 'https://docs.google.com/spreadsheets/d/1ekyKZHhUIwQDFtqEblnJN_5SNeYEqOlKOja1wnCutLY/gviz/tq?tqx=out:csv';
export const DEFAULT_PER_PAGE = 25;

let allProducts = [];
let siglasDict = {};
let currentLang = getLang();
let modalTrigger = null;

const state = {
  query: '',
  platforms: new Set(),
  status: 'available',
  sortField: 'num',
  sortAsc: true,
  page: 1,
  perPage: DEFAULT_PER_PAGE
};

export function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      field = '';
      rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows
    .map((r) => r.map((cell) => cell.trim()))
    .filter((r) => r.some((cell) => cell !== ''));
}

// Mapa de columnas del catálogo. Posicional por defecto (la hoja real solo
// etiqueta Product/Platform/Link y deja el resto de encabezados vacíos).
const COLUMN_MAP = {
  num: 0,
  name: 1,
  platform: 2,
  price: 3,
  neto: 4,
  stock: 5,
  link: 6,
  sold: 7
};

function detectColumnMap(rows) {
  const headerIdx = rows.findIndex((row) => row.includes('Product'));
  if (headerIdx < 0) return { map: { ...COLUMN_MAP }, dataStart: 1 };
  const header = rows[headerIdx];
  const pos = (col) => header.indexOf(col);
  const map = { ...COLUMN_MAP };
  const named = {
    num: 'Num',
    name: 'Product',
    platform: 'Platform',
    price: 'Price',
    neto: 'Neto',
    stock: 'Stock',
    link: 'Link',
    sold: 'Sold'
  };
  for (const key of Object.keys(named)) {
    const p = pos(named[key]);
    if (p >= 0) map[key] = p;
  }
  return { map, dataStart: headerIdx + 1 };
}

function isValidProductRow(p) {
  const name = p.name.trim().toLowerCase();
  if (!name || name === 'product' || name === 'total') return false;
  const num = Number(p.num);
  return Number.isInteger(num) && num > 0;
}

export function parseCatalogCSV(text) {
  const rows = parseCSV(text);
  if (rows.length < 2) return [];
  const { map, dataStart } = detectColumnMap(rows);
  const cell = (row, idx) => (row[idx] != null ? row[idx] : '');

  return rows
    .slice(dataStart)
    .map((row) => {
      const link = cell(row, map.link);
      return {
        num: cell(row, map.num),
        name: cell(row, map.name),
        platform: cell(row, map.platform),
        price: cell(row, map.price),
        neto: cell(row, map.neto),
        stock: cell(row, map.stock),
        instagramLink: link ? `https://www.instagram.com/p/${link}/` : '',
        sold: cell(row, map.sold) === '1'
      };
    })
    .filter(isValidProductRow);
}

export function filterProducts(products, query, platforms, showSold) {
  const q = validateSearch(query).toLowerCase();
  const platformSet = new Set(platforms || []);
  return (products || []).filter((p) => {
    if (!showSold && p.sold) return false;
    if (q) {
      const haystack = `${p.name} ${p.platform} ${p.num}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (platformSet.size > 0 && !platformSet.has(p.platform)) return false;
    return true;
  });
}

export function paginateProducts(products, page, perPage) {
  const total = (products || []).length;
  const size = perPage > 0 ? perPage : DEFAULT_PER_PAGE;
  const totalPages = Math.max(1, Math.ceil(total / size));
  const current = Math.min(Math.max(1, page || 1), totalPages);
  const start = (current - 1) * size;
  return {
    items: (products || []).slice(start, start + size),
    total,
    totalPages,
    page: current,
    perPage: size
  };
}

export function renderProductTable(products, container) {
  if (!container) return;
  container.innerHTML = '';
  if (!products || products.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = `<td colspan="6" class="empty-row">${sanitizeHTML(t('products.empty'))}</td>`;
    container.appendChild(row);
    return;
  }
  products.forEach((product) => {
    const tr = document.createElement('tr');
    if (product.sold) tr.classList.add('product-sold');
    tr.setAttribute('data-product-id', String(product.num));

    const numTd = document.createElement('td');
    numTd.setAttribute('data-label', t('products.table_num'));
    numTd.textContent = product.num;

    const nameTd = document.createElement('td');
    nameTd.setAttribute('data-label', t('products.table_product'));
    nameTd.className = 'product-name';
    nameTd.textContent = product.name;
    const siglas = detectSiglas(product.name, siglasDict);
    if (siglas.length > 0) renderSiglasTooltips(nameTd, siglas, siglasDict, currentLang);

    const platformTd = document.createElement('td');
    platformTd.setAttribute('data-label', t('products.table_platform'));
    platformTd.textContent = product.platform;

    const priceTd = document.createElement('td');
    priceTd.setAttribute('data-label', t('products.table_price'));
    priceTd.textContent = product.neto || product.price;

    const stockTd = document.createElement('td');
    stockTd.setAttribute('data-label', t('products.table_stock'));
    stockTd.textContent = product.stock;

    const statusTd = document.createElement('td');
    statusTd.setAttribute('data-label', t('products.table_status'));
    const badge = document.createElement('span');
    badge.className = product.sold ? 'badge badge--sold' : 'badge badge--available';
    badge.textContent = product.sold ? t('products.status_sold_label') : t('products.status_available_label');
    statusTd.appendChild(badge);

    tr.append(numTd, nameTd, platformTd, priceTd, stockTd, statusTd);
    tr.tabIndex = 0;
    tr.addEventListener('click', () => openProductModal(product, siglasDict, currentLang));
    tr.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openProductModal(product, siglasDict, currentLang);
      }
    });
    container.appendChild(tr);
  });
}

export function openProductModal(product, siglas, lang) {
  const modal = document.getElementById('product-modal');
  const body = document.getElementById('product-modal-body');
  if (!modal || !body || !product) return;
  modalTrigger = document.activeElement;

  body.innerHTML = '';
  const detected = detectSiglas(product.name, siglas || {});

  const name = document.createElement('h2');
  name.id = 'product-modal-title';
  name.textContent = product.name;
  const siglasHits = detectSiglas(product.name, siglas || {});
  if (siglasHits.length > 0) renderSiglasTooltips(name, siglasHits, siglas || {}, lang);
  body.appendChild(name);

  const dl = document.createElement('dl');
  dl.className = 'product-detail-list';
  const addRow = (label, value) => {
    const dt = document.createElement('dt');
    dt.textContent = label;
    const dd = document.createElement('dd');
    dd.textContent = value;
    dl.append(dt, dd);
  };
  addRow(t('products.detail_platform'), product.platform);
  addRow(t('products.detail_price'), product.neto || product.price);
  addRow(t('products.detail_stock'), product.stock || '—');
  addRow(t('products.detail_status'), product.sold ? t('products.status_sold_label') : t('products.status_available_label'));
  body.appendChild(dl);

  if (product.instagramLink) {
    const link = document.createElement('a');
    link.className = 'btn btn--secondary';
    link.href = product.instagramLink;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = t('products.detail_instagram');
    body.appendChild(link);
  }

  const siglasTitle = document.createElement('h3');
  siglasTitle.className = 'product-detail-siglas-title';
  siglasTitle.textContent = t('products.detail_siglas');
  body.appendChild(siglasTitle);
  const siglasSection = document.createElement('div');
  siglasSection.className = 'product-detail-siglas';
  body.appendChild(siglasSection);
  renderSiglasSection(siglasSection, detected, siglas || {}, lang);
  if (detected.length === 0) {
    const none = document.createElement('p');
    none.textContent = t('products.detail_no_siglas');
    siglasSection.appendChild(none);
  }

  modal.hidden = false;
  document.body.classList.add('modal-open');
  const closeBtn = modal.querySelector('.modal-close');
  if (closeBtn) closeBtn.focus();
}

function closeProductModal() {
  const modal = document.getElementById('product-modal');
  if (!modal) return;
  modal.hidden = true;
  document.body.classList.remove('modal-open');
  if (modalTrigger && typeof modalTrigger.focus === 'function') modalTrigger.focus();
}

function bindModal() {
  const modal = document.getElementById('product-modal');
  if (!modal) return;
  const closeBtn = modal.querySelector('.modal-close');
  if (closeBtn) closeBtn.addEventListener('click', closeProductModal);
  modal.addEventListener('click', (event) => {
    if (event.target === modal || (event.target.dataset && event.target.dataset.close !== undefined)) closeProductModal();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.hidden) closeProductModal();
  });
}

function getPlatforms() {
  const set = new Set();
  allProducts.forEach((p) => {
    if (p.platform) set.add(p.platform);
  });
  return [...set].sort((a, b) => a.localeCompare(b, 'es', { numeric: true }));
}

function getFiltered() {
  const showSold = state.status === 'all' || state.status === 'sold';
  let filtered = filterProducts(allProducts, state.query, [...state.platforms], showSold);
  if (state.status === 'sold') filtered = filtered.filter((p) => p.sold);
  return sortProducts(filtered, state.sortField, state.sortAsc);
}

function renderPagination(pag) {
  const container = document.querySelector('#catalog-pagination');
  if (!container) return;
  container.innerHTML = '';
  if (pag.totalPages <= 1) return;

  const info = document.createElement('span');
  info.className = 'pagination-info';
  info.textContent = t('products.page_info').replace('{current}', String(pag.page)).replace('{total}', String(pag.totalPages));

  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'pagination-btn';
  prev.textContent = t('products.pagination_prev');
  prev.disabled = pag.page <= 1;
  prev.addEventListener('click', () => {
    state.page -= 1;
    renderCatalog();
  });

  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'pagination-btn';
  next.textContent = t('products.pagination_next');
  next.disabled = pag.page >= pag.totalPages;
  next.addEventListener('click', () => {
    state.page += 1;
    renderCatalog();
  });

  const pageNumbers = document.createElement('div');
  pageNumbers.className = 'pagination-pages';
  for (let i = 1; i <= pag.totalPages; i++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pagination-page';
    btn.textContent = String(i);
    btn.setAttribute('aria-label', `${t('products.page_info').replace('{current}', String(i)).replace('{total}', String(pag.totalPages))}`);
    if (i === pag.page) {
      btn.classList.add('current');
      btn.setAttribute('aria-current', 'page');
    }
    btn.addEventListener('click', () => {
      state.page = i;
      renderCatalog();
    });
    pageNumbers.appendChild(btn);
  }

  container.append(info, prev, pageNumbers, next);
}

function renderPlatformFilters() {
  const container = document.querySelector('#platform-filters');
  if (!container) return;
  container.innerHTML = '';
  const platforms = getPlatforms();
  platforms.forEach((platform) => {
    const label = document.createElement('label');
    label.className = 'platform-chip';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = platform;
    checkbox.checked = state.platforms.has(platform);
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) state.platforms.add(platform);
      else state.platforms.delete(platform);
      state.page = 1;
      renderCatalog();
    });
    const span = document.createElement('span');
    span.textContent = platform;
    label.append(checkbox, span);
    container.appendChild(label);
  });
}

function bindControls() {
  const search = document.querySelector('#catalog-search');
  if (search) {
    const debounced = debounce(() => {
      state.query = search.value;
      state.page = 1;
      renderCatalog();
    }, 300);
    search.addEventListener('input', debounced);
  }
  const status = document.querySelector('#catalog-status');
  if (status) {
    status.addEventListener('change', () => {
      state.status = status.value;
      state.page = 1;
      renderCatalog();
    });
  }
  const sort = document.querySelector('#catalog-sort');
  if (sort) {
    sort.addEventListener('change', () => {
      const [field, dir] = sort.value.split(':');
      state.sortField = field || 'num';
      state.sortAsc = dir !== 'desc';
      state.page = 1;
      renderCatalog();
    });
  }
}

function updateResultsInfo() {
  const el = document.querySelector('#catalog-results');
  if (!el) return;
  const filtered = getFiltered();
  el.textContent = `${filtered.length} ${t('products.results_suffix')}`;
}

function renderCatalog() {
  const tbody = document.querySelector('#catalog-tbody');
  if (!tbody) return;
  renderPlatformFilters();
  const filtered = getFiltered();
  const pag = paginateProducts(filtered, state.page, state.perPage);
  renderProductTable(pag.items, tbody);
  renderPagination(pag);
  updateResultsInfo();
}

function showLoading() {
  const status = document.querySelector('#catalog-status-area');
  if (status) status.textContent = t('products.loading');
  const container = document.querySelector('#catalog-container');
  if (container) {
    container.querySelectorAll('.catalog-error').forEach((el) => el.remove());
  }
}

function showError() {
  const container = document.querySelector('#catalog-container');
  if (!container) return;
  const tbody = document.querySelector('#catalog-tbody');
  if (tbody) tbody.innerHTML = '';
  const status = document.querySelector('#catalog-status-area');
  if (status) status.textContent = '';

  const errorBox = document.createElement('div');
  errorBox.className = 'catalog-error';
  errorBox.setAttribute('role', 'alert');
  const message = document.createElement('p');
  message.textContent = t('products.error_load');
  const retry = document.createElement('button');
  retry.type = 'button';
  retry.className = 'btn btn--primary';
  retry.textContent = t('products.retry');
  retry.addEventListener('click', retryLoadCatalog);
  errorBox.append(message, retry);
  container.prepend(errorBox);
}

export async function fetchCatalog() {
  const res = await fetch(GOOGLE_SHEETS_CSV_URL, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Error al cargar el catálogo (HTTP ${res.status})`);
  const text = await res.text();
  const products = parseCatalogCSV(text);
  if (products.length === 0) throw new Error('El catálogo está vacío o el CSV no tiene el formato esperado');
  return products;
}

export async function initCatalog() {
  const container = document.querySelector('#catalog-container');
  if (!container) return;
  showLoading();
  bindModal();
  bindControls();
  try {
    currentLang = getLang();
    siglasDict = await loadSiglas();
    let data = getCache(CACHE_KEY);
    if (!data) {
      data = await fetchCatalog();
      setCache(CACHE_KEY, data, CATALOG_TTL_MS);
    }
    allProducts = data;
    renderCatalog();
    window.addEventListener('dis:langchange', () => {
      currentLang = getLang();
      renderCatalog();
    });
  } catch (err) {
    handleError('catalog', err);
    logger.error('No se pudo cargar el catálogo', err);
    showError();
  }
}

export function retryLoadCatalog() {
  clearCache(CACHE_KEY);
  initCatalog();
}