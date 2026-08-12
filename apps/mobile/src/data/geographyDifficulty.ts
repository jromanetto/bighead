/**
 * Difficulty tiers for the Geography section. mledoze has no population, and
 * area is a poor notoriety proxy (Russia huge, Vatican tiny-but-famous), so the
 * "how well-known" tiers are curated by hand.
 *   tier 1 = well-known worldwide, tier 2 = moderately known, tier 3 = the rest.
 */
import { Country } from "./geography";

export type GeoDifficulty = "easy" | "medium" | "hard";

// Globally famous countries.
const EASY_CODES = new Set([
  // Europe
  "fr", "de", "es", "it", "gb", "pt", "nl", "be", "ch", "se", "no", "gr", "pl", "at", "ie", "ru", "ua",
  // Africa
  "eg", "ma", "ng", "za", "ke", "dz", "tn", "sn",
  // Asia
  "cn", "jp", "in", "kr", "th", "vn", "id", "tr", "sa", "ir", "ph", "il", "ae",
  // Americas
  "us", "ca", "mx", "br", "ar", "cl", "pe", "co", "cu",
  // Oceania
  "au", "nz",
]);

// Moderately known.
const MEDIUM_CODES = new Set([
  // Europe
  "fi", "dk", "cz", "hu", "ro", "rs", "hr", "bg", "sk", "si", "is", "lu", "al", "ba", "mk", "lt", "lv", "ee", "by", "md", "cy",
  // Africa
  "gh", "ci", "cm", "et", "ao", "mz", "zw", "zm", "tz", "ug", "ml", "bf", "ne", "td", "sd", "ly", "mr", "rw", "mg", "na", "bw", "so",
  // Asia
  "pk", "bd", "lk", "np", "mm", "kh", "la", "mn", "kz", "uz", "iq", "sy", "jo", "lb", "ye", "om", "qa", "kw", "bh", "af", "az", "ge", "am", "sg", "my", "bn",
  // Americas
  "uy", "ec", "ve", "py", "bo", "gt", "hn", "sv", "ni", "cr", "pa", "do", "jm", "ht", "tt",
  // Oceania
  "fj", "pg", "ws", "to",
]);

export function countryTier(code: string): 1 | 2 | 3 {
  if (EASY_CODES.has(code)) return 1;
  if (MEDIUM_CODES.has(code)) return 2;
  return 3;
}

/**
 * Filter a country pool by difficulty. `easy` = tier 1 only, `medium` = tiers
 * 1-2, `hard` = everything. Falls back to the full pool when the filtered set
 * is too small to build a decent quiz (e.g. easy + Oceania).
 */
export function filterByDifficulty(
  countries: Country[],
  difficulty: GeoDifficulty,
  minPool = 10,
): Country[] {
  const maxTier = difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3;
  const filtered = countries.filter((c) => countryTier(c.code) <= maxTier);
  return filtered.length >= Math.min(minPool, countries.length) ? filtered : countries;
}
