import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    viewport: { width: 1280, height: 720 },
    // Las peticiones que hace el Service Worker no pasan por page.route (los mocks
    // del CSV); solo tests/e2e/pwa.spec.js lo habilita.
    serviceWorkers: 'block'
  },
  webServer: {
    command: 'python scripts/serve.py 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: true,
    timeout: 30000
  }
});