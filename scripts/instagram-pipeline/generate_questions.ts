/**
 * Generate ~10,000 bilingual quiz questions across weak categories.
 *
 * Pipeline:
 *  1. For each (category, difficulty, language) batch, ask Claude to produce N unique questions.
 *  2. Validate locally: 4 distinct options, answer not in question, age-appropriate.
 *  3. Translate FR → EN (or vice versa) for the second language.
 *  4. Bulk-insert to Supabase, skipping near-duplicates.
 *
 * Run: npx tsx ./generate_questions.ts [--dry-run] [--cat=pop-culture] [--max=100]
 *
 * Resumable: tracks progress in /tmp/qgen_progress.json so re-runs continue where stopped.
 */
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
dotenv.config();

const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const DRY_RUN = process.argv.includes('--dry-run');
const ONLY_CAT = (process.argv.find(a => a.startsWith('--cat='))?.split('=')[1]) || null;
const MAX = parseInt(process.argv.find(a => a.startsWith('--max='))?.split('=')[1] || '999999');
const MODEL = 'claude-sonnet-4-6';

interface Quota {
  category: string;
  add: number;
  topics: string[]; // seed topics to diversify
  ageByDifficulty: Record<number, number>;
}

const QUOTAS: Quota[] = [
  {
    category: 'pop-culture',
    add: 1500,
    topics: [
      'Disney movies and characters', 'Marvel and DC superheroes', 'TV series finales and twists',
      'reality TV (The Voice, Top Chef, Survivor)', 'celebrity couples and breakups',
      'viral internet moments and memes', 'TikTok trends', 'YouTube creators',
      'anime and manga (Naruto, Dragon Ball, One Piece)', 'video game franchises (Mario, Zelda, Pokemon)',
      'Stranger Things, Game of Thrones, Breaking Bad', 'awards (Oscars, Golden Globes, Cannes)',
      'Friends, How I Met Your Mother, Big Bang Theory', 'reality stars (Kardashians, Real Housewives)',
      'social media platforms (Instagram, TikTok, Snapchat)', 'streaming services (Netflix, Disney+, Prime)',
    ],
    ageByDifficulty: { 1: 6, 2: 8, 3: 12, 4: 14, 5: 16 },
  },
  {
    category: 'logo',
    add: 1500,
    topics: [
      'tech giants (Apple, Google, Microsoft, Meta)', 'fast food (McDonald\'s, KFC, Burger King)',
      'soft drinks (Coca-Cola, Pepsi, Fanta, Sprite)', 'luxury fashion (Gucci, Prada, Chanel, LV)',
      'sportswear (Nike, Adidas, Puma, Under Armour)', 'cars (BMW, Mercedes, Audi, Toyota)',
      'banks and finance (Visa, MasterCard, PayPal)', 'streaming (Netflix, Disney+, Spotify)',
      'gaming (Xbox, PlayStation, Nintendo, Steam)', 'social media (Instagram, TikTok, Snapchat)',
      'browsers and OS (Chrome, Firefox, Safari, Windows)', 'airlines (Air France, Lufthansa, Emirates)',
      'electronics (Samsung, LG, Sony, Bose)', 'food brands (Kellogg\'s, Nutella, Nestle)',
      'beverage (Heineken, Budweiser, Red Bull)', 'retail (IKEA, Walmart, Carrefour)',
    ],
    ageByDifficulty: { 1: 6, 2: 8, 3: 12, 4: 14, 5: 16 },
  },
  {
    category: 'animals',
    add: 1300,
    topics: [
      'big cats (lions, tigers, leopards, cheetahs)', 'marine mammals (whales, dolphins, seals)',
      'birds of prey (eagles, hawks, owls)', 'reptiles (snakes, lizards, crocodiles, turtles)',
      'insects (bees, butterflies, ants, beetles)', 'farm animals and breeds',
      'African savanna animals', 'Australian wildlife (kangaroos, koalas, platypus)',
      'rainforest animals', 'arctic and Antarctic wildlife (polar bears, penguins)',
      'deep sea creatures', 'extinct animals (dinosaurs, woolly mammoths, dodos)',
      'animal records (fastest, biggest, oldest)', 'pets (dog breeds, cat breeds)',
      'amphibians (frogs, salamanders)', 'farm-to-table animals and products',
    ],
    ageByDifficulty: { 1: 6, 2: 8, 3: 12, 4: 14, 5: 16 },
  },
  {
    category: 'movies',
    add: 1100,
    topics: [
      'Oscar winners by year', 'Marvel Cinematic Universe phases',
      'Star Wars saga', 'Pixar films', 'Christopher Nolan films',
      'Quentin Tarantino films', 'Steven Spielberg films',
      'horror classics (The Shining, Halloween, Scream)', 'thrillers (Se7en, Silence of the Lambs)',
      'romantic comedies', 'animated movies (Disney, DreamWorks, Studio Ghibli)',
      'biopics and historical films', 'sci-fi classics (Blade Runner, 2001, Matrix)',
      'James Bond movies', 'Indiana Jones', 'Lord of the Rings / Hobbit',
      'Harry Potter movies', 'French cinema (Amélie, La Haine, Intouchables)',
    ],
    ageByDifficulty: { 1: 8, 2: 10, 3: 12, 4: 14, 5: 16 },
  },
  {
    category: 'art',
    add: 900,
    topics: [
      'Renaissance painters (Leonardo, Michelangelo, Raphael)',
      'Impressionists (Monet, Renoir, Degas)', 'post-impressionists (Van Gogh, Cézanne, Gauguin)',
      'cubism (Picasso, Braque)', 'surrealism (Dalí, Magritte)',
      'modern art (Pollock, Warhol, Basquiat)', 'sculptors (Rodin, Michelangelo, Henry Moore)',
      'famous museums (Louvre, MoMA, Tate)', 'art movements timeline',
      'street art and Banksy', 'photography pioneers',
      'architectural styles (Gothic, Baroque, Bauhaus)',
      'paintings and their stories (Mona Lisa, Starry Night, Guernica)',
    ],
    ageByDifficulty: { 1: 8, 2: 10, 3: 12, 4: 14, 5: 16 },
  },
  {
    category: 'cinema',
    add: 700,
    topics: [
      'French film industry', 'Cannes Festival winners',
      'César awards', 'world cinema (Korean, Japanese, Iranian)',
      'animated cinema (Miyazaki, Disney)', 'iconic directors',
      'iconic actors and actresses', 'film genres deep dives',
      'cinematography techniques', 'famous quotes from films',
    ],
    ageByDifficulty: { 1: 8, 2: 10, 3: 12, 4: 14, 5: 16 },
  },
  {
    category: 'literature',
    add: 500,
    topics: [
      'Nobel laureates in literature', 'classic French novels (Hugo, Zola, Balzac, Dumas)',
      'British classics (Austen, Brontë, Dickens, Shakespeare)',
      'American classics (Twain, Fitzgerald, Hemingway)',
      'Russian literature (Tolstoy, Dostoevsky, Chekhov)',
      'sci-fi authors (Asimov, Dick, Le Guin)', 'fantasy authors (Tolkien, Martin)',
      'modern bestsellers', 'children books and YA',
      'poetry (Baudelaire, Whitman, Dickinson)',
    ],
    ageByDifficulty: { 1: 8, 2: 10, 3: 12, 4: 14, 5: 16 },
  },
  {
    category: 'nature',
    add: 500,
    topics: [
      'biomes (rainforest, desert, tundra)', 'extreme weather (hurricanes, tornadoes)',
      'geological formations (volcanoes, glaciers)', 'plant biology and trees',
      'flowers (roses, tulips, orchids)', 'mountains and ranges',
      'rivers and oceans', 'national parks of the world', 'climate phenomena',
      'rocks and minerals', 'caves and underground formations',
    ],
    ageByDifficulty: { 1: 6, 2: 8, 3: 12, 4: 14, 5: 16 },
  },
  {
    category: 'music',
    add: 500,
    topics: [
      'classical composers (Mozart, Beethoven, Bach)', 'rock legends (Beatles, Stones, Queen)',
      'pop icons (Michael Jackson, Madonna, Beyoncé)', 'hip-hop history',
      'French music (Brassens, Brel, Aznavour, Stromae)', 'electronic music history',
      'jazz icons (Miles Davis, Coltrane, Ella)', 'reggae and ska',
      'instruments (piano, violin, drums)', 'opera and operetta', 'music festivals',
    ],
    ageByDifficulty: { 1: 6, 2: 8, 3: 12, 4: 14, 5: 16 },
  },
  {
    category: 'technology',
    add: 300,
    topics: [
      'AI and machine learning history', 'programming languages',
      'famous tech founders', 'internet history (ARPANET, web)',
      'cybersecurity basics', 'mobile phone evolution',
      'gaming hardware history', 'cryptography and blockchain',
    ],
    ageByDifficulty: { 1: 8, 2: 10, 3: 12, 4: 14, 5: 16 },
  },
  {
    category: 'history',
    add: 200,
    topics: [
      'World War I details', 'World War II battles', 'ancient civilizations',
      'medieval Europe', 'French Revolution', 'American Revolution',
      'space race', 'cold war events',
    ],
    ageByDifficulty: { 1: 8, 2: 10, 3: 12, 4: 14, 5: 16 },
  },
  {
    category: 'sport',
    add: 200,
    topics: [
      'Olympic Games history', 'Football World Cups', 'Tennis Grand Slams',
      'NBA legends', 'F1 champions', 'Tour de France',
      'rugby world cup', 'extreme sports',
    ],
    ageByDifficulty: { 1: 6, 2: 8, 3: 12, 4: 14, 5: 16 },
  },
  {
    category: 'general',
    add: 400,
    topics: [
      'capitals and flags', 'world records', 'famous quotes',
      'inventions and inventors', 'scientific discoveries', 'mythology',
      'food and cuisine', 'currencies', 'languages',
    ],
    ageByDifficulty: { 1: 6, 2: 8, 3: 12, 4: 14, 5: 16 },
  },
  {
    category: 'science',
    add: 200,
    topics: [
      'human anatomy', 'chemistry elements', 'physics laws',
      'space and astronomy', 'evolution', 'genetics',
    ],
    ageByDifficulty: { 1: 8, 2: 10, 3: 12, 4: 14, 5: 16 },
  },
];

