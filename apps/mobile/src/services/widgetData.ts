/**
 * Widget écran d'accueil (Vague 4) — rappel permanent, non-mutable, sans
 * permission. Duo/Finch en font un pilier de rétention (la flamme "à risque"
 * en fin de journée = moteur de culpabilité passif).
 *
 * ⚠️ Le TARGET NATIF (WidgetKit iOS / App Widget Android) n'est PAS OTA-able :
 * il exige un dev build + un pont de stockage partagé (App Group iOS). Ce module
 * couvre la partie JS : construire le payload (pur, testable) et le persister.
 * Le pont natif lit ensuite ce payload pour rendre le widget.
 *
 * Étapes natives restantes (hors OTA) :
 *  1. Ajouter un target Widget (ex: config plugin `@bacons/apple-targets`).
 *  2. Partager le stockage via App Group `group.com.bighead.widget`.
 *  3. Le widget lit `WIDGET_STORAGE_KEY` et affiche flamme + statut.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

export const WIDGET_STORAGE_KEY = "@bighead_widget_payload";

export interface WidgetState {
  streak: number;
  dailyDone: boolean;
  /** Heure locale 0–23 pour décider si la flamme est "à risque" (soir + pas fait). */
  hour: number;
}

export interface WidgetPayload {
  streak: number;
  dailyDone: boolean;
  /** La série est-elle en danger (soir avancé et daily pas encore faite) ? */
  atRisk: boolean;
  /** Emoji d'état prêt à afficher. */
  flame: string;
  updatedAtDay: string; // "YYYY-MM-DD"
}

/** Construit le payload widget à partir de l'état (pur → testable). */
export function buildWidgetPayload(state: WidgetState, today: string): WidgetPayload {
  const streak = Math.max(0, Math.floor(state.streak || 0));
  const dailyDone = !!state.dailyDone;
  // "À risque" : il est ≥ 18h, la question du jour n'est pas faite, et il y a une
  // série à protéger. C'est le moment où le rappel passif a le plus de valeur.
  const atRisk = !dailyDone && streak > 0 && (state.hour ?? 0) >= 18;
  const flame = dailyDone ? "✅" : atRisk ? "⚠️🔥" : streak > 0 ? "🔥" : "🧠";
  return { streak, dailyDone, atRisk, flame, updatedAtDay: today };
}

/** Persiste le payload (le pont natif le relit pour rendre le widget). */
export async function updateWidgetData(state: WidgetState): Promise<WidgetPayload> {
  const today = new Date().toISOString().slice(0, 10);
  const payload = buildWidgetPayload(state, today);
  try {
    await AsyncStorage.setItem(WIDGET_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ne jamais casser l'app pour un widget
  }
  return payload;
}

/** Lit le dernier payload persisté (côté JS ; le natif lit le stockage partagé). */
export async function readWidgetData(): Promise<WidgetPayload | null> {
  try {
    const raw = await AsyncStorage.getItem(WIDGET_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WidgetPayload) : null;
  } catch {
    return null;
  }
}
