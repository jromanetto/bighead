/**
 * Seed 900 quiz questions with images to test Supabase Storage robustness.
 *
 * - 300 geography questions per language (flags + capitals) = 600
 * - 150 brand logo questions per language = 300
 * - Total: 900 questions
 *
 * Usage:
 *   cd scripts/instagram-pipeline && npx tsx src/seed-image-questions.ts
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

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
// DATA: BRANDS
// [domain, name, industryEn, industryFr]
// ============================================================
type Brand = [string, string, string, string];

const BRANDS: Brand[] = [
  // Tech
  ["apple.com", "Apple", "Technology", "Technologie"],
  ["google.com", "Google", "Technology", "Technologie"],
  ["microsoft.com", "Microsoft", "Technology", "Technologie"],
  ["amazon.com", "Amazon", "E-commerce", "E-commerce"],
  ["meta.com", "Meta", "Technology", "Technologie"],
  ["netflix.com", "Netflix", "Entertainment", "Divertissement"],
  ["tesla.com", "Tesla", "Automotive", "Automobile"],
  ["samsung.com", "Samsung", "Technology", "Technologie"],
  ["sony.com", "Sony", "Technology", "Technologie"],
  ["intel.com", "Intel", "Technology", "Technologie"],
  ["ibm.com", "IBM", "Technology", "Technologie"],
  ["oracle.com", "Oracle", "Technology", "Technologie"],
  ["adobe.com", "Adobe", "Technology", "Technologie"],
  ["spotify.com", "Spotify", "Music", "Musique"],
  ["uber.com", "Uber", "Transport", "Transport"],
  ["airbnb.com", "Airbnb", "Travel", "Voyage"],
  ["x.com", "X (Twitter)", "Social Media", "Réseaux sociaux"],
  ["tiktok.com", "TikTok", "Social Media", "Réseaux sociaux"],
  ["linkedin.com", "LinkedIn", "Social Media", "Réseaux sociaux"],
  ["paypal.com", "PayPal", "Finance", "Finance"],
  ["salesforce.com", "Salesforce", "Technology", "Technologie"],
  ["cisco.com", "Cisco", "Technology", "Technologie"],
  ["hp.com", "HP", "Technology", "Technologie"],
  ["dell.com", "Dell", "Technology", "Technologie"],
  ["nvidia.com", "NVIDIA", "Technology", "Technologie"],
  ["snap.com", "Snapchat", "Social Media", "Réseaux sociaux"],
  ["pinterest.com", "Pinterest", "Social Media", "Réseaux sociaux"],
  ["reddit.com", "Reddit", "Social Media", "Réseaux sociaux"],
  ["zoom.us", "Zoom", "Technology", "Technologie"],
  ["slack.com", "Slack", "Technology", "Technologie"],
  ["dropbox.com", "Dropbox", "Technology", "Technologie"],
  ["shopify.com", "Shopify", "E-commerce", "E-commerce"],
  ["stripe.com", "Stripe", "Finance", "Finance"],
  ["twitch.tv", "Twitch", "Entertainment", "Divertissement"],
  // Auto
  ["bmw.com", "BMW", "Automotive", "Automobile"],
  ["mercedes-benz.com", "Mercedes-Benz", "Automotive", "Automobile"],
  ["toyota.com", "Toyota", "Automotive", "Automobile"],
  ["honda.com", "Honda", "Automotive", "Automobile"],
  ["ford.com", "Ford", "Automotive", "Automobile"],
  ["audi.com", "Audi", "Automotive", "Automobile"],
  ["volkswagen.com", "Volkswagen", "Automotive", "Automobile"],
  ["porsche.com", "Porsche", "Automotive", "Automobile"],
  ["ferrari.com", "Ferrari", "Automotive", "Automobile"],
  ["nissan.com", "Nissan", "Automotive", "Automobile"],
  ["hyundai.com", "Hyundai", "Automotive", "Automobile"],
  ["kia.com", "Kia", "Automotive", "Automobile"],
  ["volvo.com", "Volvo", "Automotive", "Automobile"],
  ["mazda.com", "Mazda", "Automotive", "Automobile"],
  ["renault.com", "Renault", "Automotive", "Automobile"],
  ["peugeot.com", "Peugeot", "Automotive", "Automobile"],
  ["lamborghini.com", "Lamborghini", "Automotive", "Automobile"],
  // Fashion & Sport
  ["nike.com", "Nike", "Sportswear", "Sportswear"],
  ["adidas.com", "Adidas", "Sportswear", "Sportswear"],
  ["puma.com", "Puma", "Sportswear", "Sportswear"],
  ["zara.com", "Zara", "Fashion", "Mode"],
  ["hm.com", "H&M", "Fashion", "Mode"],
  ["gucci.com", "Gucci", "Fashion", "Mode"],
  ["louisvuitton.com", "Louis Vuitton", "Fashion", "Mode"],
  ["chanel.com", "Chanel", "Fashion", "Mode"],
  ["dior.com", "Dior", "Fashion", "Mode"],
  ["versace.com", "Versace", "Fashion", "Mode"],
  ["burberry.com", "Burberry", "Fashion", "Mode"],
  ["hermes.com", "Hermès", "Fashion", "Mode"],
  ["ralphlauren.com", "Ralph Lauren", "Fashion", "Mode"],
  ["levi.com", "Levi's", "Fashion", "Mode"],
  ["underarmour.com", "Under Armour", "Sportswear", "Sportswear"],
  ["newbalance.com", "New Balance", "Sportswear", "Sportswear"],
  ["lacoste.com", "Lacoste", "Fashion", "Mode"],
  ["rolex.com", "Rolex", "Luxury", "Luxe"],
  ["cartier.com", "Cartier", "Luxury", "Luxe"],
  ["tiffany.com", "Tiffany & Co.", "Luxury", "Luxe"],
  // Food & Drink
  ["mcdonalds.com", "McDonald's", "Fast Food", "Restauration rapide"],
  ["coca-cola.com", "Coca-Cola", "Beverages", "Boissons"],
  ["pepsi.com", "Pepsi", "Beverages", "Boissons"],
  ["starbucks.com", "Starbucks", "Coffee", "Café"],
  ["kfc.com", "KFC", "Fast Food", "Restauration rapide"],
  ["burgerking.com", "Burger King", "Fast Food", "Restauration rapide"],
  ["subway.com", "Subway", "Fast Food", "Restauration rapide"],
  ["dominos.com", "Domino's", "Fast Food", "Restauration rapide"],
  ["pizzahut.com", "Pizza Hut", "Fast Food", "Restauration rapide"],
  ["redbull.com", "Red Bull", "Beverages", "Boissons"],
  ["heineken.com", "Heineken", "Beverages", "Boissons"],
  ["nestle.com", "Nestlé", "Food", "Alimentation"],
  ["danone.com", "Danone", "Food", "Alimentation"],
  ["nutella.com", "Nutella", "Food", "Alimentation"],
  ["oreo.com", "Oreo", "Food", "Alimentation"],
  ["lays.com", "Lay's", "Food", "Alimentation"],
  // Retail & Consumer
  ["ikea.com", "IKEA", "Retail", "Commerce"],
  ["lego.com", "LEGO", "Toys", "Jouets"],
  ["walmart.com", "Walmart", "Retail", "Commerce"],
  ["ebay.com", "eBay", "E-commerce", "E-commerce"],
  ["alibaba.com", "Alibaba", "E-commerce", "E-commerce"],
  ["sephora.com", "Sephora", "Beauty", "Beauté"],
  ["loreal.com", "L'Oréal", "Beauty", "Beauté"],
  ["gillette.com", "Gillette", "Personal Care", "Hygiène"],
  ["dove.com", "Dove", "Personal Care", "Hygiène"],
  ["colgate.com", "Colgate", "Personal Care", "Hygiène"],
  // Entertainment
  ["disney.com", "Disney", "Entertainment", "Divertissement"],
  ["warnerbros.com", "Warner Bros.", "Entertainment", "Divertissement"],
  ["paramount.com", "Paramount", "Entertainment", "Divertissement"],
  ["ea.com", "EA", "Video Games", "Jeux vidéo"],
  ["epicgames.com", "Epic Games", "Video Games", "Jeux vidéo"],
  ["nintendo.com", "Nintendo", "Video Games", "Jeux vidéo"],
  ["playstation.com", "PlayStation", "Video Games", "Jeux vidéo"],
  ["xbox.com", "Xbox", "Video Games", "Jeux vidéo"],
  ["youtube.com", "YouTube", "Entertainment", "Divertissement"],
  // Airlines
  ["emirates.com", "Emirates", "Airlines", "Compagnies aériennes"],
  ["qatarairways.com", "Qatar Airways", "Airlines", "Compagnies aériennes"],
  ["britishairways.com", "British Airways", "Airlines", "Compagnies aériennes"],
  ["lufthansa.com", "Lufthansa", "Airlines", "Compagnies aériennes"],
  ["airfrance.com", "Air France", "Airlines", "Compagnies aériennes"],
  ["delta.com", "Delta", "Airlines", "Compagnies aériennes"],
  ["singaporeair.com", "Singapore Airlines", "Airlines", "Compagnies aériennes"],
  // Finance
  ["visa.com", "Visa", "Finance", "Finance"],
  ["mastercard.com", "Mastercard", "Finance", "Finance"],
  ["americanexpress.com", "American Express", "Finance", "Finance"],
  ["hsbc.com", "HSBC", "Finance", "Finance"],
  ["goldmansachs.com", "Goldman Sachs", "Finance", "Finance"],
  ["jpmorgan.com", "JPMorgan", "Finance", "Finance"],
  ["bnpparibas.com", "BNP Paribas", "Finance", "Finance"],
];

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

const continentsFr: Record<string, string> = {
  Europe: "Europe",
  Asia: "Asie",
  Africa: "Afrique",
  Americas: "Amériques",
  Oceania: "Océanie",
};

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
  image_key: string; // storage path (for dedup)
  image_source: string; // external URL to download
  image_credit: string | null;
}

function flagQuestion(c: Country, lang: "en" | "fr"): QuestionData {
  const [code, nameEn, nameFr, , , continent] = c;
  const name = lang === "en" ? nameEn : nameFr;
  const allNames = COUNTRIES.map((x) => (lang === "en" ? x[1] : x[2]));
  const sameContinent = COUNTRIES.filter((x) => x[5] === continent).map((x) =>
    lang === "en" ? x[1] : x[2]
  );
  // Prefer wrong answers from same continent (harder)
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
  const [code, nameEn, nameFr, capEn, capFr, continent] = c;
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
  const [domain, name, indEn, indFr] = b;
  const allNames = BRANDS.map((x) => x[1]);
  const wrongs = pickRandom(allNames, 3, name);

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
    image_key: `logos/${domain.replace(/\./g, "_")}.png`,
    image_source: `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
    image_credit: "clearbit.com",
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
    // Throttle wikimedia
    if (sourceUrl.includes("wikimedia.org")) {
      await new Promise((r) => setTimeout(r, 3000));
    }

    const res = await fetch(sourceUrl, {
      headers: { "User-Agent": "BigHeadQuizApp/1.0" },
      redirect: "follow",
    });

    if (!res.ok) {
      console.log(`  SKIP ${key} - HTTP ${res.status}`);
      return null;
    }

    const ct = res.headers.get("content-type")?.split(";")[0] || "image/png";
    const buffer = Buffer.from(await res.arrayBuffer());

    if (buffer.length < 100) {
      console.log(`  SKIP ${key} - too small (${buffer.length}B)`);
      return null;
    }

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(key, buffer, { contentType: ct, upsert: true });

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
// MAIN
// ============================================================

async function main() {
  console.log("=== Seed image questions ===\n");
  console.log(`Countries: ${COUNTRIES.length}`);
  console.log(`Brands: ${BRANDS.length}\n`);

  // 1. Generate all questions
  const questions: QuestionData[] = [];

  // Flag questions: 150 per language (use first 150 countries)
  const flagCountries = COUNTRIES.slice(0, 150);
  for (const c of flagCountries) {
    questions.push(flagQuestion(c, "en"));
    questions.push(flagQuestion(c, "fr"));
  }

  // Capital questions: 150 per language (use first 150 countries)
  for (const c of flagCountries) {
    questions.push(capitalQuestion(c, "en"));
    questions.push(capitalQuestion(c, "fr"));
  }

  // Logo questions: 150 per language (use all brands, ~120 entries × 2 = ~240)
  // Fill remaining with extra brand question types
  for (const b of BRANDS) {
    questions.push(logoQuestion(b, "en"));
    questions.push(logoQuestion(b, "fr"));
  }

  const enCount = questions.filter((q) => q.language === "en").length;
  const frCount = questions.filter((q) => q.language === "fr").length;
  console.log(`Questions generated: ${questions.length} (${enCount} EN, ${frCount} FR)`);

  // 2. Collect unique images
  const imageKeys = new Map<string, string>(); // key -> source URL
  for (const q of questions) {
    if (!imageKeys.has(q.image_key)) {
      imageKeys.set(q.image_key, q.image_source);
    }
  }
  console.log(`Unique images to upload: ${imageKeys.size}\n`);

  // 3. Upload images
  console.log("--- Uploading images ---");
  const imageUrls = new Map<string, string>(); // key -> supabase URL
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
