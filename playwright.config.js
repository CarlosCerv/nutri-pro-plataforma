import { defineConfig, devices } from '@playwright/test';

/**
 * Config de la prueba de punta a punta pedida por el usuario (registro →
 * login → recorrido de toda la plataforma). Vive en la raíz porque cruza
 * frontend (5173) y backend (5000), ya arrancados con `npm run dev`.
 *
 * Un solo proyecto en WebKit: es el motor real de Safari (el navegador que
 * usa el usuario) y no hay herramienta de automatización de Safari.app en
 * este entorno. WebKit en macOS 13 requiere fijar Playwright 1.46 — la
 * versión actual (1.63) dejó de traer un build de WebKit para macOS 13.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [['list'], ['json', { outputFile: 'e2e/report.json' }]],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
