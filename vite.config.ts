import {vitePlugin as remix} from '@remix-run/dev'
import {installGlobals} from '@remix-run/node'
import {defineConfig} from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    remix({
      ignoredRouteFiles: ['**/*.css'],
      future: {
        v3_fetcherPersist: true,
        v3_lazyRouteDiscovery: true,
        v3_relativeSplatPath: true,
        v3_singleFetch: true,
        v3_throwAbortReason: true
      }
    }),
    tsconfigPaths()
  ],
  optimizeDeps: {exclude: ['@mapbox/node-pre-gyp']}
})

declare module '@remix-run/server-runtime' {
  // or cloudflare, deno, etc.
  interface Future {
    v3_singleFetch: true
  }
}
