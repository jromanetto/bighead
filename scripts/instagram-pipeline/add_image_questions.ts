/**
 * Stress-test the image-rendering pipeline by adding ~250 bilingual (FR+EN)
 * trivia questions with VALIDATED images across 3 categories:
 *   1. Country flags via flagcdn.com (w640 PNGs)
 *   2. Famous monuments via Wikipedia REST API (uploaded to Supabase storage)
 *   3. Famous people  via Wikipedia REST API (uploaded to Supabase storage)
 *
 * Pipeline per item:
 *   - Resolve image URL (flagcdn direct, Wikipedia for the rest)
 *   - Download & validate (PNG/JPEG/WebP signature + dim ≥50×50 + size ≥50B)
 *   - For monuments/people: upload to Supabase `question-images` bucket
 *   - Generate FR + EN questions (rotating question_text variants)
 *   - Run answer-leak guard (drops question if correct_answer appears in question_text)
 *   - Idempotent: skip if a question with same image_url already exists
 *   - Batched INSERTs (50 rows/batch)
 *
 * Cache: /tmp/add_image_questions_cache.json — stores fetched Wikipedia image URLs
 *
 * Run: cd scripts/instagram-pipeline && npx tsx add_image_questions.ts
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY env');
  process.exit(1);
}
const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const BUCKET = 'question-images';
const DRY = process.argv.includes('--dry-run');
const CACHE_PATH = '/tmp/add_image_questions_cache.json';
const USER_AGENT = 'BigHead/1.0 (https://bighead.app)';

// ============================================================================
// 1. CURATED DATA
// ============================================================================

interface Country {
  code: string;       // ISO 3166-1 alpha-2 lowercase
  nameFR: string;
  nameEN: string;
  difficulty: 1 | 2 | 3;
}

const COUNTRIES: Country[] = [
  { code: 'fr', nameFR: 'France',          nameEN: 'France',          difficulty: 1 },
  { code: 'de', nameFR: 'Allemagne',       nameEN: 'Germany',         difficulty: 1 },
  { code: 'it', nameFR: 'Italie',          nameEN: 'Italy',           difficulty: 1 },
  { code: 'es', nameFR: 'Espagne',         nameEN: 'Spain',           difficulty: 1 },
  { code: 'pt', nameFR: 'Portugal',        nameEN: 'Portugal',        difficulty: 2 },
  { code: 'gb', nameFR: 'Royaume-Uni',     nameEN: 'United Kingdom',  difficulty: 1 },
  { code: 'us', nameFR: 'États-Unis',      nameEN: 'United States',   difficulty: 1 },
  { code: 'ca', nameFR: 'Canada',          nameEN: 'Canada',          difficulty: 2 },
  { code: 'mx', nameFR: 'Mexique',         nameEN: 'Mexico',          difficulty: 2 },
  { code: 'br', nameFR: 'Brésil',          nameEN: 'Brazil',          difficulty: 1 },
  { code: 'ar', nameFR: 'Argentine',       nameEN: 'Argentina',       difficulty: 2 },
  { code: 'cl', nameFR: 'Chili',           nameEN: 'Chile',           difficulty: 2 },
  { code: 'co', nameFR: 'Colombie',        nameEN: 'Colombia',        difficulty: 2 },
  { code: 'pe', nameFR: 'Pérou',           nameEN: 'Peru',            difficulty: 2 },
  { code: 've', nameFR: 'Venezuela',       nameEN: 'Venezuela',       difficulty: 2 },
  { code: 'jp', nameFR: 'Japon',           nameEN: 'Japan',           difficulty: 1 },
  { code: 'kr', nameFR: 'Corée du Sud',    nameEN: 'South Korea',     difficulty: 2 },
  { code: 'cn', nameFR: 'Chine',           nameEN: 'China',           difficulty: 1 },
  { code: 'in', nameFR: 'Inde',            nameEN: 'India',           difficulty: 2 },
  { code: 'id', nameFR: 'Indonésie',       nameEN: 'Indonesia',       difficulty: 2 },
  { code: 'th', nameFR: 'Thaïlande',       nameEN: 'Thailand',        difficulty: 2 },
  { code: 'vn', nameFR: 'Vietnam',         nameEN: 'Vietnam',         difficulty: 2 },
  { code: 'ph', nameFR: 'Philippines',     nameEN: 'Philippines',     difficulty: 2 },
  { code: 'my', nameFR: 'Malaisie',        nameEN: 'Malaysia',        difficulty: 2 },
  { code: 'sg', nameFR: 'Singapour',       nameEN: 'Singapore',       difficulty: 2 },
  { code: 'au', nameFR: 'Australie',       nameEN: 'Australia',       difficulty: 2 },
  { code: 'nz', nameFR: 'Nouvelle-Zélande',nameEN: 'New Zealand',     difficulty: 2 },
  { code: 'eg', nameFR: 'Égypte',          nameEN: 'Egypt',           difficulty: 2 },
  { code: 'za', nameFR: 'Afrique du Sud',  nameEN: 'South Africa',    difficulty: 2 },
  { code: 'ng', nameFR: 'Nigeria',         nameEN: 'Nigeria',         difficulty: 2 },
  { code: 'ke', nameFR: 'Kenya',           nameEN: 'Kenya',           difficulty: 2 },
  { code: 'ma', nameFR: 'Maroc',           nameEN: 'Morocco',         difficulty: 2 },
  { code: 'sa', nameFR: 'Arabie saoudite', nameEN: 'Saudi Arabia',    difficulty: 2 },
  { code: 'ae', nameFR: 'Émirats arabes unis', nameEN: 'United Arab Emirates', difficulty: 2 },
  { code: 'tr', nameFR: 'Turquie',         nameEN: 'Turkey',          difficulty: 2 },
  { code: 'gr', nameFR: 'Grèce',           nameEN: 'Greece',          difficulty: 2 },
  { code: 'ru', nameFR: 'Russie',          nameEN: 'Russia',          difficulty: 1 },
  { code: 'pl', nameFR: 'Pologne',         nameEN: 'Poland',          difficulty: 2 },
  { code: 'ua', nameFR: 'Ukraine',         nameEN: 'Ukraine',         difficulty: 2 },
  { code: 'nl', nameFR: 'Pays-Bas',        nameEN: 'Netherlands',     difficulty: 2 },
  { code: 'be', nameFR: 'Belgique',        nameEN: 'Belgium',         difficulty: 2 },
  { code: 'ch', nameFR: 'Suisse',          nameEN: 'Switzerland',     difficulty: 2 },
  { code: 'at', nameFR: 'Autriche',        nameEN: 'Austria',         difficulty: 2 },
  { code: 'se', nameFR: 'Suède',           nameEN: 'Sweden',          difficulty: 2 },
  { code: 'no', nameFR: 'Norvège',         nameEN: 'Norway',          difficulty: 2 },
  { code: 'dk', nameFR: 'Danemark',        nameEN: 'Denmark',         difficulty: 2 },
  { code: 'fi', nameFR: 'Finlande',        nameEN: 'Finland',         difficulty: 2 },
  { code: 'ie', nameFR: 'Irlande',         nameEN: 'Ireland',         difficulty: 2 },
  { code: 'is', nameFR: 'Islande',         nameEN: 'Iceland',         difficulty: 2 },
  { code: 'il', nameFR: 'Israël',          nameEN: 'Israel',          difficulty: 2 },
];

interface Monument {
  wikiTitle: string;
  nameFR: string;
  nameEN: string;
  category: 'history' | 'geography';
  difficulty: 1 | 2 | 3;
}

const MONUMENTS: Monument[] = [
  { wikiTitle: 'Eiffel_Tower',                 nameFR: 'Tour Eiffel',          nameEN: 'Eiffel Tower',         category: 'history',  difficulty: 1 },
  { wikiTitle: 'Statue_of_Liberty',            nameFR: 'Statue de la Liberté', nameEN: 'Statue of Liberty',    category: 'history',  difficulty: 1 },
  { wikiTitle: 'Big_Ben',                      nameFR: 'Big Ben',              nameEN: 'Big Ben',              category: 'history',  difficulty: 1 },
  { wikiTitle: 'Colosseum',                    nameFR: 'Colisée',              nameEN: 'Colosseum',            category: 'history',  difficulty: 1 },
  { wikiTitle: 'Great_Wall_of_China',          nameFR: 'Grande Muraille de Chine', nameEN: 'Great Wall of China', category: 'history', difficulty: 1 },
  { wikiTitle: 'Taj_Mahal',                    nameFR: 'Taj Mahal',            nameEN: 'Taj Mahal',            category: 'history',  difficulty: 1 },
  { wikiTitle: 'Giza_pyramid_complex',         nameFR: 'Pyramides de Gizeh',   nameEN: 'Pyramids of Giza',     category: 'history',  difficulty: 1 },
  { wikiTitle: 'Christ_the_Redeemer_(statue)', nameFR: 'Christ Rédempteur',    nameEN: 'Christ the Redeemer',  category: 'history',  difficulty: 2 },
  { wikiTitle: 'Machu_Picchu',                 nameFR: 'Machu Picchu',         nameEN: 'Machu Picchu',         category: 'history',  difficulty: 2 },
  { wikiTitle: 'Sydney_Opera_House',           nameFR: 'Opéra de Sydney',      nameEN: 'Sydney Opera House',   category: 'history',  difficulty: 1 },
  { wikiTitle: 'Mount_Rushmore',               nameFR: 'Mont Rushmore',        nameEN: 'Mount Rushmore',       category: 'history',  difficulty: 2 },
  { wikiTitle: 'Brandenburg_Gate',             nameFR: 'Porte de Brandebourg', nameEN: 'Brandenburg Gate',     category: 'history',  difficulty: 2 },
  { wikiTitle: 'Acropolis_of_Athens',          nameFR: 'Acropole d\'Athènes',  nameEN: 'Acropolis of Athens',  category: 'history',  difficulty: 2 },
  { wikiTitle: 'Petra',                        nameFR: 'Pétra',                nameEN: 'Petra',                category: 'history',  difficulty: 2 },
  { wikiTitle: 'Angkor_Wat',                   nameFR: 'Angkor Vat',           nameEN: 'Angkor Wat',           category: 'history',  difficulty: 2 },
  { wikiTitle: 'Stonehenge',                   nameFR: 'Stonehenge',           nameEN: 'Stonehenge',           category: 'history',  difficulty: 1 },
  { wikiTitle: 'Mont-Saint-Michel',            nameFR: 'Mont-Saint-Michel',    nameEN: 'Mont-Saint-Michel',    category: 'history',  difficulty: 2 },
  { wikiTitle: 'Sagrada_Família',              nameFR: 'Sagrada Família',      nameEN: 'Sagrada Família',      category: 'history',  difficulty: 2 },
  { wikiTitle: 'Arc_de_Triomphe',              nameFR: 'Arc de Triomphe',      nameEN: 'Arc de Triomphe',      category: 'history',  difficulty: 2 },
  { wikiTitle: 'Notre-Dame_de_Paris',          nameFR: 'Notre-Dame de Paris',  nameEN: 'Notre-Dame de Paris',  category: 'history',  difficulty: 1 },
  { wikiTitle: 'Tower_of_London',              nameFR: 'Tour de Londres',      nameEN: 'Tower of London',      category: 'history',  difficulty: 2 },
  { wikiTitle: 'Buckingham_Palace',            nameFR: 'Palais de Buckingham', nameEN: 'Buckingham Palace',    category: 'history',  difficulty: 2 },
  { wikiTitle: 'Saint_Basil%27s_Cathedral',    nameFR: 'Cathédrale Saint-Basile', nameEN: 'Saint Basil\'s Cathedral', category: 'history', difficulty: 2 },
  { wikiTitle: 'Leaning_Tower_of_Pisa',        nameFR: 'Tour de Pise',         nameEN: 'Leaning Tower of Pisa', category: 'history', difficulty: 1 },
  { wikiTitle: 'Burj_Khalifa',                 nameFR: 'Burj Khalifa',         nameEN: 'Burj Khalifa',         category: 'history',  difficulty: 2 },
  { wikiTitle: 'Empire_State_Building',        nameFR: 'Empire State Building', nameEN: 'Empire State Building', category: 'history', difficulty: 2 },
  { wikiTitle: 'Golden_Gate_Bridge',           nameFR: 'Golden Gate Bridge',   nameEN: 'Golden Gate Bridge',   category: 'history',  difficulty: 2 },
  { wikiTitle: 'Mount_Fuji',                   nameFR: 'Mont Fuji',            nameEN: 'Mount Fuji',           category: 'geography', difficulty: 1 },
  { wikiTitle: 'Forbidden_City',               nameFR: 'Cité interdite',       nameEN: 'Forbidden City',       category: 'history',  difficulty: 2 },
  { wikiTitle: 'Palace_of_Versailles',         nameFR: 'Château de Versailles', nameEN: 'Palace of Versailles', category: 'history', difficulty: 2 },
  { wikiTitle: 'Louvre',                       nameFR: 'Louvre',               nameEN: 'Louvre',               category: 'history',  difficulty: 2 },
  { wikiTitle: 'Alhambra',                     nameFR: 'Alhambra',             nameEN: 'Alhambra',             category: 'history',  difficulty: 2 },
  { wikiTitle: 'Neuschwanstein_Castle',        nameFR: 'Château de Neuschwanstein', nameEN: 'Neuschwanstein Castle', category: 'history', difficulty: 2 },
  { wikiTitle: 'Edinburgh_Castle',             nameFR: 'Château d\'Édimbourg', nameEN: 'Edinburgh Castle',     category: 'history',  difficulty: 2 },
  { wikiTitle: 'Schönbrunn_Palace',            nameFR: 'Château de Schönbrunn', nameEN: 'Schönbrunn Palace',   category: 'history',  difficulty: 3 },
  { wikiTitle: 'CN_Tower',                     nameFR: 'Tour CN',              nameEN: 'CN Tower',             category: 'history',  difficulty: 2 },
  { wikiTitle: 'Space_Needle',                 nameFR: 'Space Needle',         nameEN: 'Space Needle',         category: 'history',  difficulty: 3 },
  { wikiTitle: 'Hagia_Sophia',                 nameFR: 'Sainte-Sophie',        nameEN: 'Hagia Sophia',         category: 'history',  difficulty: 2 },
  { wikiTitle: 'Trevi_Fountain',               nameFR: 'Fontaine de Trevi',    nameEN: 'Trevi Fountain',       category: 'history',  difficulty: 2 },
  { wikiTitle: 'Berlin_Wall',                  nameFR: 'Mur de Berlin',        nameEN: 'Berlin Wall',          category: 'history',  difficulty: 2 },
  { wikiTitle: 'Wat_Pho',                      nameFR: 'Wat Pho',              nameEN: 'Wat Pho',              category: 'history',  difficulty: 3 },
  { wikiTitle: 'Borobudur',                    nameFR: 'Borobudur',            nameEN: 'Borobudur',            category: 'history',  difficulty: 3 },
  { wikiTitle: 'Chichen_Itza',                 nameFR: 'Chichén Itzá',         nameEN: 'Chichen Itza',         category: 'history',  difficulty: 2 },
  { wikiTitle: 'Easter_Island',                nameFR: 'Île de Pâques',        nameEN: 'Easter Island',        category: 'geography', difficulty: 2 },
  { wikiTitle: 'Hạ_Long_Bay',                  nameFR: 'Baie d\'Hạ Long',      nameEN: 'Halong Bay',           category: 'geography', difficulty: 3 },
  { wikiTitle: 'Niagara_Falls',                nameFR: 'Chutes du Niagara',    nameEN: 'Niagara Falls',        category: 'geography', difficulty: 1 },
  { wikiTitle: 'Hoover_Dam',                   nameFR: 'Barrage Hoover',       nameEN: 'Hoover Dam',           category: 'history',  difficulty: 2 },
  { wikiTitle: 'Times_Square',                 nameFR: 'Times Square',         nameEN: 'Times Square',         category: 'geography', difficulty: 2 },
  { wikiTitle: 'Las_Vegas_Strip',              nameFR: 'Las Vegas Strip',      nameEN: 'Las Vegas Strip',      category: 'geography', difficulty: 3 },
];

interface Person {
  wikiTitle: string;
  nameFR: string;
  nameEN: string;
  category: 'science' | 'art' | 'music' | 'cinema' | 'technology' | 'history' | 'literature';
  era: string; // for plausibility grouping
  difficulty: 1 | 2 | 3;
}

const PEOPLE: Person[] = [
  { wikiTitle: 'Albert_Einstein',         nameFR: 'Albert Einstein',         nameEN: 'Albert Einstein',         category: 'science',    era: 'modern',     difficulty: 1 },
  { wikiTitle: 'Marie_Curie',             nameFR: 'Marie Curie',             nameEN: 'Marie Curie',             category: 'science',    era: 'modern',     difficulty: 1 },
  { wikiTitle: 'Leonardo_da_Vinci',       nameFR: 'Léonard de Vinci',        nameEN: 'Leonardo da Vinci',       category: 'art',        era: 'renaissance',difficulty: 1 },
  { wikiTitle: 'William_Shakespeare',     nameFR: 'William Shakespeare',     nameEN: 'William Shakespeare',     category: 'literature', era: 'classical',  difficulty: 1 },
  { wikiTitle: 'Vincent_van_Gogh',        nameFR: 'Vincent van Gogh',        nameEN: 'Vincent van Gogh',        category: 'art',        era: 'modern',     difficulty: 1 },
  { wikiTitle: 'Pablo_Picasso',           nameFR: 'Pablo Picasso',           nameEN: 'Pablo Picasso',           category: 'art',        era: 'modern',     difficulty: 1 },
  { wikiTitle: 'Wolfgang_Amadeus_Mozart', nameFR: 'Mozart',                  nameEN: 'Mozart',                  category: 'music',      era: 'classical',  difficulty: 1 },
  { wikiTitle: 'Ludwig_van_Beethoven',    nameFR: 'Beethoven',               nameEN: 'Beethoven',               category: 'music',      era: 'classical',  difficulty: 1 },
  { wikiTitle: 'Charlie_Chaplin',         nameFR: 'Charlie Chaplin',         nameEN: 'Charlie Chaplin',         category: 'cinema',     era: 'modern',     difficulty: 1 },
  { wikiTitle: 'Walt_Disney',             nameFR: 'Walt Disney',             nameEN: 'Walt Disney',             category: 'cinema',     era: 'modern',     difficulty: 1 },
  { wikiTitle: 'Steve_Jobs',              nameFR: 'Steve Jobs',              nameEN: 'Steve Jobs',              category: 'technology', era: 'contemporary', difficulty: 1 },
  { wikiTitle: 'Bill_Gates',              nameFR: 'Bill Gates',              nameEN: 'Bill Gates',              category: 'technology', era: 'contemporary', difficulty: 1 },
  { wikiTitle: 'Mark_Zuckerberg',         nameFR: 'Mark Zuckerberg',         nameEN: 'Mark Zuckerberg',         category: 'technology', era: 'contemporary', difficulty: 1 },
  { wikiTitle: 'Elon_Musk',               nameFR: 'Elon Musk',               nameEN: 'Elon Musk',               category: 'technology', era: 'contemporary', difficulty: 1 },
  { wikiTitle: 'Barack_Obama',            nameFR: 'Barack Obama',            nameEN: 'Barack Obama',            category: 'history',    era: 'contemporary', difficulty: 1 },
  { wikiTitle: 'Nelson_Mandela',          nameFR: 'Nelson Mandela',          nameEN: 'Nelson Mandela',          category: 'history',    era: 'modern',     difficulty: 1 },
  { wikiTitle: 'Mahatma_Gandhi',          nameFR: 'Gandhi',                  nameEN: 'Gandhi',                  category: 'history',    era: 'modern',     difficulty: 1 },
  { wikiTitle: 'Martin_Luther_King_Jr.',  nameFR: 'Martin Luther King',      nameEN: 'Martin Luther King',      category: 'history',    era: 'modern',     difficulty: 1 },
  { wikiTitle: 'John_F._Kennedy',         nameFR: 'John F. Kennedy',         nameEN: 'John F. Kennedy',         category: 'history',    era: 'modern',     difficulty: 2 },
  { wikiTitle: 'Winston_Churchill',       nameFR: 'Winston Churchill',       nameEN: 'Winston Churchill',       category: 'history',    era: 'modern',     difficulty: 2 },
  { wikiTitle: 'Charles_de_Gaulle',       nameFR: 'Charles de Gaulle',       nameEN: 'Charles de Gaulle',       category: 'history',    era: 'modern',     difficulty: 1 },
  { wikiTitle: 'Napoleon',                nameFR: 'Napoléon',                nameEN: 'Napoleon',                category: 'history',    era: 'classical',  difficulty: 1 },
  { wikiTitle: 'Cleopatra',               nameFR: 'Cléopâtre',               nameEN: 'Cleopatra',               category: 'history',    era: 'ancient',    difficulty: 1 },
  { wikiTitle: 'Julius_Caesar',           nameFR: 'Jules César',             nameEN: 'Julius Caesar',           category: 'history',    era: 'ancient',    difficulty: 1 },
  { wikiTitle: 'Joan_of_Arc',             nameFR: 'Jeanne d\'Arc',           nameEN: 'Joan of Arc',             category: 'history',    era: 'medieval',   difficulty: 1 },
  { wikiTitle: 'Frida_Kahlo',             nameFR: 'Frida Kahlo',             nameEN: 'Frida Kahlo',             category: 'art',        era: 'modern',     difficulty: 2 },
  { wikiTitle: 'Audrey_Hepburn',          nameFR: 'Audrey Hepburn',          nameEN: 'Audrey Hepburn',          category: 'cinema',     era: 'modern',     difficulty: 2 },
  { wikiTitle: 'Marilyn_Monroe',          nameFR: 'Marilyn Monroe',          nameEN: 'Marilyn Monroe',          category: 'cinema',     era: 'modern',     difficulty: 1 },
  { wikiTitle: 'Michael_Jackson',         nameFR: 'Michael Jackson',         nameEN: 'Michael Jackson',         category: 'music',      era: 'contemporary', difficulty: 1 },
  { wikiTitle: 'Elvis_Presley',           nameFR: 'Elvis Presley',           nameEN: 'Elvis Presley',           category: 'music',      era: 'modern',     difficulty: 1 },
];

// ============================================================================
// 2. UTILITIES
// ============================================================================

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const ARTICLES = new Set([
  'le','la','les','l','un','une','des','du','de','au','aux',
  'the','a','an',
  'el','los','las','unos','unas',
  'der','die','das','ein','eine',
]);

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripArticles(normalizedAnswer: string): string {
  const tokens = normalizedAnswer.split(' ').filter(Boolean);
  while (tokens.length > 1 && ARTICLES.has(tokens[0])) tokens.shift();
  while (tokens.length > 1 && ARTICLES.has(tokens[tokens.length - 1])) tokens.pop();
  return tokens.join(' ');
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isLeak(questionText: string, correctAnswer: string): boolean {
  const ansRaw = (correctAnswer || '').trim();
  if (!ansRaw) return false;
  const ansN = stripArticles(normalize(ansRaw));
  const textN = normalize(questionText || '');
  if (!ansN || !textN) return false;
  if (ansN.length >= 4) {
    const wholeRe = new RegExp(`\\b${escapeRe(ansN)}\\b`);
    if (wholeRe.test(textN)) return true;
  }
  const tokens = ansN.split(' ').filter((w) => w.length >= 4);
  if (tokens.length >= 2) {
    const allHit = tokens.every((w) => new RegExp(`\\b${escapeRe(w)}\\b`).test(textN));
    if (allHit) return true;
  }
  return false;
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickWrongs(correctName: string, pool: string[], n = 3): string[] {
  const candidates = pool.filter((p) => p !== correctName);
  return shuffle(candidates).slice(0, n);
}

// PNG/JPEG/WebP/GIF signature + dim parser (from broken_imgs.ts)
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
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[8] === 0x57 && buf[9] === 0x45) {
    return { width: -1, height: -1, format: 'webp' };
  }
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) {
    const w = buf[6] | (buf[7] << 8);
    const h = buf[8] | (buf[9] << 8);
    return { width: w, height: h, format: 'gif' };
  }
  return { width: 0, height: 0, format: 'unknown' };
}

function sleep(ms: number) { return new Promise<void>((res) => setTimeout(res, ms)); }

async function downloadAndValidate(url: string, retries = 3): Promise<{ ok: boolean; buf?: Buffer; reason: string; format?: string }> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 20000);
      const r = await fetch(url, { headers: { 'User-Agent': USER_AGENT }, signal: ctrl.signal });
      clearTimeout(t);
      if (r.status === 429) {
        const wait = 1500 * (attempt + 1) * (attempt + 1);
        if (attempt < retries - 1) {
          await sleep(wait);
          continue;
        }
        return { ok: false, reason: `HTTP 429 (rate-limited after ${retries})` };
      }
      if (!r.ok) return { ok: false, reason: `HTTP ${r.status}` };
      const buf = Buffer.from(await r.arrayBuffer());
      if (buf.length < 50) return { ok: false, reason: `truncated (${buf.length}b)` };
      const ct = r.headers.get('content-type') || '';
      if (!ct.startsWith('image/')) return { ok: false, reason: `wrong content-type: ${ct}` };
      const { width, height, format } = parseImageDims(buf);
      if (format === 'unknown') return { ok: false, reason: 'unknown signature' };
      if (format !== 'webp' && (width < 50 || height < 50)) return { ok: false, reason: `too small ${width}x${height}` };
      return { ok: true, buf, reason: 'ok', format };
    } catch (e: any) {
      if (attempt < retries - 1) {
        await sleep(1000 * (attempt + 1));
        continue;
      }
      return { ok: false, reason: `fetch err: ${e.message}` };
    }
  }
  return { ok: false, reason: 'exhausted retries' };
}

// ============================================================================
// 3. CACHE
// ============================================================================

interface CacheEntry {
  originalImage?: string;
  thumbnail?: string;
  fetchedAt: string;
}

let CACHE: Record<string, CacheEntry> = {};
function loadCache() {
  try {
    if (fs.existsSync(CACHE_PATH)) {
      CACHE = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
    }
  } catch (e) { /* ignore */ }
}
function saveCache() {
  try {
    fs.writeFileSync(CACHE_PATH, JSON.stringify(CACHE, null, 2));
  } catch (e) { /* ignore */ }
}

