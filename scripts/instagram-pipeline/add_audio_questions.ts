/**
 * add_audio_questions.ts
 * -----------------------------------------------------------------------------
 * Populates the `audio_questions` table with REAL, legally-usable audio content
 * sourced from Wikimedia Commons (PD / CC0 / CC-BY / CC-BY-SA only).
 *
 * Pipeline per item:
 *   1. Search Commons API for a matching audio file (namespace 6 = File)
 *   2. Fetch file URL + license (imageinfo extmetadata)
 *   3. Verify license is free (PD / CC0 / CC-BY / CC-BY-SA) — SKIP otherwise
 *   4. Download (custom User-Agent), convert/trim to MP3 (<=12s) via ffmpeg
 *   5. Validate MP3 signature + size (10KB - 2MB)
 *   6. Upload to Supabase storage bucket `question-audio/<category>/<slug>.mp3`
 *   7. Insert bilingual row into `audio_questions`
 *
 * Idempotent: caches resolved files in /tmp/add_audio_cache.json and skips any
 * item whose target audio_url already exists in the DB.
 *
 * iOS NOTE: expo-av cannot play OGG/OGA. All output is MP3.
 *
 * RUN: cd scripts/instagram-pipeline && npx tsx add_audio_questions.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

dotenv.config();

const execFileP = promisify(execFile);

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY env');
  process.exit(1);
}
const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const BUCKET = 'question-audio';
const UA = 'BigHead/1.0 (https://bighead.app)';
const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';
const CACHE_PATH = path.join(os.tmpdir(), 'add_audio_cache.json');
const TMP_DIR = path.join(os.tmpdir(), 'bighead-audio');
const AUDIO_EXT = /\.(ogg|oga|mp3|wav|flac|opus|m4a)$/i;
const MAX_SECONDS = 12;
const MIN_BYTES = 10 * 1024;
const MAX_BYTES = 2 * 1024 * 1024;

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------

interface Item {
  slug: string;
  category: 'music' | 'animals' | 'geography';
  subcategory: 'instrument' | 'animal' | 'anthem' | 'composer';
  question_fr: string;
  question_en: string;
  correct_answer: string;          // language-neutral proper noun
  wrong_answers: string[];         // 3 plausible peers
  difficulty: number;              // 1-3
  // Ordered search queries; first one that yields a free audio file wins.
  queries: string[];
  // Optional explicit File: titles to try first (most reliable).
  files?: string[];
  // Keywords required (any) in a search-result filename to accept it.
  keywords: string[];
}

const Q_INSTRUMENT_FR = 'Quel instrument entends-tu ?';
const Q_INSTRUMENT_EN = 'Which instrument do you hear?';
const Q_ANIMAL_FR = 'Quel animal fait ce cri ?';
const Q_ANIMAL_EN = 'Which animal makes this sound?';
const Q_ANTHEM_FR = 'De quel pays est cet hymne ?';
const Q_ANTHEM_EN = "Which country's anthem is this?";
const Q_COMPOSER_FR = 'Quel compositeur a écrit ce morceau ?';
const Q_COMPOSER_EN = 'Which composer wrote this piece?';

const INSTRUMENTS = ['Piano', 'Violin', 'Cello', 'Flute', 'Trumpet', 'Saxophone', 'Guitar', 'Drums', 'Harp', 'Accordion', 'Clarinet', 'Oboe', 'Trombone', 'Harmonica', 'Organ'];
const ANIMALS = ['Lion', 'Wolf', 'Elephant', 'Cat', 'Dog', 'Rooster', 'Cow', 'Horse', 'Frog', 'Owl', 'Dolphin', 'Whale', 'Monkey', 'Sheep', 'Duck'];
const COUNTRIES = ['France', 'United States', 'United Kingdom', 'Germany', 'Italy', 'Spain', 'Russia', 'Japan', 'Brazil', 'Canada', 'Mexico', 'Argentina', 'Australia', 'India', 'China'];
const COMPOSERS = ['Bach', 'Mozart', 'Beethoven', 'Vivaldi', 'Chopin', 'Tchaikovsky', 'Debussy', 'Brahms', 'Handel', 'Schubert', 'Wagner', 'Verdi', 'Strauss', 'Haydn', 'Liszt'];

// pick 3 wrong answers (deterministic-ish) excluding the correct one
function peers(pool: string[], correct: string, n = 3): string[] {
  const others = pool.filter((x) => x !== correct);
  // rotate based on correct's index so distributions vary
  const start = (pool.indexOf(correct) + 1) % others.length;
  const out: string[] = [];
  for (let i = 0; i < n; i++) out.push(others[(start + i) % others.length]);
  return out;
}

function instr(correct: string, diff: number, queries: string[], keywords: string[], files?: string[]): Item {
  return {
    slug: `instrument-${correct.toLowerCase()}`,
    category: 'music', subcategory: 'instrument',
    question_fr: Q_INSTRUMENT_FR, question_en: Q_INSTRUMENT_EN,
    correct_answer: correct, wrong_answers: peers(INSTRUMENTS, correct),
    difficulty: diff, queries, keywords, files,
  };
}
function animal(correct: string, diff: number, queries: string[], keywords: string[], files?: string[]): Item {
  return {
    slug: `animal-${correct.toLowerCase()}`,
    category: 'animals', subcategory: 'animal',
    question_fr: Q_ANIMAL_FR, question_en: Q_ANIMAL_EN,
    correct_answer: correct, wrong_answers: peers(ANIMALS, correct),
    difficulty: diff, queries, keywords, files,
  };
}
function anthem(country: string, diff: number, queries: string[], keywords: string[], files?: string[]): Item {
  return {
    slug: `anthem-${country.toLowerCase().replace(/\s+/g, '-')}`,
    category: 'geography', subcategory: 'anthem',
    question_fr: Q_ANTHEM_FR, question_en: Q_ANTHEM_EN,
    correct_answer: country, wrong_answers: peers(COUNTRIES, country),
    difficulty: diff, queries, keywords, files,
  };
}
function composer(correct: string, diff: number, slug: string, answer: string, queries: string[], keywords: string[], files?: string[]): Item {
  return {
    slug: `composer-${slug.toLowerCase()}`,
    category: 'music', subcategory: 'composer',
    question_fr: Q_COMPOSER_FR, question_en: Q_COMPOSER_EN,
    correct_answer: answer, wrong_answers: peers(COMPOSERS, answer),
    difficulty: diff, queries, keywords, files,
  };
}

// Curated catalog. `files` are explicit File: titles tried first (most
// reliable for correctness); `queries` + `keywords` drive the filtered search
// fallback. The resolver verifies each candidate's license before accepting.
const CATALOG: Item[] = [
  // ---- INSTRUMENTS ----
  instr('Piano', 1, ['piano solo', 'piano scale', 'piano chord'], ['piano'], ['File:Piano scale.ogg', 'File:Piano C.ogg']),
  instr('Violin', 1, ['violin vibrato', 'violin open strings', 'violin chords'], ['violin'], ['File:Violin vibrato.ogg', 'File:Violin chords.ogg']),
  instr('Cello', 2, ['cello prelude', 'cello suite', 'cello solo'], ['cello'], []),
  instr('Flute', 1, ['concert flute', 'flute solo', 'transverse flute'], ['flute', 'huilu'], []),
  instr('Trumpet', 1, ['natural trumpet', 'trumpet solo', 'trumpet fanfare'], ['trumpet', 'trompet'], ['File:Natural trumpet B-flat.ogg']),
  instr('Saxophone', 2, ['alto saxophone solo', 'saxophone jazz', 'sax solo'], ['saxophone', 'sax'], []),
  instr('Guitar', 1, ['acoustic guitar solo', 'classical guitar', 'guitar sample'], ['guitar'], ['File:AcousticGuitarSample.ogg']),
  instr('Drums', 1, ['snare drum', 'drum kit', 'drum beat'], ['drum'], ['File:Snare drum muffled.ogg']),
  instr('Harp', 2, ['harp glissando', 'concert harp', 'harp overtones'], ['harp'], []),
  instr('Accordion', 2, ['accordion chords', 'accordion registers', 'accordion solo'], ['accordion'], ['File:Accordion registers.ogg', 'File:Accordion chords-01.ogg']),
  instr('Clarinet', 2, ['clarinet solo', 'clarinet scale', 'clarinet sample'], ['clarinet'], []),
  instr('Oboe', 3, ['oboe solo', 'oboe study', 'oboe sample'], ['oboe'], []),
  instr('Trombone', 2, ['trombone solo', 'trombone pedal tone', 'trombone glissando'], ['trombone'], []),
  instr('Harmonica', 2, ['harmonica blues', 'harmonica playing', 'blues harp harmonica'], ['harmonica'], ['File:Harmonica playing.ogg']),
  instr('Organ', 2, ['pipe organ', 'church organ', 'organ recital'], ['organ', 'orgel', 'orgue'], []),

  // ---- ANIMALS ----
  animal('Lion', 2, ['lion roaring', 'lion growl', 'panthera leo roar'], ['lion', 'leo'], []),
  animal('Wolf', 2, ['wolf howling', 'wolf howls', 'gray wolf howl'], ['wolf'], ['File:Wolf howls.ogg']),
  animal('Elephant', 2, ['elephant trumpeting', 'elephant call', 'elephant voice'], ['elephant', 'éléphant', 'eléphant'], ['File:Elephant voice - trumpeting.ogg']),
  animal('Cat', 1, ['cat meowing', 'domestic cat meow', 'cat meow'], ['meow', 'cat', 'felis'], ['File:Meow domestic cat.ogg', 'File:Felis silvestris catus meows.ogg']),
  animal('Dog', 1, ['dog barking', 'dog bark', 'barking dog'], ['barking', 'dog', 'bark'], ['File:Barking of a dog.ogg', 'File:Barking of a dog 2.ogg']),
  animal('Rooster', 1, ['rooster crowing', 'cockerel crow', 'cock crow'], ['rooster', 'cock', 'crow'], ['File:Rooster crowing.ogg', 'File:Young rooster crowing.ogg']),
  animal('Cow', 1, ['cow moo', 'cattle moo', 'cow mooing'], ['cow', 'moo', 'cattle'], ['File:Single Cow Moo.ogg']),
  animal('Horse', 2, ['horse neighing', 'horse whinny', 'horse snort'], ['horse', 'neigh', 'whinny'], []),
  animal('Frog', 2, ['frog croaking', 'frog croak', 'single frog'], ['frog', 'croak'], ['File:Single Frog Croak.oga']),
  animal('Owl', 2, ['owl hooting', 'tawny owl call', 'barn owl call'], ['owl', 'strix', 'tyto', 'bubo'], []),
  animal('Dolphin', 3, ['dolphin screaming underwater', 'dolphin clicks', 'dolphin sounds'], ['dolphin'], []),
  animal('Whale', 3, ['humpback whale song', 'whale song', 'humpback whale'], ['whale'], []),
  animal('Monkey', 3, ['monkey alarm call', 'woolly monkey', 'howler monkey'], ['monkey'], ['File:Brown woolly monkey alarm call.wav']),
  animal('Sheep', 1, ['sheep bleating', 'sheep bleat', 'sheep baa'], ['sheep', 'bleat'], ['File:Sheep bleating.ogg', 'File:Sheep bleat.ogg']),
  animal('Duck', 1, ['duck quacking', 'mallard quack', 'pekin duck'], ['duck', 'mallard'], ['File:Pekin duck & mallard.ogg']),

  // ---- NATIONAL ANTHEMS (instrumental, mostly PD / US Navy/Army bands) ----
  anthem('France', 1, ['La Marseillaise', 'Marseillaise', 'hymne France'], ['marseillaise'], ['File:United States Navy Band - La Marseillaise.ogg']),
  anthem('United States', 1, ['Star-Spangled Banner instrumental', 'Star Spangled Banner band', 'United States anthem'], ['star', 'spangled', 'banner'], ['File:Star Spangled Banner instrumental.ogg', 'File:The Star-Spangled Banner (instrumental) - Concert Band - United States Air Force Band.mp3']),
  anthem('United Kingdom', 2, ['God Save the Queen instrumental', 'God Save the King', 'United Kingdom anthem'], ['god save', 'queen', 'king'], ['File:United States Navy Band - God Save the Queen.ogg']),
  anthem('Germany', 2, ['Deutschlandlied', 'Germany national anthem', 'Lied der Deutschen'], ['deutschlandlied', 'germany', 'deutschen'], ['File:United States Navy Band - Deutschlandlied.ogg']),
  anthem('Italy', 2, ['Inno di Mameli', 'Canto degli Italiani', 'Italy national anthem'], ['mameli', 'italiani', 'italy'], ['File:United States Navy Band - Il Canto degli Italiani.ogg']),
  anthem('Spain', 2, ['Marcha Real', 'Spain national anthem', 'Himno Nacional Espanol'], ['marcha real', 'spain', 'espan'], ['File:United States Navy Band - Marcha Real.ogg']),
  anthem('Russia', 2, ['National Anthem Russian Federation', 'Russia national anthem', 'State Anthem Russia'], ['russia', 'russian'], ['File:United States Navy Band - National Anthem of the Russian Federation.ogg']),
  anthem('Japan', 2, ['Kimigayo', 'Japan national anthem', 'Kimi ga Yo'], ['kimigayo', 'japan', 'kimi ga'], ['File:United States Navy Band - Kimigayo.ogg']),
  anthem('Brazil', 2, ['Hino Nacional Brasileiro', 'Brazil national anthem', 'Brazilian anthem'], ['brasileiro', 'brazil', 'brasil'], ['File:United States Navy Band - Hino Nacional Brasileiro.ogg']),
  anthem('Canada', 2, ['O Canada anthem', 'Canada national anthem', 'O Canada instrumental'], ['canada'], ['File:United States Navy Band - O Canada.ogg']),
  anthem('Mexico', 3, ['Himno Nacional Mexicano', 'Mexico national anthem', 'Mexican anthem'], ['mexicano', 'mexico', 'mexican'], ['File:United States Navy Band - Himno Nacional Mexicano.ogg']),
  anthem('Argentina', 3, ['Himno Nacional Argentino', 'Argentina national anthem', 'Argentine anthem'], ['argentino', 'argentina', 'argentine'], ['File:United States Navy Band - Himno Nacional Argentino.ogg']),
  anthem('Australia', 3, ['Advance Australia Fair instrumental', 'Australia national anthem', 'Advance Australia'], ['australia'], ['File:U.S. Navy Band, Advance Australia Fair (instrumental).ogg', 'File:United States Navy Band - Advance Australia Fair.ogg']),
  anthem('India', 3, ['Jana Gana Mana', 'India national anthem', 'Indian anthem'], ['jana gana', 'india'], ['File:United States Navy Band - Jana Gana Mana.ogg']),
  anthem('China', 3, ['March of the Volunteers', 'China national anthem', 'Chinese anthem'], ['volunteers', 'china', 'chinese'], ['File:United States Navy Band - March of the Volunteers.ogg']),

  // ---- CLASSICAL COMPOSERS (PD performances) ----
  composer('Beethoven', 1, 'beethoven', 'Beethoven', ['Beethoven Symphony No 5', 'Beethoven Fur Elise', 'Beethoven Ode to Joy'], ['beethoven']),
  composer('Mozart', 1, 'mozart', 'Mozart', ['Mozart Eine kleine Nachtmusik', 'Mozart Turkish March', 'Mozart Symphony 40'], ['mozart']),
  composer('Bach', 1, 'bach', 'Bach', ['Bach Toccata and Fugue', 'Bach Air G String', 'Bach Brandenburg'], ['bach']),
  composer('Vivaldi', 2, 'vivaldi-spring', 'Vivaldi', ['Vivaldi Four Seasons Spring', 'Vivaldi Spring Allegro', 'Vivaldi RV 269'], ['vivaldi']),
  composer('Chopin', 2, 'chopin', 'Chopin', ['Chopin Nocturne op 9', 'Chopin Minute Waltz', 'Chopin Prelude'], ['chopin']),
  composer('Tchaikovsky', 2, 'tchaikovsky', 'Tchaikovsky', ['Tchaikovsky Swan Lake', 'Tchaikovsky Nutcracker', 'Tchaikovsky 1812'], ['tchaikovsky', 'swan lake', 'nutcracker']),
  composer('Debussy', 3, 'debussy', 'Debussy', ['Debussy Suite bergamasque', 'Debussy Arabesque Prati', 'Debussy Clair de lune'], ['debussy'], ['File:Clair de lune (Claude Debussy) Suite bergamasque.ogg', 'File:Claude Debussy - Première Arabesque - Patrizia Prati.ogg']),
  composer('Brahms', 2, 'brahms', 'Brahms', ['Brahms Hungarian Dance', 'Brahms Lullaby', 'Brahms Wiegenlied'], ['brahms']),
  composer('Handel', 2, 'handel', 'Handel', ['Handel Messiah Hallelujah', 'Handel Water Music', 'Handel Sarabande'], ['handel', 'haendel', 'messiah']),
  composer('Wagner', 2, 'wagner', 'Wagner', ['Wagner Ride of the Valkyries', 'Wagner Bridal Chorus', 'Ride of the Valkyries Wagner'], ['wagner', 'valkyries']),
  composer('Verdi', 3, 'verdi', 'Verdi', ['Verdi La donna e mobile', 'Verdi Aida', 'Verdi Nabucco'], ['verdi', 'aida', 'donna e mobile']),
  composer('Strauss', 2, 'strauss', 'Strauss', ['Strauss Blue Danube', 'Strauss Radetzky', 'Blue Danube waltz'], ['strauss', 'danube', 'radetzky']),
  composer('Haydn', 3, 'haydn', 'Haydn', ['Haydn Surprise Symphony', 'Haydn Symphony 94', 'Haydn Trumpet Concerto'], ['haydn']),
  composer('Liszt', 3, 'liszt', 'Liszt', ['Liszt Hungarian Rhapsody', 'Liszt Liebestraum', 'Liszt La Campanella'], ['liszt']),
];

// ---------------------------------------------------------------------------
// License gate
// ---------------------------------------------------------------------------

function isFreeLicense(short?: string, full?: string): boolean {
  const s = `${short || ''} ${full || ''}`.toLowerCase();
  if (!s.trim()) return false;
  // Reject obviously non-free first.
  if (/fair use|non-?free|all rights reserved/.test(s) && !/public domain|cc0|creative commons|cc[ -]?by/.test(s)) {
    return false;
  }
  // Allow: Public Domain, CC0, CC-BY, CC-BY-SA (any version, spaces or hyphens).
  return /public domain|pd-|cc0|cc[ -]?0|cc[ -]?by|creative commons|attribution|share[ -]?alike/.test(s);
}

// ---------------------------------------------------------------------------
// Commons API helpers
// ---------------------------------------------------------------------------

async function api(params: Record<string, string>): Promise<any> {
  const url = new URL(COMMONS_API);
  Object.entries({ format: 'json', formatversion: '2', ...params }).forEach(([k, v]) => url.searchParams.set(k, v));
  const r = await fetch(url.toString(), { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error(`Commons API ${r.status}`);
  return r.json();
}

interface Resolved { title: string; url: string; license: string; }

async function imageinfo(title: string): Promise<Resolved | null> {
  try {
    const j = await api({ action: 'query', prop: 'imageinfo', iiprop: 'url|extmetadata|mediatype', titles: title });
    const page = j?.query?.pages?.[0];
    if (!page || page.missing) return null;
    const ii = page.imageinfo?.[0];
    if (!ii?.url) return null;
    if (!AUDIO_EXT.test(ii.url)) return null;
    const meta = ii.extmetadata || {};
    const short = meta.LicenseShortName?.value;
    const usage = meta.UsageTerms?.value;
    const lic = meta.License?.value;
    const label = short || usage || lic || '';
    if (!isFreeLicense(short || lic, `${usage || ''} ${label}`)) return null;
    return { title: page.title, url: ii.url, license: String(label).replace(/<[^>]+>/g, '').trim() || 'Public domain' };
  } catch {
    return null;
  }
}

// Dictionary / pronunciation / spoken-word noise that Commons surfaces for
// plain nouns. These are NOT the actual sound of the thing.
const NOISE_RE = /(^|file:)\s*(ll-q\d|en-|fr-|de-|nl-|es-|it-|pt-|ru-|ja-|zh-|ms-|jer-|cs-|pl-|sv-)/i;
const NOISE_WORDS = /(pronunciation|-article|wikipedia|spoken|how to say|tts|text to speech|narration|audiobook|poem|reading of)/i;

/**
 * Filter Commons search hits to plausible, on-topic audio files.
 * Requires at least one item keyword in the filename and rejects spoken-word.
 */
