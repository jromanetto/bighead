/**
 * Pure, testable quiz builders for the Geography section.
 * `flags`    → show a flag, pick the country name.
 * `capitals` → show a country name, pick its capital.
 * Distractors are drawn from the same continent pool (plausible, not random junk).
 */
import {
  Country,
  countryName,
  capitalName,
} from "../data/geography";

export type GeoMode = "flags" | "capitals";
export type Lang = "fr" | "en";

export interface GeoQuestion {
  id: string;
  mode: GeoMode;
  flagCode?: string; // flags mode: the flag to display
  promptText?: string; // capitals mode: the country name shown
  answers: string[]; // options (correct + distractors), already shuffled
  correctIndex: number;
}

const OPTIONS_PER_QUESTION = 4;

/** Fisher-Yates shuffle with an injectable RNG (default Math.random). */
export function shuffle<T>(arr: T[], rng: () => number = Math.random): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Pick up to `n` distractor countries from `pool`, excluding `correct`. */
export function pickDistractors(
  correct: Country,
  pool: Country[],
  n: number,
  rng: () => number = Math.random,
): Country[] {
  const candidates = pool.filter((c) => c.code !== correct.code);
  return shuffle(candidates, rng).slice(0, Math.max(0, n));
}

/** Build one question for `country`, drawing distractors from `pool`. */
export function buildGeoQuestion(
  mode: GeoMode,
  country: Country,
  pool: Country[],
  lang: Lang,
  rng: () => number = Math.random,
): GeoQuestion {
  const label = mode === "flags" ? countryName : capitalName;
  const correctLabel = label(country, lang);

  const distractors = pickDistractors(country, pool, OPTIONS_PER_QUESTION - 1, rng)
    .map((c) => label(c, lang))
    .filter((s) => s !== correctLabel);

  // De-dup + assemble, then shuffle so the correct answer isn't always first.
  const uniqueOptions = Array.from(new Set([correctLabel, ...distractors]));
  const answers = shuffle(uniqueOptions, rng);

  return {
    id: `${mode}-${country.code}`,
    mode,
    flagCode: mode === "flags" ? country.code : undefined,
    promptText: mode === "capitals" ? countryName(country, lang) : undefined,
    answers,
    correctIndex: answers.indexOf(correctLabel),
  };
}

/**
 * Build a full quiz: pick `count` target countries from `countries`, each with
 * its own distractor set. `count` is clamped to the pool size.
 */
export function buildGeoQuiz(
  mode: GeoMode,
  countries: Country[],
  lang: Lang,
  count: number,
  rng: () => number = Math.random,
): GeoQuestion[] {
  const n = Math.min(count, countries.length);
  const targets = shuffle(countries, rng).slice(0, n);
  return targets.map((c) => buildGeoQuestion(mode, c, countries, lang, rng));
}