// ============================================================================
// 4. WIKIPEDIA REST API
// ============================================================================

async function fetchWikiImage(title: string, retries = 3): Promise<{ originalImage?: string; thumbnail?: string } | null> {
  if (CACHE[title]) return CACHE[title];
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`;
      const r = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
      if (r.status === 429) {
        if (attempt < retries - 1) { await sleep(2000 * (attempt + 1) * (attempt + 1)); continue; }
        console.log(`  wiki: ${title} → HTTP 429 (rate-limited after ${retries})`);
        return null;
      }
      if (!r.ok) {
        console.log(`  wiki: ${title} → HTTP ${r.status}`);
        return null;
      }
      const data: any = await r.json();
      const entry: CacheEntry = {
        originalImage: data.originalimage?.source,
        thumbnail: data.thumbnail?.source,
        fetchedAt: new Date().toISOString(),
      };
      CACHE[title] = entry;
      saveCache();
      return entry;
    } catch (e: any) {
      if (attempt < retries - 1) { await sleep(1000 * (attempt + 1)); continue; }
      console.log(`  wiki: ${title} → err ${e.message}`);
      return null;
    }
  }
  return null;
}

// ============================================================================
// 5. STORAGE UPLOAD
// ============================================================================

async function uploadImage(folder: string, slug: string, buf: Buffer, format: string): Promise<string | null> {
  const ext = format === 'png' ? 'png' : format === 'webp' ? 'webp' : 'jpg';
  const filePath = `${folder}/${slug}.${ext}`;
  const contentType = format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg';
  const { error } = await sb.storage.from(BUCKET).upload(filePath, buf, { contentType, upsert: true });
  if (error) {
    console.error(`  upload err for ${filePath}: ${error.message}`);
    return null;
  }
  return sb.storage.from(BUCKET).getPublicUrl(filePath).data.publicUrl;
}

// ============================================================================
// 6. QUESTION GENERATION
// ============================================================================

const FR_FLAG_VARIANTS = [
  'À quel pays appartient ce drapeau ?',
  'De quel pays est ce drapeau ?',
  'Quel pays a ce drapeau ?',
];
const EN_FLAG_VARIANTS = [
  'Which country does this flag belong to?',
  'Which country has this flag?',
  'What country is this flag from?',
];
const FR_MONUMENT_VARIANTS = [
  'Quel est ce monument ?',
  'Quel monument est représenté ?',
  'Reconnais-tu ce site ?',
];
const EN_MONUMENT_VARIANTS = [
  'What monument is this?',
  'Which landmark is shown?',
  'Can you identify this site?',
];
const FR_PERSON_VARIANTS = [
  'Qui est représenté sur cette image ?',
  'Reconnais-tu cette personnalité ?',
];
const EN_PERSON_VARIANTS = [
  'Who is shown in this image?',
  'Can you identify this person?',
];

function pickVariant(arr: string[], i: number): string {
  return arr[i % arr.length];
}

interface QuestionRow {
  language: string;
  category: string;
  difficulty: number;
  min_age: number;
  is_active: boolean;
  question_text: string;
  correct_answer: string;
  wrong_answers: string[];
  explanation: string | null;
  image_url: string;
  image_credit: string;
}

// ============================================================================
// 7. PROCESS EACH CATEGORY
// ============================================================================

const existingImageUrls = new Set<string>();

async function preloadExistingImageUrls() {
  // Load only URLs likely to collide: flagcdn w640 + monuments/people storage URLs.
  let from = 0;
  const PAGE = 1000;
  while (true) {
    const { data, error } = await sb.from('questions')
      .select('image_url')
      .or('image_url.like.%flagcdn.com/w640/%,image_url.like.%/monuments/%,image_url.like.%/people/%')
      .range(from, from + PAGE - 1);
    if (error) { console.error('preload err:', error.message); break; }
    if (!data || data.length === 0) break;
    (data as any[]).forEach((q) => { if (q.image_url) existingImageUrls.add(q.image_url); });
    if (data.length < PAGE) break;
    from += PAGE;
  }
  console.log(`Pre-loaded ${existingImageUrls.size} existing image URLs (flag/monument/person)`);
}

interface Stats {
  inserted: number;
  skippedExisting: number;
  skippedLeak: number;
  failedFetch: number;
  failedUpload: number;
}

function makeStats(): Stats {
  return { inserted: 0, skippedExisting: 0, skippedLeak: 0, failedFetch: 0, failedUpload: 0 };
}

async function batchedInsert(rows: QuestionRow[]): Promise<number> {
  if (DRY) {
    console.log(`  [DRY] would insert ${rows.length} rows`);
    return 0;
  }
  const BATCH = 50;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const slice = rows.slice(i, i + BATCH);
    const { error, data } = await sb.from('questions').insert(slice as any).select('id');
    if (error) {
      console.error(`  batch ${i / BATCH + 1} insert err: ${error.message}`);
      continue;
    }
    inserted += (data?.length ?? slice.length);
  }
  return inserted;
}

async function processFlags(): Promise<Stats> {
  const stats = makeStats();
  const rows: QuestionRow[] = [];
  const namesFR = COUNTRIES.map((c) => c.nameFR);
  const namesEN = COUNTRIES.map((c) => c.nameEN);
  let qIdx = 0;

  for (const c of COUNTRIES) {
    const imageUrl = `https://flagcdn.com/w640/${c.code}.png`;
    if (existingImageUrls.has(imageUrl)) {
      stats.skippedExisting += 2;
      continue;
    }
    const v = await downloadAndValidate(imageUrl);
    if (!v.ok) {
      console.log(`[flag ${c.code}] FAIL ${v.reason}`);
      stats.failedFetch += 2;
      continue;
    }
    const minAge = 6;

    // FR
    const qFR = pickVariant(FR_FLAG_VARIANTS, qIdx);
    if (isLeak(qFR, c.nameFR)) {
      stats.skippedLeak++;
    } else {
      rows.push({
        language: 'fr', category: 'geography', difficulty: c.difficulty, min_age: minAge, is_active: true,
        question_text: qFR, correct_answer: c.nameFR,
        wrong_answers: pickWrongs(c.nameFR, namesFR),
        explanation: null, image_url: imageUrl, image_credit: 'flagcdn.com',
      });
    }
    // EN
    const qEN = pickVariant(EN_FLAG_VARIANTS, qIdx);
    if (isLeak(qEN, c.nameEN)) {
      stats.skippedLeak++;
    } else {
      rows.push({
        language: 'en', category: 'geography', difficulty: c.difficulty, min_age: minAge, is_active: true,
        question_text: qEN, correct_answer: c.nameEN,
        wrong_answers: pickWrongs(c.nameEN, namesEN),
        explanation: null, image_url: imageUrl, image_credit: 'flagcdn.com',
      });
    }
    existingImageUrls.add(imageUrl);
    qIdx++;
    if (qIdx % 10 === 0) process.stdout.write(`\r flags processed: ${qIdx}/${COUNTRIES.length}`);
  }
  process.stdout.write('\n');

  console.log(`Inserting ${rows.length} flag rows...`);
  stats.inserted = await batchedInsert(rows);
  return stats;
}