function filterCandidates(titles: string[], keywords: string[]): string[] {
  const kw = keywords.map((k) => k.toLowerCase());
  return titles.filter((t) => {
    const low = t.toLowerCase();
    if (NOISE_RE.test(low) || NOISE_WORDS.test(low)) return false;
    return kw.some((k) => low.includes(k));
  });
}

async function searchAudio(query: string): Promise<string[]> {
  try {
    // `filetype:audio` biases results toward actual audio files.
    const j = await api({ action: 'query', list: 'search', srsearch: `${query} filetype:audio`, srnamespace: '6', srlimit: '20' });
    const hits = j?.query?.search || [];
    return hits.map((h: any) => h.title).filter((t: string) => AUDIO_EXT.test(t));
  } catch {
    return [];
  }
}

async function resolve(item: Item): Promise<Resolved | null> {
  // 1. explicit known-good files first (most reliable for correctness)
  for (const f of item.files || []) {
    const r = await imageinfo(f);
    if (r) return r;
  }
  // 2. filtered search queries
  for (const q of item.queries) {
    const titles = await searchAudio(q);
    const good = filterCandidates(titles, item.keywords);
    for (const t of good) {
      const r = await imageinfo(t);
      if (r) return r;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Download + convert
// ---------------------------------------------------------------------------

async function download(url: string, dest: string): Promise<void> {
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error(`download ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  fs.writeFileSync(dest, buf);
}

async function toMp3(srcPath: string, outPath: string): Promise<void> {
  // Trim to MAX_SECONDS, mono, 96kbps mp3. -y overwrite.
  await execFileP('ffmpeg', [
    '-y', '-i', srcPath, '-t', String(MAX_SECONDS),
    '-ac', '1', '-ar', '44100',
    '-acodec', 'libmp3lame', '-b:a', '96k',
    outPath,
  ]);
}

function validMp3(p: string): boolean {
  if (!fs.existsSync(p)) return false;
  const size = fs.statSync(p).size;
  if (size < MIN_BYTES || size > MAX_BYTES) {
    console.warn(`    bad size ${size}b`);
    return false;
  }
  const fd = fs.openSync(p, 'r');
  const head = Buffer.alloc(3);
  fs.readSync(fd, head, 0, 3, 0);
  fs.closeSync(fd);
  // ID3 tag or MPEG frame sync (0xFF Ex/Fx)
  const isID3 = head.toString('ascii', 0, 3) === 'ID3';
  const isFrame = head[0] === 0xff && (head[1] & 0xe0) === 0xe0;
  if (!isID3 && !isFrame) {
    console.warn('    not an MP3 signature');
    return false;
  }
  return true;
}

async function durationSeconds(p: string): Promise<number> {
  try {
    const { stdout } = await execFileP('ffprobe', [
      '-v', 'error', '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1', p,
    ]);
    const d = parseFloat(stdout.trim());
    return Number.isFinite(d) ? Math.min(Math.round(d), MAX_SECONDS) : MAX_SECONDS;
  } catch {
    return MAX_SECONDS;
  }
}

// ---------------------------------------------------------------------------
// Storage + DB
// ---------------------------------------------------------------------------

function publicUrl(filePath: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${filePath}`;
}

async function upload(filePath: string, localPath: string): Promise<boolean> {
  const buf = fs.readFileSync(localPath);
  const { error } = await sb.storage.from(BUCKET).upload(filePath, buf, { contentType: 'audio/mpeg', upsert: true });
  if (error) {
    console.error(`    upload err: ${error.message}`);
    return false;
  }
  return true;
}

async function rowExists(audioUrl: string): Promise<boolean> {
  const { data } = await (sb.from('audio_questions') as any).select('id').eq('audio_url', audioUrl).limit(1);
  return !!(data && data.length);
}

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------

type Cache = Record<string, { title: string; license: string; sourceUrl: string }>;
function loadCache(): Cache {
  try { return JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8')); } catch { return {}; }
}
function saveCache(c: Cache): void {
  try { fs.writeFileSync(CACHE_PATH, JSON.stringify(c, null, 2)); } catch {}
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  fs.mkdirSync(TMP_DIR, { recursive: true });
  const cache = loadCache();

  const stats: Record<string, { inserted: number; skipped: number; samples: string[] }> = {
    instrument: { inserted: 0, skipped: 0, samples: [] },
    animal: { inserted: 0, skipped: 0, samples: [] },
    anthem: { inserted: 0, skipped: 0, samples: [] },
    composer: { inserted: 0, skipped: 0, samples: [] },
  };
  let converted = 0;
  const skipReasons: string[] = [];

  for (const item of CATALOG) {
    const targetUrl = publicUrl(`${item.category}/${item.slug}.mp3`);
    const st = stats[item.subcategory];

    // Idempotency: already in DB?
    if (await rowExists(targetUrl)) {
      console.log(`= ${item.slug}: already in DB, skip`);
      continue;
    }

    console.log(`> ${item.slug} (${item.correct_answer})`);

    // Resolve a free audio source (use cache if present)
    let resolved: Resolved | null = null;
    if (cache[item.slug]) {
      resolved = { title: cache[item.slug].title, url: cache[item.slug].sourceUrl, license: cache[item.slug].license };
      console.log(`  cache hit: ${resolved.title}`);
    } else {
      resolved = await resolve(item);
      if (resolved) {
        cache[item.slug] = { title: resolved.title, license: resolved.license, sourceUrl: resolved.url };
        saveCache(cache);
      }
    }

    if (!resolved) {
      console.warn('  SKIP: no free audio found');
      st.skipped++;
      skipReasons.push(`${item.slug}: not found / non-free`);
      continue;
    }
    console.log(`  src: ${resolved.title} [${resolved.license}]`);

    // Download
    const srcExt = (resolved.url.match(AUDIO_EXT)?.[0] || '.ogg').toLowerCase();
    const srcPath = path.join(TMP_DIR, `${item.slug}${srcExt}`);
    const outPath = path.join(TMP_DIR, `${item.slug}.mp3`);
    try {
      await download(resolved.url, srcPath);
    } catch (e: any) {
      console.warn(`  SKIP: download failed (${e.message})`);
      st.skipped++;
      skipReasons.push(`${item.slug}: download failed`);
      continue;
    }

    // Convert/trim to MP3
    try {
      await toMp3(srcPath, outPath);
      converted++;
    } catch (e: any) {
      console.warn(`  SKIP: ffmpeg failed (${e.message?.slice(0, 120)})`);
      st.skipped++;
      skipReasons.push(`${item.slug}: ffmpeg failed`);
      continue;
    }

    if (!validMp3(outPath)) {
      console.warn('  SKIP: invalid MP3 output');
      st.skipped++;
      skipReasons.push(`${item.slug}: invalid mp3`);
      continue;
    }

    const dur = await durationSeconds(outPath);

    // Upload
    const storagePath = `${item.category}/${item.slug}.mp3`;
    if (!(await upload(storagePath, outPath))) {
      st.skipped++;
      skipReasons.push(`${item.slug}: upload failed`);
      continue;
    }

    // Insert
    const row = {
      audio_url: targetUrl,
      audio_duration_seconds: dur,
      audio_credit: `Wikimedia Commons — ${resolved.license}`,
      category: item.category,
      subcategory: item.subcategory,
      question_fr: item.question_fr,
      question_en: item.question_en,
      correct_answer: item.correct_answer,
      wrong_answers: item.wrong_answers,
      difficulty: item.difficulty,
      is_active: true,
    };
    const { error } = await (sb.from('audio_questions') as any).insert(row);
    if (error) {
      console.error(`  insert err: ${error.message}`);
      st.skipped++;
      skipReasons.push(`${item.slug}: insert failed`);
      continue;
    }
    st.inserted++;
    if (st.samples.length < 2) {
      st.samples.push(`${item.correct_answer} | ${item.question_en} | ${targetUrl}`);
    }
    console.log(`  OK inserted (${dur}s)`);
  }

  // Delete placeholders
  const { error: delErr, count } = await (sb.from('audio_questions') as any)
    .delete({ count: 'exact' })
    .or('subcategory.eq.placeholder,audio_url.like.%piano2.wav%');
  console.log(`\nPlaceholders deleted: ${delErr ? `ERR ${delErr.message}` : (count ?? 'done')}`);

  // Report
  console.log('\n========== SUMMARY ==========');
  console.log(`ffmpeg converted: ${converted}`);
  for (const [k, v] of Object.entries(stats)) {
    console.log(`\n[${k}] inserted=${v.inserted} skipped=${v.skipped}`);
    v.samples.forEach((s) => console.log(`   - ${s}`));
  }
  if (skipReasons.length) {
    console.log('\nSkips:');
    skipReasons.forEach((s) => console.log(`   ! ${s}`));
  }
  console.log('\nCache:', CACHE_PATH);
}

main().catch((e) => { console.error(e); process.exit(1); });