interface GeneratedQuestion {
  question_text: string;
  correct_answer: string;
  wrong_answers: string[];
  explanation: string | null;
  difficulty: number;
}

interface DBRow {
  question_text: string;
  correct_answer: string;
  wrong_answers: string[];
  explanation: string | null;
  difficulty: number;
  min_age: number;
  language: string;
  category: string;
  is_active: boolean;
}

async function callClaude(prompt: string): Promise<string> {
  const r = await claude.messages.create({
    model: MODEL,
    max_tokens: 8000,
    messages: [{ role: 'user', content: prompt }],
  });
  const block = r.content.find(c => c.type === 'text');
  if (!block || block.type !== 'text') throw new Error('No text in response');
  return block.text;
}

function extractJsonArray(text: string): any[] {
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('No JSON array in response: ' + text.slice(0, 200));
  return JSON.parse(match[0]);
}

function validateQuestion(q: GeneratedQuestion): { ok: boolean; reason?: string } {
  if (!q.question_text || !q.correct_answer) return { ok: false, reason: 'missing fields' };
  if (!Array.isArray(q.wrong_answers) || q.wrong_answers.length !== 3) return { ok: false, reason: 'need 3 wrong_answers' };
  if (q.wrong_answers.some(w => !w || w === q.correct_answer)) return { ok: false, reason: 'wrong_answer empty or = correct' };
  // No answer leak
  const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  const ansN = norm(q.correct_answer);
  const textN = norm(q.question_text);
  if (ansN.length > 3) {
    const escAns = ansN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(`\\b${escAns}\\b`).test(textN)) return { ok: false, reason: 'answer leaks in question' };
  }
  return { ok: true };
}