async function processMonuments(): Promise<Stats> {
  const stats = makeStats();
  const rows: QuestionRow[] = [];
  const namesFR = MONUMENTS.map((m) => m.nameFR);
  const namesEN = MONUMENTS.map((m) => m.nameEN);
  let qIdx = 0;

  for (const m of MONUMENTS) {
    const slug = slugify(m.nameEN);
    // Tentative URL — but we have to upload, so check by predicted public URL.
    const wiki = await fetchWikiImage(m.wikiTitle);
    if (!wiki) {
      console.log(`[monument ${m.nameEN}] no wiki data`);
      stats.failedFetch += 2;
      continue;
    }
    // Prefer thumbnail (smaller, faster, less load on Wikimedia) — fallback to original.
    // For monuments, we can also bump thumbnail size by replacing /<N>px-/ in the URL.
    const bumpThumbnail = (url?: string): string | undefined => {
      if (!url) return url;
      return url.replace(/\/(\d{2,4})px-/, '/800px-');
    };
    let chosen = bumpThumbnail(wiki.thumbnail) || wiki.originalImage;
    let v = chosen ? await downloadAndValidate(chosen) : { ok: false, reason: 'no image' } as any;
    if (!v.ok && wiki.thumbnail && chosen !== wiki.thumbnail) {
      chosen = wiki.thumbnail;
      v = await downloadAndValidate(chosen);
    }
    if (!v.ok && wiki.originalImage && chosen !== wiki.originalImage) {
      chosen = wiki.originalImage;
      v = await downloadAndValidate(chosen);
    }
    if (!v.ok || !v.buf) {
      console.log(`[monument ${m.nameEN}] FAIL ${v.reason}`);
      stats.failedFetch += 2;
      continue;
    }

    // Upload to bucket
    let publicUrl: string | null;
    if (DRY) {
      publicUrl = `https://dqhhpoxqrtlmhosrsdxp.supabase.co/storage/v1/object/public/${BUCKET}/monuments/${slug}.${v.format === 'png' ? 'png' : v.format === 'webp' ? 'webp' : 'jpg'}`;
    } else {
      publicUrl = await uploadImage('monuments', slug, v.buf, v.format!);
    }
    if (!publicUrl) {
      stats.failedUpload += 2;
      continue;
    }
    if (existingImageUrls.has(publicUrl)) {
      stats.skippedExisting += 2;
      continue;
    }
    const minAge = m.difficulty <= 2 ? 8 : 12;

    const qFR = pickVariant(FR_MONUMENT_VARIANTS, qIdx);
    if (isLeak(qFR, m.nameFR)) {
      stats.skippedLeak++;
    } else {
      rows.push({
        language: 'fr', category: m.category, difficulty: m.difficulty, min_age: minAge, is_active: true,
        question_text: qFR, correct_answer: m.nameFR,
        wrong_answers: pickWrongs(m.nameFR, namesFR),
        explanation: null, image_url: publicUrl, image_credit: 'Wikimedia Commons',
      });
    }
    const qEN = pickVariant(EN_MONUMENT_VARIANTS, qIdx);
    if (isLeak(qEN, m.nameEN)) {
      stats.skippedLeak++;
    } else {
      rows.push({
        language: 'en', category: m.category, difficulty: m.difficulty, min_age: minAge, is_active: true,
        question_text: qEN, correct_answer: m.nameEN,
        wrong_answers: pickWrongs(m.nameEN, namesEN),
        explanation: null, image_url: publicUrl, image_credit: 'Wikimedia Commons',
      });
    }
    existingImageUrls.add(publicUrl);
    qIdx++;
    console.log(`[monument] ${m.nameEN.padEnd(28)} → ${slug}.${v.format === 'png' ? 'png' : v.format === 'webp' ? 'webp' : 'jpg'} (${(v.buf!.length / 1024).toFixed(0)}KB)`);
    saveCache();
    await sleep(300);
  }

  console.log(`Inserting ${rows.length} monument rows...`);
  stats.inserted = await batchedInsert(rows);
  return stats;
}

