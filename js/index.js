// Entry point — solo orquesta DOMContentLoaded (requisito 19.2 / tasks 10)
import { initUI, setNavActive, getLang } from './modules/ui.js';
import { initInstagramSection } from './modules/instagram.js';
import { loadEfemerides, getTodayEfemeride, renderEfemeride } from './modules/efemerides.js';
import { initCatalog } from './modules/products.js';
import { initAnalytics } from './modules/analytics.js';

document.addEventListener('DOMContentLoaded', async () => {
  initUI(); setNavActive(); initAnalytics();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('service-worker.js').catch(() => {});
  const efemeridesContent = document.getElementById('efemerides-content');
  if (efemeridesContent) {
    try {
      const data = await loadEfemerides();
      renderEfemeride(getTodayEfemeride(data), efemeridesContent, getLang());
    } catch {
      const section = efemeridesContent.closest('section');
      if (section) section.style.display = 'none';
    }
  }
  if (document.querySelector('#catalog-container')) await initCatalog();
  const instagramRoot = document.querySelector('#instagram-root');
  if (instagramRoot && typeof getInstagramPostsData === 'function') await initInstagramSection(getInstagramPostsData());
});