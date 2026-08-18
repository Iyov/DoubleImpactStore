// Utilidades: sanitización, validación, debounce, ordenamiento y errores
// Feature: double-impact-store, Requirements 11.2, 19.1

import { logger } from './logger.js';

const HTML_ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};

export function sanitizeHTML(input) {
  return String(input == null ? '' : input).replace(/[&<>"']/g, (char) => HTML_ESCAPE_MAP[char]);
}

export function validateSearch(query) {
  const value = String(query == null ? '' : query).trim();
  return value.length > 100 ? value.slice(0, 100) : value;
}

export function debounce(fn, ms) {
  let timer = null;
  const wrapped = function debounced(...args) {
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn.apply(this, args);
    }, ms);
  };
  wrapped.cancel = function cancel() {
    if (timer !== null) clearTimeout(timer);
    timer = null;
  };
  return wrapped;
}

export function sortProducts(products, field, asc) {
  const dir = asc ? 1 : -1;
  const sorted = Array.isArray(products) ? [...products] : [];
  return sorted.sort((a, b) => {
    const av = a == null ? null : a[field];
    const bv = b == null ? null : b[field];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    return String(av).localeCompare(String(bv), 'es', { numeric: true }) * dir;
  });
}

export function handleError(context, err) {
  logger.error(`[${context}]`, err);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dis:error', { detail: { context, err } }));
  }
}