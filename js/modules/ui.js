// UI: FAQ, menú móvil, navegación activa, scroll, botones flotantes y offline
// Feature: double-impact-store, Requirements 1.7, 16.1–16.3, 19.1, 21–25

import { renderSocialLinks } from '../social.js';
import { getLang, setLang, initLang, t } from './i18n.js';
import { getTheme, setTheme, initTheme } from './theme.js';
import { initBlogModals } from './blog.js';

export function setFaqOpen(items, index) {
  (items || []).forEach((item, i) => {
    const open = i === index;
    item.classList.toggle('open', open);
    const btn = item.querySelector ? item.querySelector('.faq-question') : null;
    if (btn) btn.setAttribute('aria-expanded', String(open));
    const panel = item.querySelector ? item.querySelector('.faq-answer') : null;
    if (panel) panel.setAttribute('aria-hidden', String(!open));
  });
}

export function initFAQ() {
  const accordion = document.querySelector('.faq-accordion');
  if (!accordion) return;
  const items = [...accordion.querySelectorAll('.faq-item')];
  items.forEach((item, index) => {
    const button = item.querySelector('.faq-question');
    if (!button) return;
    button.addEventListener('click', () => setFaqOpen(items, index));
  });
  if (items.length > 0) setFaqOpen(items, 0);
}

export function initMobileMenu() {
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('main-nav');
  if (!toggle || !nav) return;
  const close = () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', t('controls.menu_open'));
  };
  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? t('controls.menu_close') : t('controls.menu_open'));
  });
  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', close));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('open')) {
      close();
      toggle.focus();
    }
  });
}

export function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  const update = () => {
    const doc = document.documentElement;
    const scrollTop = doc.scrollTop || window.scrollY || document.body.scrollTop || 0;
    const max = doc.scrollHeight - doc.clientHeight;
    const pct = max > 0 ? Math.min(100, Math.max(0, (scrollTop / max) * 100)) : 0;
    bar.style.width = `${pct}%`;
    bar.setAttribute('aria-valuenow', String(Math.round(pct)));
  };
  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
}

export function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  const onScroll = () => {
    btn.classList.toggle('show', window.scrollY > 300);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

export function initLogoBackToTop() {
  const logo = document.querySelector('.brand');
  if (!logo) return;
  logo.addEventListener('click', (event) => {
    if (getCurrentPath() === '/' && window.scrollY > 0) {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}

export function initWhatsAppButton() {
  const float = document.getElementById('whatsapp-float');
  if (!float) return;
  const tooltip = float.querySelector('.whatsapp-tooltip');
  const updateTooltip = () => {
    if (tooltip) tooltip.textContent = t('whatsapp.tooltip');
  };
  updateTooltip();
  window.addEventListener('dis:langchange', updateTooltip);
}

export function setNavActive(path) {
  const target = path || getCurrentPath();
  document.querySelectorAll('[data-nav]').forEach((link) => {
    const active = link.getAttribute('data-nav') === target;
    link.classList.toggle('nav-active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

function getCurrentPath() {
  const path = window.location.pathname.replace(/\/+$/, '');
  if (path.endsWith('productos.html') || path === '/productos') return '/productos';
  if (path.endsWith('security-policy.html') || path === '/security-policy') return '/security-policy';
  if (path.endsWith('security-acknowledgments.html') || path === '/security-acknowledgments') return '/security-acknowledgments';
  if (path.endsWith('404.html')) return '';
  const sections = {
    '#nosotros': '/nosotros',
    '#instagram': '/instagram',
    '#efemerides': '/efemerides',
    '#blog': '/blog',
    '#testimonios': '/testimonios',
    '#faq': '/faq',
    '#servicios': '/servicios',
    '#contacto': '/contacto',
  };
  return sections[window.location.hash] || '/';
}

function initToggles() {
  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) themeBtn.addEventListener('click', () => setTheme(getTheme() === 'dark' ? 'light' : 'dark'));
  const langBtn = document.getElementById('lang-toggle');
  if (langBtn) langBtn.addEventListener('click', () => setLang(getLang() === 'es' ? 'en' : 'es'));
}

function initNavActive() {
  document.querySelectorAll('[data-nav]').forEach((link) => {
    link.addEventListener('click', () => {
      setNavActive(link.getAttribute('data-nav'));
    });
  });
  window.addEventListener('hashchange', () => setNavActive());
}

function initOfflineIndicator() {
  const indicator = document.getElementById('offline-indicator');
  if (!indicator) return;
  const show = () => {
    indicator.hidden = false;
  };
  const hide = () => {
    indicator.hidden = true;
  };
  window.addEventListener('offline', show);
  window.addEventListener('online', hide);
  if (navigator.onLine === false) show();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'dis-offline') show();
    });
    // addEventListener no habilita la cola de mensajes por sí solo (onmessage sí)
    navigator.serviceWorker.startMessages();
  }
}

export function initUI() {
  initTheme();
  initLang();
  initToggles();
  initNavActive();
  initMobileMenu();
  initFAQ();
  initBlogModals();
  initScrollProgress();
  initBackToTop();
  initLogoBackToTop();
  initWhatsAppButton();
  initOfflineIndicator();
  renderSocialLinks(document.querySelectorAll('[data-social]'));
}
