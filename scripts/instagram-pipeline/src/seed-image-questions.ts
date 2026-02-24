/**
 * Seed quiz questions with images to test Supabase Storage robustness.
 *
 * - Geography: flags (flagcdn) + capital questions
 * - Logos: Simple Icons CDN (SVG icon-only, no text) → converted to PNG via sharp
 *
 * Usage:
 *   cd scripts/instagram-pipeline && npx tsx src/seed-image-questions.ts
 *
 * Options:
 *   SKIP_GEO=1    Skip geography questions
 *   SKIP_LOGOS=1   Skip logo questions
 *   CLEANUP_LOGOS=1  Only delete existing logo questions, don't seed new ones
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const BUCKET = "question-images";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// ============================================================
// DATA: COUNTRIES
// [code, nameEn, nameFr, capitalEn, capitalFr, continent]
// ============================================================
type Country = [string, string, string, string, string, string];

const COUNTRIES: Country[] = [
  // Europe
  ["fr", "France", "France", "Paris", "Paris", "Europe"],
  ["de", "Germany", "Allemagne", "Berlin", "Berlin", "Europe"],
  ["it", "Italy", "Italie", "Rome", "Rome", "Europe"],
  ["es", "Spain", "Espagne", "Madrid", "Madrid", "Europe"],
  ["gb", "United Kingdom", "Royaume-Uni", "London", "Londres", "Europe"],
  ["pt", "Portugal", "Portugal", "Lisbon", "Lisbonne", "Europe"],
  ["nl", "Netherlands", "Pays-Bas", "Amsterdam", "Amsterdam", "Europe"],
  ["be", "Belgium", "Belgique", "Brussels", "Bruxelles", "Europe"],
  ["ch", "Switzerland", "Suisse", "Bern", "Berne", "Europe"],
  ["at", "Austria", "Autriche", "Vienna", "Vienne", "Europe"],
  ["se", "Sweden", "Suède", "Stockholm", "Stockholm", "Europe"],
  ["no", "Norway", "Norvège", "Oslo", "Oslo", "Europe"],
  ["dk", "Denmark", "Danemark", "Copenhagen", "Copenhague", "Europe"],
  ["fi", "Finland", "Finlande", "Helsinki", "Helsinki", "Europe"],
  ["ie", "Ireland", "Irlande", "Dublin", "Dublin", "Europe"],
  ["gr", "Greece", "Grèce", "Athens", "Athènes", "Europe"],
  ["pl", "Poland", "Pologne", "Warsaw", "Varsovie", "Europe"],
  ["cz", "Czechia", "Tchéquie", "Prague", "Prague", "Europe"],
  ["hu", "Hungary", "Hongrie", "Budapest", "Budapest", "Europe"],
  ["ro", "Romania", "Roumanie", "Bucharest", "Bucarest", "Europe"],
  ["bg", "Bulgaria", "Bulgarie", "Sofia", "Sofia", "Europe"],
  ["hr", "Croatia", "Croatie", "Zagreb", "Zagreb", "Europe"],
  ["rs", "Serbia", "Serbie", "Belgrade", "Belgrade", "Europe"],
  ["ua", "Ukraine", "Ukraine", "Kyiv", "Kiev", "Europe"],
  ["tr", "Turkey", "Turquie", "Ankara", "Ankara", "Europe"],
  ["ru", "Russia", "Russie", "Moscow", "Moscou", "Europe"],
  ["is", "Iceland", "Islande", "Reykjavik", "Reykjavik", "Europe"],
  ["lu", "Luxembourg", "Luxembourg", "Luxembourg City", "Luxembourg-Ville", "Europe"],
  ["mt", "Malta", "Malte", "Valletta", "La Valette", "Europe"],
  ["cy", "Cyprus", "Chypre", "Nicosia", "Nicosie", "Europe"],
  ["si", "Slovenia", "Slovénie", "Ljubljana", "Ljubljana", "Europe"],
  ["sk", "Slovakia", "Slovaquie", "Bratislava", "Bratislava", "Europe"],
  ["ee", "Estonia", "Estonie", "Tallinn", "Tallinn", "Europe"],
  ["lv", "Latvia", "Lettonie", "Riga", "Riga", "Europe"],
  ["lt", "Lithuania", "Lituanie", "Vilnius", "Vilnius", "Europe"],
  ["al", "Albania", "Albanie", "Tirana", "Tirana", "Europe"],
  ["mk", "North Macedonia", "Macédoine du Nord", "Skopje", "Skopje", "Europe"],
  ["me", "Montenegro", "Monténégro", "Podgorica", "Podgorica", "Europe"],
  ["ba", "Bosnia and Herzegovina", "Bosnie-Herzégovine", "Sarajevo", "Sarajevo", "Europe"],
  ["md", "Moldova", "Moldavie", "Chisinau", "Chișinău", "Europe"],
  ["mc", "Monaco", "Monaco", "Monaco", "Monaco", "Europe"],
  ["ad", "Andorra", "Andorre", "Andorra la Vella", "Andorre-la-Vieille", "Europe"],
  ["ge", "Georgia", "Géorgie", "Tbilisi", "Tbilissi", "Europe"],
  // Asia
  ["cn", "China", "Chine", "Beijing", "Pékin", "Asia"],
  ["jp", "Japan", "Japon", "Tokyo", "Tokyo", "Asia"],
  ["kr", "South Korea", "Corée du Sud", "Seoul", "Séoul", "Asia"],
  ["in", "India", "Inde", "New Delhi", "New Delhi", "Asia"],
  ["th", "Thailand", "Thaïlande", "Bangkok", "Bangkok", "Asia"],
  ["vn", "Vietnam", "Viêt Nam", "Hanoi", "Hanoï", "Asia"],
  ["id", "Indonesia", "Indonésie", "Jakarta", "Jakarta", "Asia"],
  ["ph", "Philippines", "Philippines", "Manila", "Manille", "Asia"],
  ["my", "Malaysia", "Malaisie", "Kuala Lumpur", "Kuala Lumpur", "Asia"],
  ["sg", "Singapore", "Singapour", "Singapore", "Singapour", "Asia"],
  ["pk", "Pakistan", "Pakistan", "Islamabad", "Islamabad", "Asia"],
  ["bd", "Bangladesh", "Bangladesh", "Dhaka", "Dacca", "Asia"],
  ["lk", "Sri Lanka", "Sri Lanka", "Colombo", "Colombo", "Asia"],
  ["np", "Nepal", "Népal", "Kathmandu", "Katmandou", "Asia"],
  ["kh", "Cambodia", "Cambodge", "Phnom Penh", "Phnom Penh", "Asia"],
  ["mn", "Mongolia", "Mongolie", "Ulaanbaatar", "Oulan-Bator", "Asia"],
  ["ir", "Iran", "Iran", "Tehran", "Téhéran", "Asia"],
  ["iq", "Iraq", "Irak", "Baghdad", "Bagdad", "Asia"],
  ["sa", "Saudi Arabia", "Arabie saoudite", "Riyadh", "Riyad", "Asia"],
  ["ae", "United Arab Emirates", "Émirats arabes unis", "Abu Dhabi", "Abou Dabi", "Asia"],
  ["qa", "Qatar", "Qatar", "Doha", "Doha", "Asia"],
  ["jo", "Jordan", "Jordanie", "Amman", "Amman", "Asia"],
  ["lb", "Lebanon", "Liban", "Beirut", "Beyrouth", "Asia"],
  ["il", "Israel", "Israël", "Jerusalem", "Jérusalem", "Asia"],
  ["kz", "Kazakhstan", "Kazakhstan", "Astana", "Astana", "Asia"],
  ["uz", "Uzbekistan", "Ouzbékistan", "Tashkent", "Tachkent", "Asia"],
  ["tw", "Taiwan", "Taïwan", "Taipei", "Taipei", "Asia"],
  ["am", "Armenia", "Arménie", "Yerevan", "Erevan", "Asia"],
  ["az", "Azerbaijan", "Azerbaïdjan", "Baku", "Bakou", "Asia"],
  ["bt", "Bhutan", "Bhoutan", "Thimphu", "Thimphou", "Asia"],
  ["mm", "Myanmar", "Myanmar", "Naypyidaw", "Naypyidaw", "Asia"],
  ["la", "Laos", "Laos", "Vientiane", "Vientiane", "Asia"],
  ["kw", "Kuwait", "Koweït", "Kuwait City", "Koweït", "Asia"],
  // Africa
  ["eg", "Egypt", "Égypte", "Cairo", "Le Caire", "Africa"],
  ["za", "South Africa", "Afrique du Sud", "Pretoria", "Pretoria", "Africa"],
  ["ng", "Nigeria", "Nigeria", "Abuja", "Abuja", "Africa"],
  ["ke", "Kenya", "Kenya", "Nairobi", "Nairobi", "Africa"],
  ["et", "Ethiopia", "Éthiopie", "Addis Ababa", "Addis-Abeba", "Africa"],
  ["gh", "Ghana", "Ghana", "Accra", "Accra", "Africa"],
  ["tz", "Tanzania", "Tanzanie", "Dodoma", "Dodoma", "Africa"],
  ["ma", "Morocco", "Maroc", "Rabat", "Rabat", "Africa"],
  ["dz", "Algeria", "Algérie", "Algiers", "Alger", "Africa"],
  ["tn", "Tunisia", "Tunisie", "Tunis", "Tunis", "Africa"],
  ["sn", "Senegal", "Sénégal", "Dakar", "Dakar", "Africa"],
  ["ci", "Ivory Coast", "Côte d'Ivoire", "Yamoussoukro", "Yamoussoukro", "Africa"],
  ["cm", "Cameroon", "Cameroun", "Yaoundé", "Yaoundé", "Africa"],
  ["ao", "Angola", "Angola", "Luanda", "Luanda", "Africa"],
  ["mg", "Madagascar", "Madagascar", "Antananarivo", "Antananarivo", "Africa"],
  ["zw", "Zimbabwe", "Zimbabwe", "Harare", "Harare", "Africa"],
  ["bw", "Botswana", "Botswana", "Gaborone", "Gaborone", "Africa"],
  ["na", "Namibia", "Namibie", "Windhoek", "Windhoek", "Africa"],
  ["rw", "Rwanda", "Rwanda", "Kigali", "Kigali", "Africa"],
  ["ug", "Uganda", "Ouganda", "Kampala", "Kampala", "Africa"],
  ["ml", "Mali", "Mali", "Bamako", "Bamako", "Africa"],
  ["cd", "DR Congo", "RD Congo", "Kinshasa", "Kinshasa", "Africa"],
  ["mu", "Mauritius", "Maurice", "Port Louis", "Port-Louis", "Africa"],
  ["ga", "Gabon", "Gabon", "Libreville", "Libreville", "Africa"],
  ["ly", "Libya", "Libye", "Tripoli", "Tripoli", "Africa"],
  ["sd", "Sudan", "Soudan", "Khartoum", "Khartoum", "Africa"],
  ["mz", "Mozambique", "Mozambique", "Maputo", "Maputo", "Africa"],
  ["ne", "Niger", "Niger", "Niamey", "Niamey", "Africa"],
  ["bf", "Burkina Faso", "Burkina Faso", "Ouagadougou", "Ouagadougou", "Africa"],
  ["tg", "Togo", "Togo", "Lomé", "Lomé", "Africa"],
  ["bj", "Benin", "Bénin", "Porto-Novo", "Porto-Novo", "Africa"],
  // Americas
  ["us", "United States", "États-Unis", "Washington D.C.", "Washington D.C.", "Americas"],
  ["ca", "Canada", "Canada", "Ottawa", "Ottawa", "Americas"],
  ["mx", "Mexico", "Mexique", "Mexico City", "Mexico", "Americas"],
  ["br", "Brazil", "Brésil", "Brasilia", "Brasilia", "Americas"],
  ["ar", "Argentina", "Argentine", "Buenos Aires", "Buenos Aires", "Americas"],
  ["cl", "Chile", "Chili", "Santiago", "Santiago", "Americas"],
  ["co", "Colombia", "Colombie", "Bogota", "Bogota", "Americas"],
  ["pe", "Peru", "Pérou", "Lima", "Lima", "Americas"],
  ["ve", "Venezuela", "Venezuela", "Caracas", "Caracas", "Americas"],
  ["ec", "Ecuador", "Équateur", "Quito", "Quito", "Americas"],
  ["bo", "Bolivia", "Bolivie", "Sucre", "Sucre", "Americas"],
  ["py", "Paraguay", "Paraguay", "Asunción", "Asunción", "Americas"],
  ["uy", "Uruguay", "Uruguay", "Montevideo", "Montevideo", "Americas"],
  ["cu", "Cuba", "Cuba", "Havana", "La Havane", "Americas"],
  ["jm", "Jamaica", "Jamaïque", "Kingston", "Kingston", "Americas"],
  ["ht", "Haiti", "Haïti", "Port-au-Prince", "Port-au-Prince", "Americas"],
  ["do", "Dominican Republic", "République dominicaine", "Santo Domingo", "Saint-Domingue", "Americas"],
  ["cr", "Costa Rica", "Costa Rica", "San José", "San José", "Americas"],
  ["pa", "Panama", "Panama", "Panama City", "Panama", "Americas"],
  ["gt", "Guatemala", "Guatemala", "Guatemala City", "Guatemala", "Americas"],
  ["hn", "Honduras", "Honduras", "Tegucigalpa", "Tegucigalpa", "Americas"],
  ["ni", "Nicaragua", "Nicaragua", "Managua", "Managua", "Americas"],
  ["sv", "El Salvador", "Salvador", "San Salvador", "San Salvador", "Americas"],
  ["tt", "Trinidad and Tobago", "Trinité-et-Tobago", "Port of Spain", "Port-d'Espagne", "Americas"],
  ["bs", "Bahamas", "Bahamas", "Nassau", "Nassau", "Americas"],
  // Oceania
  ["au", "Australia", "Australie", "Canberra", "Canberra", "Oceania"],
  ["nz", "New Zealand", "Nouvelle-Zélande", "Wellington", "Wellington", "Oceania"],
  ["fj", "Fiji", "Fidji", "Suva", "Suva", "Oceania"],
  ["pg", "Papua New Guinea", "Papouasie-Nouvelle-Guinée", "Port Moresby", "Port Moresby", "Oceania"],
];

// ============================================================
// DATA: BRANDS (Simple Icons)
// [slug, name, industryEn, industryFr, hexColor]
// Only brands with distinctive SYMBOL-ONLY icons (no text on icon)
// ============================================================
type Brand = [string, string, string, string, string];

const BRANDS: Brand[] = [
  // Automotive — all have distinctive symbol logos
  ["bmw", "BMW", "Automotive", "Automobile", "0066B1"],
  ["audi", "Audi", "Automotive", "Automobile", "BB0A30"],
  ["ferrari", "Ferrari", "Automotive", "Automobile", "D40000"],
  ["lamborghini", "Lamborghini", "Automotive", "Automobile", "DDB320"],
  ["porsche", "Porsche", "Automotive", "Automobile", "B12B28"],
  ["volkswagen", "Volkswagen", "Automotive", "Automobile", "151F5D"],
  ["toyota", "Toyota", "Automotive", "Automobile", "EB0A1E"],
  ["honda", "Honda", "Automotive", "Automobile", "E40521"],
  ["nissan", "Nissan", "Automotive", "Automobile", "C3002F"],
  ["mazda", "Mazda", "Automotive", "Automobile", "101010"],
  ["mitsubishi", "Mitsubishi", "Automotive", "Automobile", "E60012"],
  ["subaru", "Subaru", "Automotive", "Automobile", "013C74"],
  ["suzuki", "Suzuki", "Automotive", "Automobile", "E30613"],
  ["hyundai", "Hyundai", "Automotive", "Automobile", "002C5F"],
  ["kia", "Kia", "Automotive", "Automobile", "05141F"],
  ["renault", "Renault", "Automotive", "Automobile", "FFCC33"],
  ["peugeot", "Peugeot", "Automotive", "Automobile", "000000"],
  ["citroen", "Citroën", "Automotive", "Automobile", "AC1518"],
  ["volvo", "Volvo", "Automotive", "Automobile", "003057"],
  ["maserati", "Maserati", "Automotive", "Automobile", "0C2340"],
  ["bentley", "Bentley", "Automotive", "Automobile", "333333"],
  ["rollsroyce", "Rolls-Royce", "Automotive", "Automobile", "281432"],
  ["bugatti", "Bugatti", "Automotive", "Automobile", "BE0030"],
  ["tesla", "Tesla", "Automotive", "Automobile", "CC0000"],
  ["astonmartin", "Aston Martin", "Automotive", "Automobile", "006B38"],
  ["mclaren", "McLaren", "Automotive", "Automobile", "FF8000"],
  ["lotus", "Lotus", "Automotive", "Automobile", "1A1A1A"],
  ["pagani", "Pagani", "Automotive", "Automobile", "232323"],
  ["alfaromeo", "Alfa Romeo", "Automotive", "Automobile", "981E32"],
  // Tech — symbol-only icons
  ["apple", "Apple", "Technology", "Technologie", "000000"],
  ["android", "Android", "Technology", "Technologie", "34A853"],
  ["linux", "Linux", "Technology", "Technologie", "FCC624"],
  ["docker", "Docker", "Technology", "Technologie", "2496ED"],
  ["github", "GitHub", "Technology", "Technologie", "181717"],
  ["gitlab", "GitLab", "Technology", "Technologie", "FC6D26"],
  ["figma", "Figma", "Technology", "Technologie", "F24E1E"],
  ["steam", "Steam", "Technology", "Technologie", "000000"],
  ["playstation", "PlayStation", "Technology", "Technologie", "003791"],
  ["nintendo", "Nintendo", "Video Games", "Jeux vidéo", "E60012"],
  ["bluetooth", "Bluetooth", "Technology", "Technologie", "0082FC"],
  ["wifi", "Wi-Fi", "Technology", "Technologie", "000000"],
  ["usb", "USB", "Technology", "Technologie", "504CFF"],
  // Social & Apps — symbol-only icons
  ["instagram", "Instagram", "Social Media", "Réseaux sociaux", "E4405F"],
  ["snapchat", "Snapchat", "Social Media", "Réseaux sociaux", "FFFC00"],
  ["spotify", "Spotify", "Music", "Musique", "1DB954"],
  ["discord", "Discord", "Social Media", "Réseaux sociaux", "5865F2"],
  ["whatsapp", "WhatsApp", "Social Media", "Réseaux sociaux", "25D366"],
  ["telegram", "Telegram", "Social Media", "Réseaux sociaux", "26A5E4"],
  ["signal", "Signal", "Social Media", "Réseaux sociaux", "3A76F0"],
  ["twitch", "Twitch", "Entertainment", "Divertissement", "9146FF"],
  ["tiktok", "TikTok", "Social Media", "Réseaux sociaux", "000000"],
  ["pinterest", "Pinterest", "Social Media", "Réseaux sociaux", "BD081C"],
  ["reddit", "Reddit", "Social Media", "Réseaux sociaux", "FF4500"],
  ["tumblr", "Tumblr", "Social Media", "Réseaux sociaux", "36465D"],
  ["soundcloud", "SoundCloud", "Music", "Musique", "FF3300"],
  ["shazam", "Shazam", "Music", "Musique", "0088FF"],
  ["deezer", "Deezer", "Music", "Musique", "FEAA2D"],
  // Food & Drink — symbol-only icons
  ["mcdonalds", "McDonald's", "Fast Food", "Restauration rapide", "FBC817"],
  ["starbucks", "Starbucks", "Coffee", "Café", "006241"],
  ["burgerking", "Burger King", "Fast Food", "Restauration rapide", "D62300"],
  ["cocacola", "Coca-Cola", "Beverages", "Boissons", "F40009"],
  ["redbull", "Red Bull", "Beverages", "Boissons", "DB0A40"],
  // Sports
  ["adidas", "Adidas", "Sportswear", "Sportswear", "000000"],
  ["nike", "Nike", "Sportswear", "Sportswear", "000000"],
  ["puma", "Puma", "Sportswear", "Sportswear", "000000"],
  ["underarmour", "Under Armour", "Sportswear", "Sportswear", "1D1D1D"],
  ["newbalance", "New Balance", "Sportswear", "Sportswear", "CF0A2C"],
  // Services & Transport
  ["airbnb", "Airbnb", "Travel", "Voyage", "FF5A5F"],
  ["uber", "Uber", "Transport", "Transport", "000000"],
  ["lyft", "Lyft", "Transport", "Transport", "FF00BF"],
  // Finance
  ["mastercard", "Mastercard", "Finance", "Finance", "EB001B"],
  ["visa", "Visa", "Finance", "Finance", "1A1F71"],
  ["paypal", "PayPal", "Finance", "Finance", "003087"],
  // Retail & Consumer
  ["ikea", "IKEA", "Retail", "Commerce", "0058A3"],
  ["lego", "LEGO", "Toys", "Jouets", "D01012"],
  // Luxury
  ["rolex", "Rolex", "Luxury", "Luxe", "006039"],
  // Cloud & DevOps
  ["kubernetes", "Kubernetes", "Technology", "Technologie", "326CE5"],
  ["amazonaws", "AWS", "Technology", "Technologie", "232F3E"],
  ["googlecloud", "Google Cloud", "Technology", "Technologie", "4285F4"],
  // Entertainment
  ["netflix", "Netflix", "Entertainment", "Divertissement", "E50914"],
  ["disneyplus", "Disney+", "Entertainment", "Divertissement", "113CCF"],
  ["primevideo", "Prime Video", "Entertainment", "Divertissement", "1A98FF"],
  ["crunchyroll", "Crunchyroll", "Entertainment", "Divertissement", "F47521"],
  // OS & Browsers
  ["windows", "Windows", "Technology", "Technologie", "0078D4"],
  ["firefox", "Firefox", "Technology", "Technologie", "FF7139"],
  ["googlechrome", "Google Chrome", "Technology", "Technologie", "4285F4"],
  ["safari", "Safari", "Technology", "Technologie", "006CFF"],
  ["opera", "Opera", "Technology", "Technologie", "FF1B2D"],
  // Extra distinctive icons
  ["wordpress", "WordPress", "Technology", "Technologie", "21759B"],
  ["shopify", "Shopify", "E-commerce", "E-commerce", "7AB55C"],
  ["dropbox", "Dropbox", "Technology", "Technologie", "0061FF"],
  ["slack", "Slack", "Technology", "Technologie", "4A154B"],
  ["zoom", "Zoom", "Technology", "Technologie", "0B5CFF"],
  ["notion", "Notion", "Technology", "Technologie", "000000"],
  ["trello", "Trello", "Technology", "Technologie", "0052CC"],
  ["duolingo", "Duolingo", "Education", "Éducation", "58CC02"],
  ["microsoftteams", "Microsoft Teams", "Technology", "Technologie", "6264A7"],
  ["skype", "Skype", "Technology", "Technologie", "00AFF0"],
  ["tinder", "Tinder", "Social Media", "Réseaux sociaux", "FF6B6B"],
  ["tripadvisor", "TripAdvisor", "Travel", "Voyage", "34E0A1"],
  ["waze", "Waze", "Transport", "Transport", "33CCFF"],
  ["github", "GitHub", "Technology", "Technologie", "181717"],
  ["stackoverflow", "Stack Overflow", "Technology", "Technologie", "F58025"],
  ["openai", "OpenAI", "Technology", "Technologie", "412991"],
  ["rust", "Rust", "Technology", "Technologie", "000000"],
  ["python", "Python", "Technology", "Technologie", "3776AB"],
  ["swift", "Swift", "Technology", "Technologie", "F05138"],
  ["kotlin", "Kotlin", "Technology", "Technologie", "7F52FF"],
  ["dart", "Dart", "Technology", "Technologie", "0175C2"],
  ["flutter", "Flutter", "Technology", "Technologie", "02569B"],
  ["react", "React", "Technology", "Technologie", "61DAFB"],
  ["vuedotjs", "Vue.js", "Technology", "Technologie", "4FC08D"],
  ["angular", "Angular", "Technology", "Technologie", "0F0F11"],
  ["svelte", "Svelte", "Technology", "Technologie", "FF3E00"],
  ["nodejs", "Node.js", "Technology", "Technologie", "5FA04E"],
  ["deno", "Deno", "Technology", "Technologie", "000000"],
  ["mongodb", "MongoDB", "Technology", "Technologie", "47A248"],
  ["postgresql", "PostgreSQL", "Technology", "Technologie", "4169E1"],
  ["redis", "Redis", "Technology", "Technologie", "FF4438"],
  ["elasticsearch", "Elasticsearch", "Technology", "Technologie", "005571"],
  ["grafana", "Grafana", "Technology", "Technologie", "F46800"],
  ["prometheus", "Prometheus", "Technology", "Technologie", "E6522C"],
];

// Deduplicate brands by slug (github appears twice above)
const seenSlugs = new Set<string>();
const UNIQUE_BRANDS: Brand[] = [];
for (const b of BRANDS) {
  if (!seenSlugs.has(b[0])) {
    seenSlugs.add(b[0]);
    UNIQUE_BRANDS.push(b);
  }
}

// ============================================================
// HELPERS
// ============================================================

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom<T>(arr: T[], n: number, exclude?: T): T[] {
  const filtered = exclude !== undefined ? arr.filter((x) => x !== exclude) : arr;
  return shuffle(filtered).slice(0, n);
}

// ============================================================
// QUESTION GENERATORS
// ============================================================

interface QuestionData {
  question_text: string;
  correct_answer: string;
  wrong_answers: string[];
  category: string;
  difficulty: number;
  language: string;
  is_active: boolean;
  image_key: string;
  image_source: string;
  image_credit: string | null;
}

function flagQuestion(c: Country, lang: "en" | "fr"): QuestionData {
  const [code, nameEn, nameFr, , , continent] = c;
  const name = lang === "en" ? nameEn : nameFr;
  const allNames = COUNTRIES.map((x) => (lang === "en" ? x[1] : x[2]));
  const sameContinent = COUNTRIES.filter((x) => x[5] === continent).map((x) =>
    lang === "en" ? x[1] : x[2]
  );
  let wrongs = pickRandom(sameContinent, 3, name);
  if (wrongs.length < 3) wrongs = pickRandom(allNames, 3, name);

  return {
    question_text:
      lang === "en"
        ? "Which country does this flag belong to?"
        : "À quel pays appartient ce drapeau ?",
    correct_answer: name,
    wrong_answers: wrongs,
    category: "geography",
    difficulty: continent === "Europe" || continent === "Americas" ? 1 : 2,
    language: lang,
    is_active: true,
    image_key: `flags/${code}.png`,
    image_source: `https://flagcdn.com/w320/${code}.png`,
    image_credit: "flagcdn.com",
  };
}

function capitalQuestion(c: Country, lang: "en" | "fr"): QuestionData {
  const [code, nameEn, nameFr, capEn, capFr] = c;
  const name = lang === "en" ? nameEn : nameFr;
  const capital = lang === "en" ? capEn : capFr;
  const allCapitals = COUNTRIES.map((x) => (lang === "en" ? x[3] : x[4]));
  const wrongs = pickRandom(allCapitals, 3, capital);

  return {
    question_text:
      lang === "en"
        ? `What is the capital of ${name}?`
        : `Quelle est la capitale ${nameFr.startsWith("É") || nameFr.startsWith("A") || nameFr.startsWith("I") || nameFr.startsWith("O") || nameFr.startsWith("U") ? "de l'" + nameFr : nameFr === "France" || nameFr === "Chine" || nameFr === "Suisse" || nameFr === "Turquie" || nameFr === "Russie" || nameFr === "Moldavie" || nameFr === "Géorgie" || nameFr === "Mongolie" || nameFr === "Colombie" || nameFr === "Bolivie" || nameFr === "Jordanie" || nameFr === "Libye" || nameFr === "Tunisie" || nameFr === "Tanzanie" || nameFr === "Namibie" ? "de la " + nameFr : "du " + nameFr} ?`,
    correct_answer: capital,
    wrong_answers: wrongs,
    category: "geography",
    difficulty: 2,
    language: lang,
    is_active: true,
    image_key: `flags/${code}.png`,
    image_source: `https://flagcdn.com/w320/${code}.png`,
    image_credit: "flagcdn.com",
  };
}

function logoQuestion(b: Brand, lang: "en" | "fr"): QuestionData {
  const [slug, name, indEn, indFr, color] = b;
  const allNames = UNIQUE_BRANDS.map((x) => x[1]);
  // Prefer wrong answers from same industry
  const sameIndustry = UNIQUE_BRANDS
    .filter((x) => x[2] === indEn && x[1] !== name)
    .map((x) => x[1]);
  let wrongs = sameIndustry.length >= 3
    ? pickRandom(sameIndustry, 3)
    : pickRandom(allNames, 3, name);

  return {
    question_text:
      lang === "en"
        ? "Which brand does this logo belong to?"
        : "À quelle marque appartient ce logo ?",
    correct_answer: name,
    wrong_answers: wrongs,
    category: "culture_generale",
    difficulty: 2,
    language: lang,
    is_active: true,
    image_key: `logos/${slug}.png`,
    image_source: `https://cdn.simpleicons.org/${slug}/${color}`,
    image_credit: "simpleicons.org",
  };
}

// ============================================================
// IMAGE UPLOAD
// ============================================================

async function uploadImage(
  key: string,
  sourceUrl: string
): Promise<string | null> {
  try {
    const res = await fetch(sourceUrl, {
      headers: { "User-Agent": "BigHeadQuizApp/1.0" },
      redirect: "follow",
    });

    if (!res.ok) {
      console.log(`  SKIP ${key} - HTTP ${res.status}`);
      return null;
    }

    const contentType = res.headers.get("content-type") || "";
    let buffer: Buffer;

    // Simple Icons returns SVG — convert to PNG via sharp
    if (contentType.includes("svg") || sourceUrl.includes("simpleicons.org")) {
      const svgText = await res.text();
      if (svgText.length < 10) {
        console.log(`  SKIP ${key} - SVG too small`);
        return null;
      }
      // Render SVG to 256x256 PNG with transparent background
      buffer = await sharp(Buffer.from(svgText))
        .resize(256, 256, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer();
    } else {
      buffer = Buffer.from(await res.arrayBuffer());
    }

    if (buffer.length < 100) {
      console.log(`  SKIP ${key} - too small (${buffer.length}B)`);
      return null;
    }

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(key, buffer, { contentType: "image/png", upsert: true });

    if (error) {
      console.log(`  FAIL ${key}: ${error.message}`);
      return null;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(key);

    return publicUrl;
  } catch (err: any) {
    console.log(`  ERROR ${key}: ${err.message}`);
    return null;
  }
}

// ============================================================
// CLEANUP OLD LOGO QUESTIONS
// ============================================================

async function cleanupOldLogos() {
  console.log("--- Cleaning up old logo questions ---");

  // Delete questions with Google Favicon images or old logo credit
  const { data, error } = await supabase
    .from("questions")
    .select("id, image_url")
    .eq("category", "culture_generale")
    .or("image_credit.eq.clearbit.com,image_credit.eq.google.com/s2/favicons");

  if (error) {
    console.log(`  Query error: ${error.message}`);
    return;
  }

  if (!data || data.length === 0) {
    // Also try matching by image_url pattern
    const { data: data2, error: error2 } = await supabase
      .from("questions")
      .select("id, image_url, image_credit")
      .eq("category", "culture_generale")
      .like("question_text", "%logo%");

    if (error2 || !data2 || data2.length === 0) {
      console.log("  No old logo questions found to clean up");
      return;
    }

    // Only delete those with non-simpleicons images
    const toDelete = data2.filter(
      (q: any) => q.image_credit !== "simpleicons.org"
    );

    if (toDelete.length === 0) {
      console.log("  No old logo questions to clean up (all already simpleicons)");
      return;
    }

    const ids = toDelete.map((q: any) => q.id);
    const { error: delErr } = await supabase
      .from("questions")
      .delete()
      .in("id", ids);

    if (delErr) {
      console.log(`  Delete error: ${delErr.message}`);
    } else {
      console.log(`  Deleted ${ids.length} old logo questions`);
    }
    return;
  }

  const ids = data.map((q: any) => q.id);
  const { error: delErr } = await supabase
    .from("questions")
    .delete()
    .in("id", ids);

  if (delErr) {
    console.log(`  Delete error: ${delErr.message}`);
  } else {
    console.log(`  Deleted ${ids.length} old logo questions`);
  }
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  const SKIP_GEO = process.env.SKIP_GEO === "1";
  const SKIP_LOGOS = process.env.SKIP_LOGOS === "1";
  const CLEANUP_LOGOS = process.env.CLEANUP_LOGOS === "1";

  console.log("=== Seed image questions ===\n");
  console.log(`Countries: ${COUNTRIES.length}`);
  console.log(`Brands: ${UNIQUE_BRANDS.length} (deduplicated)\n`);

  // Cleanup old logo questions before seeding new ones
  if (!SKIP_LOGOS || CLEANUP_LOGOS) {
    await cleanupOldLogos();
    if (CLEANUP_LOGOS) {
      console.log("\nCleanup only mode — exiting");
      return;
    }
  }

  // 1. Generate all questions
  const questions: QuestionData[] = [];

  if (!SKIP_GEO) {
    const flagCountries = COUNTRIES.slice(0, 150);
    for (const c of flagCountries) {
      questions.push(flagQuestion(c, "en"));
      questions.push(flagQuestion(c, "fr"));
    }
    for (const c of flagCountries) {
      questions.push(capitalQuestion(c, "en"));
      questions.push(capitalQuestion(c, "fr"));
    }
  }

  if (!SKIP_LOGOS) {
    for (const b of UNIQUE_BRANDS) {
      questions.push(logoQuestion(b, "en"));
      questions.push(logoQuestion(b, "fr"));
    }
  }

  const enCount = questions.filter((q) => q.language === "en").length;
  const frCount = questions.filter((q) => q.language === "fr").length;
  console.log(`\nQuestions generated: ${questions.length} (${enCount} EN, ${frCount} FR)`);

  // 2. Collect unique images
  const imageKeys = new Map<string, string>();
  for (const q of questions) {
    if (!imageKeys.has(q.image_key)) {
      imageKeys.set(q.image_key, q.image_source);
    }
  }
  console.log(`Unique images to upload: ${imageKeys.size}\n`);

  // 3. Upload images
  console.log("--- Uploading images ---");
  const imageUrls = new Map<string, string>();
  let uploaded = 0;
  let failed = 0;

  for (const [key, source] of imageKeys) {
    const url = await uploadImage(key, source);
    if (url) {
      imageUrls.set(key, url);
      uploaded++;
    } else {
      failed++;
    }
    if ((uploaded + failed) % 20 === 0) {
      console.log(`  Progress: ${uploaded + failed}/${imageKeys.size} (${uploaded} OK, ${failed} failed)`);
    }
  }

  console.log(`\nImages: ${uploaded} uploaded, ${failed} failed\n`);

  // 4. Filter questions to only those with successfully uploaded images
  const validQuestions = questions.filter((q) => imageUrls.has(q.image_key));
  console.log(`Questions with valid images: ${validQuestions.length}`);

  // 5. Insert questions in batches
  console.log("\n--- Inserting questions ---");
  const BATCH_SIZE = 100;
  let inserted = 0;

  for (let i = 0; i < validQuestions.length; i += BATCH_SIZE) {
    const batch = validQuestions.slice(i, i + BATCH_SIZE).map((q) => ({
      question_text: q.question_text,
      correct_answer: q.correct_answer,
      wrong_answers: q.wrong_answers,
      category: q.category,
      difficulty: q.difficulty,
      language: q.language,
      is_active: q.is_active,
      image_url: imageUrls.get(q.image_key),
      image_credit: q.image_credit,
    }));

    const { error } = await supabase.from("questions").insert(batch);
    if (error) {
      console.log(`  FAIL batch ${i}: ${error.message}`);
    } else {
      inserted += batch.length;
      console.log(`  Inserted ${inserted}/${validQuestions.length}`);
    }
  }

  console.log(`\n=== Done ===`);
  console.log(`  Total inserted: ${inserted}`);
  console.log(`  Images uploaded: ${uploaded}`);
  console.log(`  Images failed: ${failed}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
