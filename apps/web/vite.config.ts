import { configDefaults, defineConfig } from 'vitest/config'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [devtools(), tailwindcss(), tanstackStart(), viteReact()],
  test: {
    // Keep vitest on its defaults but ignore the Playwright E2E specs, which
    // import @playwright/test and must only be run via `pnpm test:e2e`.
    exclude: [...configDefaults.exclude, 'e2e/**'],
  },
})

export default config
