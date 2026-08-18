// E2E: Página principal, navegación, tema, idioma, FAQ, blog, Instagram y 404.
import { test, expect } from '@playwright/test';

test.describe('Página principal', () => {
  test('renderiza el hero y las secciones principales', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/DoubleImpactStore/);
    await expect(page.locator('.hero-title')).toContainText('DoubleImpactStore');
    await expect(page.locator('#nosotros')).toBeVisible();
    await expect(page.locator('#productos-destacados')).toBeVisible();
    await expect(page.locator('#instagram')).toBeVisible();
    await expect(page.locator('#blog .blog-card')).toHaveCount(3);
    await expect(page.locator('#faq .faq-item')).toHaveCount(7);
    await expect(page.locator('#servicios .service-card')).toHaveCount(6);
  });

  test('el tema oscuro/claro se alterna y persiste', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.click('#theme-toggle');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('el idioma ES/EN se alterna y persiste', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await page.click('#lang-toggle');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('#lang-toggle')).toHaveText('ES');
    await expect(page.locator('#main-nav')).toContainText('Products');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('FAQ mantiene exactamente una sección abierta', async ({ page }) => {
    await page.goto('/');
    const open = page.locator('.faq-item.open');
    await expect(open).toHaveCount(1);
    await page.locator('.faq-item').nth(2).locator('.faq-question').click();
    await expect(open).toHaveCount(1);
    await expect(page.locator('.faq-item').nth(2)).toHaveClass(/open/);
  });

  test('el modal del blog abre con clic y cierra con Escape', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-blog-card]').first().click();
    const modal = page.locator('#blog-modal');
    await expect(modal).toBeVisible();
    await expect(modal.locator('#blog-modal-title')).not.toBeEmpty();
    await page.keyboard.press('Escape');
    await expect(modal).toBeHidden();
  });

  test('el modal del blog abre con la tecla Enter', async ({ page }) => {
    await page.goto('/');
    const card = page.locator('[data-blog-card]').first();
    await card.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#blog-modal')).toBeVisible();
    await page.keyboard.press('Escape');
  });

  test('la sección de Instagram renderiza posts con filtros', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.ig-card').first()).toBeVisible();
    await expect(page.locator('.ig-card img')).toHaveAttribute('loading', 'lazy');
    await expect(page.locator('.ig-filter-btn').first()).toBeVisible();
  });

  test('navegación móvil con toggle', async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 800 });
    await page.goto('/');
    const toggle = page.locator('#nav-toggle');
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(page.locator('#main-nav')).toHaveClass(/open/);
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  test('la navegación activa marca el enlace actual', async ({ page }) => {
    await page.goto('/productos.html');
    await expect(page.locator('[data-nav="/productos"]')).toHaveClass(/nav-active/);
    await expect(page.locator('[data-nav="/productos"]')).toHaveAttribute('aria-current', 'page');
  });

  test('la página 404 renderiza el contenido de error', async ({ page }) => {
    await page.goto('/404.html');
    await expect(page.locator('.notfound-code')).toHaveText('404');
    await expect(page.locator('.notfound a')).toBeVisible();
  });
});