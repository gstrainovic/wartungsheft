import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  // Vue-Plugin, damit Seitentests (z. B. AnlagenPage.test.ts) Komponenten per vue/server-renderer rendern können
  plugins: [vue()],
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
})
