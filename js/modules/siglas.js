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

export function detectSiglas(productName, dict) {
  const upper = String(productName == null ? '' : productName).toUpperCase();
  const keys = Object.keys(dict || {}).sort((a, b) => b.length - a.length);
  const found = new Set();
  for (const key of keys) {
    const needle = key.toUpperCase();
    if (needle.length === 1) {
      // Siglas de 1 carácter (M, L, S, K, C) solo como token aislado
      if (new RegExp(`(?:^|[^A-Z0-9])${escapeRegex(needle)}(?:[^A-Z0-9]|$)`, 'u').test(upper)) {
        found.add(key);
      }
    } else if (upper.includes(needle)) {
      found.add(key);
    }
  }
  return [...found];
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function wrapSiglasInText(text, siglas, dict, lang) {
  if (!siglas || siglas.length === 0) return sanitizeHTML(text);
  const multi = siglas
    .filter((k) => k.length > 1)
    .map(escapeRegex)
    .join('|');
  const single = siglas
    .filter((k) => k.length === 1)
    .map(escapeRegex)
    .join('|');
  const alternatives = [];
  if (multi) alternatives.push(`(${multi})`);
  if (single) alternatives.push(`\\b(${single})\\b`);
  const pattern = new RegExp(alternatives.join('|'), 'gi');
  const keys = [...siglas].sort((a, b) => b.length - a.length);
  return String(text).replace(pattern, (match) => {
    const canonical = keys.find((k) => k.toLowerCase() === match.toLowerCase()) || match;
    const def = (dict[canonical] && dict[canonical][lang]) || (dict[canonical] && dict[canonical].es) || '';
    const safeKey = sanitizeHTML(canonical);
    const safeDef = sanitizeHTML(def);
    return `<span class="sigla-tooltip" tabindex="0" role="button" data-sigla="${safeKey}" aria-label="${safeKey}: ${safeDef}">${sanitizeHTML(match)}<span class="sigla-tooltip__text" role="tooltip">${safeKey}: ${safeDef}</span></span>`;
  });
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