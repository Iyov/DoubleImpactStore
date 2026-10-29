// Entry point — solo orquesta (requisito R19: ≤20 líneas); cada módulo se activa si su sección existe
import { initUI, setNavActive } from './modules/ui.js';
import { initInstagramSection } from './modules/instagram.js';
import { initEfemerides } from './modules/efemerides.js';
import { initCatalog } from './modules/products.js';
import { initAnalytics } from './modules/analytics.js';

document.addEventListener('DOMContentLoaded', () => {
  initUI();
  setNavActive();
  initAnalytics();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('service-worker.js').catch(() => {});
  initEfemerides();
  initCatalog();
  initInstagramSection();
});
