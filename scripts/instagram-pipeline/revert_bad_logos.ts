/**
 * Revert logo updates where the correct_answer wasn't actually a brand.
 *
 * Heuristics for "not a brand":
 *   - Starts with article: Le, La, Les, Un, Une, L'
 *   - Is a number (year, count)
 *   - Contains too many spaces (> 3 words usually a phrase, not brand)
 *   - In explicit denylist
 *
 * Also revert questions whose original text wasn't actually about a logo
 *  (e.g. "Quelle entreprise a créé l'iPhone ?" — was probably caught by 'marque' filter elsewhere).
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
dotenv.config();
const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

interface Q {
  id: string;
  question_text: string;
  correct_answer: string;
  image_url: string | null;
  language: string;
}

function isLikelyNotBrand(answer: string): boolean {
  const a = answer.trim();
  if (!a) return true;
  // Number-only
  if (/^\d+$/.test(a)) return true;
  // Starts with FR article
  if (/^(le |la |les |un |une |l'|au |aux |des |du |de |d')/i.test(a)) return true;
  if (/^(the |a |an )/i.test(a)) return true;
  // Multi-word phrases (more than 3 words)
  if (a.split(/\s+/).length > 3) return true;
  // Common non-brand keywords (sports, generic concepts)
  const nonBrand = ['photography', 'club', 'rugby', 'crocodile', 'horse', 'chien',
                    'football américain', 'magical realism', 'realisme'];
  if (nonBrand.some(kw => a.toLowerCase().includes(kw))) return true;
  return false;
}

function originalWasAboutLogo(text: string): boolean {
  const t = text.toLowerCase();
  // Word-boundary checks for "logo" or "la marque/cette marque/sa marque/quelle marque"
  if (/\blogo\b/.test(t)) return true;
  if (/\b(la|cette|sa|quelle|une|leur|notre|ta|ma|sont|the|this|which|whose|brand)\s+marque\b/.test(t)) return true;
  if (/\bmarques?\s+(célèbres?|connues?|de luxe|sportives?|automobiles?|fait|appartient|représente|utilise)/.test(t)) return true;
  if (/\b(this|the|which)\s+(brand|logo)\b/.test(t)) return true;
  if (/\bbrand\s+(uses?|has|created|made|owns?|owned|is)/.test(t)) return true;
  return false;
}

async function getOrigQuestions(): Promise<Map<string, { text: string; img: string | null }>> {
  const data = JSON.parse(fs.readFileSync('/tmp/audit_all.json', 'utf-8')) as any[];
  const map = new Map<string, { text: string; img: string | null }>();
  for (const q of data) map.set(q.id, { text: q.question_text, img: q.image_url });
  return map;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const origMap = await getOrigQuestions();
  console.log(`Loaded ${origMap.size} original questions`);

  // Find all questions currently flagged as logo (neutral text)
  const all: Q[] = [];
  let from = 0;
  const PAGE = 1000;
  while (true) {
    const { data, error } = await sb
      .from('questions')
      .select('id,question_text,correct_answer,image_url,language')
      .or('image_url.like.%/logos/%')
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    all.push(...(data as Q[]));
    if (data.length < PAGE) break;
    from += PAGE;
  }
  console.log(`${all.length} questions currently linked to a logo image`);

  let reverted = 0;
  let kept = 0;

  for (const q of all) {
    const orig = origMap.get(q.id);
    if (!orig) continue;
    const wasAboutLogo = originalWasAboutLogo(orig.text);
    const notReallyABrand = isLikelyNotBrand(q.correct_answer);

    if (notReallyABrand || !wasAboutLogo) {
      console.log(`REVERT [${q.id.slice(0, 8)}] ans="${q.correct_answer}" — orig="${orig.text.slice(0, 60)}"`);
      if (!dryRun) {
        const { error } = await sb
          .from('questions')
          // @ts-ignore
          .update({ question_text: orig.text, image_url: orig.img })
          .eq('id', q.id);
        if (error) console.warn('  err:', error.message);
      }
      reverted++;
    } else {
      kept++;
    }
  }

  console.log(`\nReverted: ${reverted}, kept: ${kept}`);
}

main().catch(e => { console.error(e); process.exit(1); });
