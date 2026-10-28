// E2E: la Content-Security-Policy (<meta>) no bloquea nada del propio sitio.
import { test, expect } from '@playwright/test';
import { mockCatalogRoute } from './fixtures.js';

const PAGES = ['/index.html', '/productos.html', '/404.html', '/security-policy.html', '/security-acknowledgments.html'];

async function collectViolations(page) {
  await page.addInitScript(() => {
    window.__cspViolations = [];
    document.addEventListener('securitypolicyviolation', (e) => {
      window.__cspViolations.push(`${e.violatedDirective} ${e.blockedURI}`);
    });
  });
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error' && /Content Security Policy/i.test(msg.text())) consoleErrors.push(msg.text());
  });
  return consoleErrors;
}

test.describe('Seguridad: CSP', () => {
  for (const url of PAGES) {
    test(`${url} carga sin violaciones de CSP`, async ({ page }) => {
      const consoleErrors = await collectViolations(page);
      await mockCatalogRoute(page);
      await page.goto(url, { waitUntil: 'load' });
      // Deja tiempo a los módulos y a GTM para cargar lo que necesiten
      await page.waitForTimeout(1500);
      const violations = await page.evaluate(() => window.__cspViolations);
      expect(violations).toEqual([]);
      expect(consoleErrors).toEqual([]);
    });
  }

  test('la CSP se entrega antes del primer script y sin unsafe-inline en script-src', async ({ page }) => {
    await page.goto('/index.html');
    const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
    const scriptSrc = csp.split(';').find((d) => d.trim().startsWith('script-src'));
    expect(scriptSrc).not.toContain("'unsafe-inline'");
    expect(scriptSrc).toMatch(/'sha256-[A-Za-z0-9+/=]+'/);
    await expect(page.locator('meta[name="referrer"]')).toHaveAttribute('content', 'strict-origin-when-cross-origin');
  });

  test('un script inline inyectado es bloqueado', async ({ page }) => {
    await page.goto('/index.html');
    const executed = await page.evaluate(() => {
      window.__injected = false;
      const s = document.createElement('script');
      s.textContent = 'window.__injected = true;';
      document.body.appendChild(s);
      return window.__injected;
    });
    expect(executed).toBe(false);
  });
});
