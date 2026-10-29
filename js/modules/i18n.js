// Idioma: persistencia, traducción de claves y aplicación al DOM
// Feature: double-impact-store, Requirements 3.2–3.6

import { translations } from './translations.js';

export const LANG_KEY = 'dis_lang';
export const DEFAULT_LANG = 'es';

export function getLang() {
  let lang = DEFAULT_LANG;
  try {
    lang = window.localStorage.getItem(LANG_KEY) || DEFAULT_LANG;
  } catch (err) {
    lang = DEFAULT_LANG;
  }
  return lang === 'en' ? 'en' : 'es';
}

export function t(key) {
  const lang = getLang();
  const value = translations[lang] && translations[lang][key];
  return value != null ? String(value) : key;
}

export function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
  });
  document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
  });
  // El script inline del <head> oculta los textos hasta que estén traducidos
  document.documentElement.classList.remove('i18n-pending');
}

export function setLang(lang) {
  const value = lang === 'en' ? 'en' : 'es';
  try {
    window.localStorage.setItem(LANG_KEY, value);
  } catch (err) {
    // sin almacenamiento: no-op
  }
  document.documentElement.setAttribute('lang', value);
  applyTranslations();
  const btn = document.getElementById('lang-toggle');
  if (btn) {
    btn.textContent = value === 'es' ? 'EN' : 'ES';
    btn.setAttribute('aria-label', t('controls.lang'));
  }
  window.dispatchEvent(new CustomEvent('dis:langchange', { detail: { lang: value } }));
}

export function initLang() {
  setLang(getLang());
}

export function getTranslations() {
  return translations;
}
