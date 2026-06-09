// Generates public/og.png (1200x630) from an inline branded SVG.
// Run with: node scripts/gen-og.mjs
// Requires the `sharp` devDependency (SVG -> PNG raster).
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, '../public/og.png')

const BG = '#161a1d'
const CYAN = '#00c2cc'

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="50%" cy="38%" r="65%">
      <stop offset="0%" stop-color="#1d2a2c"/>
      <stop offset="100%" stop-color="${BG}"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect x="0" y="0" width="1200" height="8" fill="${CYAN}"/>
  <text x="600" y="300" text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif" font-weight="800"
        font-size="150" letter-spacing="4" fill="${CYAN}">BIGHEAD</text>
  <text x="600" y="380" text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif" font-weight="500"
        font-size="40" fill="#e6f7f8">Le quiz qui défie ton cerveau</text>
  <text x="600" y="470" text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif" font-weight="600"
        font-size="26" letter-spacing="2" fill="#7c8a8c">play.bighead-quizz.com</text>
</svg>`

await sharp(Buffer.from(svg)).png().toFile(OUT)
console.log(`Wrote ${OUT}`)
