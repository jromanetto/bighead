import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
dotenv.config();
const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

interface Q {
  id: string;
  category: string | null;
  difficulty: number | null;
  question_text: string;
  correct_answer: string;
  wrong_answers: string[] | null;
  explanation: string | null;
  language: string | null;
  is_active: boolean;
  image_url: string | null;
  options: any;
}

async function getAll(): Promise<Q[]> {
  const all: Q[] = [];
  const PAGE = 1000;
  let from = 0;
  while (true) {
    const { data, error } = await sb
      .from('questions')
      .select('id,category,difficulty,question_text,correct_answer,wrong_answers,explanation,language,is_active,image_url,options')
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

// Detect if text is mostly French or English
function detectLang(text: string): 'fr' | 'en' | 'unknown' {
  const t = text.toLowerCase();
  // Strong French markers
  const frMarkers = [
    /\b(le|la|les|un|une|des|du|de|au|aux|qui|que|quoi|quel|quelle|quels|quelles|est|sont|était|avoir|être|dans|sur|pour|avec|sans|son|sa|ses|leur|leurs|notre|votre|mon|ma|mes|ton|ta|tes|c'est|qu'est|n'est|d'un|d'une|l'on|l')\b/g,
    /[àâäéèêëïîôöùûüÿç]/g,
  ];
  // Strong English markers
  const enMarkers = [
    /\b(the|is|are|was|were|of|and|or|in|on|at|to|for|with|which|what|who|whose|where|when|why|how|that|this|these|those|a|an|do|does|did|has|have|had|been|being|its|it's|don't|doesn't|wasn't|weren't|isn't)\b/g,
  ];
  let frScore = 0, enScore = 0;
  frMarkers.forEach(r => { const m = t.match(r); if (m) frScore += m.length; });
  enMarkers.forEach(r => { const m = t.match(r); if (m) enScore += m.length; });
  if (frScore === 0 && enScore === 0) return 'unknown';
  if (frScore > enScore * 1.5) return 'fr';
  if (enScore > frScore * 1.5) return 'en';
  return 'unknown';
}

// Detect if answer is leaked in question text
function answerLeak(q: Q): { leaked: boolean; how: string } {
  const ans = q.correct_answer?.trim();
  if (!ans || ans.length < 3) return { leaked: false, how: '' };
  const text = q.question_text || '';
  // Skip very short or single-character answers (could be year, letter etc.)
  if (ans.length <= 2) return { leaked: false, how: '' };
  // Build a normalized version
  const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  const ansN = norm(ans);
  const textN = norm(text);
  // Whole word match
  const re = new RegExp(`\\b${ansN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
  if (re.test(textN)) return { leaked: true, how: 'exact' };
  // For multi-word answers, check if all words appear close
  const ansWords = ansN.split(' ').filter(w => w.length > 2);
  if (ansWords.length >= 2) {
    const allMatch = ansWords.every(w => new RegExp(`\\b${w}\\b`).test(textN));
    if (allMatch) return { leaked: true, how: 'all-words' };
  }
  return { leaked: false, how: '' };
}

// Detect if question references "this image/photo/logo" but has no image_url
function imageReference(q: Q): { needsImage: boolean; hasImage: boolean } {
  const t = (q.question_text || '').toLowerCase();
  const refs = ['cette image', 'cette photo', 'ce logo', 'cette marque', 'ce drapeau', 'ce monument', 'this image', 'this photo', 'this logo', 'this brand', 'this flag', 'this monument', 'shown', 'pictured', 'ci-dessous', 'ci-contre'];
  const needs = refs.some(r => t.includes(r));
  return { needsImage: needs, hasImage: !!q.image_url };
}

async function main() {
  console.log('Loading all questions...');
  const all = await getAll();
  console.log(`Loaded ${all.length} questions`);

  // 1. Stats
  const byLang: Record<string, number> = {};
  const byCat: Record<string, number> = {};
  const byActive: Record<string, number> = {};
  all.forEach(q => {
    byLang[q.language || 'null'] = (byLang[q.language || 'null'] || 0) + 1;
    byCat[q.category || 'null'] = (byCat[q.category || 'null'] || 0) + 1;
    byActive[String(q.is_active)] = (byActive[String(q.is_active)] || 0) + 1;
  });
  console.log('BY LANG:', byLang);
  console.log('BY ACTIVE:', byActive);
  console.log('BY CAT:', byCat);

  // 2. Language mismatch
  const mismatches: any[] = [];
  all.forEach(q => {
    if (!q.is_active) return;
    const detected = detectLang(q.question_text || '');
    if (q.language && detected !== 'unknown' && detected !== q.language) {
      mismatches.push({ id: q.id, declared: q.language, detected, category: q.category, text: q.question_text?.slice(0, 80) });
    }
  });
  console.log(`\nLANG MISMATCHES: ${mismatches.length}`);
  console.log('Examples:', mismatches.slice(0, 10));

  // 3. Answer leak
  const leaks: any[] = [];
  all.forEach(q => {
    if (!q.is_active) return;
    const { leaked, how } = answerLeak(q);
    if (leaked) {
      leaks.push({ id: q.id, lang: q.language, cat: q.category, how, ans: q.correct_answer, text: q.question_text?.slice(0, 100) });
    }
  });
  console.log(`\nANSWER LEAKS: ${leaks.length}`);
  console.log('Examples:', leaks.slice(0, 10));

  // 4. Image references without image
  const missingImg: any[] = [];
  all.forEach(q => {
    if (!q.is_active) return;
    const { needsImage, hasImage } = imageReference(q);
    if (needsImage && !hasImage) {
      missingImg.push({ id: q.id, lang: q.language, cat: q.category, text: q.question_text?.slice(0, 100) });
    }
  });
  console.log(`\nMISSING IMAGES: ${missingImg.length}`);
  console.log('Examples:', missingImg.slice(0, 10));

  // 5. Logo questions detection
  const logoQuestions = all.filter(q => {
    if (!q.is_active) return false;
    const t = (q.question_text || '').toLowerCase();
    return t.includes('logo') || t.includes('marque') || t.includes('brand');
  });
  console.log(`\nLOGO QUESTIONS: ${logoQuestions.length}`);
  console.log('Examples:', logoQuestions.slice(0, 5).map(q => ({ id: q.id, lang: q.language, ans: q.correct_answer, text: q.question_text?.slice(0, 80), img: q.image_url })));

  // 6. Image URL stats
  const withImage = all.filter(q => q.image_url).length;
  const flagImages = all.filter(q => q.image_url?.includes('flags')).length;
  console.log(`\nWITH IMAGE: ${withImage}/${all.length}`);
  console.log(`FLAG IMAGES: ${flagImages}`);

  // Save all to JSON for further analysis
  fs.writeFileSync('/tmp/audit_all.json', JSON.stringify(all, null, 2));
  fs.writeFileSync('/tmp/audit_mismatches.json', JSON.stringify(mismatches, null, 2));
  fs.writeFileSync('/tmp/audit_leaks.json', JSON.stringify(leaks, null, 2));
  fs.writeFileSync('/tmp/audit_missing_img.json', JSON.stringify(missingImg, null, 2));
  fs.writeFileSync('/tmp/audit_logos.json', JSON.stringify(logoQuestions, null, 2));
  console.log('\nFull data saved to /tmp/audit_*.json');
}

main().catch(e => { console.error(e); process.exit(1); });
