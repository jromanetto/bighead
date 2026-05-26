/**
 * Combined audit + fix script for broken question image URLs.
 *
 * Pipeline:
 *  1. Audit  — fetch every distinct image_url across active questions and
 *             validate (HTTP 200, image/* content-type, > 200 bytes, valid
 *             PNG/JPEG/GIF/WebP signature).
 *  2. Logos  — refetch via logo.dev for any broken logo URL (clearbit/logo.dev/
 *             category=logo), grouped by correct_answer brand. Upload to
 *             supabase storage `question-images/logos/<slug>.png`.
 *  3. Flags  — try alternative flag CDNs (flagcdn at different sizes, flagsapi).
 *  4. Other  — NULL the image_url so the app renders graceful fallback.
 *  5. Re-audit and report.
 *
 * Idempotent — uses /tmp/fix_images_cache.json for already-fixed brands.
 *
 * Run: npx tsx fix_broken_images.ts [--dry-run]
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const LOGODEV_PK = process.env.LOGO_DEV_PK || process.env.LOGODEV_PK || 'pk_TujTU5IDT8W_iEAxa8hFyA';
const LOGODEV_SK = process.env.LOGO_DEV_SK || process.env.LOGODEV_SK || 'sk_be_j-BU7TiifOuPhP7qwGQ';

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const BUCKET = 'question-images';
const LOGOS_PREFIX = 'logos';
const CACHE_FILE = '/tmp/fix_images_cache.json';
const REPORT_FILE = '/tmp/fix_images_report.json';

const DRY_RUN = process.argv.includes('--dry-run');
const FETCH_TIMEOUT_MS = 10_000;
const CONCURRENCY = 20;

// ---------------- Types ----------------

interface QuestionRow {
  id: string;
  category: string | null;
  language: string;
  question_text: string;
  correct_answer: string;
  image_url: string | null;
}

interface AuditResult {
  url: string;
  ok: boolean;
  status: number;
  size: number;
  width: number;
  height: number;
  contentType: string;
  reason: string;
  questionIds: string[];
}

interface LogoCandidate {
  name?: string;
  domain?: string;
  logo_url?: string;
  confidence?: number;
}

// ---------------- Helpers ----------------

function slugify(brand: string): string {
  return brand
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function parseImageDims(buf: Uint8Array): { width: number; height: number; format: string } {
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    const w = (buf[16] << 24) | (buf[17] << 16) | (buf[18] << 8) | buf[19];
    const h = (buf[20] << 24) | (buf[21] << 16) | (buf[22] << 8) | buf[23];
    return { width: w, height: h, format: 'png' };
  }
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i < buf.length - 1) {
      if (buf[i] !== 0xff) break;
      const marker = buf[i + 1];
      if (marker >= 0xc0 && marker <= 0xc3) {
        const h = (buf[i + 5] << 8) | buf[i + 6];
        const w = (buf[i + 7] << 8) | buf[i + 8];
        return { width: w, height: h, format: 'jpeg' };
      }
      const segLen = (buf[i + 2] << 8) | buf[i + 3];
      i += 2 + segLen;
    }
    return { width: 0, height: 0, format: 'jpeg' };
  }
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) {
    const w = buf[6] | (buf[7] << 8);
    const h = buf[8] | (buf[9] << 8);
    return { width: w, height: h, format: 'gif' };
  }
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[8] === 0x57 && buf[9] === 0x45) {
    return { width: -1, height: -1, format: 'webp' };
  }
  return { width: 0, height: 0, format: 'unknown' };
}

async function fetchWithTimeout(url: string, ms = FETCH_TIMEOUT_MS): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

async function checkUrl(url: string): Promise<Omit<AuditResult, 'url' | 'questionIds'>> {
  try {
    const r = await fetchWithTimeout(url);
    const buf = new Uint8Array(await r.arrayBuffer());
    const size = buf.byteLength;
    const ct = r.headers.get('content-type') || '';
    if (!r.ok) return { ok: false, status: r.status, size, width: 0, height: 0, contentType: ct, reason: `HTTP ${r.status}` };
    // 50-byte minimum (real flag PNGs can be < 200 bytes when highly compressible)
    if (size < 50) return { ok: false, status: r.status, size, width: 0, height: 0, contentType: ct, reason: `truncated (${size}b)` };
    if (!ct.startsWith('image/')) return { ok: false, status: r.status, size, width: 0, height: 0, contentType: ct, reason: `wrong content-type: ${ct}` };
    const { width, height, format } = parseImageDims(buf);
    if (format === 'unknown') return { ok: false, status: r.status, size, width, height, contentType: ct, reason: 'unknown image signature' };
    // Dimension check is the real validator; webp doesn't expose dims via header parse
    if (format !== 'webp' && (width < 50 || height < 50)) return { ok: false, status: r.status, size, width, height, contentType: ct, reason: `too small ${width}x${height}` };
    return { ok: true, status: r.status, size, width, height, contentType: ct, reason: 'ok' };
  } catch (e: any) {
    return { ok: false, status: 0, size: 0, width: 0, height: 0, contentType: '', reason: `fetch err: ${e.message || e.name}` };
  }
}

function domainBucket(url: string): 'clearbit' | 'logodev' | 'flagcdn' | 'flagsapi' | 'unsplash' | 'supabase' | 'other' {
  if (url.includes('logo.clearbit.com')) return 'clearbit';
  if (url.includes('logo.dev') || url.includes('img.logo.dev')) return 'logodev';
  if (url.includes('flagcdn.com')) return 'flagcdn';
  if (url.includes('flagsapi.com')) return 'flagsapi';
  if (url.includes('images.unsplash.com') || url.includes('unsplash.com')) return 'unsplash';
  if (url.includes('supabase.co/storage')) return 'supabase';
  return 'other';
}

// ---------------- Data loading ----------------

async function loadActiveQuestions(): Promise<QuestionRow[]> {
  const all: QuestionRow[] = [];
  const PAGE = 1000;
  let from = 0;
  while (true) {
    const { data, error } = await sb
      .from('questions')
      .select('id,category,language,question_text,correct_answer,image_url')
      .eq('is_active', true)
      .not('image_url', 'is', null)
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    all.push(...(data as QuestionRow[]));
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return all;
}

function groupByUrl(rows: QuestionRow[]): Map<string, QuestionRow[]> {
  const m = new Map<string, QuestionRow[]>();
  for (const r of rows) {
    if (!r.image_url) continue;
    if (!m.has(r.image_url)) m.set(r.image_url, []);
    m.get(r.image_url)!.push(r);
  }
  return m;
}

// ---------------- Audit ----------------

async function audit(urlMap: Map<string, QuestionRow[]>): Promise<AuditResult[]> {
  const urls = Array.from(urlMap.keys());
  const results: AuditResult[] = [];
  let i = 0;
  const tick = setInterval(() => process.stdout.write(`\r  audit: ${i}/${urls.length}`), 1000);
  async function worker() {
    while (i < urls.length) {
      const idx = i++;
      const url = urls[idx];
      const r = await checkUrl(url);
      results.push({ url, ...r, questionIds: urlMap.get(url)!.map(q => q.id) });
    }
  }
  await Promise.all(Array(CONCURRENCY).fill(0).map(() => worker()));
  clearInterval(tick);
  process.stdout.write('\n');
  return results;
}

function summarizeBroken(broken: AuditResult[]): Record<string, number> {
  const buckets: Record<string, number> = {};
  for (const r of broken) {
    const b = domainBucket(r.url);
    buckets[b] = (buckets[b] || 0) + 1;
  }
  return buckets;
}

// ---------------- Logo.dev fixes ----------------

async function searchBrand(brand: string): Promise<LogoCandidate[]> {
  try {
    const r = await fetchWithTimeout(`https://api.logo.dev/search?q=${encodeURIComponent(brand)}`);
    if (!r.ok) return [];
    // Re-fetch with auth header (search needs SK)
    const r2 = await fetch(`https://api.logo.dev/search?q=${encodeURIComponent(brand)}`, {
      headers: { Authorization: `Bearer ${LOGODEV_SK}` },
    });
    if (!r2.ok) return [];
    const json = (await r2.json()) as LogoCandidate[];
    return Array.isArray(json) ? json : [];
  } catch {
    return [];
  }
}

const DOMAIN_DENYLIST = new Set([
  'bloomberg.com', 'crunchbase.com', 'linkedin.com', 'wikipedia.org',
  'yelp.com', 'facebook.com', 'twitter.com', 'instagram.com',
  'amazon.com', 'ebay.com', 'pinterest.com', 'youtube.com',
]);

function pickBestCandidate(brand: string, candidates: LogoCandidate[]): LogoCandidate | null {
  if (!candidates.length) return null;
  const brandUp = brand.toUpperCase().replace(/[\s\-_]+/g, ' ').trim();
  const brandSlug = slugify(brand);
  const score = (c: LogoCandidate): number => {
    const name = (c.name || '').toUpperCase();
    const domain = (c.domain || '').toLowerCase();
    if (DOMAIN_DENYLIST.has(domain)) return -100;
    let s = 0;
    if (typeof c.confidence === 'number') s += c.confidence * 100;
    if (name.replace(/[\s\-_]+/g, ' ').trim() === brandUp) s += 100;
    if (domain.startsWith(brandSlug + '.')) s += 50;
    if (name.includes(brandUp)) s += 20;
    if (name.includes('(')) s -= 5;
    if (domain.endsWith('.com')) s += 5;
    return s;
  };
  const sorted = [...candidates].sort((a, b) => score(b) - score(a));
  const best = sorted[0];
  // Accept if either confidence > 0.6 OR we beat the name-match threshold
  const conf = typeof best.confidence === 'number' ? best.confidence : 1;
  if (conf < 0.6 && score(best) < 50) return null;
  return best.domain ? best : null;
}

async function downloadLogo(domain: string): Promise<Buffer | null> {
  try {
    const url = `https://img.logo.dev/${domain}?token=${LOGODEV_PK}&size=200&format=png&retina=true`;
    const r = await fetchWithTimeout(url);
    if (!r.ok) return null;
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length < 1000) return null;
    // PNG signature check
    if (buf[0] !== 0x89 || buf[1] !== 0x50 || buf[2] !== 0x4e || buf[3] !== 0x47) return null;
    return buf;
  } catch {
    return null;
  }
}

async function uploadLogoToStorage(slug: string, buf: Buffer): Promise<string | null> {
  const filePath = `${LOGOS_PREFIX}/${slug}.png`;
  const { error } = await sb.storage.from(BUCKET).upload(filePath, buf, {
    contentType: 'image/png',
    upsert: true,
  });
  if (error) {
    console.warn(`  ✗ storage upload error for ${slug}: ${error.message}`);
    return null;
  }
  const { data } = sb.storage.from(BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

// ---------------- Flag fixes ----------------

function extractFlagCode(url: string): string | null {
  // flagcdn.com/w320/fr.png  OR  flagcdn.com/fr.svg
  let m = url.match(/flagcdn\.com\/(?:[a-z0-9]+\/)?([a-z]{2})\.(?:png|svg|jpg)/i);
  if (m) return m[1].toLowerCase();
  // supabase storage hosted: /question-images/flags/fr.png
  m = url.match(/\/flags\/([a-z]{2})\.(?:png|svg|jpg)/i);
  if (m) return m[1].toLowerCase();
  // flagsapi.com/FR/flat/64.png
  m = url.match(/flagsapi\.com\/([A-Z]{2})\//);
  if (m) return m[1].toLowerCase();
  return null;
}

function isFlagUrl(url: string): boolean {
  return /flagcdn\.com|flagsapi\.com|\/flags\//i.test(url);
}

function isLogoUrl(url: string): boolean {
  return /clearbit|logo\.dev|\/logos\//i.test(url);
}

async function tryAlternativeFlag(url: string): Promise<string | null> {
  const code = extractFlagCode(url);
  if (!code) return null;
  const candidates: string[] = [];
  // Default flagcdn at known sizes
  if (!url.includes('w320')) candidates.push(`https://flagcdn.com/w320/${code}.png`);
  if (!url.includes('w640')) candidates.push(`https://flagcdn.com/w640/${code}.png`);
  if (!url.includes('w160')) candidates.push(`https://flagcdn.com/w160/${code}.png`);
  // flagsapi fallback
  candidates.push(`https://flagsapi.com/${code.toUpperCase()}/flat/64.png`);
  for (const c of candidates) {
    const r = await checkUrl(c);
    if (r.ok) return c;
  }
  return null;
}

// ---------------- Update questions ----------------

async function updateQuestionsImageUrl(questionIds: string[], newUrl: string | null, credit?: string | null) {
  if (questionIds.length === 0) return 0;
  const patch: Record<string, any> = { image_url: newUrl };
  if (credit !== undefined) patch.image_credit = credit;
  const { error } = await (sb.from('questions') as any).update(patch).in('id', questionIds);
  if (error) {
    console.warn(`  ✗ update error: ${error.message}`);
    return 0;
  }
  return questionIds.length;
}

// ---------------- Main ----------------

async function main() {
  console.log(`[fix_broken_images] dry=${DRY_RUN}`);
  console.log('Loading active questions with image_url...');
  const questions = await loadActiveQuestions();
  console.log(`  ${questions.length} questions, ${new Set(questions.map(q => q.image_url)).size} unique URLs`);

  const urlMap = groupByUrl(questions);
  // Map: question id -> row (for quick lookups by brand)
  const byId = new Map<string, QuestionRow>();
  questions.forEach(q => byId.set(q.id, q));

  console.log('\n=== Phase 1: AUDIT ===');
  const results = await audit(urlMap);
  const broken = results.filter(r => !r.ok);
  const affected = broken.reduce((s, r) => s + r.questionIds.length, 0);
  console.log(`Broken: ${broken.length}/${results.length} URLs (${affected} questions affected)`);
  if (broken.length > 0) {
    console.log('Breakdown by domain:');
    for (const [k, v] of Object.entries(summarizeBroken(broken)).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${k}: ${v}`);
    }
  }

  // Load idempotency cache (brand -> public storage URL)
  let cache: Record<string, string> = {};
  if (fs.existsSync(CACHE_FILE)) {
    try { cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8')); } catch {}
  }

  // ---- Phase 2: Logos ----
  console.log('\n=== Phase 2: LOGO FIXES ===');
  // Identify broken logo URLs (clearbit / logo.dev / supabase /logos/ / category=logo)
  const brokenLogoResults = broken.filter(r => {
    if (isLogoUrl(r.url)) return true;
    // Also catch by category from affected questions (logo category but URL elsewhere)
    return r.questionIds.some(id => byId.get(id)?.category === 'logo');
  });

  // Group affected questions by correct_answer brand
  const brandToQs = new Map<string, QuestionRow[]>();
  for (const res of brokenLogoResults) {
    for (const qid of res.questionIds) {
      const q = byId.get(qid);
      if (!q) continue;
      const brand = (q.correct_answer || '').trim();
      if (!brand) continue;
      if (!brandToQs.has(brand)) brandToQs.set(brand, []);
      brandToQs.get(brand)!.push(q);
    }
  }
  console.log(`  ${brandToQs.size} unique brands to refetch (${brokenLogoResults.length} broken logo URLs)`);

  let logosFixed = 0;
  let questionsLogoUpdated = 0;
  const logoFailures: string[] = [];

  for (const [brand, qs] of brandToQs) {
    const slug = slugify(brand);
    let publicUrl: string | undefined = cache[brand];
    if (publicUrl) {
      console.log(`  [${brand}] cached → ${publicUrl}`);
    } else {
      console.log(`  [${brand}] searching...`);
      const candidates = await searchBrand(brand);
      const best = pickBestCandidate(brand, candidates);
      if (!best || !best.domain) {
        console.log(`    ✗ no candidate`);
        logoFailures.push(brand);
        continue;
      }
      console.log(`    → ${best.domain} (${best.name || ''}) conf=${best.confidence ?? 'n/a'}`);
      const buf = await downloadLogo(best.domain);
      if (!buf) {
        console.log(`    ✗ download failed`);
        logoFailures.push(brand);
        continue;
      }
      if (DRY_RUN) {
        console.log(`    [DRY] would upload ${buf.length} bytes`);
        logosFixed++;
        continue;
      }
      publicUrl = (await uploadLogoToStorage(slug, buf)) || undefined;
      if (!publicUrl) {
        logoFailures.push(brand);
        continue;
      }
      cache[brand] = publicUrl;
      fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
      console.log(`    ✓ uploaded → ${publicUrl}`);
      logosFixed++;
    }

    if (!DRY_RUN && publicUrl) {
      const updated = await updateQuestionsImageUrl(qs.map(q => q.id), publicUrl, 'logo.dev');
      questionsLogoUpdated += updated;
    }

    await new Promise(r => setTimeout(r, 200));
  }

  // ---- Phase 3: Flags ----
  console.log('\n=== Phase 3: FLAG FIXES ===');
  // Any broken URL that looks like a flag (flagcdn, flagsapi, or supabase /flags/)
  // and was NOT already swept into the logo phase above.
  const logoUrlSet = new Set(brokenLogoResults.map(r => r.url));
  const brokenFlagResults = broken.filter(r => !logoUrlSet.has(r.url) && isFlagUrl(r.url));
  console.log(`  ${brokenFlagResults.length} broken flag URLs`);

  let flagsFixed = 0;
  let questionsFlagUpdated = 0;
  const flagFailures: string[] = [];
  const flagFixedUrlSet = new Set<string>();

  for (const res of brokenFlagResults) {
    const alt = await tryAlternativeFlag(res.url);
    if (alt) {
      console.log(`  ✓ ${res.url.slice(-50)} → ${alt}`);
      if (!DRY_RUN) {
        const n = await updateQuestionsImageUrl(res.questionIds, alt);
        questionsFlagUpdated += n;
      }
      flagsFixed++;
      flagFixedUrlSet.add(res.url);
    } else {
      flagFailures.push(res.url);
    }
  }

  // ---- Phase 4: NULL the rest ----
  console.log('\n=== Phase 4: NULL OTHERS ===');
  // NULL any broken URL we did NOT fix above (logo or flag). The app's
  // QuestionImage falls back to a styled placeholder when image_url is null.
  const toNullQuestionIds: string[] = [];
  const nulledUrls: string[] = [];
  for (const res of broken) {
    // Skip flags we successfully replaced
    if (flagFixedUrlSet.has(res.url)) continue;
    // Skip logo URLs whose every affected brand was successfully fixed
    if (logoUrlSet.has(res.url)) {
      const allBrandsFixed = res.questionIds.every(qid => {
        const brand = byId.get(qid)?.correct_answer?.trim();
        return !!(brand && cache[brand]);
      });
      if (allBrandsFixed) continue;
    }
    res.questionIds.forEach(qid => toNullQuestionIds.push(qid));
    nulledUrls.push(res.url);
  }

  console.log(`  ${toNullQuestionIds.length} questions to NULL (${nulledUrls.length} unique URLs)`);
  let nulled = 0;
  if (!DRY_RUN && toNullQuestionIds.length > 0) {
    // Chunk to avoid PostgREST request limits
    const CHUNK = 200;
    for (let i = 0; i < toNullQuestionIds.length; i += CHUNK) {
      const slice = toNullQuestionIds.slice(i, i + CHUNK);
      nulled += await updateQuestionsImageUrl(slice, null);
    }
  }
  if (nulledUrls.length > 0) {
    console.log('  Disabled URLs (first 10):');
    nulledUrls.slice(0, 10).forEach(u => console.log(`    ${u}`));
  }

  // ---- Phase 5: Re-audit ----
  console.log('\n=== Phase 5: RE-AUDIT ===');
  let finalBrokenCount = 0;
  let finalAffected = 0;
  if (DRY_RUN) {
    console.log('  [DRY] skipping re-audit');
  } else {
    const refreshed = await loadActiveQuestions();
    const refMap = groupByUrl(refreshed);
    const refResults = await audit(refMap);
    const refBroken = refResults.filter(r => !r.ok);
    finalBrokenCount = refBroken.length;
    finalAffected = refBroken.reduce((s, r) => s + r.questionIds.length, 0);
    console.log(`  Final broken: ${finalBrokenCount}/${refResults.length} URLs (${finalAffected} questions)`);
  }

  // ---- Final report ----
  const report = {
    dry_run: DRY_RUN,
    initial: {
      total_questions_with_image: questions.length,
      unique_urls: urlMap.size,
      broken_urls: broken.length,
      affected_questions: affected,
      breakdown: summarizeBroken(broken),
    },
    logos: {
      brands_attempted: brandToQs.size,
      fixed: logosFixed,
      questions_updated: questionsLogoUpdated,
      failures: logoFailures,
    },
    flags: {
      attempted: brokenFlagResults.length,
      fixed: flagsFixed,
      questions_updated: questionsFlagUpdated,
      failures: flagFailures,
    },
    nulled: {
      questions: nulled,
      unique_urls: nulledUrls.length,
      urls: nulledUrls,
    },
    final: {
      broken_urls: finalBrokenCount,
      affected_questions: finalAffected,
    },
    cache_file: CACHE_FILE,
  };

  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
  console.log('\n=========================================');
  console.log('FINAL SUMMARY');
  console.log('=========================================');
  console.log(`  Initial broken : ${broken.length} URLs (${affected} questions)`);
  console.log(`  Logos fixed    : ${logosFixed} (${questionsLogoUpdated} questions)`);
  console.log(`  Flags fixed    : ${flagsFixed} (${questionsFlagUpdated} questions)`);
  console.log(`  NULLed         : ${nulled} questions (${nulledUrls.length} URLs)`);
  console.log(`  Final broken   : ${finalBrokenCount} URLs (${finalAffected} questions)`);
  console.log(`  Cache file     : ${CACHE_FILE}`);
  console.log(`  Report         : ${REPORT_FILE}`);
  if (logoFailures.length) console.log(`  Logo failures  : ${logoFailures.length} brands`);
  if (flagFailures.length) console.log(`  Flag failures  : ${flagFailures.length} URLs`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
