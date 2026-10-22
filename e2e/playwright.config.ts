import { defineConfig, devices } from '@playwright/test'

/*
 * Pruebas de extremo a extremo de NEXO JOVEN 360 (responsable: Elizabeth, tarea I4).
 *
 * Usan el frontend en http://localhost:5173. Si ya está corriendo (`npm run dev` en
 * frontend/), lo reutilizan; si no, lo arrancan.
 *
 * En local se usa el Chrome instalado (sin descargar navegadores). En CI se usa el Chromium
 * de Playwright: `npx playwright install --with-deps chromium`.
 */
const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:5173'
const channel = process.env.CI ? undefined : 'chrome'

/** Todos los proyectos usan Chromium; los dispositivos solo aportan tamaño, escala y táctil. */
function dispositivo(nombre: keyof typeof devices) {
  const { defaultBrowserType: _ignorado, ...resto } = devices[nombre]
  return { ...resto, browserName: 'chromium' as const, channel }
}

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { outputFolder: './playwright-report', open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'iphone-se-320', use: dispositivo('iPhone SE') },
    { name: 'galaxy-s8-360', use: dispositivo('Galaxy S8') },
    { name: 'iphone-8-375', use: dispositivo('iPhone 8') },
    { name: 'iphone-14-390', use: dispositivo('iPhone 14') },
    { name: 'pixel-7-412', use: dispositivo('Pixel 7') },
    { name: 'ipad-mini-768', use: dispositivo('iPad Mini') },
    {
      name: 'escritorio-1440',
      use: { ...devices['Desktop Chrome'], channel, viewport: { width: 1440, height: 900 } },
    },
  ],
  webServer: {
    command: 'npm --prefix ../frontend run dev -- --port 5173 --strictPort',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
