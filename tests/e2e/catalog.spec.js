// E2E: Catálogo /productos — carga, búsqueda, filtros, paginación, modal y errores.
import { test, expect } from '@playwright/test';
import { CATALOG_COUNTS, mockCatalogRoute } from './fixtures.js';

test.describe('Catálogo /productos', () => {
  test('carga y renderiza la tabla del catálogo', async ({ page }) => {
    await mockCatalogRoute(page);
    await page.goto('/productos.html');
    await expect(page.locator('#catalog-tbody tr[data-product-id]')).toHaveCount(25);
    await expect(page.locator('#catalog-results')).toContainText(String(CATALOG_COUNTS.available));
  });

  test('la búsqueda filtra por texto (debounce)', async ({ page }) => {
    await mockCatalogRoute(page);
    await page.goto('/productos.html');
    await page.fill('#catalog-search', 'Metal Gear');
    await expect(page.locator('#catalog-tbody tr[data-product-id]')).toHaveCount(1);
    await expect(page.locator('#catalog-tbody')).toContainText('Metal Gear');
  });

  test('el filtro de plataforma filtra correctamente', async ({ page }) => {
    await mockCatalogRoute(page);
    await page.goto('/productos.html');
    await page.locator('.platform-chip input[value="SNES"]').check();
    await expect(page.locator('#catalog-tbody tr[data-product-id]')).toHaveCount(CATALOG_COUNTS.snes);
    await page.locator('.platform-chip input[value="NES"]').check();
    await expect(page.locator('#catalog-tbody tr[data-product-id]')).toHaveCount(CATALOG_COUNTS.snes + CATALOG_COUNTS.nes);
  });

  test('la paginación muestra 25 por página y navega', async ({ page }) => {
    await mockCatalogRoute(page);
    await page.goto('/productos.html');
    await expect(page.locator('#catalog-tbody tr[data-product-id]')).toHaveCount(25);
    await expect(page.locator('#catalog-pagination .pagination-page')).toHaveCount(2);
    await page.locator('#catalog-pagination .pagination-page').nth(1).click();
    await expect(page.locator('#catalog-tbody tr[data-product-id]')).toHaveCount(CATALOG_COUNTS.available - 25);
  });

  test('el modal de producto abre y cierra con Escape', async ({ page }) => {
    await mockCatalogRoute(page);
    await page.goto('/productos.html');
    await page.locator('#catalog-tbody tr[data-product-id]').first().click();
    const modal = page.locator('#product-modal');
    await expect(modal).toBeVisible();
    await expect(modal.locator('#product-modal-title')).not.toBeEmpty();
    await page.keyboard.press('Escape');
    await expect(modal).toBeHidden();
  });

  test('el filtro de estado muestra productos vendidos', async ({ page }) => {
    await mockCatalogRoute(page);
    await page.goto('/productos.html');
    await expect(page.locator('.badge--sold')).toHaveCount(0);
    await page.selectOption('#catalog-status', 'all');
    await expect(page.locator('.badge--sold')).toHaveCount(CATALOG_COUNTS.sold);
  });

  test('muestra error y botón Reintentar si falla la carga', async ({ page }) => {
    await page.route(/\/gviz\/tq/, (route) => route.abort());
    await page.goto('/productos.html');
    await expect(page.locator('.catalog-error')).toBeVisible();
    await expect(page.locator('.catalog-error button')).toContainText('Reintentar');
  });
});