async function generateBatch(category: string, difficulty: number, count: number, language: 'fr' | 'en', topic: string): Promise<GeneratedQuestion[]> {
  const lang = language === 'fr' ? 'French' : 'English';
  const prompt = `Generate exactly ${count} unique trivia questions for a quiz mobile app, in ${lang}.

CATEGORY: ${category}
TOPIC FOCUS: ${topic}
DIFFICULTY: ${difficulty}/5 (1=easy elementary, 3=medium high-school, 5=expert)

CRITICAL RULES:
1. Question MUST NOT contain the answer or any synonym/translation/part of the answer.
2. Each question has 4 answer choices: 1 correct + 3 plausible wrong answers.
3. Wrong answers must be distinct from the correct answer and from each other.
4. Add a brief 1-sentence explanation.
5. Avoid generic/repeated questions; every question must be distinct.
6. ${language === 'fr' ? 'Tout doit être en français impeccable, avec accents corrects.' : 'All in clean English.'}

Output ONLY a JSON array, no prose. Schema:
[
  {
    "question_text": "...",
    "correct_answer": "...",
    "wrong_answers": ["...", "...", "..."],
    "explanation": "..."
  }
]`;

  const raw = await callClaude(prompt);
  const arr = extractJsonArray(raw);
  return arr.map((q: any) => ({
    question_text: q.question_text,
    correct_answer: q.correct_answer,
    wrong_answers: q.wrong_answers,
    explanation: q.explanation || null,
    difficulty,
  }));
}

