/**
 * "Défie un ami" — le loop social sans friction (façon PIN Kahoot / grille
 * Wordle) : un lien qui dépose l'ami direct sur la question, sans inscription.
 *
 * L'app gère déjà le deep-link `bighead://challenge/<code>` ; ce module produit
 * de façon COHÉRENTE le lien (deep + web de secours), le code normalisé et le
 * texte de partage localisé. Pur → testable.
 */

// Même domaine marketing que le partage Wordle quotidien.
export const APP_WEB_BASE = "https://bighead.jrmanagement.org";
export const DEEP_LINK_SCHEME = "bighead://challenge/";

/** Normalise un code de défi : majuscules, alphanumérique, 6 caractères. */
export function normalizeChallengeCode(raw: string): string {
  return (raw || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6);
}

/** Deep-link natif vers le défi. */
export function buildChallengeDeepLink(code: string): string {
  return `${DEEP_LINK_SCHEME}${normalizeChallengeCode(code)}`;
}

/** Lien web de secours (ouvre la page qui redirige vers l'app / le store). */
export function buildChallengeWebLink(code: string): string {
  return `${APP_WEB_BASE}/c/${normalizeChallengeCode(code)}`;
}

/** Texte de partage prêt à être envoyé (inclut le lien web, ouvrable partout). */
export function buildChallengeShareText(code: string, lang: "fr" | "en" = "fr"): string {
  const clean = normalizeChallengeCode(code);
  const link = buildChallengeWebLink(clean);
  if (lang === "fr") {
    return `🧠 Je te défie sur BigHead ! Même question, on voit qui gagne 👀\nCode : ${clean}\n${link}`;
  }
  return `🧠 I challenge you on BigHead! Same question — let's see who wins 👀\nCode: ${clean}\n${link}`;
}
