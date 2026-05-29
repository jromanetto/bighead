/**
 * expand_audio_questions.ts
 * -----------------------------------------------------------------------------
 * EXPANDS the `audio_questions` table with ~60 NEW, distinct, legally-usable
 * audio questions sourced from Wikimedia Commons (PD / CC0 / CC-BY / CC-BY-SA).
 *
 * Reuses the proven pipeline from add_audio_questions.ts:
 *   Commons search -> license verify -> download -> ffmpeg OGG/FLAC -> MP3
 *   (mono, 96kbps, <=12s) -> validate MP3 signature -> upload to
 *   question-audio/<category>/<slug>.mp3 -> INSERT bilingual row.
 *
 * NEW content (no overlap with the existing 59 rows):
 *   - more composers (Ravel, Saint-Saens, Grieg, Dvorak, Rossini, Puccini,
 *     Mendelssohn, Rachmaninoff, Mussorgsky, Bizet, Johann Strauss, Schubert...)
 *   - more instruments (bagpipes, banjo, xylophone, double bass, French horn,
 *     tuba, ukulele, mandolin, sitar, didgeridoo, panpipes, cymbals, bongos, recorder)
 *   - everyday/ambient sounds (thunder, rain, ocean, fire, engines, train, etc.)
 *   - bird songs (nightingale, blackbird, cuckoo, owl, eagle, seagull, crow, robin...)
 *   - early jazz / ragtime PD (Scott Joplin, etc.)
 *
 * Idempotent: caches resolved files in /tmp/expand_audio_cache.json and skips
 * any item whose target audio_url already exists OR whose (subcategory,
 * correct_answer) pair already exists in the DB.
 *
 * iOS NOTE: expo-av plays only MP3/M4A/WAV. All output is MP3.
 *
 * RUN: cd scripts/instagram-pipeline && npx tsx expand_audio_questions.ts
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
const CACHE_PATH = path.join(os.tmpdir(), 'expand_audio_cache.json');
const TMP_DIR = path.join(os.tmpdir(), 'bighead-audio-expand');
const AUDIO_EXT = /\.(ogg|oga|mp3|wav|flac|opus|m4a)$/i;
const MAX_SECONDS = 12;
const MIN_BYTES = 10 * 1024;
const MAX_BYTES = 2 * 1024 * 1024;

// ---------------------------------------------------------------------------
// Catalog types
// ---------------------------------------------------------------------------

type Category = 'music' | 'animals' | 'general';
type Subcategory = 'composer' | 'instrument' | 'ambient' | 'bird' | 'genre';

interface Item {
  slug: string;
  category: Category;
  subcategory: Subcategory;
  question_fr: string;
  question_en: string;
  correct_answer: string;
  wrong_answers: string[];
  difficulty: number;
  queries: string[];
  files?: string[];
  keywords: string[];
}

const Q_INSTRUMENT_FR = 'Quel instrument entends-tu ?';
const Q_INSTRUMENT_EN = 'Which instrument do you hear?';
const Q_COMPOSER_FR = 'Quel compositeur a écrit ce morceau ?';
const Q_COMPOSER_EN = 'Which composer wrote this piece?';
const Q_AMBIENT_FR = 'Quel est ce son ?';
const Q_AMBIENT_EN = 'What is this sound?';
const Q_BIRD_FR = 'Quel oiseau chante ?';
const Q_BIRD_EN = 'Which bird is singing?';
const Q_GENRE_FR = 'Quel style musical entends-tu ?';
const Q_GENRE_EN = 'Which musical style do you hear?';

// Answer pools for plausible wrong answers (NEW items only; mixed with a few
// classics so distractors feel natural without duplicating DB rows as content).
const INSTRUMENTS = ['Bagpipes', 'Banjo', 'Xylophone', 'Double bass', 'French horn', 'Tuba', 'Ukulele', 'Mandolin', 'Sitar', 'Didgeridoo', 'Panpipes', 'Cymbals', 'Bongos', 'Recorder'];
const COMPOSERS = ['Ravel', 'Saint-Saëns', 'Grieg', 'Dvořák', 'Rossini', 'Puccini', 'Mendelssohn', 'Rachmaninoff', 'Mussorgsky', 'Bizet', 'Johann Strauss', 'Schubert'];
const AMBIENT = ['Thunder', 'Rain', 'Ocean waves', 'Fire crackling', 'Car engine', 'Motorcycle', 'Train', 'Helicopter', 'Doorbell', 'Telephone ring', 'Typewriter', 'Applause', 'Church bells', 'Clock ticking', 'Camera shutter'];
const BIRDS = ['Nightingale', 'Blackbird', 'Cuckoo', 'Owl', 'Eagle', 'Seagull', 'Crow', 'Robin', 'Sparrow', 'Woodpecker'];
const GENRES = ['Ragtime', 'Early jazz', 'Dixieland', 'Swing', 'Blues', 'Marching band'];

function peers(pool: string[], correct: string, n = 3): string[] {
  const others = pool.filter((x) => x !== correct);
  const start = (pool.indexOf(correct) + 1) % others.length;
  const out: string[] = [];
  for (let i = 0; i < n; i++) out.push(others[(start + i) % others.length]);
  return out;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function instr(correct: string, diff: number, queries: string[], keywords: string[], files?: string[]): Item {
  return {
    slug: `instrument-${slugify(correct)}`,
    category: 'music', subcategory: 'instrument',
    question_fr: Q_INSTRUMENT_FR, question_en: Q_INSTRUMENT_EN,
    correct_answer: correct, wrong_answers: peers(INSTRUMENTS, correct),
    difficulty: diff, queries, keywords, files,
  };
}
function composer(answer: string, diff: number, queries: string[], keywords: string[], files?: string[]): Item {
  return {
    slug: `composer-${slugify(answer)}`,
    category: 'music', subcategory: 'composer',
    question_fr: Q_COMPOSER_FR, question_en: Q_COMPOSER_EN,
    correct_answer: answer, wrong_answers: peers(COMPOSERS, answer),
    difficulty: diff, queries, keywords, files,
  };
}
function ambient(correct: string, diff: number, queries: string[], keywords: string[], files?: string[]): Item {
  return {
    slug: `ambient-${slugify(correct)}`,
    category: 'general', subcategory: 'ambient',
    question_fr: Q_AMBIENT_FR, question_en: Q_AMBIENT_EN,
    correct_answer: correct, wrong_answers: peers(AMBIENT, correct),
    difficulty: diff, queries, keywords, files,
  };
}
function bird(correct: string, diff: number, queries: string[], keywords: string[], files?: string[]): Item {
  return {
    slug: `bird-${slugify(correct)}`,
    category: 'animals', subcategory: 'bird',
    question_fr: Q_BIRD_FR, question_en: Q_BIRD_EN,
    correct_answer: correct, wrong_answers: peers(BIRDS, correct),
    difficulty: diff, queries, keywords, files,
  };
}
function genre(correct: string, diff: number, queries: string[], keywords: string[], files?: string[]): Item {
  return {
    slug: `genre-${slugify(correct)}`,
    category: 'music', subcategory: 'genre',
    question_fr: Q_GENRE_FR, question_en: Q_GENRE_EN,
    correct_answer: correct, wrong_answers: peers(GENRES, correct),
    difficulty: diff, queries, keywords, files,
  };
}

// ---------------------------------------------------------------------------
// Catalog — NEW items only (no overlap with existing 59 rows)
// ---------------------------------------------------------------------------

const CATALOG: Item[] = [
  // ---- MORE COMPOSERS (PD performances) ----
  composer('Ravel', 2, ["Ravel Bolero", "Ravel Pavane", "Ravel Jeux d'eau"], ['ravel', 'bolero', 'pavane']),
  composer('Saint-Saëns', 2, ['Saint-Saens Carnival of the Animals', 'Saint-Saens Danse Macabre', 'Saint-Saens The Swan'], ['saint-saens', 'saint saens', 'carnival', 'danse macabre', 'cygne', 'swan']),
  composer('Grieg', 3, ['Grieg In the Hall of the Mountain King', 'Grieg Peer Gynt', 'Grieg Morning Mood'], ['grieg', 'peer gynt', 'mountain king']),
  composer('Dvořák', 3, ['Dvorak New World Symphony', 'Dvorak Symphony No 9', 'Dvorak Humoresque'], ['dvorak', 'dvořák', 'new world', 'humoresque']),
  composer('Rossini', 2, ['Rossini William Tell Overture', 'Rossini Barber of Seville', 'Rossini Guillaume Tell'], ['rossini', 'william tell', 'guillaume tell', 'barber']),
  composer('Puccini', 3, ['Puccini Nessun Dorma', 'Puccini O mio babbino caro', 'Puccini La Boheme'], ['puccini', 'nessun dorma', 'babbino', 'boheme']),
  composer('Mendelssohn', 2, ['Mendelssohn Wedding March', 'Mendelssohn Midsummer Nights Dream', 'Mendelssohn Spring Song'], ['mendelssohn', 'wedding march', 'midsummer']),
  composer('Rachmaninoff', 3, ['Rachmaninoff Prelude C sharp minor', 'Rachmaninoff Piano Concerto 2', 'Rachmaninov Prelude'], ['rachmaninoff', 'rachmaninov', 'prelude', 'concerto']),
  composer('Mussorgsky', 3, ['Mussorgsky Pictures at an Exhibition', 'Mussorgsky Night on Bald Mountain', 'Moussorgsky Pictures'], ['mussorgsky', 'moussorgsky', 'pictures', 'bald mountain', 'exhibition']),
  composer('Bizet', 2, ['Bizet Carmen', 'Bizet Toreador', 'Bizet Carmen overture', 'Carmen Bizet suite'], ['bizet', 'carmen', 'toreador'], ['File:Bizet - Carmen Suite No. 1 - I. Prelude.ogg', 'File:Georges Bizet - Carmen - Prélude.ogg']),
  composer('Johann Strauss', 2, ['Johann Strauss Blue Danube', 'Johann Strauss Tritsch-Tratsch-Polka', 'Strauss Emperor Waltz'], ['tritsch', 'tritsch-tratsch', 'emperor waltz', 'kaiser-walzer']),
  composer('Schubert', 2, ['Schubert Ave Maria', 'Schubert Trout Quintet', 'Schubert Erlkonig', 'Schubert Marche militaire'], ['schubert', 'ave maria', 'trout', 'forelle', 'erlkonig']),

  // ---- MORE INSTRUMENTS ----
  instr('Bagpipes', 2, ['bagpipes playing', 'great highland bagpipe', 'bagpipe scotland'], ['bagpipe', 'cornemuse', 'dudelsack', 'gaita']),
  instr('Banjo', 2, ['banjo playing', 'five string banjo', 'bluegrass banjo'], ['banjo']),
  instr('Xylophone', 2, ['xylophone playing', 'xylophone scale', 'xylophone solo'], ['xylophone', 'xylophon']),
  instr('Double bass', 3, ['double bass pizzicato', 'contrabass arco', 'upright bass solo'], ['double bass', 'contrabass', 'contrebasse', 'kontrabass', 'upright bass']),
  instr('French horn', 3, ['waldhorn', 'french horn', 'horn instrument sound', 'cor d harmonie'], ['french horn', 'waldhorn', 'horn ', 'cor ', 'corno'], ['File:Waldhorn.ogg', 'File:Horn.ogg', 'File:French horn.ogg']),
  instr('Tuba', 2, ['tuba', 'tuba note', 'sousaphone tuba'], ['tuba', 'sousaphone'], ['File:Tuba.ogg', 'File:Tuba sound.ogg']),
  instr('Ukulele', 2, ['ukulele playing', 'ukulele strum', 'ukulele chords'], ['ukulele', 'ukelele']),
  instr('Mandolin', 3, ['mandolin playing', 'mandolin tremolo', 'mandolin solo'], ['mandolin', 'mandoline']),
  instr('Sitar', 3, ['sitar playing', 'sitar raga', 'indian sitar'], ['sitar']),
  instr('Didgeridoo', 3, ['didgeridoo playing', 'didjeridu drone', 'aboriginal didgeridoo'], ['didgeridoo', 'didjeridu', 'didgeridoo']),
  instr('Panpipes', 3, ['pan flute', 'panpipe', 'zampona andean', 'siku panpipe', 'nai pan flute'], ['pan flute', 'panpipe', 'pan pipe', 'panflute', 'zampona', 'zampoña', 'siku', 'nai ', 'quena'], ['File:Pan flute.ogg', 'File:Panflute.ogg']),
  instr('Cymbals', 2, ['crash cymbal', 'cymbal hit', 'orchestral cymbals'], ['cymbal', 'cymbale', 'becken']),
  instr('Bongos', 2, ['bongo drums playing', 'bongos rhythm', 'bongo pattern'], ['bongo']),
  instr('Recorder', 2, ['recorder flute playing', 'soprano recorder', 'block flute recorder'], ['recorder', 'blockflote', 'blockflöte', 'flute a bec', 'flûte à bec']),

  // ---- EVERYDAY / AMBIENT SOUNDS ----
  ambient('Thunder', 1, ['thunder sound', 'thunderclap', 'thunderstorm thunder'], ['thunder', 'tonnerre', 'donner']),
  ambient('Rain', 1, ['rain sound', 'rainfall ambient', 'rain falling'], ['rain', 'pluie', 'regen']),
  ambient('Ocean waves', 1, ['ocean waves sound', 'sea waves', 'waves beach'], ['wave', 'ocean', 'sea ', 'surf', 'vague', 'mer ']),
  ambient('Fire crackling', 2, ['fire crackling', 'campfire sound', 'crackling fire'], ['fire', 'crackl', 'campfire', 'feu', 'feuer']),
  ambient('Car engine', 2, ['car engine sound', 'car engine idle', 'automobile engine'], ['car engine', 'engine', 'motor', 'moteur', 'automobile']),
  ambient('Motorcycle', 2, ['motorcycle engine sound', 'motorbike revving', 'motorcycle passing'], ['motorcycle', 'motorbike', 'moto ', 'motorrad']),
  ambient('Train', 2, ['train passing sound', 'steam train', 'train whistle horn'], ['train', 'locomotive', 'railway', 'zug ']),
  ambient('Helicopter', 2, ['helicopter sound', 'helicopter rotor', 'helicopter flyby'], ['helicopter', 'helicoptere', 'hubschrauber', 'rotor']),
  ambient('Doorbell', 2, ['doorbell sound', 'door bell ring', 'door chime'], ['doorbell', 'door bell', 'door chime', 'sonnette', 'turklingel']),
  ambient('Telephone ring', 2, ['telephone ringing', 'phone ringing sound', 'rotary telephone', 'old phone bell ring'], ['telephone', 'phone ring', 'phone bell', 'ringing', 'rotary', 'klingel', 'telefon'], ['File:Telephone-ring-04a.ogg', 'File:Telephone ring.ogg', 'File:Old telephone ringing.ogg']),
  ambient('Typewriter', 2, ['typewriter sound', 'typewriter typing', 'mechanical typewriter'], ['typewriter', 'schreibmaschine', 'machine a ecrire']),
  ambient('Applause', 1, ['applause sound', 'clapping crowd', 'audience applause'], ['applause', 'clapping', 'applaudissement', 'beifall', 'ovation']),
  ambient('Church bells', 2, ['church bells ringing', 'church bell tower', 'cathedral bells'], ['church bell', 'bell tower', 'cloche', 'glocke', 'carillon', 'campane']),
  ambient('Clock ticking', 2, ['clock ticking sound', 'clock tick tock', 'pendulum clock ticking'], ['clock tick', 'ticking', 'tick tock', 'pendulum', 'horloge', 'uhr ']),
  ambient('Camera shutter', 3, ['camera shutter sound', 'slr shutter click', 'camera click shutter'], ['shutter', 'camera click', 'obturateur', 'kamera']),

  // ---- BIRD SONGS ----
  bird('Nightingale', 2, ['nightingale song', 'common nightingale Luscinia', 'nightingale singing'], ['nightingale', 'luscinia', 'rossignol', 'nachtigall']),
  bird('Blackbird', 2, ['common blackbird song', 'Turdus merula song', 'blackbird singing'], ['blackbird', 'turdus merula', 'merle', 'amsel']),
  bird('Cuckoo', 2, ['common cuckoo call', 'Cuculus canorus call', 'cuckoo singing'], ['cuckoo', 'cuculus', 'coucou', 'kuckuck']),
  bird('Owl', 2, ['tawny owl call', 'owl hooting', 'Strix aluco call', 'barn owl'], ['owl', 'strix', 'tyto', 'bubo', 'chouette', 'hibou', 'eule']),
  bird('Eagle', 3, ['eagle call', 'golden eagle call', 'sea eagle call', 'Aquila call'], ['eagle', 'aquila', 'haliaeetus', 'aigle', 'adler']),
  bird('Seagull', 2, ['seagull call', 'herring gull call', 'Larus call', 'gull sound'], ['gull', 'seagull', 'larus', 'mouette', 'goeland', 'mowe', 'möwe']),
  bird('Crow', 2, ['crow cawing', 'carrion crow call', 'Corvus call', 'raven crow'], ['crow', 'corvus', 'raven', 'corneille', 'corbeau', 'krahe', 'krähe']),
  bird('Robin', 3, ['European robin song', 'Erithacus rubecula song', 'robin singing'], ['robin', 'erithacus', 'rougegorge', 'rouge-gorge', 'rotkehlchen']),
  bird('Sparrow', 3, ['house sparrow call', 'Passer domesticus chirp', 'sparrow chirping'], ['sparrow', 'passer', 'moineau', 'sperling', 'spatz']),
  bird('Woodpecker', 3, ['woodpecker drumming', 'great spotted woodpecker', 'Dendrocopos drumming', 'green woodpecker call'], ['woodpecker', 'dendrocopos', 'picus', 'pic ', 'pivert', 'specht']),

  // ---- EARLY JAZZ / RAGTIME (Public Domain, pre-1928) ----
  genre('Ragtime', 2, ['Maple Leaf Rag Scott Joplin', 'Scott Joplin Maple Leaf Rag', 'ragtime piano roll'], ['maple leaf', 'joplin', 'ragtime', 'rag ']),
  genre('Ragtime', 2, ['The Entertainer Scott Joplin', 'Scott Joplin Entertainer', 'Entertainer rag'], ['entertainer', 'joplin']),
  genre('Early jazz', 3, ['Original Dixieland Jass Band', 'Livery Stable Blues 1917', 'Dixieland Jass Band one step'], ['dixieland', 'jass band', 'livery stable', 'original dixieland']),
  genre('Early jazz', 3, ['Tiger Rag Original Dixieland', 'Tiger Rag 1918', 'Castle House Rag Europe'], ['tiger rag', 'castle house', 'dixieland', 'james reese europe']),
  genre('Ragtime', 3, ['Scott Joplin Solace', 'Joplin Pineapple Rag', 'Scott Joplin Easy Winners'], ['solace', 'pineapple', 'easy winners', 'joplin']),
  genre('Early jazz', 3, ['Memphis Blues W.C. Handy', 'St Louis Blues Handy 1920s', 'Darktown Strutters Ball'], ['memphis blues', 'st louis blues', 'darktown', 'handy']),
];

// ---------------------------------------------------------------------------
// License gate (same policy as add_audio_questions.ts)
// ---------------------------------------------------------------------------

function isFreeLicense(short?: string, full?: string): boolean {
  const s = `${short || ''} ${full || ''}`.toLowerCase();
  if (!s.trim()) return false;
  if (/fair use|non-?free|all rights reserved/.test(s) && !/public domain|cc0|creative commons|cc[ -]?by/.test(s)) {
    return false;
  }
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

const NOISE_RE = /(^|file:)\s*(ll-q\d|en-|fr-|de-|nl-|es-|it-|pt-|ru-|ja-|zh-|ms-|jer-|cs-|pl-|sv-)/i;
const NOISE_WORDS = /(pronunciation|-article|wikipedia|spoken|how to say|tts|text to speech|narration|audiobook|poem|reading of)/i;

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
    const j = await api({ action: 'query', list: 'search', srsearch: `${query} filetype:audio`, srnamespace: '6', srlimit: '20' });
    const hits = j?.query?.search || [];
    return hits.map((h: any) => h.title).filter((t: string) => AUDIO_EXT.test(t));
  } catch {
    return [];
  }
}

async function resolve(item: Item): Promise<Resolved | null> {
  for (const f of item.files || []) {
    const r = await imageinfo(f);
    if (r) return r;
  }
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

// Loaded once: existing (subcategory, correct_answer) pairs to prevent content dupes.
let existingPairs = new Set<string>();
function pairKey(sub: string, ans: string): string {
  return `${sub}::${ans.toLowerCase()}`;
}
async function loadExistingPairs(): Promise<void> {
  const { data } = await (sb.from('audio_questions') as any)
    .select('subcategory, correct_answer')
    .eq('is_active', true);
  for (const r of (data as any[]) || []) {
    existingPairs.add(pairKey(r.subcategory, r.correct_answer));
  }
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
// Leak guard: correct_answer must not appear in either question text.
// ---------------------------------------------------------------------------

function leaks(item: Item): boolean {
  const ans = item.correct_answer.toLowerCase();
  return item.question_fr.toLowerCase().includes(ans) || item.question_en.toLowerCase().includes(ans);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  fs.mkdirSync(TMP_DIR, { recursive: true });
  const cache = loadCache();
  await loadExistingPairs();

  // Track (subcategory, answer) pairs inserted within THIS run so the multiple
  // "Ragtime"/"Early jazz" genre items don't collide on slug or pair.
  const insertedPairs = new Set<string>();

  const stats: Record<string, { inserted: number; skipped: number; samples: string[] }> = {
    composer: { inserted: 0, skipped: 0, samples: [] },
    instrument: { inserted: 0, skipped: 0, samples: [] },
    ambient: { inserted: 0, skipped: 0, samples: [] },
    bird: { inserted: 0, skipped: 0, samples: [] },
    genre: { inserted: 0, skipped: 0, samples: [] },
  };
  let converted = 0;
  const skipReasons: string[] = [];

  for (const item of CATALOG) {
    const st = stats[item.subcategory];

    // Leak guard.
    if (leaks(item)) {
      console.warn(`! ${item.slug}: answer leaks into question, skip`);
      st.skipped++;
      skipReasons.push(`${item.slug}: answer leak`);
      continue;
    }

    // Genre items reuse the same correct_answer ("Ragtime"/"Early jazz") across
    // multiple distinct recordings — give each a unique slug + storage path.
    let storageSlug = item.slug;
    const pk = pairKey(item.subcategory, item.correct_answer);
    if (item.subcategory === 'genre') {
      // Use the first query as a discriminator so each recording is distinct.
      storageSlug = `${item.slug}-${slugify(item.queries[0]).slice(0, 32)}`;
    } else {
      // Non-genre: content dedupe on (subcategory, answer).
      if (existingPairs.has(pk) || insertedPairs.has(pk)) {
        console.log(`= ${item.slug}: (sub,answer) pair already exists, skip`);
        continue;
      }
    }

    const storagePath = `${item.category}/${storageSlug}.mp3`;
    const targetUrl = publicUrl(storagePath);

    // Idempotency: already in DB by URL?
    if (await rowExists(targetUrl)) {
      console.log(`= ${storageSlug}: already in DB, skip`);
      continue;
    }

    console.log(`> ${storageSlug} (${item.correct_answer})`);

    // Resolve a free audio source (use cache if present).
    let resolved: Resolved | null = null;
    if (cache[storageSlug]) {
      resolved = { title: cache[storageSlug].title, url: cache[storageSlug].sourceUrl, license: cache[storageSlug].license };
      console.log(`  cache hit: ${resolved.title}`);
    } else {
      resolved = await resolve(item);
      if (resolved) {
        cache[storageSlug] = { title: resolved.title, license: resolved.license, sourceUrl: resolved.url };
        saveCache(cache);
      }
    }

    if (!resolved) {
      console.warn('  SKIP: no free audio found');
      st.skipped++;
      skipReasons.push(`${storageSlug}: not found / non-free`);
      continue;
    }
    console.log(`  src: ${resolved.title} [${resolved.license}]`);

    // Download.
    const srcExt = (resolved.url.match(AUDIO_EXT)?.[0] || '.ogg').toLowerCase();
    // Use a distinct "src-" prefix so a source .mp3 never collides with the
    // .mp3 output path (ffmpeg refuses to read+write the same file in place).
    const srcPath = path.join(TMP_DIR, `src-${storageSlug}${srcExt}`);
    const outPath = path.join(TMP_DIR, `${storageSlug}.mp3`);
    try {
      await download(resolved.url, srcPath);
    } catch (e: any) {
      console.warn(`  SKIP: download failed (${e.message})`);
      st.skipped++;
      skipReasons.push(`${storageSlug}: download failed`);
      continue;
    }

    // Convert/trim to MP3.
    try {
      await toMp3(srcPath, outPath);
      converted++;
    } catch (e: any) {
      console.warn(`  SKIP: ffmpeg failed (${e.message?.slice(0, 120)})`);
      st.skipped++;
      skipReasons.push(`${storageSlug}: ffmpeg failed`);
      continue;
    }

    if (!validMp3(outPath)) {
      console.warn('  SKIP: invalid MP3 output');
      st.skipped++;
      skipReasons.push(`${storageSlug}: invalid mp3`);
      continue;
    }

    const dur = await durationSeconds(outPath);

    // Upload.
    if (!(await upload(storagePath, outPath))) {
      st.skipped++;
      skipReasons.push(`${storageSlug}: upload failed`);
      continue;
    }

    // Insert.
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
      skipReasons.push(`${storageSlug}: insert failed`);
      continue;
    }
    insertedPairs.add(pk);
    st.inserted++;
    if (st.samples.length < 2) {
      st.samples.push(`${item.correct_answer} | ${item.question_en} | ${targetUrl}`);
    }
    console.log(`  OK inserted (${dur}s)`);
  }

  // Report.
  console.log('\n========== SUMMARY ==========');
  console.log(`ffmpeg converted: ${converted}`);
  let total = 0;
  for (const [k, v] of Object.entries(stats)) {
    total += v.inserted;
    console.log(`\n[${k}] inserted=${v.inserted} skipped=${v.skipped}`);
    v.samples.forEach((s) => console.log(`   - ${s}`));
  }
  console.log(`\nTOTAL inserted this run: ${total}`);
  if (skipReasons.length) {
    console.log('\nSkips:');
    skipReasons.forEach((s) => console.log(`   ! ${s}`));
  }
  console.log('\nCache:', CACHE_PATH);
}

main().catch((e) => { console.error(e); process.exit(1); });
