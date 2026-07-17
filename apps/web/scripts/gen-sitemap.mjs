#!/usr/bin/env node
/**
 * Generate public/sitemap.xml from the real content so it never goes stale.
 * Runs at build time (see package.json "build"). Picks up every theme page in
 * src/lib/seo/themes.ts automatically — add a theme, it lands in the sitemap.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const SITE = 'https://play.bighead-quizz.com'
const today = new Date().toISOString().slice(0, 10)

// Theme slugs — extracted from the THEMES array (source of truth).
const themesSrc = readFileSync(resolve(root, 'src/lib/seo/themes.ts'), 'utf8')
const themeSlugs = [...themesSrc.matchAll(/^\s*slug:\s*'([a-z0-9-]+)'/gm)].map((m) => m[1])

// Category slugs served at /quiz/<category>.
const categories = [
  'general', 'history', 'geography', 'music', 'science', 'literature',
  'technology', 'animals', 'sport', 'cinema', 'nature',
]

// Core, high-priority pages.
const core = [
  { path: '/', priority: '1.0' },
  { path: '/play', priority: '0.9' },
  { path: '/play/chain', priority: '0.8' },
  { path: '/play/daily', priority: '0.8' },
  { path: '/duels', priority: '0.7' },
  { path: '/weekly', priority: '0.7' },
  { path: '/leaderboard', priority: '0.7' },
]

const urls = [
  ...core,
  ...categories.map((c) => ({ path: `/quiz/${c}`, priority: '0.6' })),
  ...themeSlugs.map((s) => ({ path: `/quiz/t/${s}`, priority: '0.6' })),
]

const body = urls
  .map(
    (u) =>
      `  <url><loc>${SITE}${u.path}</loc><lastmod>${today}</lastmod><priority>${u.priority}</priority></url>`,
  )
  .join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`

writeFileSync(resolve(root, 'public/sitemap.xml'), xml)
console.log(`sitemap.xml: ${urls.length} URLs (${themeSlugs.length} theme pages)`)
