// Entry point — solo orquesta DOMContentLoaded (requisito 19.2 / tasks 10)
import { initUI, setNavActive, getLang } from './modules/ui.js';
import { initInstagramSection } from './modules/instagram.js';
import { loadEfemerides, getTodayEfemeride, renderEfemeride } from './modules/efemerides.js';
import { initCatalog } from './modules/products.js';
import { initAnalytics } from './modules/analytics.js';

document.addEventListener('DOMContentLoaded', async () => {
  initUI(); setNavActive(); initAnalytics();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('service-worker.js').catch(() => {});
  const efemerides = document.querySelector('#efemerides');
  if (efemerides) renderEfemeride(getTodayEfemeride(await loadEfemerides()), efemerides, getLang());
  if (document.querySelector('#catalog-container')) await initCatalog();
  const instagramRoot = document.querySelector('#instagram-root');
  if (instagramRoot && typeof getInstagramPostsData === 'function') await initInstagramSection(getInstagramPostsData());
});