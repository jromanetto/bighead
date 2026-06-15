import { configDefaults, defineConfig } from 'vitest/config'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [devtools(), tailwindcss(), tanstackStart(), viteReact()],
  build: {
    rollupOptions: {
      output: {
        // Peel the heavy animation deps out of the entry chunk so they load in
        // parallel and cache independently across deploys (framer-motion alone
        // is ~150KB gz). Route-level splitting is already handled by TanStack's
        // file-based routes.
        manualChunks(id) {
          if (id.includes('framer-motion') || id.includes('motion-dom') || id.includes('motion-utils'))
            return 'motion'
          if (id.includes('canvas-confetti')) return 'confetti'
        },
      },
    },
  },
  test: {
    // Keep vitest on its defaults but ignore the Playwright E2E specs, which
    // import @playwright/test and must only be run via `pnpm test:e2e`.
    exclude: [...configDefaults.exclude, 'e2e/**'],
  },
})

export default config