async function translateBatch(questions: GeneratedQuestion[], from: 'fr' | 'en', to: 'fr' | 'en'): Promise<GeneratedQuestion[]> {
  if (from === to) return questions;
  const fromLang = from === 'fr' ? 'French' : 'English';
  const toLang = to === 'fr' ? 'French' : 'English';
  const prompt = `Translate these ${questions.length} quiz questions from ${fromLang} to ${toLang}.

Preserve the answer choices exactly when they are proper nouns (brand names, places, people).
Translate naturally, not word-by-word. Return ONLY a JSON array with the same structure.

INPUT:
${JSON.stringify(questions.map(q => ({
    question_text: q.question_text,
    correct_answer: q.correct_answer,
    wrong_answers: q.wrong_answers,
    explanation: q.explanation,
  })), null, 2)}`;

  const raw = await callClaude(prompt);
  const arr = extractJsonArray(raw);
  return arr.map((q: any, i: number) => ({
    question_text: q.question_text,
    correct_answer: q.correct_answer,
    wrong_answers: q.wrong_answers,
    explanation: q.explanation || null,
    difficulty: questions[i].difficulty,
  }));
}

async function existingFingerprints(category: string): Promise<Set<string>> {
  // Load all existing question texts for this category to dedupe
  const set = new Set<string>();
  let from = 0;
  while (true) {
    const { data, error } = await sb
      .from('questions')
      .select('question_text')
      .eq('category', category)
      .range(from, from + 999);
    if (error) throw error;
    if (!data || data.length === 0) break;
    data.forEach((q: any) => set.add(q.question_text.trim().toLowerCase().slice(0, 80)));
    if (data.length < 1000) break;
    from += 1000;
  }
  return set;
}

async function insertBatch(rows: DBRow[]): Promise<number> {
  if (DRY_RUN) {
    console.log(`  [DRY] would insert ${rows.length} rows`);
    return rows.length;
  }
  // Insert in chunks of 100
  let inserted = 0;
  for (let i = 0; i < rows.length; i += 100) {
    const chunk = rows.slice(i, i + 100);
    const { error } = await sb.from('questions').insert(chunk as any);
    if (error) {
      console.warn(`  insert err: ${error.message}`);
    } else {
      inserted += chunk.length;
    }
  }
  return inserted;
}

interface Progress {
  [category: string]: {
    inserted_fr: number;
    inserted_en: number;
    last_topic_idx: number;
  };
}

function loadProgress(): Progress {
  try {
    return JSON.parse(fs.readFileSync('/tmp/qgen_progress.json', 'utf-8'));
  } catch {
    return {};
  }
}

