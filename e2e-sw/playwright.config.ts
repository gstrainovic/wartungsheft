import { defineConfig, devices } from '@playwright/test'

// Service-Worker-Update gegen zwei echte Produktions-Builds (Dev-Server hat keinen Service Worker).
// Aufruf: npm run test:sw
export default defineConfig({
  testDir: '.',
  timeout: 120_000,
  workers: 1,
  use: { ...devices['Desktop Chrome'] },
})
