import { supabase } from "./supabase";

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
