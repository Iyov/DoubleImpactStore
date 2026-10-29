// E2E: accesibilidad (axe, WCAG 2.1 AA), teclado, siglas e idioma entre páginas.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mockCatalogRoute } from './fixtures.js';

const PAGES = ['/index.html', '/productos.html', '/404.html', '/security-policy.html', '/security-acknowledgments.html'];

test.describe('Accesibilidad: axe WCAG 2.1 AA', () => {
  for (const url of PAGES) {
    for (const theme of ['dark', 'light']) {
      test(`${url} (${theme}) sin violaciones`, async ({ page }) => {
        await page.addInitScript((value) => localStorage.setItem('dis_theme', value), theme);
        await mockCatalogRoute(page);
        await page.goto(url);
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        if (url === '/productos.html') await expect(page.locator('#catalog-tbody tr[data-product-id]').first()).toBeVisible();
        const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
        const summary = results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
        expect(summary).toEqual([]);
      });
    }
  }
});

test.describe('Teclado', () => {
  test.use({ viewport: { width: 390, height: 800 } });

  test('menú móvil: Enter abre, Escape cierra y devuelve el foco al botón', async ({ page }) => {
    await page.goto('/index.html');
    const toggle = page.locator('#nav-toggle');
    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#main-nav a').first()).toBeVisible();

    await page.locator('#main-nav a').first().focus();
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
  });
});

test.describe('Siglas en el catálogo', () => {
  test('la sigla es enfocable, tiene su definición y se traduce al cambiar de idioma', async ({ page }) => {
    await mockCatalogRoute(page);
    await page.goto('/productos.html');
    const sigla = page.locator('#catalog-tbody .sigla-tooltip[data-sigla="CIB+"]').first();
    await expect(sigla).toHaveAttribute('tabindex', '0');
    await expect(sigla).toHaveAttribute('aria-label', 'CIB+: Caja, Juego, Manual, Insertos');

    await page.locator('#lang-toggle').click();
    await expect(page.locator('#catalog-tbody .sigla-tooltip[data-sigla="CIB+"]').first()).toHaveAttribute(
      'aria-label',
      'CIB+: Box, Game, Manual, Inserts'
    );
  });
});

test.describe('Idioma entre páginas', () => {
  test('el inglés elegido en la portada se mantiene en /productos', async ({ page }) => {
    await mockCatalogRoute(page);
    await page.goto('/index.html');
    await page.locator('#lang-toggle').click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    await page.goto('/productos.html');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('[data-i18n="products.title"]').first()).toHaveText('Catalog');
  });

  test('la página 404 se muestra en inglés', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('dis_lang', 'en'));
    await page.goto('/404.html');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('h1[data-i18n="notfound.title"]')).toHaveText('Page not found');
  });
});
