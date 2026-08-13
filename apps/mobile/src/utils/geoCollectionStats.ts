import { COUNTRIES, CONTINENTS, ContinentId } from "../data/geography";

export interface ContinentCollection {
  id: ContinentId;
  caught: number;
  total: number;
}

/** Caught/total per continent (only real dataset codes count). */
export function collectionByContinent(caught: Set<string>): ContinentCollection[] {
  return CONTINENTS.map((c) => {
    const countries = COUNTRIES.filter((k) => k.continent === c.id);
    return {
      id: c.id,
      caught: countries.filter((k) => caught.has(k.code)).length,
      total: countries.length,
    };
  });
}

/** Overall caught/total across the whole dataset. */
export function totalCaught(caught: Set<string>): { caught: number; total: number } {
  const n = COUNTRIES.filter((k) => caught.has(k.code)).length;
  return { caught: n, total: COUNTRIES.length };
}
