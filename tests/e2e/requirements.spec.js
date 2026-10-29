// E2E: criterios de requirements.md corregidos en la auditoría (R3.5, R4.6, R5.3, R13.4, R24.5).
import { test, expect } from '@playwright/test';
import { mockCatalogRoute, CATALOG_COUNTS } from './fixtures.js';

test('R3.5: tema e idioma guardados se aplican antes del primer pintado', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('dis_theme', 'light');
    localStorage.setItem('dis_lang', 'en');
    // Estado del <html> en el primer momento en que existe <body> (antes de DOMContentLoaded)
    new MutationObserver((_, observer) => {
      if (document.body) {
        window.__firstPaintState = { theme: document.documentElement.dataset.theme, lang: document.documentElement.lang };
        observer.disconnect();
      }
    }).observe(document, { childList: true, subtree: true });
  });
  await page.goto('/index.html');
  expect(await page.evaluate(() => window.__firstPaintState)).toEqual({ theme: 'light', lang: 'en' });
  // Una vez traducido, los textos se muestran
  await expect(page.locator('html')).not.toHaveClass(/i18n-pending/);
  await expect(page.locator('[data-i18n="efemerides.title"], h2[data-i18n]').first()).toBeVisible();
});

test('R4.6: el número de productos por página es configurable', async ({ page }) => {
  await mockCatalogRoute(page);
  await page.goto('/productos.html');
  const rows = page.locator('#catalog-tbody tr[data-product-id]');
  await expect(rows).toHaveCount(25);
  await page.locator('#catalog-per-page').selectOption('50');
  await expect(rows).toHaveCount(CATALOG_COUNTS.available);
});

test.describe('móvil', () => {
  test.use({ viewport: { width: 390, height: 800 } });

  test('R5.3: las siglas se ven sin hover en el catálogo móvil', async ({ page }) => {
    await mockCatalogRoute(page);
    await page.goto('/productos.html');
    const siglas = page.locator('tr[data-product-id="1"] .siglas-mobile');
    await expect(siglas).toBeVisible();
    await expect(siglas).toContainText('CIB+');
    await expect(siglas).toContainText('Caja, Juego, Manual, Insertos');
  });
});

test('R5.3: en desktop la lista móvil de siglas no se muestra', async ({ page }) => {
  await mockCatalogRoute(page);
  await page.goto('/productos.html');
  await expect(page.locator('tr[data-product-id="1"] .sigla-tooltip').first()).toBeVisible();
  await expect(page.locator('tr[data-product-id="1"] .siglas-mobile')).toBeHidden();
});

test('R13.4: la fecha de la efeméride se muestra formateada en el idioma activo', async ({ page }) => {
  await page.goto('/index.html');
  const date = page.locator('#efemerides-date');
  test.skip(!(await page.locator('.efemeride-title').count()), 'hoy no hay efeméride');
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const now = new Date();
  await expect(date).toHaveText(`${now.getDate()} de ${months[now.getMonth()]}`);
  await page.locator('#lang-toggle').click();
  await expect(date).toHaveText(new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'long' }).format(now));
});

test('R24.5/R25.4: botones flotantes con aria-label descriptivo y traducido', async ({ page }) => {
  await page.goto('/index.html');
  await expect(page.locator('#back-to-top')).toHaveAttribute('aria-label', 'Volver al inicio');
  await expect(page.locator('#whatsapp-float')).toHaveAttribute('aria-label', /WhatsApp/);
  await page.locator('#lang-toggle').click();
  await expect(page.locator('#back-to-top')).toHaveAttribute('aria-label', 'Back to top');
  await expect(page.locator('#whatsapp-float')).toHaveAttribute('aria-label', 'Message us on WhatsApp (opens in a new tab)');
});
