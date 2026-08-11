/**
 * Static geography dataset for the Geography section (MVP: flags & capitals by
 * continent). Flags are rendered from flagcdn.com images (real flags on iOS AND
 * Android — unlike emoji flags which don't render on many Android devices).
 */

export type ContinentId = "europe" | "africa" | "asia" | "americas" | "oceania";

export interface Continent {
  id: ContinentId;
  emoji: string;
  fr: string;
  en: string;
}

export const CONTINENTS: Continent[] = [
  { id: "europe", emoji: "🇪🇺", fr: "Europe", en: "Europe" },
  { id: "africa", emoji: "🌍", fr: "Afrique", en: "Africa" },
  { id: "asia", emoji: "🌏", fr: "Asie", en: "Asia" },
  { id: "americas", emoji: "🌎", fr: "Amériques", en: "Americas" },
  { id: "oceania", emoji: "🏝️", fr: "Océanie", en: "Oceania" },
];

export interface Country {
  code: string; // ISO 3166-1 alpha-2, lowercase (flagcdn)
  fr: string;
  en: string;
  capitalFr: string;
  capitalEn: string;
  continent: ContinentId;
}

export const COUNTRIES: Country[] = [
  // ---- Europe ----
  { code: "fr", fr: "France", en: "France", capitalFr: "Paris", capitalEn: "Paris", continent: "europe" },
  { code: "de", fr: "Allemagne", en: "Germany", capitalFr: "Berlin", capitalEn: "Berlin", continent: "europe" },
  { code: "es", fr: "Espagne", en: "Spain", capitalFr: "Madrid", capitalEn: "Madrid", continent: "europe" },
  { code: "it", fr: "Italie", en: "Italy", capitalFr: "Rome", capitalEn: "Rome", continent: "europe" },
  { code: "gb", fr: "Royaume-Uni", en: "United Kingdom", capitalFr: "Londres", capitalEn: "London", continent: "europe" },
  { code: "pt", fr: "Portugal", en: "Portugal", capitalFr: "Lisbonne", capitalEn: "Lisbon", continent: "europe" },
  { code: "nl", fr: "Pays-Bas", en: "Netherlands", capitalFr: "Amsterdam", capitalEn: "Amsterdam", continent: "europe" },
  { code: "be", fr: "Belgique", en: "Belgium", capitalFr: "Bruxelles", capitalEn: "Brussels", continent: "europe" },
  { code: "ch", fr: "Suisse", en: "Switzerland", capitalFr: "Berne", capitalEn: "Bern", continent: "europe" },
  { code: "se", fr: "Suède", en: "Sweden", capitalFr: "Stockholm", capitalEn: "Stockholm", continent: "europe" },
  { code: "no", fr: "Norvège", en: "Norway", capitalFr: "Oslo", capitalEn: "Oslo", continent: "europe" },
  { code: "gr", fr: "Grèce", en: "Greece", capitalFr: "Athènes", capitalEn: "Athens", continent: "europe" },
  { code: "pl", fr: "Pologne", en: "Poland", capitalFr: "Varsovie", capitalEn: "Warsaw", continent: "europe" },
  { code: "at", fr: "Autriche", en: "Austria", capitalFr: "Vienne", capitalEn: "Vienna", continent: "europe" },
  { code: "ie", fr: "Irlande", en: "Ireland", capitalFr: "Dublin", capitalEn: "Dublin", continent: "europe" },
  { code: "ru", fr: "Russie", en: "Russia", capitalFr: "Moscou", capitalEn: "Moscow", continent: "europe" },

  // ---- Africa ----
  { code: "eg", fr: "Égypte", en: "Egypt", capitalFr: "Le Caire", capitalEn: "Cairo", continent: "africa" },
  { code: "ma", fr: "Maroc", en: "Morocco", capitalFr: "Rabat", capitalEn: "Rabat", continent: "africa" },
  { code: "ng", fr: "Nigeria", en: "Nigeria", capitalFr: "Abuja", capitalEn: "Abuja", continent: "africa" },
  { code: "za", fr: "Afrique du Sud", en: "South Africa", capitalFr: "Pretoria", capitalEn: "Pretoria", continent: "africa" },
  { code: "ke", fr: "Kenya", en: "Kenya", capitalFr: "Nairobi", capitalEn: "Nairobi", continent: "africa" },
  { code: "dz", fr: "Algérie", en: "Algeria", capitalFr: "Alger", capitalEn: "Algiers", continent: "africa" },
  { code: "et", fr: "Éthiopie", en: "Ethiopia", capitalFr: "Addis-Abeba", capitalEn: "Addis Ababa", continent: "africa" },
  { code: "gh", fr: "Ghana", en: "Ghana", capitalFr: "Accra", capitalEn: "Accra", continent: "africa" },
  { code: "sn", fr: "Sénégal", en: "Senegal", capitalFr: "Dakar", capitalEn: "Dakar", continent: "africa" },
  { code: "tn", fr: "Tunisie", en: "Tunisia", capitalFr: "Tunis", capitalEn: "Tunis", continent: "africa" },
  { code: "ci", fr: "Côte d'Ivoire", en: "Ivory Coast", capitalFr: "Yamoussoukro", capitalEn: "Yamoussoukro", continent: "africa" },
  { code: "cm", fr: "Cameroun", en: "Cameroon", capitalFr: "Yaoundé", capitalEn: "Yaoundé", continent: "africa" },

  // ---- Asia ----
  { code: "cn", fr: "Chine", en: "China", capitalFr: "Pékin", capitalEn: "Beijing", continent: "asia" },
  { code: "jp", fr: "Japon", en: "Japan", capitalFr: "Tokyo", capitalEn: "Tokyo", continent: "asia" },
  { code: "in", fr: "Inde", en: "India", capitalFr: "New Delhi", capitalEn: "New Delhi", continent: "asia" },
  { code: "kr", fr: "Corée du Sud", en: "South Korea", capitalFr: "Séoul", capitalEn: "Seoul", continent: "asia" },
  { code: "th", fr: "Thaïlande", en: "Thailand", capitalFr: "Bangkok", capitalEn: "Bangkok", continent: "asia" },
  { code: "vn", fr: "Vietnam", en: "Vietnam", capitalFr: "Hanoï", capitalEn: "Hanoi", continent: "asia" },
  { code: "id", fr: "Indonésie", en: "Indonesia", capitalFr: "Jakarta", capitalEn: "Jakarta", continent: "asia" },
  { code: "tr", fr: "Turquie", en: "Turkey", capitalFr: "Ankara", capitalEn: "Ankara", continent: "asia" },
  { code: "sa", fr: "Arabie saoudite", en: "Saudi Arabia", capitalFr: "Riyad", capitalEn: "Riyadh", continent: "asia" },
  { code: "ir", fr: "Iran", en: "Iran", capitalFr: "Téhéran", capitalEn: "Tehran", continent: "asia" },
  { code: "iq", fr: "Irak", en: "Iraq", capitalFr: "Bagdad", capitalEn: "Baghdad", continent: "asia" },
  { code: "ph", fr: "Philippines", en: "Philippines", capitalFr: "Manille", capitalEn: "Manila", continent: "asia" },

  // ---- Americas ----
  { code: "us", fr: "États-Unis", en: "United States", capitalFr: "Washington", capitalEn: "Washington", continent: "americas" },
  { code: "ca", fr: "Canada", en: "Canada", capitalFr: "Ottawa", capitalEn: "Ottawa", continent: "americas" },
  { code: "mx", fr: "Mexique", en: "Mexico", capitalFr: "Mexico", capitalEn: "Mexico City", continent: "americas" },
  { code: "br", fr: "Brésil", en: "Brazil", capitalFr: "Brasília", capitalEn: "Brasília", continent: "americas" },
  { code: "ar", fr: "Argentine", en: "Argentina", capitalFr: "Buenos Aires", capitalEn: "Buenos Aires", continent: "americas" },
  { code: "cl", fr: "Chili", en: "Chile", capitalFr: "Santiago", capitalEn: "Santiago", continent: "americas" },
  { code: "pe", fr: "Pérou", en: "Peru", capitalFr: "Lima", capitalEn: "Lima", continent: "americas" },
  { code: "co", fr: "Colombie", en: "Colombia", capitalFr: "Bogota", capitalEn: "Bogotá", continent: "americas" },
  { code: "cu", fr: "Cuba", en: "Cuba", capitalFr: "La Havane", capitalEn: "Havana", continent: "americas" },
  { code: "uy", fr: "Uruguay", en: "Uruguay", capitalFr: "Montevideo", capitalEn: "Montevideo", continent: "americas" },
  { code: "ec", fr: "Équateur", en: "Ecuador", capitalFr: "Quito", capitalEn: "Quito", continent: "americas" },
  { code: "ve", fr: "Venezuela", en: "Venezuela", capitalFr: "Caracas", capitalEn: "Caracas", continent: "americas" },

  // ---- Oceania ----
  { code: "au", fr: "Australie", en: "Australia", capitalFr: "Canberra", capitalEn: "Canberra", continent: "oceania" },
  { code: "nz", fr: "Nouvelle-Zélande", en: "New Zealand", capitalFr: "Wellington", capitalEn: "Wellington", continent: "oceania" },
  { code: "fj", fr: "Fidji", en: "Fiji", capitalFr: "Suva", capitalEn: "Suva", continent: "oceania" },
  { code: "pg", fr: "Papouasie-Nouvelle-Guinée", en: "Papua New Guinea", capitalFr: "Port Moresby", capitalEn: "Port Moresby", continent: "oceania" },
  { code: "ws", fr: "Samoa", en: "Samoa", capitalFr: "Apia", capitalEn: "Apia", continent: "oceania" },
  { code: "to", fr: "Tonga", en: "Tonga", capitalFr: "Nuku'alofa", capitalEn: "Nuku'alofa", continent: "oceania" },
  { code: "vu", fr: "Vanuatu", en: "Vanuatu", capitalFr: "Port-Vila", capitalEn: "Port Vila", continent: "oceania" },
  { code: "sb", fr: "Îles Salomon", en: "Solomon Islands", capitalFr: "Honiara", capitalEn: "Honiara", continent: "oceania" },
  { code: "pw", fr: "Palaos", en: "Palau", capitalFr: "Ngerulmud", capitalEn: "Ngerulmud", continent: "oceania" },
  { code: "ki", fr: "Kiribati", en: "Kiribati", capitalFr: "Tarawa-Sud", capitalEn: "South Tarawa", continent: "oceania" },
];

export const flagUrl = (code: string): string => `https://flagcdn.com/w320/${code}.png`;

export const countriesByContinent = (id: ContinentId): Country[] =>
  COUNTRIES.filter((c) => c.continent === id);

export const countryName = (c: Country, lang: "fr" | "en"): string =>
  lang === "fr" ? c.fr : c.en;

export const capitalName = (c: Country, lang: "fr" | "en"): string =>
  lang === "fr" ? c.capitalFr : c.capitalEn;
