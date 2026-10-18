import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: 'reading.spec.mjs',
  fullyParallel: true,
  workers: 2,
  retries: 0,
  timeout: 90000,
  expect: { timeout: 7000 },
  outputDir: process.env.READING_OUTPUT || 'test-results/reading',
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: process.env.READING_BASE_URL || 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'desktop-webkit', use: { ...devices['Desktop Safari'], viewport: { width: 1280, height: 900 } } },
    { name: 'phone-webkit', use: { ...devices['iPhone 13'] } },
    { name: 'phone-chromium', use: { ...devices['Pixel 7'] } }
  ],
  webServer: process.env.READING_BASE_URL ? undefined : {
    command: 'python3 tests/serve_reading.py',
    url: 'http://127.0.0.1:4173/backend-map/',
    reuseExistingServer: !process.env.CI
  }
});
