import { supabase } from "./supabase";

/**
 * Product-event logging léger vers `public.activity_events`.
 *
 * Fire-and-forget : ne jette JAMAIS. Toute erreur (RLS, réseau, hors-ligne) est
 * avalée pour que l'instrumentation ne casse jamais l'expérience utilisateur.
 * Les users anonymes Supabase ont le rôle `authenticated`, la policy d'insert
 * "own rows" les couvre donc aussi.
 */
export async function logEvent(
  eventType: string,
  payload: Record<string, unknown> = {},
  userId?: string,
): Promise<void> {
  try {
    let uid = userId;
    if (!uid) {
      const { data } = await supabase.auth.getUser();
      uid = data.user?.id;
    }
    if (!uid) return;

    await (supabase.from("activity_events") as any).insert({
      user_id: uid,
      event_type: eventType,
      payload,
    });
  } catch {
    // Analytics ne doit jamais faire planter l'app.
  }
}
