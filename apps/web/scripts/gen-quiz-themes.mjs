#!/usr/bin/env node
/**
 * Generate `ThemeContent` entries for src/lib/seo/themes.ts at scale.
 *
 * For each spec below, one Claude call produces the SEO copy (intro, subtopics,
 * sample Q&A, FAQ) in FR + EN. The script prints ready-to-paste TS objects to
 * stdout — review them, then append the good ones to the THEMES array.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-ant-... node apps/web/scripts/gen-quiz-themes.mjs
 *
 * Edit SPECS to add the long-tail themes you want pages for (validate FR search
 * volume first — Google Keyword Planner / Ubersuggest). `playCategory` MUST be a
 * valid slug from src/lib/game/categories.ts: general, history, geography, music,
 * science, literature, technology, animals, sport, cinema, nature.
 */

const MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-5'
const KEY = process.env.ANTHROPIC_API_KEY
if (!KEY) {
  console.error('Set ANTHROPIC_API_KEY')
  process.exit(1)
}

// One line per page you want. slug = kebab-case ASCII.
const SPECS = [
  // { slug: 'histoire-de-france', emoji: '⚜️', playCategory: 'history', frLabel: 'Histoire de France', enLabel: 'History of France', aboutName: 'Histoire de France', aboutWikipedia: 'https://fr.wikipedia.org/wiki/Histoire_de_France' },
  // { slug: 'football', emoji: '⚽', playCategory: 'sport', frLabel: 'Football', enLabel: 'Football', aboutName: 'Football', aboutWikipedia: 'https://fr.wikipedia.org/wiki/Football' },
]

function prompt(spec) {
  return `Tu écris le contenu SEO d'une page de quiz pour le site BIGHEAD (jeu de quiz culture générale, FR + EN). Thème : "${spec.frLabel}" (EN: "${spec.enLabel}").

Réponds en JSON STRICT uniquement (pas de markdown), avec EXACTEMENT cette forme :
{
  "intro": { "fr": "120-180 mots, accrocheur, unique, mentionne 'jouable dans le navigateur, gratuit', cite 2-3 exemples concrets et un piège connu", "en": "same in English" },
  "subtopics": { "fr": ["6 sous-thèmes courts"], "en": ["6 short subtopics"] },
  "samples": { "fr": [ {"question":"...","answer":"...","explanation":"1 phrase"} x3 ], "en": [ x3 ] },
  "faq": { "fr": [ {"q":"...","a":"..."} x3 ], "en": [ x3 ] }
}
Contraintes : faits 100% vérifiables (Wikipédia-grade), pas d'invention. Une des 3 FAQ doit confirmer "gratuit, sans compte, dans le navigateur". Français correct avec accents.`
}

async function callClaude(p) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: MODEL, max_tokens: 4000, temperature: 0.6, messages: [{ role: 'user', content: p }] }),
  })
  if (!res.ok) throw new Error(`Claude ${res.status}: ${await res.text()}`)
  const data = await res.json()
  const text = data.content?.[0]?.text ?? ''
  const m = text.match(/\{[\s\S]*\}/)
  if (!m) throw new Error('no JSON in response')
  return JSON.parse(m[0])
}

function emit(spec, c) {
  // Print a ThemeContent object literal ready to paste into THEMES.
  const o = {
    slug: spec.slug,
    emoji: spec.emoji,
    playCategory: spec.playCategory,
    aboutName: spec.aboutName,
    aboutWikipedia: spec.aboutWikipedia,
    label: { fr: spec.frLabel, en: spec.enLabel },
    title: {
      fr: `Quiz ${spec.frLabel} — BIGHEAD`,
      en: `${spec.enLabel} Quiz — BIGHEAD`,
    },
    description: {
      fr: c.intro.fr.slice(0, 150),
      en: c.intro.en.slice(0, 150),
    },
    intro: c.intro,
    subtopics: c.subtopics,
    samples: c.samples,
    faq: c.faq,
  }
  console.log(JSON.stringify(o, null, 2) + ',\n')
}

if (SPECS.length === 0) {
  console.error('Edit SPECS in this file first. Nothing to generate.')
  process.exit(0)
}

for (const spec of SPECS) {
  try {
    const c = await callClaude(prompt(spec))
    emit(spec, c)
    console.error(`✓ ${spec.slug}`)
  } catch (e) {
    console.error(`✗ ${spec.slug}: ${e.message}`)
  }
}
