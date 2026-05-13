import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
dotenv.config();
const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

interface ImgResult {
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

async function getAllImages(): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>();
  let from = 0;
  const PAGE = 1000;
  while (true) {
    const { data, error } = await sb.from('questions')
      .select('id, image_url')
      .not('image_url', 'is', null)
      .eq('is_active', true)
      .range(from, from + PAGE - 1);
    if (error || !data || data.length === 0) break;
    data.forEach((q: any) => {
      if (!q.image_url) return;
      if (!map.has(q.image_url)) map.set(q.image_url, []);
      map.get(q.image_url)!.push(q.id);
    });
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return map;
}

// Parse width/height from PNG / JPEG / GIF / WebP headers
function parseImageDims(buf: Uint8Array): { width: number; height: number; format: string } {
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) {
    const w = (buf[16] << 24) | (buf[17] << 16) | (buf[18] << 8) | buf[19];
    const h = (buf[20] << 24) | (buf[21] << 16) | (buf[22] << 8) | buf[23];
    return { width: w, height: h, format: 'png' };
  }
  if (buf[0] === 0xFF && buf[1] === 0xD8) {
    let i = 2;
    while (i < buf.length - 1) {
      if (buf[i] !== 0xFF) break;
      const marker = buf[i + 1];
      if (marker >= 0xC0 && marker <= 0xC3) {
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

async function check(url: string): Promise<{ ok: boolean; status: number; size: number; width: number; height: number; contentType: string; reason: string }> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 10000);
    const r = await fetch(url, { method: 'GET', signal: ctrl.signal });
    clearTimeout(t);
    const buf = new Uint8Array(await r.arrayBuffer());
    const size = buf.byteLength;
    const ct = r.headers.get('content-type') || '';

    if (!r.ok) return { ok: false, status: r.status, size, width: 0, height: 0, contentType: ct, reason: `HTTP ${r.status}` };
    if (size < 50) return { ok: false, status: r.status, size, width: 0, height: 0, contentType: ct, reason: `truncated (${size}b)` };
    if (!ct.startsWith('image/')) return { ok: false, status: r.status, size, width: 0, height: 0, contentType: ct, reason: `wrong content-type: ${ct}` };

    const { width, height, format } = parseImageDims(buf);
    if (format === 'unknown') return { ok: false, status: r.status, size, width, height, contentType: ct, reason: 'unknown image format / corrupt signature' };
    if (format !== 'webp' && (width < 50 || height < 50)) return { ok: false, status: r.status, size, width, height, contentType: ct, reason: `too small dims ${width}x${height}` };
    return { ok: true, status: r.status, size, width, height, contentType: ct, reason: 'ok' };
  } catch (e: any) {
    return { ok: false, status: 0, size: 0, width: 0, height: 0, contentType: '', reason: `fetch err: ${e.message}` };
  }
}

async function main() {
  console.log('Loading image URLs from active questions...');
  const urlMap = await getAllImages();
  const totalQuestions = Array.from(urlMap.values()).reduce((s, a) => s + a.length, 0);
  console.log(`${urlMap.size} unique URLs across ${totalQuestions} active questions`);

  const buckets: Record<string, number> = {};
  for (const url of urlMap.keys()) {
    const key = url.includes('/flags/') ? 'flags'
              : url.includes('/logos/') ? 'logos'
              : url.includes('question-images') ? 'question-images'
              : 'other';
    buckets[key] = (buckets[key] || 0) + 1;
  }
  console.log('Buckets:', buckets);

  const urls = Array.from(urlMap.keys());
  const results: ImgResult[] = [];
  const CONCURRENCY = 20;
  let i = 0;
  const tick = setInterval(() => process.stdout.write(`\r checked ${i}/${urls.length}`), 1000);

  async function worker() {
    while (i < urls.length) {
      const idx = i++;
      const url = urls[idx];
      const r = await check(url);
      results.push({ url, ...r, questionIds: urlMap.get(url)! });
    }
  }
  await Promise.all(Array(CONCURRENCY).fill(0).map(() => worker()));
  clearInterval(tick);
  process.stdout.write('\n');

  const broken = results.filter(r => !r.ok);
  const totalAffected = broken.reduce((s, r) => s + r.questionIds.length, 0);
  console.log(`\n=== ${broken.length}/${results.length} broken URLs · ${totalAffected} affected questions ===`);

  if (broken.length === 0) {
    console.log('No broken images detected.');
    return;
  }

  const byReason: Record<string, ImgResult[]> = {};
  broken.forEach(r => {
    const k = r.reason.replace(/\(\d+b?\)/, '(...)').replace(/\d+x\d+/, 'NxM');
    if (!byReason[k]) byReason[k] = [];
    byReason[k].push(r);
  });
  for (const [reason, items] of Object.entries(byReason)) {
    console.log(`\n--- ${reason} (${items.length} URLs, ${items.reduce((s, r) => s + r.questionIds.length, 0)} questions) ---`);
    items.slice(0, 5).forEach(r => {
      console.log(`  ${r.url.slice(-80)}`);
      console.log(`    status=${r.status} size=${r.size}b dims=${r.width}x${r.height} ct=${r.contentType}`);
      console.log(`    affected: ${r.questionIds.length} question(s) → ${r.questionIds.slice(0, 2).join(', ')}`);
    });
    if (items.length > 5) console.log(`  ... +${items.length - 5} more`);
  }

  fs.writeFileSync('/tmp/broken_imgs.json', JSON.stringify(broken, null, 2));
  console.log('\nFull list: /tmp/broken_imgs.json');
}

main().catch(e => { console.error(e); process.exit(1); });
