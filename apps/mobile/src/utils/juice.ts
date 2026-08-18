/**
 * Juice centralisé — le "game feel" aux moments qui comptent.
 *
 * Le feeling premium vient de 3 pics : bonne réponse, palier (série/niveau),
 * unlock. Ce module sépare la DÉCISION (quel retour pour quel pic — pur, donc
 * testable) de l'EFFET (appels haptics/son). Avant, chaque écran câblait ses
 * propres haptics de façon inégale ; ici tout passe par un plan unique.
 *
 * Note : `feedback` est lazy-require dans `playJuice` (et pas importé en tête)
 * pour que le graphe de module de `juice.ts` reste libre de toute dépendance
 * native — les fonctions pures (`juicePlan`, `countUpFrames`) restent ainsi
 * importables et testables sans mocker expo-av/expo-haptics.
 */

export type JuiceEvent =
  | "answer_correct"
  | "answer_wrong"
  | "combo"
  | "streak_milestone"
  | "level_up"
  | "unlock";

export interface JuicePlan {
  haptic: "light" | "medium" | "heavy" | "success" | "warning" | "error";
  sound: "correct" | "wrong" | "tick" | "success" | "levelup" | "achievement";
  /** Descripteur d'animation à consommer par l'UI (Reanimated). */
  animation: "pop" | "shake" | "burst" | "celebrate" | "count";
  /** Le pic mérite-t-il une célébration plein écran (confetti) ? */
  celebrate: boolean;
}

/** Plan de juice pour un événement (pur). */
export function juicePlan(event: JuiceEvent): JuicePlan {
  switch (event) {
    case "answer_correct":
      return { haptic: "success", sound: "correct", animation: "pop", celebrate: false };
    case "answer_wrong":
      // Doux, jamais punitif — on veut que le joueur retente, pas qu'il culpabilise.
      return { haptic: "warning", sound: "wrong", animation: "shake", celebrate: false };
    case "combo":
      return { haptic: "medium", sound: "tick", animation: "count", celebrate: false };
    case "streak_milestone":
      return { haptic: "heavy", sound: "success", animation: "celebrate", celebrate: true };
    case "level_up":
      return { haptic: "heavy", sound: "levelup", animation: "celebrate", celebrate: true };
    case "unlock":
      return { haptic: "success", sound: "achievement", animation: "burst", celebrate: true };
  }
}

/** Joue le juice d'un événement (effet — haptics + son via feedback.ts). */
export async function playJuice(event: JuiceEvent): Promise<void> {
  try {
    // Lazy-require : garde le module pur importable sans dépendance native.
    const fb = require("./feedback") as typeof import("./feedback");
    switch (event) {
      case "answer_correct":
        await fb.correctAnswerFeedback();
        return;
      case "answer_wrong":
        await fb.wrongAnswerFeedback();
        return;
      case "level_up":
        await fb.levelUpFeedback();
        return;
      case "unlock":
        await fb.achievementFeedback();
        return;
      default: {
        const plan = juicePlan(event);
        await Promise.all([fb.playHaptic(plan.haptic), fb.playSound(plan.sound)]);
      }
    }
  } catch {
    // Le juice ne doit JAMAIS casser le gameplay.
  }
}

/** easeOutCubic — décélération naturelle pour les compteurs qui montent. */
export function easeOutCubic(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return 1 - Math.pow(1 - c, 3);
}

/**
 * Frames d'un compteur qui "monte" (ex: XP 40→41, série 22→23).
 * Retourne `steps` valeurs entières interpolées de `from` à `to` (dernière = to).
 * Pur → testable ; l'UI n'a plus qu'à afficher chaque frame.
 */
export function countUpFrames(from: number, to: number, steps = 20): number[] {
  const a = Math.round(from);
  const b = Math.round(to);
  if (steps <= 1 || a === b) return [b];
  const frames: number[] = [];
  for (let i = 1; i <= steps; i++) {
    const eased = easeOutCubic(i / steps);
    frames.push(Math.round(a + (b - a) * eased));
  }
  frames[frames.length - 1] = b; // garantit l'arrivée exacte
  return frames;
}
