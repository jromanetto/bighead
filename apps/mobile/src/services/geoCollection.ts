import { supabase } from "./supabase";
import { awardXP } from "./xp";

export const CONTINENT_BONUS_XP = 200;

/** Record a country as "caught" (correct geography answer). Fire-and-forget. */
export async function catchCountry(userId: string, code: string): Promise<void> {
  try {
    await (supabase.from("geo_collection") as any).upsert(
      { user_id: userId, country_code: code },
      { onConflict: "user_id,country_code", ignoreDuplicates: true },
    );
  } catch {
    // ignore (offline / dup)
  }
}

/**
 * Award the one-time completion bonus for each fully-collected continent.
 * Idempotent: award_xp dedupes on `geo_continent_<id>`, so calling this on every
 * collection view only ever pays out once per continent.
 */
export async function awardContinentCompletions(userId: string, completed: string[]): Promise<void> {
  for (const id of completed) {
    try {
      await awardXP(userId, CONTINENT_BONUS_XP, "geography", { reason: "continent_complete", continent: id }, `geo_continent_${id}`);
    } catch {
      // ignore
    }
  }
}

/** The set of country codes this user has caught. Empty on error/anonymous. */
export async function getCaughtCodes(userId: string): Promise<Set<string>> {
  try {
    const { data, error } = await supabase
      .from("geo_collection")
      .select("country_code")
      .eq("user_id", userId);
    if (error || !data) return new Set();
    return new Set((data as any[]).map((r) => r.country_code));
  } catch {
    return new Set();
  }
}
