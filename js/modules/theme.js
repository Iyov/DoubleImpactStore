// Tema claro/oscuro con persistencia
// Feature: double-impact-store, Requirements 3.1–3.2

import { t } from './i18n.js';

export const THEME_KEY = 'dis_theme';
export const DEFAULT_THEME = 'dark';

export function getTheme() {
  let theme = DEFAULT_THEME;
  try {
    theme = window.localStorage.getItem(THEME_KEY) || DEFAULT_THEME;
  } catch (err) {
    theme = DEFAULT_THEME;
  }
  return theme === 'light' ? 'light' : 'dark';
}

export function setTheme(theme) {
  const value = theme === 'light' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', value);
  try {
    window.localStorage.setItem(THEME_KEY, value);
  } catch (err) {
    // sin almacenamiento: no-op
  }
  const btn = document.getElementById('theme-toggle');
  if (btn) {
    btn.setAttribute('aria-label', t(value === 'dark' ? 'controls.theme_light' : 'controls.theme_dark'));
  }
}

export function initTheme() {
  setTheme(getTheme());
}
