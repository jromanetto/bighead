import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E config for the BIGHEAD web app (TanStack Start).
 *
 * Runs against the *production* build served by `vite preview` so the smoke
 * tests exercise the real SSR server (including silent anonymous Supabase
 * sign-in performed in the root route `beforeLoad`).
 *
 * Dedicated port 4173 is used to avoid colliding with the dev/preview default
 * port 3000, which may already be occupied.
 */
const PORT = 4173
const baseURL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `pnpm build && pnpm preview --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    // Building the app before serving can take a while on cold caches.
    timeout: 180_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
})
