import {defineConfig} from 'vitest/config'

import mainViteConfig from './vite.config'

export default defineConfig({
  ...mainViteConfig,
  test: {
    setupFiles: ['/tests/setup.ts'],
    coverage: {
      provider: 'istanbul',
      include: ['app'],
      reporter: ['text', 'html', 'clover', 'json', 'json-summary']
    }
  }
})