async function processPeople(): Promise<Stats> {
  const stats = makeStats();
  const rows: QuestionRow[] = [];
  const namesByCat: Record<string, { fr: string[]; en: string[] }> = {};
  for (const p of PEOPLE) {
    if (!namesByCat[p.category]) namesByCat[p.category] = { fr: [], en: [] };
    namesByCat[p.category].fr.push(p.nameFR);
    namesByCat[p.category].en.push(p.nameEN);
  }
  const allFR = PEOPLE.map((p) => p.nameFR);
  const allEN = PEOPLE.map((p) => p.nameEN);
  let qIdx = 0;

  for (const p of PEOPLE) {
    const slug = slugify(p.nameEN);
    const wiki = await fetchWikiImage(p.wikiTitle);
    if (!wiki) {
      console.log(`[person ${p.nameEN}] no wiki data`);
      stats.failedFetch += 2;
      continue;
    }
    const bumpThumbnail = (url?: string): string | undefined => {
      if (!url) return url;
      return url.replace(/\/(\d{2,4})px-/, '/600px-');
    };
    let chosen = bumpThumbnail(wiki.thumbnail) || wiki.originalImage;
    let v = chosen ? await downloadAndValidate(chosen) : { ok: false, reason: 'no image' } as any;
    if (!v.ok && wiki.thumbnail && chosen !== wiki.thumbnail) {
      chosen = wiki.thumbnail;
      v = await downloadAndValidate(chosen);
    }
    if (!v.ok && wiki.originalImage && chosen !== wiki.originalImage) {
      chosen = wiki.originalImage;
      v = await downloadAndValidate(chosen);
    }
    if (!v.ok || !v.buf) {
      console.log(`[person ${p.nameEN}] FAIL ${v.reason}`);
      stats.failedFetch += 2;
      continue;
    }

    let publicUrl: string | null;
    if (DRY) {
      publicUrl = `https://dqhhpoxqrtlmhosrsdxp.supabase.co/storage/v1/object/public/${BUCKET}/people/${slug}.${v.format === 'png' ? 'png' : v.format === 'webp' ? 'webp' : 'jpg'}`;
    } else {
      publicUrl = await uploadImage('people', slug, v.buf, v.format!);
    }
    if (!publicUrl) {
      stats.failedUpload += 2;
      continue;
    }
    if (existingImageUrls.has(publicUrl)) {
      stats.skippedExisting += 2;
      continue;
    }
    const minAge = p.difficulty <= 2 ? 10 : 12;

    // Same-category wrongs for plausibility (fallback to all)
    const sameCat = namesByCat[p.category];
    const wrongsFR = (sameCat.fr.length >= 4 ? pickWrongs(p.nameFR, sameCat.fr) : pickWrongs(p.nameFR, allFR));
    const wrongsEN = (sameCat.en.length >= 4 ? pickWrongs(p.nameEN, sameCat.en) : pickWrongs(p.nameEN, allEN));

    const qFR = pickVariant(FR_PERSON_VARIANTS, qIdx);
    if (isLeak(qFR, p.nameFR)) {
      stats.skippedLeak++;
    } else {
      rows.push({
        language: 'fr', category: p.category, difficulty: p.difficulty, min_age: minAge, is_active: true,
        question_text: qFR, correct_answer: p.nameFR,
        wrong_answers: wrongsFR,
        explanation: null, image_url: publicUrl, image_credit: 'Wikimedia Commons',
      });
    }
    const qEN = pickVariant(EN_PERSON_VARIANTS, qIdx);
    if (isLeak(qEN, p.nameEN)) {
      stats.skippedLeak++;
    } else {
      rows.push({
        language: 'en', category: p.category, difficulty: p.difficulty, min_age: minAge, is_active: true,
        question_text: qEN, correct_answer: p.nameEN,
        wrong_answers: wrongsEN,
        explanation: null, image_url: publicUrl, image_credit: 'Wikimedia Commons',
      });
    }
    existingImageUrls.add(publicUrl);
    qIdx++;
    console.log(`[person]   ${p.nameEN.padEnd(28)} → ${slug}.${v.format === 'png' ? 'png' : v.format === 'webp' ? 'webp' : 'jpg'} (${(v.buf!.length / 1024).toFixed(0)}KB)`);
    saveCache();
    await sleep(300);
  }

  console.log(`Inserting ${rows.length} people rows...`);
  stats.inserted = await batchedInsert(rows);
  return stats;
}

