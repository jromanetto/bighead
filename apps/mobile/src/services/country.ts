import { getLocales } from "expo-localization";
import { supabase } from "./supabase";

/**
 * Renseigne users.country depuis la région de l'appareil (ex "FR" → "fr") si le
 * profil n'en a pas encore. Idempotent, fire-and-forget, appelé au lancement.
 */
export async function ensureCountry(userId: string, current?: string | null): Promise<void> {
  if (!userId) return;
  const region = getLocales()[0]?.regionCode?.toLowerCase();
  if (!region || !/^[a-z]{2}$/.test(region)) return;
  // Corrige aussi un pays déduit de la langue (backfill) vers le vrai pays de
  // l'appareil ; n'écrit qu'une fois (quand ça diffère).
  if (current === region) return;
  try {
    await (supabase.from("users") as any)
      .update({ country: region })
      .eq("id", userId);
  } catch {
    // silencieux — non critique
  }
}
