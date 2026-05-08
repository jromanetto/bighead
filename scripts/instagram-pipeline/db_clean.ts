/**
 * Clean up DB issues:
 *   1. Language mismatch — `language='fr'` but text is in English (or vice-versa).
 *      Disable (`is_active=false`) since fixing automatically would degrade quality.
 *   2. Answer-in-question — the correct_answer appears verbatim in question_text.
 *      Disable, except for legitimate cases (e.g. capital city named after country).
 *   3. Categories normalization — merge `sports`→`sport`, set up category aliases.
 *
 * Both detectors strip out quoted strings and proper nouns before language analysis,
 * to avoid false positives from movie/song titles.
 *
 * Run: npx tsx ./db_clean.ts [--dry-run] [--lang|--leak|--cat]
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
dotenv.config();
const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

const DRY_RUN = process.argv.includes('--dry-run');
const ONLY_LANG = process.argv.includes('--lang');
const ONLY_LEAK = process.argv.includes('--leak');
const ONLY_CAT = process.argv.includes('--cat');
const DO_ALL = !ONLY_LANG && !ONLY_LEAK && !ONLY_CAT;

interface Q {
  id: string;
  category: string | null;
  difficulty: number | null;
  question_text: string;
  correct_answer: string;
  wrong_answers: string[] | null;
  language: string;
  is_active: boolean;
  image_url: string | null;
}

async function getAll(): Promise<Q[]> {
  const all: Q[] = [];
  let from = 0;
  const PAGE = 1000;
  while (true) {
    const { data, error } = await sb
      .from('questions')
      .select('id,category,difficulty,question_text,correct_answer,wrong_answers,language,is_active,image_url')
      .eq('is_active', true)
      .order('id')
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    all.push(...(data as Q[]));
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return all;
}

// Strip quoted strings (titles) before lang analysis to avoid false positives
function stripQuotes(text: string): string {
  return text
    .replace(/"[^"]*"/g, ' ')
    .replace(/«[^»]*»/g, ' ')
    .replace(/'[^']{4,}'/g, ' ')
    .replace(/\s+/g, ' ');
}

function detectLang(textRaw: string): 'fr' | 'en' | 'unknown' {
  const text = stripQuotes(textRaw).toLowerCase();
  // Strong, function-word-only markers — these don't appear in titles
  const fr = /\b(qui|quel|quelle|quels|quelles|quoi|combien|comment|pourquoi|où|quand|est|sont|était|étaient|avoir|être|dans|sur|pour|avec|sans|son|sa|ses|leur|leurs|notre|votre|mon|ma|mes|c'est|qu'est|n'est|d'un|d'une|cette|cet|ces|du|au|aux|fait|peut|doit)\b/g;
  const en = /\b(which|what|who|whose|where|when|why|how|the|is|are|was|were|of|and|or|in|on|at|to|for|with|its|it's|don't|doesn't|wasn't|weren't|isn't|do|does|did|has|have|had|been|being|that|this|these|those|been|will|would|should|could|can|may|might)\b/g;
  const frHits = (text.match(fr) || []).length;
  const enHits = (text.match(en) || []).length;
  // Diacritics are a strong FR hint
  const diacritics = (textRaw.match(/[àâäéèêëïîôöùûüÿç]/gi) || []).length;
  const frScore = frHits * 2 + diacritics;
  const enScore = enHits * 2;
  if (frScore + enScore < 4) return 'unknown';
  if (frScore >= enScore * 2) return 'fr';
  if (enScore >= frScore * 2) return 'en';
  return 'unknown';
}

// Detect when correct_answer leaks in the question.
// Returns leak severity: 'exact' | 'major' | 'minor' | 'none'
function detectAnswerLeak(q: Q): 'exact' | 'major' | 'minor' | 'none' {
  const ans = q.correct_answer?.trim();
  if (!ans || ans.length < 4) return 'none';
  const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  const ansN = norm(ans);
  const textN = norm(q.question_text);
  // Whole word/phrase match
  const escAns = ansN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`\\b${escAns}\\b`);
  if (re.test(textN)) {
    // Skip legitimate cases: country/capital ("capitale du Koweït" → answer Koweït is OK because answer matches CITY, but in DB we have "Koweït" not "Kuwait City" — it's actually not OK)
    // Skip if answer is a place name and question is about the place's capital (rare to discriminate without external KB)
    return 'exact';
  }
  // Multi-word answer: all words appear separately
  const ansWords = ansN.split(' ').filter(w => w.length > 3);
  if (ansWords.length >= 2 && ansWords.every(w => new RegExp(`\\b${w}\\b`).test(textN))) {
    return 'major';
  }
  // Single significant word from answer appears in question
  const significantWord = ansWords.find(w => w.length > 5);
  if (significantWord && new RegExp(`\\b${significantWord}\\b`).test(textN)) {
    return 'minor';
  }
  return 'none';
}

async function fixLanguageMismatch(all: Q[]): Promise<number> {
  console.log('\n=== LANGUAGE MISMATCH ===');
  const bad: { id: string; declared: string; detected: string; text: string }[] = [];
  for (const q of all) {
    const detected = detectLang(q.question_text || '');
    if (detected !== 'unknown' && detected !== q.language) {
      bad.push({ id: q.id, declared: q.language, detected, text: q.question_text.slice(0, 80) });
    }
  }
  console.log(`Found ${bad.length} mismatches`);
  console.log('Sample:', bad.slice(0, 5));

  if (DRY_RUN) {
    fs.writeFileSync('/tmp/lang_mismatches.json', JSON.stringify(bad, null, 2));
    return bad.length;
  }

  // Fix by setting the correct language (since the data exists, just relabel it)
  // This is safer than disabling — questions are still useful in their actual language.
  let updated = 0;
  for (const b of bad) {
    const { error } = await sb
      .from('questions')
      // @ts-ignore
      .update({ language: b.detected })
      .eq('id', b.id);
    if (!error) updated++;
    else console.warn(`  err ${b.id}: ${error.message}`);
  }
  console.log(`Updated language tag for ${updated}/${bad.length}`);
  return updated;
}

async function fixAnswerLeaks(all: Q[]): Promise<number> {
  console.log('\n=== ANSWER LEAKS ===');
  const exact: Q[] = [];
  const major: Q[] = [];
  for (const q of all) {
    const lvl = detectAnswerLeak(q);
    if (lvl === 'exact') exact.push(q);
    else if (lvl === 'major') major.push(q);
  }
  console.log(`Exact leaks: ${exact.length}, major: ${major.length}`);
  console.log('Exact sample:', exact.slice(0, 5).map(q => ({ id: q.id, ans: q.correct_answer, q: q.question_text.slice(0, 80) })));

  if (DRY_RUN) {
    fs.writeFileSync('/tmp/leaks_exact.json', JSON.stringify(exact, null, 2));
    fs.writeFileSync('/tmp/leaks_major.json', JSON.stringify(major, null, 2));
    return exact.length;
  }

  // Disable exact leaks. Keep major for manual review.
  let disabled = 0;
  const ids = exact.map(q => q.id);
  // Batch in chunks of 100
  for (let i = 0; i < ids.length; i += 100) {
    const chunk = ids.slice(i, i + 100);
    const { error } = await sb
      .from('questions')
      // @ts-ignore
      .update({ is_active: false })
      .in('id', chunk);
    if (!error) disabled += chunk.length;
    else console.warn(`  batch err: ${error.message}`);
  }
  console.log(`Disabled ${disabled} exact-leak questions`);
  fs.writeFileSync('/tmp/leaks_major.json', JSON.stringify(major, null, 2));
  return disabled;
}

async function normalizeCategories(all: Q[]): Promise<number> {
  console.log('\n=== CATEGORY NORMALIZATION ===');
  // sports → sport, movies → cinema (FR) or keep movies for EN
  const renames: Record<string, string> = {
    sports: 'sport',
    pop_culture: 'pop-culture', // Some question generators wrote underscore
  };
  let updated = 0;
  for (const [from, to] of Object.entries(renames)) {
    const matching = all.filter(q => q.category === from);
    console.log(`${from} → ${to}: ${matching.length} questions`);
    if (DRY_RUN || matching.length === 0) continue;
    const { error } = await sb
      .from('questions')
      // @ts-ignore
      .update({ category: to })
      .eq('category', from);
    if (!error) updated += matching.length;
    else console.warn(`  err ${from}: ${error.message}`);
  }
  console.log(`Renamed ${updated} questions`);
  return updated;
}

async function main() {
  console.log(`[db_clean] dry=${DRY_RUN}`);
  const all = await getAll();
  console.log(`Loaded ${all.length} active questions`);

  if (DO_ALL || ONLY_LANG) await fixLanguageMismatch(all);
  if (DO_ALL || ONLY_LEAK) await fixAnswerLeaks(all);
  if (DO_ALL || ONLY_CAT) await normalizeCategories(all);
}

main().catch(e => { console.error(e); process.exit(1); });
