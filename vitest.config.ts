import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  // Vue-Plugin, damit Seitentests (z. B. AnlagenPage.test.ts) Komponenten per vue/server-renderer rendern können
  plugins: [vue()],
  test: {
    // e2e/*.test.ts: Hilfen der E2E-Suite (Playwright selbst nimmt nur *.spec.ts)
    include: ['src/**/*.test.ts', 'e2e/**/*.test.ts'],
    environment: 'node',
  },
})
