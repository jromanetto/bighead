/**
 * Fetch logos from logo.dev for all logo questions in DB.
 *
 * For each unique brand (correct_answer of a logo question):
 *  1. GET https://api.logo.dev/search?q={brand}  (Bearer SK)
 *  2. Pick best candidate domain (filter denylist + prefer brand-name match)
 *  3. GET https://img.logo.dev/{domain}?token={pk}&format=png
 *  4. Upload to supabase storage bucket `question-images` at path `logos/{slug}.png`
 *  5. Update all questions with this brand: set image_url + neutralize question_text
 *
 * Run: npx tsx ./fetch_logos.ts [--dry-run] [--brand "Apple"]
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const LOGODEV_PK = process.env.LOGODEV_PK || 'pk_TujTU5IDT8W_iEAxa8hFyA';
const LOGODEV_SK = process.env.LOGODEV_SK || 'sk_be_j-BU7TiifOuPhP7qwGQ';
const BUCKET = 'question-images';
const STORAGE_PREFIX = 'logos';

const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

const DRY_RUN = process.argv.includes('--dry-run');
const SINGLE_BRAND_IDX = process.argv.indexOf('--brand');
const SINGLE_BRAND = SINGLE_BRAND_IDX >= 0 ? process.argv[SINGLE_BRAND_IDX + 1] : null;

const DOMAIN_DENYLIST = new Set([
  'bloomberg.com', 'crunchbase.com', 'linkedin.com', 'wikipedia.org',
  'yelp.com', 'facebook.com', 'twitter.com', 'instagram.com',
  'amazon.com', 'ebay.com', 'pinterest.com', 'youtube.com',
]);

interface LogoQuestion {
  id: string;
  category: string | null;
  language: string;
  question_text: string;
  correct_answer: string;
  image_url: string | null;
}

interface LogoCandidate {
  name?: string;
  domain?: string;
  logo_url?: string;
}

function slugify(brand: string): string {
  return brand
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function searchBrand(brand: string): Promise<LogoCandidate[]> {
  try {
    const r = await fetch(`https://api.logo.dev/search?q=${encodeURIComponent(brand)}`, {
      headers: { Authorization: `Bearer ${LOGODEV_SK}` },
    });
    if (!r.ok) return [];
    return (await r.json()) as LogoCandidate[];
  } catch (e) {
    console.warn(`  search error for ${brand}:`, e);
    return [];
  }
}

function pickBest(brand: string, candidates: LogoCandidate[]): LogoCandidate | null {
  if (!candidates.length) return null;
  const brandUp = brand.toUpperCase().replace(/[\s\-_]+/g, ' ').trim();

  const score = (c: LogoCandidate): number => {
    const name = (c.name || '').toUpperCase();
    const domain = (c.domain || '').toLowerCase();
    if (DOMAIN_DENYLIST.has(domain)) return -100;
    let s = 0;
    // Exact match
    if (name.replace(/[\s\-_]+/g, ' ').trim() === brandUp) s += 100;
    // Domain starts with brand
    const brandSlug = slugify(brand);
    if (domain.startsWith(brandSlug + '.')) s += 50;
    // Name contains brand
    if (name.includes(brandUp)) s += 20;
    // Penalize wikipedia-style entries
    if (name.includes('(')) s -= 5;
    // Prefer .com
    if (domain.endsWith('.com')) s += 5;
    return s;
  };

  const sorted = [...candidates].sort((a, b) => score(b) - score(a));
  const best = sorted[0];
  if (score(best) <= 0) return null;
  return best;
}

async function downloadLogo(domain: string): Promise<Buffer | null> {
  try {
    const url = `https://img.logo.dev/${domain}?token=${LOGODEV_PK}&format=png&size=512&retina=true`;
    const r = await fetch(url);
    if (!r.ok) return null;
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length < 1000) return null; // Suspicious tiny image
    return buf;
  } catch (e) {
    console.warn(`  download error for ${domain}:`, e);
    return null;
  }
}

async function uploadToStorage(slug: string, buf: Buffer): Promise<string | null> {
  const filePath = `${STORAGE_PREFIX}/${slug}.png`;
  const { error } = await sb.storage.from(BUCKET).upload(filePath, buf, {
    contentType: 'image/png',
    upsert: true,
  });
  if (error) {
    console.error(`  upload error:`, error.message);
    return null;
  }
  const { data } = sb.storage.from(BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

async function getAllLogoQuestions(): Promise<LogoQuestion[]> {
  const all: LogoQuestion[] = [];
  const PAGE = 1000;
  let from = 0;
  while (true) {
    const { data, error } = await sb
      .from('questions')
      .select('id,category,language,question_text,correct_answer,image_url')
      .or('category.eq.logo,question_text.ilike.%logo%,question_text.ilike.%marque%')
      .eq('is_active', true)
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    all.push(...(data as LogoQuestion[]));
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return all;
}

function neutralQuestionText(language: string): string {
  return language === 'fr'
    ? 'Quelle marque est représentée par ce logo ?'
    : 'Which brand is represented by this logo?';
}

async function main() {
  console.log(`[fetch_logos] dry=${DRY_RUN} brand=${SINGLE_BRAND || 'all'}`);
  const questions = await getAllLogoQuestions();
  console.log(`Loaded ${questions.length} logo-related questions`);

  // Group by brand (correct_answer)
  const brandMap = new Map<string, LogoQuestion[]>();
  for (const q of questions) {
    const brand = q.correct_answer.trim();
    if (!brand) continue;
    if (SINGLE_BRAND && brand.toLowerCase() !== SINGLE_BRAND.toLowerCase()) continue;
    if (!brandMap.has(brand)) brandMap.set(brand, []);
    brandMap.get(brand)!.push(q);
  }
  console.log(`${brandMap.size} unique brands`);

  // Cache to skip already-fetched logos
  const cacheFile = '/tmp/logo_cache.json';
  let cache: Record<string, string> = {};
  if (fs.existsSync(cacheFile)) {
    try { cache = JSON.parse(fs.readFileSync(cacheFile, 'utf-8')); } catch {}
  }

  let success = 0, failed = 0, updated = 0;
  const failures: string[] = [];

  for (const [brand, qs] of brandMap) {
    const slug = slugify(brand);
    let publicUrl = cache[brand];

    if (!publicUrl) {
      console.log(`\n[${brand}] (${qs.length} questions)`);
      const candidates = await searchBrand(brand);
      const best = pickBest(brand, candidates);
      if (!best || !best.domain) {
        console.log(`  ✗ no candidate found`);
        failed++;
        failures.push(brand);
        continue;
      }
      console.log(`  → domain: ${best.domain} (${best.name})`);
      const buf = await downloadLogo(best.domain);
      if (!buf) {
        console.log(`  ✗ download failed`);
        failed++;
        failures.push(brand);
        continue;
      }
      if (DRY_RUN) {
        console.log(`  [DRY] would upload ${buf.length} bytes to ${STORAGE_PREFIX}/${slug}.png`);
        success++;
        continue;
      }
      publicUrl = (await uploadToStorage(slug, buf)) || undefined;
      if (!publicUrl) {
        console.log(`  ✗ upload failed`);
        failed++;
        failures.push(brand);
        continue;
      }
      cache[brand] = publicUrl;
      fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2));
      console.log(`  ✓ uploaded → ${publicUrl}`);
      success++;
    } else {
      console.log(`[${brand}] cached → ${publicUrl}`);
    }

    // Update questions: image_url + neutralize question_text
    if (DRY_RUN) continue;
    for (const q of qs) {
      const newText = neutralQuestionText(q.language);
      const { error } = await sb
        .from('questions')
        // @ts-ignore
        .update({
          image_url: publicUrl,
          question_text: newText,
        })
        .eq('id', q.id);
      if (error) {
        console.warn(`  update error for ${q.id}: ${error.message}`);
      } else {
        updated++;
      }
    }
    // Throttle
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\nDONE — logos fetched: ${success}, failed: ${failed}, questions updated: ${updated}`);
  if (failures.length) {
    console.log(`Failures: ${failures.join(', ')}`);
    fs.writeFileSync('/tmp/logo_failures.txt', failures.join('\n'));
  }
}

main().catch(e => { console.error(e); process.exit(1); });
