// Analytics: GTM, GA4, Cloudflare y sistema de fallback
// Feature: double-impact-store, Requirements 11.6, 12.1–12.4, 19.1

import { logger } from './logger.js';

export const ANALYTICS_CONFIG = {
  // Configura los IDs reales aquí o desde el despliegue.
  // Estos valores son placeholders: el sitio funciona sin ellos (fallback propio).
  gtmId: 'GTM-NB5CQ3VR', // Google Tag Manager — ej. 'GTM-XXXXXXX'
  ga4Id: 'G-CHJJRHE1YK', // Google Analytics 4 — ej. 'G-XXXXXXXXXX'
  cloudflareToken: '' // Cloudflare Web Analytics beacon token
};

export function isAdBlockActive() {
  if (typeof document === 'undefined') return false;
  try {
    const probe = document.createElement('div');
    probe.className = 'ad-banner-probe';
    probe.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;';
    document.body.appendChild(probe);
    const blocked = probe.clientHeight === 0 || probe.clientWidth === 0;
    document.body.removeChild(probe);
    return blocked;
  } catch (err) {
    return false;
  }
}

function loadGtm() {
  if (!ANALYTICS_CONFIG.gtmId) return;
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(ANALYTICS_CONFIG.gtmId)}`;
  document.head.appendChild(script);
}

function loadGa4() {
  if (!ANALYTICS_CONFIG.ga4Id) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', ANALYTICS_CONFIG.ga4Id);
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ANALYTICS_CONFIG.ga4Id)}`;
  document.head.appendChild(script);
}

function loadCloudflare() {
  if (!ANALYTICS_CONFIG.cloudflareToken) return;
  const script = document.createElement('script');
  script.defer = true;
  script.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  script.setAttribute('data-cf-beacon', `{"token": "${ANALYTICS_CONFIG.cloudflareToken}"}`);
  document.head.appendChild(script);
}

const FALLBACK_STORAGE_KEY = 'dis_analytics_events';

export function trackEvent(category, action, label) {
  const event = { event: 'dis_track', category, action, label: label || '', ts: Date.now() };
  try {
    if (window.dataLayer) window.dataLayer.push(event);
  } catch (err) {
    // GTM no disponible
  }
  try {
    const list = JSON.parse(window.localStorage.getItem(FALLBACK_STORAGE_KEY) || '[]');
    list.push(event);
    if (list.length > 200) list.splice(0, list.length - 200);
    window.localStorage.setItem(FALLBACK_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    // Sin almacenamiento: no-op
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dis:track', { detail: event }));
  }
}

export function setupCSPReporting() {
  if (typeof document === 'undefined') return;
  document.addEventListener('securitypolicyviolation', (event) => {
    logger.warn('CSP violation', { blockedURI: event.blockedURI, directive: event.violatedDirective });
  });
}

export function initAnalytics() {
  if (typeof window === 'undefined') return;
  loadGtm();
  loadGa4();
  loadCloudflare();
  setupCSPReporting();
  window.addEventListener('load', () => {
    const blocked = isAdBlockActive();
    if (blocked) {
      logger.warn('AdBlock detectado — activando fallback de analytics');
      trackEvent('system', 'adblock_detected');
    }
  });
  trackEvent('engagement', 'page_view', document.title || '');
  document.addEventListener('click', (event) => {
    const el = event.target && event.target.closest ? event.target.closest('[data-track]') : null;
    if (el) trackEvent('click', el.dataset.track || 'interaction', el.getAttribute('aria-label') || el.textContent.trim());
  });
}