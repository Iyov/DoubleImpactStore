// Feature: double-impact-store, Properties 1, 2, 7, 10: UI
import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import {
  THEME_KEY,
  LANG_KEY,
  DEFAULT_THEME,
  DEFAULT_LANG,
  getTheme,
  setTheme,
  initTheme,
  getLang,
  t,
  setLang,
  setFaqOpen,
  setNavActive,
  getTranslations
} from '../js/modules/ui.js';

function buildFaqItems(count = 5) {
  const items = [];
  for (let i = 0; i < count; i++) {
    const item = document.createElement('div');
    item.className = 'faq-item';
    const btn = document.createElement('button');
    btn.className = 'faq-question';
    const panel = document.createElement('div');
    panel.className = 'faq-answer';
    item.append(btn, panel);
    items.push(item);
  }
  return items;
}

function buildNav() {
  const nav = document.createElement('nav');
  ['/', '/productos', '/security-policy', '/security-acknowledgments'].forEach((path) => {
    const a = document.createElement('a');
    a.setAttribute('data-nav', path);
    nav.appendChild(a);
  });
  document.body.appendChild(nav);
  return nav;
}

describe('ui.js', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
    delete document.documentElement.dataset.theme;
  });

  it('Property 1: el tema se guarda y recupera como round-trip', () => {
    // Feature: double-impact-store, Property 1: Dark/Light
    fc.assert(
      fc.property(fc.constantFrom('dark', 'light'), (theme) => {
        setTheme(theme);
        return (
          document.documentElement.dataset.theme === theme &&
          getTheme() === theme &&
          localStorage.getItem(THEME_KEY) === theme
        );
      }),
      { numRuns: 100 }
    );
  });

  it('el tema por defecto es dark y valores inválidos vuelven a dark', () => {
    expect(DEFAULT_THEME).toBe('dark');
    localStorage.setItem(THEME_KEY, 'invalid');
    expect(getTheme()).toBe('dark');
    initTheme();
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('Property 2: toda clave de traducción es no vacía en es y en', () => {
    // Feature: double-impact-store, Property 2: Traducciones ES/EN
    const tr = getTranslations();
    const esKeys = Object.keys(tr.es);
    const enKeys = Object.keys(tr.en);
    expect(esKeys.length).toBeGreaterThan(50);
    expect(enKeys.length).toBe(esKeys.length);
    esKeys.forEach((key) => {
      expect(tr.es[key] && tr.es[key].trim().length).toBeGreaterThan(0);
      expect(tr.en[key] && tr.en[key].trim().length).toBeGreaterThan(0);
    });
  });

  it('t() devuelve la clave cuando falta la traducción', () => {
    localStorage.setItem(LANG_KEY, 'es');
    expect(t('clave.inexistente')).toBe('clave.inexistente');
    expect(t('nav.home')).toBe('Inicio');
  });

  it('setLang cambia el idioma y persiste', () => {
    setLang('en');
    expect(localStorage.getItem(LANG_KEY)).toBe('en');
    expect(getLang()).toBe('en');
    expect(document.documentElement.lang).toBe('en');
    setLang('es');
    expect(getLang()).toBe('es');
    expect(DEFAULT_LANG).toBe('es');
  });

  it('Property 7: FAQ mantiene exactamente una sección abierta', () => {
    // Feature: double-impact-store, Property 7: FAQ
    const items = buildFaqItems(5);
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 4 }), (index) => {
        setFaqOpen(items, index);
        const openCount = items.filter((item) => item.classList.contains('open')).length;
        return openCount === 1 && items[index].classList.contains('open');
      }),
      { numRuns: 100 }
    );
  });

  it('FAQ: sin elementos no lanza error', () => {
    expect(() => setFaqOpen([], 0)).not.toThrow();
  });

  it('Property 10: exactamente un enlace de navegación activo', () => {
    // Feature: double-impact-store, Property 10: Navegación
    const nav = buildNav();
    fc.assert(
      fc.property(fc.constantFrom('/', '/productos', '/security-policy', '/security-acknowledgments'), (path) => {
        setNavActive(path);
        const active = nav.querySelectorAll('.nav-active');
        return active.length === 1 && active[0].getAttribute('data-nav') === path;
      }),
      { numRuns: 100 }
    );
  });

  it('setNavActive sin argumento usa la ruta actual', () => {
    window.history.pushState({}, '', '/productos');
    const nav = buildNav();
    setNavActive();
    const active = nav.querySelectorAll('.nav-active');
    expect(active.length).toBe(1);
    expect(active[0].getAttribute('data-nav')).toBe('/productos');
  });
});