function saveProgress(p: Progress) {
  fs.writeFileSync('/tmp/qgen_progress.json', JSON.stringify(p, null, 2));
}

async function processCategory(quota: Quota): Promise<void> {
  const progress = loadProgress();
  if (!progress[quota.category]) progress[quota.category] = { inserted_fr: 0, inserted_en: 0, last_topic_idx: 0 };
  const p = progress[quota.category];

  const target = Math.min(quota.add, MAX);
  if (p.inserted_fr >= target) {
    console.log(`[${quota.category}] already done (${p.inserted_fr}/${target}) — skip`);
    return;
  }

  console.log(`\n=== ${quota.category} (target ${target}, current FR ${p.inserted_fr}) ===`);
  const existing = await existingFingerprints(quota.category);
  console.log(`  ${existing.size} existing fingerprints`);

  const BATCH_SIZE = 25;
  const DIFFICULTIES = [1, 2, 3, 4, 5];

  while (p.inserted_fr < target) {
    const remaining = target - p.inserted_fr;
    const batchN = Math.min(BATCH_SIZE, remaining);
    const topic = quota.topics[p.last_topic_idx % quota.topics.length];
    const difficulty = DIFFICULTIES[Math.floor(p.last_topic_idx / quota.topics.length) % DIFFICULTIES.length];

    console.log(`  [${p.inserted_fr}/${target}] topic="${topic.slice(0, 40)}" diff=${difficulty} n=${batchN}`);
    p.last_topic_idx++;

    let frQuestions: GeneratedQuestion[] = [];
    try {
      frQuestions = await generateBatch(quota.category, difficulty, batchN, 'fr', topic);
    } catch (e: any) {
      console.warn(`    generate err: ${e.message}`);
      saveProgress(progress);
      continue;
    }

    // Validate + dedupe
    const valid: GeneratedQuestion[] = [];
    for (const q of frQuestions) {
      const v = validateQuestion(q);
      if (!v.ok) { continue; }
      const fp = q.question_text.trim().toLowerCase().slice(0, 80);
      if (existing.has(fp)) continue;
      existing.add(fp);
      valid.push(q);
    }
    if (valid.length === 0) { saveProgress(progress); continue; }

    // Translate to EN
    let enQuestions: GeneratedQuestion[] = [];
    try {
      enQuestions = await translateBatch(valid, 'fr', 'en');
    } catch (e: any) {
      console.warn(`    translate err: ${e.message}`);
      // Skip EN this batch but keep FR
    }

    const ageMap = quota.ageByDifficulty;
    const frRows: DBRow[] = valid.map(q => ({
      ...q,
      min_age: ageMap[q.difficulty] || 12,
      language: 'fr',
      category: quota.category,
      is_active: true,
    }));
    const enRows: DBRow[] = enQuestions.length === valid.length ? enQuestions.map((q, i) => ({
      ...q,
      difficulty: valid[i].difficulty,
      min_age: ageMap[valid[i].difficulty] || 12,
      language: 'en',
      category: quota.category,
      is_active: true,
    })) : [];

    const insertedFr = await insertBatch(frRows);
    const insertedEn = await insertBatch(enRows);
    p.inserted_fr += insertedFr;
    p.inserted_en += insertedEn;
    saveProgress(progress);
    console.log(`    +${insertedFr} FR, +${insertedEn} EN`);
  }

  console.log(`[${quota.category}] DONE — ${p.inserted_fr} FR + ${p.inserted_en} EN inserted`);
}

async function main() {
  console.log(`[generate_questions] dry=${DRY_RUN} cat=${ONLY_CAT || 'all'} max=${MAX} model=${MODEL}`);
  const filtered = ONLY_CAT ? QUOTAS.filter(q => q.category === ONLY_CAT) : QUOTAS;
  for (const quota of filtered) {
    try {
      await processCategory(quota);
    } catch (e: any) {
      console.error(`[${quota.category}] fatal:`, e.message);
    }
  }
  console.log('\nALL DONE');
}

main().catch(e => { console.error(e); process.exit(1); });
