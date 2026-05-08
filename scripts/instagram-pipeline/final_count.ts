import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();
const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

async function main() {
  const counts: Record<string, { fr: number; en: number; total: number }> = {};
  let totalActive = 0;
  let totalAll = 0;

  let from = 0;
  const PAGE = 1000;
  while (true) {
    const { data, error } = await sb
      .from('questions')
      .select('category, language, is_active')
      .range(from, from + PAGE - 1);
    if (error || !data || data.length === 0) break;
    data.forEach((q: any) => {
      totalAll++;
      if (!q.is_active) return;
      totalActive++;
      const cat = q.category || 'null';
      if (!counts[cat]) counts[cat] = { fr: 0, en: 0, total: 0 };
      counts[cat].total++;
      if (q.language === 'fr') counts[cat].fr++;
      else if (q.language === 'en') counts[cat].en++;
    });
    if (data.length < PAGE) break;
    from += PAGE;
  }

  const sorted = Object.entries(counts).sort(([, a], [, b]) => b.total - a.total);
  console.log('\nFinal active question counts (by category, FR / EN / total):\n');
  console.log('CATEGORY          | FR    | EN    | TOTAL');
  console.log('------------------|-------|-------|------');
  for (const [cat, c] of sorted) {
    console.log(`${cat.padEnd(18)}| ${String(c.fr).padStart(5)} | ${String(c.en).padStart(5)} | ${String(c.total).padStart(5)}`);
  }
  console.log('------------------|-------|-------|------');
  const totalFr = Object.values(counts).reduce((s, c) => s + c.fr, 0);
  const totalEn = Object.values(counts).reduce((s, c) => s + c.en, 0);
  console.log(`${'TOTAL ACTIVE'.padEnd(18)}| ${String(totalFr).padStart(5)} | ${String(totalEn).padStart(5)} | ${String(totalActive).padStart(5)}`);
  console.log(`\nTotal rows in DB (active+inactive): ${totalAll}`);
}
main().catch(e => { console.error(e); process.exit(1); });
