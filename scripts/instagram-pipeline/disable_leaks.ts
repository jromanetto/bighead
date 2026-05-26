/**
 * Disable questions where the correct_answer leaks in the question_text.
 *
 * Detection rule:
 *   - Normalize both strings: lowercase, strip accents, strip non-alphanum.
 *   - Strip leading/trailing articles from the answer (le/la/les/l'/un/une/des/du/de
 *     /the/a/an).
 *   - Tokenize answer into words >= 4 chars.
 *   - Flag if the WHOLE answer (post-stripping) appears as a word-boundary match
 *     in the question, OR if all significant tokens (>=4 chars) appear as
 *     word-boundary matches in the question.
 *
 * Avoid false positives:
 *   - Short answer tokens (<4 chars) excluded ("Or" inside "Bordeaux" → skipped).
 *   - Articles stripped so "La France" doesn't false-match on "la" inside the
 *     question.
 *
 * Run: npx tsx ./disable_leaks.ts [--dry-run]
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY env');
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const DRY_RUN = process.argv.includes('--dry-run');

interface Q {
  id: string;
  category: string | null;
  language: string;
  question_text: string;
  correct_answer: string;
}

const ARTICLES = new Set([
  // French
  'le', 'la', 'les', 'l', 'un', 'une', 'des', 'du', 'de', 'au', 'aux',
  // English
  'the', 'a', 'an',
  // Spanish
  'el', 'los', 'las', 'unos', 'unas',
  // German
  'der', 'die', 'das', 'ein', 'eine',
]);

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip combining diacritics
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripArticles(normalizedAnswer: string): string {
  const tokens = normalizedAnswer.split(' ').filter(Boolean);
  // Strip leading articles
  while (tokens.length > 1 && ARTICLES.has(tokens[0])) tokens.shift();
  // Strip trailing articles too (rare but possible)
  while (tokens.length > 1 && ARTICLES.has(tokens[tokens.length - 1])) tokens.pop();
  return tokens.join(' ');
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Returns true if the correct answer leaks in the question text.
 */
function isLeak(questionText: string, correctAnswer: string): boolean {
  const ansRaw = (correctAnswer || '').trim();
  if (!ansRaw) return false;

  const ansN = stripArticles(normalize(ansRaw));
  const textN = normalize(questionText || '');
  if (!ansN || !textN) return false;

  // 1) Whole answer phrase appears in the question as a word-boundary match.
  if (ansN.length >= 4) {
    const wholeRe = new RegExp(`\\b${escapeRe(ansN)}\\b`);
    if (wholeRe.test(textN)) return true;
  }

  // 2) Multi-word answer: ALL significant tokens (>=4 chars) appear in question.
  const tokens = ansN.split(' ').filter((w) => w.length >= 4);
  if (tokens.length >= 2) {
    const allHit = tokens.every((w) => new RegExp(`\\b${escapeRe(w)}\\b`).test(textN));
    if (allHit) return true;
  }

  return false;
}

async function fetchAllActive(): Promise<Q[]> {
  const all: Q[] = [];
  let from = 0;
  const PAGE = 1000;
  while (true) {
    const { data, error } = await sb
      .from('questions')
      .select('id,category,language,question_text,correct_answer')
      .eq('is_active', true)
      .order('id')
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    all.push(...((data as unknown) as Q[]));
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return all;
}

async function disableInBatches(ids: string[]): Promise<number> {
  const BATCH = 500;
  let updated = 0;
  for (let i = 0; i < ids.length; i += BATCH) {
    const slice = ids.slice(i, i + BATCH);
    const { error, count } = await sb
      .from('questions')
      // @ts-ignore — generated types don't include is_active
      .update({ is_active: false }, { count: 'exact' })
      .in('id', slice);
    if (error) {
      console.warn(`  batch ${i}: ${error.message}`);
      continue;
    }
    updated += count ?? slice.length;
    console.log(`  disabled batch ${i / BATCH + 1} (${slice.length} ids)`);
  }
  return updated;
}

async function main() {
  console.log(`[disable_leaks] Fetching active questions...`);
  const all = await fetchAllActive();
  console.log(`[disable_leaks] Loaded ${all.length} active questions`);

  const flagged: Q[] = [];
  for (const q of all) {
    if (isLeak(q.question_text, q.correct_answer)) flagged.push(q);
  }

  console.log(`\n[disable_leaks] Flagged: ${flagged.length} / ${all.length}`);

  // Breakdown by category and language
  const byCat = new Map<string, number>();
  const byLang = new Map<string, number>();
  for (const q of flagged) {
    const c = q.category || '(null)';
    byCat.set(c, (byCat.get(c) ?? 0) + 1);
    byLang.set(q.language, (byLang.get(q.language) ?? 0) + 1);
  }

  console.log(`\nBy category:`);
  [...byCat.entries()]
    .sort((a, b) => b[1] - a[1])
    .forEach(([k, v]) => console.log(`  ${k.padEnd(24)} ${v}`));

  console.log(`\nBy language:`);
  [...byLang.entries()]
    .sort((a, b) => b[1] - a[1])
    .forEach(([k, v]) => console.log(`  ${k.padEnd(8)} ${v}`));

  console.log(`\nSample (20 flagged):`);
  flagged.slice(0, 20).forEach((q) => {
    console.log(
      `  [${q.language}] [${q.category}] ans="${q.correct_answer}" :: ${q.question_text.slice(0, 100)}`,
    );
  });

  if (DRY_RUN) {
    console.log(`\n[disable_leaks] DRY RUN — no DB updates.`);
    return;
  }

  if (flagged.length === 0) {
    console.log(`\n[disable_leaks] Nothing to disable.`);
    return;
  }

  console.log(`\n[disable_leaks] Disabling ${flagged.length} questions...`);
  const ids = flagged.map((q) => q.id);
  const updated = await disableInBatches(ids);
  console.log(`\n[disable_leaks] Done. Disabled ${updated} / ${flagged.length}.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
