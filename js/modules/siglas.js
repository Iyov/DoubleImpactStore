// Sistema de siglas: carga, detección y renderizado
// Feature: double-impact-store, Requirements 5.1–5.5, 19.1

import { sanitizeHTML } from './utils.js';

export async function loadSiglas() {
  const res = await fetch('js/siglas.json', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`No se pudo cargar el diccionario de siglas (HTTP ${res.status})`);
  }
  return res.json();
}

// Una sigla solo cuenta como token: sin letra ni número pegado antes o después
// (si no, "Turismo" contendría MO y "Romance" CE).
function siglaPattern(keys) {
  const alternatives = [...keys].sort((a, b) => b.length - a.length).map(escapeRegex).join('|');
  return new RegExp(`(?<![\\p{L}\\p{N}])(?:${alternatives})(?![\\p{L}\\p{N}])`, 'giu');
}

// Posiciones [inicio, fin) de cada aparición de la sigla en el texto
function occurrences(text, key) {
  return [...text.matchAll(siglaPattern([key]))].map((m) => [m.index, m.index + m[0].length]);
}

export function detectSiglas(productName, dict) {
  const text = String(productName == null ? '' : productName);
  const keys = Object.keys(dict || {}).sort((a, b) => b.length - a.length);
  const found = [];
  const covered = [];
  for (const key of keys) {
    const ranges = occurrences(text, key);
    // Una sigla corta no cuenta si solo aparece dentro de una más larga ya detectada (CIB dentro de CIB+)
    const standalone = ranges.some(([start, end]) => !covered.some(([s, e]) => start >= s && end <= e));
    if (standalone) {
      found.push(key);
      covered.push(...ranges);
    }
  }
  return found;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Todo el texto (viene de Google Sheets) se sanitiza: tanto las siglas como lo que hay entre ellas
function wrapSiglasInText(text, siglas, dict, lang) {
  const source = String(text);
  if (!siglas || siglas.length === 0) return sanitizeHTML(source);
  let html = '';
  let last = 0;
  for (const match of source.matchAll(siglaPattern(siglas))) {
    const canonical = siglas.find((k) => k.toLowerCase() === match[0].toLowerCase()) || match[0];
    const def = (dict[canonical] && dict[canonical][lang]) || (dict[canonical] && dict[canonical].es) || '';
    const safeKey = sanitizeHTML(canonical);
    const safeDef = sanitizeHTML(def);
    html += sanitizeHTML(source.slice(last, match.index));
    html += `<span class="sigla-tooltip" tabindex="0" role="button" data-sigla="${safeKey}" aria-label="${safeKey}: ${safeDef}">${sanitizeHTML(match[0])}<span class="sigla-tooltip__text" role="tooltip">${safeKey}: ${safeDef}</span></span>`;
    last = match.index + match[0].length;
  }
  return html + sanitizeHTML(source.slice(last));
}

export function renderSiglasTooltips(el, siglas, dict, lang) {
  if (!el) return;
  const text = el.textContent || '';
  el.innerHTML = wrapSiglasInText(text, siglas, dict, lang);
}

export function renderSiglasSection(container, siglas, dict, lang) {
  if (!container) return;
  const keys = [...(siglas || [])].sort((a, b) => a.localeCompare(b));
  if (keys.length === 0) {
    container.hidden = true;
    container.innerHTML = '';
    return;
  }
  container.hidden = false;
  const rows = keys
    .map((key) => {
      const def = (dict[key] && dict[key][lang]) || (dict[key] && dict[key].es) || '';
      return `<li class="sigla-item"><span class="sigla-key">${sanitizeHTML(key)}</span><span class="sigla-def">${sanitizeHTML(def)}</span></li>`;
    })
    .join('');
  container.innerHTML = `<ul class="sigla-list">${rows}</ul>`;
}