// ============================================================================
// 8. MAIN
// ============================================================================

async function main() {
  console.log(`[add_image_questions] dry=${DRY}`);
  console.log(`  flags: ${COUNTRIES.length} countries`);
  console.log(`  monuments: ${MONUMENTS.length}`);
  console.log(`  people: ${PEOPLE.length}`);
  loadCache();
  console.log(`Cache loaded: ${Object.keys(CACHE).length} wiki entries`);

  await preloadExistingImageUrls();

  // Snapshot counts BEFORE
  const { count: beforeCount } = await sb.from('questions').select('id', { count: 'exact', head: true }).eq('is_active', true);
  console.log(`Active questions BEFORE: ${beforeCount}`);

  console.log('\n=== FLAGS ===');
  const flagStats = await processFlags();
  console.log('flag stats:', flagStats);

  console.log('\n=== MONUMENTS ===');
  const monStats = await processMonuments();
  console.log('monument stats:', monStats);

  console.log('\n=== PEOPLE ===');
  const peopleStats = await processPeople();
  console.log('people stats:', peopleStats);

  saveCache();

  const { count: afterCount } = await sb.from('questions').select('id', { count: 'exact', head: true }).eq('is_active', true);
  console.log(`\nActive questions AFTER: ${afterCount} (delta ${(afterCount ?? 0) - (beforeCount ?? 0)})`);
  console.log('TOTAL INSERTED:', flagStats.inserted + monStats.inserted + peopleStats.inserted);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
