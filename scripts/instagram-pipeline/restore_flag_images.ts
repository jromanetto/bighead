/**
 * One-shot recovery for the 90 questions whose flag image_url got NULLed
 * by an early run of fix_broken_images.ts (before flag detection covered
 * supabase-hosted flags).
 *
 * Reads /tmp/fix_images_report.json, extracts the country codes that were
 * disabled, then for each affected geography question whose correct_answer
 * maps to one of those codes, sets image_url to a working flagcdn URL.
 *
 * Idempotent: only touches questions where image_url IS NULL and the
 * country name matches one of the recovered codes.
 *
 * Run: npx tsx restore_flag_images.ts
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
dotenv.config();

const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

const REPORT_FILE = '/tmp/fix_images_report.json';

// ISO-3166 alpha-2 → display name (both FR + EN tolerances)
// Only the codes that appeared in the disabled list — we don't need all 250.
const CODE_TO_NAMES: Record<string, string[]> = {
  nl: ['pays-bas', 'netherlands', 'hollande', 'holland'],
  at: ['autriche', 'austria'],
  pe: ['pérou', 'perou', 'peru'],
  ch: ['suisse', 'switzerland'],
  se: ['suède', 'suede', 'sweden'],
  hu: ['hongrie', 'hungary'],
  pl: ['pologne', 'poland'],
  de: ['allemagne', 'germany'],
  bg: ['bulgarie', 'bulgaria'],
  ru: ['russie', 'russia'],
  ua: ['ukraine'],
  lu: ['luxembourg'],
  ee: ['estonie', 'estonia'],
  lv: ['lettonie', 'latvia'],
  lt: ['lituanie', 'lithuania'],
  mc: ['monaco'],
  th: ['thaïlande', 'thailande', 'thailand'],
  id: ['indonésie', 'indonesie', 'indonesia'],
  am: ['arménie', 'armenie', 'armenia'],
  ng: ['nigéria', 'nigeria'],
  bw: ['botswana'],
  ga: ['gabon'],
  bj: ['bénin', 'benin'],
};

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

async function loadGeographyNulls(): Promise<{ id: string; correct_answer: string }[]> {
  const all: { id: string; correct_answer: string }[] = [];
  const PAGE = 1000;
  let from = 0;
  while (true) {
    const { data, error } = await sb
      .from('questions')
      .select('id, correct_answer, category')
      .is('image_url', null)
      .eq('is_active', true)
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    (data as any[]).forEach(r => {
      if (!r.correct_answer) return;
      all.push({ id: r.id, correct_answer: r.correct_answer });
    });
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return all;
}

async function checkUrl(url: string): Promise<boolean> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 10000);
    const r = await fetch(url, { signal: ctrl.signal });
    clearTimeout(t);
    if (!r.ok) return false;
    const buf = new Uint8Array(await r.arrayBuffer());
    if (buf.byteLength < 50) return false;
    // Validate it's a PNG with sensible dims
    if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
      const w = (buf[16] << 24) | (buf[17] << 16) | (buf[18] << 8) | buf[19];
      const h = (buf[20] << 24) | (buf[21] << 16) | (buf[22] << 8) | buf[23];
      return w >= 50 && h >= 50;
    }
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (!fs.existsSync(REPORT_FILE)) {
    console.error('No report at', REPORT_FILE);
    process.exit(1);
  }
  const report = JSON.parse(fs.readFileSync(REPORT_FILE, 'utf-8'));
  const nulledUrls: string[] = report?.nulled?.urls || [];
  // Extract codes
  const codes = new Set<string>();
  for (const url of nulledUrls) {
    const m = url.match(/\/flags\/([a-z]{2})\.png/i);
    if (m) codes.add(m[1].toLowerCase());
  }
  console.log(`Recovering flags for ${codes.size} country codes: ${Array.from(codes).join(', ')}`);

  // Build name → code map (both directions) using CODE_TO_NAMES
  const nameToCode = new Map<string, string>();
  for (const [code, names] of Object.entries(CODE_TO_NAMES)) {
    if (!codes.has(code)) continue;
    for (const n of names) nameToCode.set(normalize(n), code);
  }

  // Load all questions where image_url IS NULL
  const candidates = await loadGeographyNulls();
  console.log(`Scanning ${candidates.length} NULL-image questions...`);

  // Map code -> list of question ids
  const byCode = new Map<string, string[]>();
  for (const q of candidates) {
    const key = normalize(q.correct_answer);
    const code = nameToCode.get(key);
    if (!code) continue;
    if (!byCode.has(code)) byCode.set(code, []);
    byCode.get(code)!.push(q.id);
  }

  // Pre-check each flag CDN URL once, sequentially with retries
  const codeToUrl = new Map<string, string>();
  for (const code of byCode.keys()) {
    const sizes = ['w320', 'w640', 'w160'];
    let found: string | null = null;
    for (const sz of sizes) {
      const url = `https://flagcdn.com/${sz}/${code}.png`;
      for (let attempt = 0; attempt < 3; attempt++) {
        const ok = await checkUrl(url);
        if (ok) { found = url; break; }
        await new Promise(r => setTimeout(r, 500));
      }
      if (found) break;
    }
    if (found) {
      codeToUrl.set(code, found);
    } else {
      // flagsapi fallback
      const url = `https://flagsapi.com/${code.toUpperCase()}/flat/64.png`;
      const ok = await checkUrl(url);
      if (ok) {
        codeToUrl.set(code, url);
      } else {
        console.warn(`  flagcdn unavailable for ${code}`);
      }
    }
    await new Promise(r => setTimeout(r, 250));
  }

  let restored = 0;
  for (const [code, ids] of byCode) {
    const url = codeToUrl.get(code);
    if (!url) continue;
    const { error } = await (sb.from('questions') as any)
      .update({ image_url: url })
      .in('id', ids);
    if (error) {
      console.warn(`  ✗ ${code}: ${error.message}`);
      continue;
    }
    console.log(`  ✓ ${code} (${ids.length} q) → ${url}`);
    restored += ids.length;
  }
  console.log(`\nRestored ${restored} questions.`);
}

main().catch(e => { console.error(e); process.exit(1); });
