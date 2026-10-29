// E2E: PWA — Service Worker, precache y funcionamiento sin conexión.
import { test, expect } from '@playwright/test';

test.use({ serviceWorkers: 'allow' });

async function waitForServiceWorker(page) {
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise((resolve) => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
    }
    return registration.active.scriptURL;
  });
}

test.describe('PWA / offline', () => {
  test('el Service Worker se instala con una caché doubleimpact-v* que incluye el bundle', async ({ page }) => {
    await page.goto('/index.html');
    await waitForServiceWorker(page);
    const caches = await page.evaluate(async () => {
      const names = await window.caches.keys();
      const cache = await window.caches.open(names[0]);
      const urls = (await cache.keys()).map((r) => new URL(r.url).pathname);
      return { names, hasBundle: urls.includes('/js/index.min.js'), hasFont: urls.includes('/webfonts/fa-solid-900.woff2') };
    });
    expect(caches.names).toHaveLength(1);
    expect(caches.names[0]).toMatch(/^doubleimpact-v.+-[0-9a-f]{10}$/);
    expect(caches.hasBundle).toBe(true);
    expect(caches.hasFont).toBe(true);
  });

  test('sin conexión, la portada carga con estilos, JS y el indicador offline', async ({ page, context }) => {
    await page.goto('/index.html');
    await waitForServiceWorker(page);

    await context.setOffline(true);
    await page.reload();
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('#offline-indicator')).toBeVisible();
    // El CSS se aplicó (el body no tiene el fondo blanco por defecto del navegador)
    const background = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(background).not.toBe('rgba(0, 0, 0, 0)');
    // El bundle se ejecutó: el cambio de tema funciona
    const before = await page.locator('html').getAttribute('data-theme');
    await page.locator('#theme-toggle').click();
    await expect(page.locator('html')).not.toHaveAttribute('data-theme', before);
  });

  test('sin conexión, /productos (URL limpia) se sirve desde la caché', async ({ page, context }) => {
    await page.goto('/index.html');
    await waitForServiceWorker(page);

    await context.setOffline(true);
    await page.goto('/productos');
    await expect(page.locator('#catalog-container')).toBeAttached();
  });

  test('sin conexión, un asset con un ?v= nuevo recibe la versión cacheada', async ({ page, context }) => {
    await page.goto('/index.html');
    await waitForServiceWorker(page);

    await context.setOffline(true);
    const result = await page.evaluate(async () => {
      const response = await fetch('/css/style.min.css?v=version-nueva');
      return { ok: response.ok, length: (await response.text()).length };
    });
    expect(result.ok).toBe(true);
    expect(result.length).toBeGreaterThan(1000);
  });
});
