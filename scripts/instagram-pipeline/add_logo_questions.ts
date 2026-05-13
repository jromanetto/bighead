/**
 * Add MORE logo questions covering brands not yet in the DB.
 *
 * For each curated brand:
 *   1. Search logo.dev for the brand's domain
 *   2. Download the PNG
 *   3. Upload to question-images/logos/{slug}.png (skip if already exists)
 *   4. Insert FR + EN question with:
 *       - neutral question_text ("Quelle marque est représentée par ce logo ?")
 *       - correct_answer = brand display name
 *       - wrong_answers = 3 other brands from the same industry
 *       - image_url = public bucket URL
 *
 * Resumable: skips brands whose logo slug already has a question for the same brand
 * in the DB.
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
dotenv.config();

const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
const LOGODEV_PK = process.env.LOGODEV_PK || 'pk_TujTU5IDT8W_iEAxa8hFyA';
const LOGODEV_SK = process.env.LOGODEV_SK || 'sk_be_j-BU7TiifOuPhP7qwGQ';
const BUCKET = 'question-images';
const PREFIX = 'logos';
const DRY = process.argv.includes('--dry-run');

interface Brand {
  name: string;       // Display name = answer
  search?: string;    // Override logo.dev search query (defaults to name)
  industry: string;   // Used to pool wrong-answer candidates
  difficulty: 1 | 2 | 3 | 4 | 5;
}

// Curated list of brands NOT yet covered (or under-covered) by the existing question set.
const BRANDS: Brand[] = [
  // ===== Food & Beverage =====
  { name: 'Subway', industry: 'fast-food', difficulty: 1 },
  { name: 'Pizza Hut', industry: 'fast-food', difficulty: 1 },
  { name: 'Domino\'s Pizza', search: 'dominos.com', industry: 'fast-food', difficulty: 1 },
  { name: 'Wendy\'s', search: 'wendys.com', industry: 'fast-food', difficulty: 2 },
  { name: 'Chipotle', industry: 'fast-food', difficulty: 2 },
  { name: 'Taco Bell', industry: 'fast-food', difficulty: 1 },
  { name: 'Dunkin\'', search: 'dunkindonuts.com', industry: 'fast-food', difficulty: 2 },
  { name: 'Krispy Kreme', industry: 'fast-food', difficulty: 2 },
  { name: 'Tim Hortons', industry: 'fast-food', difficulty: 2 },
  { name: 'Five Guys', industry: 'fast-food', difficulty: 2 },
  { name: 'Lay\'s', search: 'lays.com', industry: 'snacks', difficulty: 1 },
  { name: 'Doritos', industry: 'snacks', difficulty: 1 },
  { name: 'Pringles', industry: 'snacks', difficulty: 1 },
  { name: 'Cheetos', industry: 'snacks', difficulty: 2 },
  { name: 'Oreo', industry: 'snacks', difficulty: 1 },
  { name: 'Kit Kat', search: 'kitkat.com', industry: 'snacks', difficulty: 1 },
  { name: 'Snickers', industry: 'snacks', difficulty: 1 },
  { name: 'Twix', industry: 'snacks', difficulty: 1 },
  { name: 'M&M\'s', search: 'mms.com', industry: 'snacks', difficulty: 1 },
  { name: 'Mars', search: 'mars.com', industry: 'snacks', difficulty: 1 },
  { name: 'Hershey', search: 'hersheys.com', industry: 'snacks', difficulty: 2 },
  { name: 'Cadbury', industry: 'snacks', difficulty: 1 },
  { name: 'Lindt', industry: 'snacks', difficulty: 2 },
  { name: 'Toblerone', industry: 'snacks', difficulty: 2 },
  { name: 'Ferrero Rocher', search: 'ferrero.com', industry: 'snacks', difficulty: 2 },
  { name: 'Nutella', industry: 'snacks', difficulty: 1 },
  { name: 'Kellogg\'s', search: 'kelloggs.com', industry: 'cereal', difficulty: 1 },
  { name: 'Cheerios', industry: 'cereal', difficulty: 2 },
  { name: 'Frosties', search: 'frostedflakes.com', industry: 'cereal', difficulty: 2 },
  { name: 'Quaker', search: 'quakeroats.com', industry: 'cereal', difficulty: 2 },
  { name: 'Dr Pepper', search: 'drpepper.com', industry: 'beverages', difficulty: 1 },
  { name: 'Mountain Dew', industry: 'beverages', difficulty: 2 },
  { name: 'Schweppes', industry: 'beverages', difficulty: 2 },
  { name: 'Sprite', industry: 'beverages', difficulty: 1 },
  { name: 'Fanta', industry: 'beverages', difficulty: 1 },
  { name: '7Up', search: '7up.com', industry: 'beverages', difficulty: 2 },
  { name: 'Lipton', industry: 'beverages', difficulty: 1 },
  { name: 'Nescafé', search: 'nescafe.com', industry: 'beverages', difficulty: 1 },
  { name: 'Nespresso', industry: 'beverages', difficulty: 1 },
  { name: 'Monster Energy', search: 'monsterenergy.com', industry: 'beverages', difficulty: 1 },
  { name: 'Gatorade', industry: 'beverages', difficulty: 1 },
  { name: 'Carlsberg', industry: 'beer', difficulty: 2 },
  { name: 'Budweiser', industry: 'beer', difficulty: 1 },
  { name: 'Stella Artois', search: 'stellaartois.com', industry: 'beer', difficulty: 2 },
  { name: 'Guinness', industry: 'beer', difficulty: 1 },
  { name: 'Corona', search: 'coronaextra.com', industry: 'beer', difficulty: 1 },

  // ===== Fashion / Apparel =====
  { name: 'H&M', search: 'hm.com', industry: 'fashion-fast', difficulty: 1 },
  { name: 'Uniqlo', industry: 'fashion-fast', difficulty: 1 },
  { name: 'GAP', search: 'gap.com', industry: 'fashion-fast', difficulty: 2 },
  { name: 'Mango', search: 'mango.com', industry: 'fashion-fast', difficulty: 2 },
  { name: 'Diesel', search: 'diesel.com', industry: 'fashion', difficulty: 2 },
  { name: 'Calvin Klein', search: 'calvinklein.com', industry: 'fashion', difficulty: 1 },
  { name: 'Tommy Hilfiger', industry: 'fashion', difficulty: 2 },
  { name: 'Ralph Lauren', industry: 'fashion', difficulty: 2 },
  { name: 'Hugo Boss', search: 'hugoboss.com', industry: 'fashion', difficulty: 2 },
  { name: 'Armani', industry: 'fashion-luxury', difficulty: 2 },
  { name: 'Prada', industry: 'fashion-luxury', difficulty: 2 },
  { name: 'Louis Vuitton', search: 'louisvuitton.com', industry: 'fashion-luxury', difficulty: 1 },
  { name: 'Dolce & Gabbana', search: 'dolcegabbana.com', industry: 'fashion-luxury', difficulty: 3 },
  { name: 'Saint Laurent', search: 'ysl.com', industry: 'fashion-luxury', difficulty: 3 },
  { name: 'Balenciaga', industry: 'fashion-luxury', difficulty: 3 },
  { name: 'Fendi', industry: 'fashion-luxury', difficulty: 3 },
  { name: 'Givenchy', industry: 'fashion-luxury', difficulty: 3 },
  { name: 'Valentino', industry: 'fashion-luxury', difficulty: 3 },
  { name: 'Bottega Veneta', industry: 'fashion-luxury', difficulty: 4 },
  { name: 'Nike', industry: 'sportswear', difficulty: 1 },
  { name: 'Puma', industry: 'sportswear', difficulty: 1 },
  { name: 'Reebok', industry: 'sportswear', difficulty: 2 },
  { name: 'New Balance', industry: 'sportswear', difficulty: 2 },
  { name: 'Converse', industry: 'sportswear', difficulty: 1 },
  { name: 'Vans', industry: 'sportswear', difficulty: 1 },
  { name: 'Asics', search: 'asics.com', industry: 'sportswear', difficulty: 2 },
  { name: 'Levi\'s', search: 'levi.com', industry: 'fashion', difficulty: 1 },

  // ===== Cars =====
  { name: 'Renault', industry: 'cars', difficulty: 1 },
  { name: 'Peugeot', industry: 'cars', difficulty: 1 },
  { name: 'Opel', industry: 'cars', difficulty: 2 },
  { name: 'Fiat', industry: 'cars', difficulty: 1 },
  { name: 'Alfa Romeo', search: 'alfaromeo.com', industry: 'cars', difficulty: 2 },
  { name: 'Maserati', industry: 'cars', difficulty: 2 },
  { name: 'Rolls-Royce', search: 'rolls-roycemotorcars.com', industry: 'cars', difficulty: 2 },
  { name: 'Mini', search: 'mini.com', industry: 'cars', difficulty: 1 },
  { name: 'Jeep', industry: 'cars', difficulty: 1 },
  { name: 'Ford', industry: 'cars', difficulty: 1 },
  { name: 'Chevrolet', industry: 'cars', difficulty: 2 },
  { name: 'Cadillac', industry: 'cars', difficulty: 2 },
  { name: 'Chrysler', industry: 'cars', difficulty: 2 },
  { name: 'Dodge', industry: 'cars', difficulty: 2 },
  { name: 'Mazda', industry: 'cars', difficulty: 1 },
  { name: 'Nissan', industry: 'cars', difficulty: 1 },
  { name: 'Lexus', industry: 'cars', difficulty: 2 },
  { name: 'Infiniti', search: 'infinitiusa.com', industry: 'cars', difficulty: 3 },
  { name: 'Acura', search: 'acura.com', industry: 'cars', difficulty: 3 },
  { name: 'Hyundai', industry: 'cars', difficulty: 1 },
  { name: 'Kia', industry: 'cars', difficulty: 1 },
  { name: 'Skoda', search: 'skoda-auto.com', industry: 'cars', difficulty: 2 },
  { name: 'Seat', search: 'seat.com', industry: 'cars', difficulty: 2 },
  { name: 'Smart', search: 'smart.com', industry: 'cars', difficulty: 2 },
  { name: 'Lancia', industry: 'cars', difficulty: 3 },

  // ===== Tech / Software =====
  { name: 'Stripe', industry: 'payments', difficulty: 2 },
  { name: 'Square', search: 'squareup.com', industry: 'payments', difficulty: 2 },
  { name: 'Klarna', industry: 'payments', difficulty: 2 },
  { name: 'Revolut', industry: 'payments', difficulty: 2 },
  { name: 'N26', search: 'n26.com', industry: 'payments', difficulty: 2 },
  { name: 'Coinbase', industry: 'crypto', difficulty: 2 },
  { name: 'Binance', industry: 'crypto', difficulty: 2 },
  { name: 'Kraken', search: 'kraken.com', industry: 'crypto', difficulty: 3 },
  { name: 'Bitcoin', search: 'bitcoin.org', industry: 'crypto', difficulty: 1 },
  { name: 'Ethereum', search: 'ethereum.org', industry: 'crypto', difficulty: 2 },
  { name: 'Salesforce', industry: 'enterprise-software', difficulty: 2 },
  { name: 'SAP', search: 'sap.com', industry: 'enterprise-software', difficulty: 2 },
  { name: 'Oracle', industry: 'enterprise-software', difficulty: 2 },
  { name: 'IBM', search: 'ibm.com', industry: 'enterprise-software', difficulty: 1 },
  { name: 'Cisco', industry: 'enterprise-software', difficulty: 2 },
  { name: 'Notion', search: 'notion.so', industry: 'productivity', difficulty: 2 },
  { name: 'Asana', industry: 'productivity', difficulty: 2 },
  { name: 'Trello', industry: 'productivity', difficulty: 2 },
  { name: 'Atlassian', industry: 'productivity', difficulty: 3 },
  { name: 'Zoom', search: 'zoom.us', industry: 'productivity', difficulty: 1 },
  { name: 'Skype', search: 'skype.com', industry: 'productivity', difficulty: 1 },
  { name: 'Discord', industry: 'social', difficulty: 1 },
  { name: 'Reddit', industry: 'social', difficulty: 1 },
  { name: 'Pinterest', industry: 'social', difficulty: 1 },
  { name: 'LinkedIn', industry: 'social', difficulty: 1 },
  { name: 'Twitch', search: 'twitch.tv', industry: 'social', difficulty: 1 },
  { name: 'Snapchat', industry: 'social', difficulty: 1 },
  { name: 'Telegram', search: 'telegram.org', industry: 'social', difficulty: 1 },
  { name: 'Signal', search: 'signal.org', industry: 'social', difficulty: 2 },
  { name: 'Slack', industry: 'productivity', difficulty: 1 },
  { name: 'Adobe', industry: 'enterprise-software', difficulty: 1 },
  { name: 'Photoshop', search: 'adobe.com/products/photoshop', industry: 'design-tools', difficulty: 1 },
  { name: 'Illustrator', search: 'adobe.com/products/illustrator', industry: 'design-tools', difficulty: 2 },
  { name: 'Canva', industry: 'design-tools', difficulty: 1 },
  { name: 'Figma', industry: 'design-tools', difficulty: 2 },
  { name: 'Sketch', search: 'sketch.com', industry: 'design-tools', difficulty: 3 },
  { name: 'Spotify', industry: 'streaming', difficulty: 1 },
  { name: 'Apple Music', search: 'music.apple.com', industry: 'streaming', difficulty: 2 },
  { name: 'SoundCloud', industry: 'streaming', difficulty: 2 },
  { name: 'Tidal', search: 'tidal.com', industry: 'streaming', difficulty: 3 },

  // ===== Streaming / Media =====
  { name: 'Disney+', search: 'disneyplus.com', industry: 'streaming-video', difficulty: 1 },
  { name: 'HBO Max', search: 'hbomax.com', industry: 'streaming-video', difficulty: 1 },
  { name: 'Prime Video', search: 'primevideo.com', industry: 'streaming-video', difficulty: 1 },
  { name: 'Hulu', search: 'hulu.com', industry: 'streaming-video', difficulty: 2 },
  { name: 'Paramount+', search: 'paramountplus.com', industry: 'streaming-video', difficulty: 2 },
  { name: 'Peacock', search: 'peacocktv.com', industry: 'streaming-video', difficulty: 3 },
  { name: 'Apple TV+', search: 'tv.apple.com', industry: 'streaming-video', difficulty: 2 },
  { name: 'Canal+', search: 'canalplus.com', industry: 'streaming-video', difficulty: 1 },

  // ===== Retail =====
  { name: 'Carrefour', industry: 'retail', difficulty: 1 },
  { name: 'Auchan', industry: 'retail', difficulty: 1 },
  { name: 'Lidl', industry: 'retail', difficulty: 1 },
  { name: 'Aldi', industry: 'retail', difficulty: 2 },
  { name: 'Costco', industry: 'retail', difficulty: 1 },
  { name: 'Walmart', industry: 'retail', difficulty: 1 },
  { name: 'Target', industry: 'retail', difficulty: 1 },
  { name: 'Best Buy', search: 'bestbuy.com', industry: 'retail', difficulty: 2 },
  { name: 'Home Depot', search: 'homedepot.com', industry: 'retail', difficulty: 2 },
  { name: 'Tesco', industry: 'retail', difficulty: 2 },
  { name: 'Decathlon', industry: 'retail', difficulty: 1 },
  { name: 'FNAC', search: 'fnac.com', industry: 'retail', difficulty: 1 },
  { name: 'Boulanger', search: 'boulanger.com', industry: 'retail', difficulty: 2 },
  { name: 'Darty', industry: 'retail', difficulty: 2 },

  // ===== Watches & Jewelry =====
  { name: 'Rolex', industry: 'watches', difficulty: 1 },
  { name: 'Omega', search: 'omegawatches.com', industry: 'watches', difficulty: 1 },
  { name: 'TAG Heuer', search: 'tagheuer.com', industry: 'watches', difficulty: 2 },
  { name: 'Patek Philippe', search: 'patek.com', industry: 'watches', difficulty: 3 },
  { name: 'Audemars Piguet', search: 'audemarspiguet.com', industry: 'watches', difficulty: 3 },
  { name: 'Breitling', industry: 'watches', difficulty: 3 },
  { name: 'Swatch', search: 'swatch.com', industry: 'watches', difficulty: 1 },
  { name: 'Bvlgari', search: 'bulgari.com', industry: 'watches', difficulty: 2 },
  { name: 'Pandora', search: 'pandora.net', industry: 'jewelry', difficulty: 2 },

  // ===== Gaming =====
  { name: 'PlayStation', search: 'playstation.com', industry: 'gaming', difficulty: 1 },
  { name: 'Nintendo', industry: 'gaming', difficulty: 1 },
  { name: 'Steam', search: 'store.steampowered.com', industry: 'gaming', difficulty: 1 },
  { name: 'Ubisoft', industry: 'gaming', difficulty: 1 },
  { name: 'Activision', industry: 'gaming', difficulty: 2 },
  { name: 'Blizzard', search: 'blizzard.com', industry: 'gaming', difficulty: 2 },
  { name: 'Square Enix', search: 'square-enix.com', industry: 'gaming', difficulty: 2 },
  { name: 'Bandai Namco', search: 'bandainamcoent.com', industry: 'gaming', difficulty: 3 },
  { name: 'Konami', industry: 'gaming', difficulty: 2 },
  { name: 'Capcom', industry: 'gaming', difficulty: 2 },
  { name: 'Sega', search: 'sega.com', industry: 'gaming', difficulty: 1 },
  { name: 'Riot Games', search: 'riotgames.com', industry: 'gaming', difficulty: 2 },
  { name: 'Roblox', industry: 'gaming', difficulty: 1 },
  { name: 'Minecraft', industry: 'gaming', difficulty: 1 },
  { name: 'Fortnite', industry: 'gaming', difficulty: 1 },

  // ===== Hardware / Electronics =====
  { name: 'Dell', search: 'dell.com', industry: 'hardware', difficulty: 1 },
  { name: 'HP', search: 'hp.com', industry: 'hardware', difficulty: 1 },
  { name: 'Lenovo', industry: 'hardware', difficulty: 2 },
  { name: 'ASUS', search: 'asus.com', industry: 'hardware', difficulty: 2 },
  { name: 'Acer', industry: 'hardware', difficulty: 2 },
  { name: 'NVIDIA', search: 'nvidia.com', industry: 'hardware', difficulty: 2 },
  { name: 'AMD', search: 'amd.com', industry: 'hardware', difficulty: 2 },
  { name: 'Bose', search: 'bose.com', industry: 'audio', difficulty: 2 },
  { name: 'Sennheiser', industry: 'audio', difficulty: 2 },
  { name: 'JBL', search: 'jbl.com', industry: 'audio', difficulty: 1 },
  { name: 'Beats', search: 'beatsbydre.com', industry: 'audio', difficulty: 1 },
  { name: 'GoPro', search: 'gopro.com', industry: 'electronics', difficulty: 1 },
  { name: 'Garmin', industry: 'electronics', difficulty: 2 },
  { name: 'Fitbit', industry: 'electronics', difficulty: 2 },
  { name: 'Polaroid', search: 'polaroid.com', industry: 'electronics', difficulty: 2 },
  { name: 'Canon', search: 'canon.com', industry: 'electronics', difficulty: 1 },
  { name: 'Nikon', search: 'nikon.com', industry: 'electronics', difficulty: 1 },
  { name: 'Fujifilm', industry: 'electronics', difficulty: 2 },
  { name: 'Logitech', industry: 'electronics', difficulty: 1 },
  { name: 'Razer', search: 'razer.com', industry: 'electronics', difficulty: 2 },

  // ===== Travel & Airlines =====
  { name: 'Airbnb', industry: 'travel', difficulty: 1 },
  { name: 'Booking.com', search: 'booking.com', industry: 'travel', difficulty: 1 },
  { name: 'Expedia', industry: 'travel', difficulty: 1 },
  { name: 'TripAdvisor', search: 'tripadvisor.com', industry: 'travel', difficulty: 1 },
  { name: 'Kayak', search: 'kayak.com', industry: 'travel', difficulty: 2 },
  { name: 'Skyscanner', industry: 'travel', difficulty: 2 },
  { name: 'Lufthansa', industry: 'airlines', difficulty: 1 },
  { name: 'Ryanair', industry: 'airlines', difficulty: 1 },
  { name: 'EasyJet', search: 'easyjet.com', industry: 'airlines', difficulty: 1 },
  { name: 'KLM', search: 'klm.com', industry: 'airlines', difficulty: 2 },
  { name: 'United Airlines', search: 'united.com', industry: 'airlines', difficulty: 2 },
  { name: 'Qatar Airways', search: 'qatarairways.com', industry: 'airlines', difficulty: 2 },
  { name: 'Etihad', search: 'etihad.com', industry: 'airlines', difficulty: 3 },
  { name: 'Singapore Airlines', search: 'singaporeair.com', industry: 'airlines', difficulty: 2 },

  // ===== Misc consumer =====
  { name: 'IKEA', search: 'ikea.com', industry: 'home', difficulty: 1 },
  { name: 'Tupperware', industry: 'home', difficulty: 2 },
  { name: 'Bic', search: 'bic.com', industry: 'home', difficulty: 1 },
  { name: 'Stabilo', industry: 'home', difficulty: 2 },
  { name: 'Lego', search: 'lego.com', industry: 'toys', difficulty: 1 },
  { name: 'Playmobil', industry: 'toys', difficulty: 1 },
  { name: 'Mattel', industry: 'toys', difficulty: 2 },
  { name: 'Hasbro', industry: 'toys', difficulty: 2 },
  { name: 'Hot Wheels', search: 'hotwheels.com', industry: 'toys', difficulty: 1 },
  { name: 'Barbie', search: 'barbie.com', industry: 'toys', difficulty: 1 },
];

function slugify(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function pickWrongs(target: Brand, all: Brand[]): string[] {
  // Pool: same industry first, then any
  const same = all.filter(b => b.industry === target.industry && b.name !== target.name);
  const other = all.filter(b => b.industry !== target.industry);
  const pool = same.length >= 3 ? same : same.concat(other);
  const shuffled = pool.sort(() => Math.random() - 0.5);
  const wrongs: string[] = [];
  for (const b of shuffled) {
    if (wrongs.length >= 3) break;
    if (b.name === target.name) continue;
    if (wrongs.includes(b.name)) continue;
    wrongs.push(b.name);
  }
  return wrongs;
}

async function searchBrand(brand: Brand): Promise<{ domain: string; name: string } | null> {
  const q = brand.search || brand.name;
  const r = await fetch(`https://api.logo.dev/search?q=${encodeURIComponent(q)}`, {
    headers: { Authorization: `Bearer ${LOGODEV_SK}` },
  });
  if (!r.ok) return null;
  const candidates: { name: string; domain: string }[] = (await r.json()) || [];
  if (!candidates.length) return null;

  const wantedNorm = brand.name.toLowerCase().replace(/[\s'\-_&.]+/g, '');
  const wantedSlug = slugify(brand.search || brand.name).replace(/-/g, '');

  const denied = new Set(['wikipedia.org', 'linkedin.com', 'bloomberg.com', 'pinterest.com', 'facebook.com']);
  const scored = candidates.map(c => {
    const domain = (c.domain || '').toLowerCase();
    const name = (c.name || '').toLowerCase();
    if (denied.has(domain)) return { c, score: -1 };
    let s = 0;
    if (name.replace(/[\s'\-_&.]+/g, '') === wantedNorm) s += 100;
    if (domain.split('.')[0] === wantedSlug) s += 60;
    if (domain.split('.')[0].includes(wantedSlug)) s += 30;
    if (domain.endsWith('.com')) s += 5;
    return { c, score: s };
  }).sort((a, b) => b.score - a.score);
  if (scored[0].score <= 0) return null;
  return scored[0].c;
}

async function fetchLogo(domain: string): Promise<Buffer | null> {
  const url = `https://img.logo.dev/${domain}?token=${LOGODEV_PK}&format=png&size=512&retina=true`;
  const r = await fetch(url);
  if (!r.ok) return null;
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length < 1000) return null;
  return buf;
}

async function uploadLogo(slug: string, buf: Buffer): Promise<string | null> {
  const path = `${PREFIX}/${slug}.png`;
  const { error } = await sb.storage.from(BUCKET).upload(path, buf, { contentType: 'image/png', upsert: true });
  if (error) {
    console.error('  upload err:', error.message);
    return null;
  }
  return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

// Pre-fetched sets for fast in-memory lookup (populated by preloadIndexes)
const STORAGE_SLUGS = new Set<string>();
const COVERED_BRANDS = new Set<string>();

async function preloadIndexes() {
  // 1. List all files in logos/ (paginate)
  let from = 0;
  while (true) {
    const { data } = await sb.storage.from(BUCKET).list(PREFIX, { limit: 1000, offset: from });
    if (!data || data.length === 0) break;
    data.forEach((f: any) => {
      if (f.name.endsWith('.png')) STORAGE_SLUGS.add(f.name.replace(/\.png$/, ''));
    });
    if (data.length < 1000) break;
    from += 1000;
  }
  // 2. All active logo questions with image_url not null → brand names already covered
  let pageFrom = 0;
  while (true) {
    const { data } = await sb.from('questions')
      .select('correct_answer')
      .eq('category', 'logo')
      .eq('is_active', true)
      .not('image_url', 'is', null)
      .range(pageFrom, pageFrom + 999);
    if (!data || data.length === 0) break;
    data.forEach((q: any) => COVERED_BRANDS.add(q.correct_answer));
    if (data.length < 1000) break;
    pageFrom += 1000;
  }
  console.log(`Pre-loaded ${STORAGE_SLUGS.size} bucket slugs, ${COVERED_BRANDS.size} covered brands`);
}

function logoExistsInMemory(slug: string): string | null {
  if (STORAGE_SLUGS.has(slug)) {
    return sb.storage.from(BUCKET).getPublicUrl(`${PREFIX}/${slug}.png`).data.publicUrl;
  }
  return null;
}

function brandAlreadyCovered(brand: string): boolean {
  return COVERED_BRANDS.has(brand);
}

async function insertPair(brand: Brand, imageUrl: string, wrongs: string[]) {
  const minAge = brand.difficulty <= 2 ? 6 : brand.difficulty <= 3 ? 12 : 14;
  const rows = [
    {
      language: 'fr',
      category: 'logo',
      difficulty: brand.difficulty,
      min_age: minAge,
      is_active: true,
      question_text: 'Quelle marque est représentée par ce logo ?',
      correct_answer: brand.name,
      wrong_answers: wrongs,
      explanation: null,
      image_url: imageUrl,
      image_credit: 'logo.dev',
    },
    {
      language: 'en',
      category: 'logo',
      difficulty: brand.difficulty,
      min_age: minAge,
      is_active: true,
      question_text: 'Which brand is represented by this logo?',
      correct_answer: brand.name,
      wrong_answers: wrongs,
      explanation: null,
      image_url: imageUrl,
      image_credit: 'logo.dev',
    },
  ];
  if (DRY) {
    console.log(`  [DRY] would insert FR + EN questions for ${brand.name}`);
    return;
  }
  const { error } = await sb.from('questions').insert(rows as any);
  if (error) console.error(`  insert err for ${brand.name}: ${error.message}`);
}

async function processBrand(brand: Brand, allBrands: Brand[]): Promise<'inserted' | 'skipped' | 'failed'> {
  const slug = slugify(brand.name);

  if (brandAlreadyCovered(brand.name)) {
    return 'skipped';
  }

  let imageUrl = logoExistsInMemory(slug);
  if (!imageUrl) {
    const cand = await searchBrand(brand);
    if (!cand) {
      console.log(`[${brand.name}] ✗ no candidate`);
      return 'failed';
    }
    const buf = await fetchLogo(cand.domain);
    if (!buf) {
      console.log(`[${brand.name}] ✗ download failed (${cand.domain})`);
      return 'failed';
    }
    if (DRY) {
      console.log(`[${brand.name}] [DRY] would upload + insert ${cand.domain}`);
      return 'inserted';
    }
    imageUrl = await uploadLogo(slug, buf);
    if (!imageUrl) {
      console.log(`[${brand.name}] ✗ upload failed`);
      return 'failed';
    }
    STORAGE_SLUGS.add(slug);
    console.log(`[${brand.name}] uploaded via ${cand.domain} → ${slug}.png`);
  }

  const wrongs = pickWrongs(brand, allBrands);
  if (wrongs.length !== 3) {
    console.log(`[${brand.name}] ✗ couldn't build 3 wrong answers`);
    return 'failed';
  }
  await insertPair(brand, imageUrl, wrongs);
  COVERED_BRANDS.add(brand.name);
  return 'inserted';
}

async function main() {
  console.log(`[add_logo_questions] dry=${DRY} brands=${BRANDS.length}`);
  await preloadIndexes();

  let processed = 0, skipped = 0, failed = 0, inserted = 0;

  // Run brands in chunks of 5 in parallel for speed
  const CONCURRENCY = 5;
  for (let i = 0; i < BRANDS.length; i += CONCURRENCY) {
    const chunk = BRANDS.slice(i, i + CONCURRENCY);
    const results = await Promise.all(chunk.map(b => processBrand(b, BRANDS)));
    results.forEach(r => {
      processed++;
      if (r === 'inserted') inserted++;
      else if (r === 'skipped') skipped++;
      else failed++;
    });
    process.stdout.write(`\r progress ${processed}/${BRANDS.length} (inserted=${inserted}, skipped=${skipped}, failed=${failed})\n`);
  }

  console.log(`\nDONE — processed: ${processed}, inserted: ${inserted} brands (×2 = ${inserted * 2} questions), skipped: ${skipped}, failed: ${failed}`);
}

main().catch(e => { console.error(e); process.exit(1); });
