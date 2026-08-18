/**
 * Recall — le format "saisie" (la signature Sporcle) : le joueur TAPE la réponse
 * au lieu de choisir un QCM. Rappel actif > reconnaissance, et bien plus
 * satisfaisant pour un public culture G qui aime savoir.
 *
 * Le cœur, c'est la NOTATION tolérante : accents, casse, articles, ponctuation
 * et une faute de frappe ne doivent pas invalider une bonne réponse. 100% pur.
 */

const LEADING_ARTICLES = [
  // "l '"/"d '" : l'apostrophe est convertie en espace par la normalisation,
  // donc "l'amazone" devient "l amazone" — on retire l'élision résiduelle "l "/"d ".
  "les ", "le ", "la ", "l ", "un ", "une ", "des ", "de ", "du ", "d ",
  "the ", "an ", "a ",
];

/** Normalise une réponse pour comparaison : minuscule, sans accents/ponctuation,
 *  articles de tête retirés, espaces compactés. */
export function normalizeAnswer(input: string): string {
  if (!input) return "";
  let s = input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // retire les diacritiques (combining marks)
    .replace(/[.,;:!?"'`()\-_/\\]/g, " ") // ponctuation → espace
    .replace(/\s+/g, " ")
    .trim();
  for (const art of LEADING_ARTICLES) {
    if (s.startsWith(art)) {
      s = s.slice(art.length).trim();
      break;
    }
  }
  return s;
}

/** Distance de Levenshtein (nombre d'éditions) entre deux chaînes. */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const prev = new Array(b.length + 1);
  const curr = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j];
  }
  return prev[b.length];
}

export interface RecallResult {
  correct: boolean;
  matched: string | null; // la variante acceptée qui a matché
  exact: boolean; // match strict (sans tolérance faute de frappe)
}

/**
 * Note une réponse tapée contre une liste de variantes acceptées.
 * - match exact après normalisation → correct
 * - sinon, tolère 1 faute de frappe (Levenshtein ≤ 1) pour les mots ≥ 4 lettres,
 *   ≤ 2 pour les réponses longues (≥ 8 lettres) — jamais pour les très courtes
 *   (sinon "chat"/"chien" deviendraient interchangeables).
 */
export function gradeRecall(input: string, accepted: string[]): RecallResult {
  const norm = normalizeAnswer(input);
  if (!norm) return { correct: false, matched: null, exact: false };

  const normAccepted = accepted.map((a) => ({ raw: a, norm: normalizeAnswer(a) }));

  // 1) Exact
  for (const a of normAccepted) {
    if (a.norm && a.norm === norm) return { correct: true, matched: a.raw, exact: true };
  }

  // 2) Tolérance faute de frappe
  for (const a of normAccepted) {
    if (!a.norm) continue;
    const len = Math.max(a.norm.length, norm.length);
    if (len < 4) continue; // trop court → pas de tolérance
    const budget = len >= 8 ? 2 : 1;
    if (levenshtein(a.norm, norm) <= budget) {
      return { correct: true, matched: a.raw, exact: false };
    }
  }

  return { correct: false, matched: null, exact: false };
}

export interface RecallProgress {
  found: number;
  total: number;
  pct: number; // 0–100
}

/** Compteur de complétion "X / N trouvés" — le moteur à dopamine de Sporcle. */
export function recallProgress(found: number, total: number): RecallProgress {
  const t = Math.max(0, Math.floor(total || 0));
  const f = Math.max(0, Math.min(t, Math.floor(found || 0)));
  return { found: f, total: t, pct: t === 0 ? 0 : Math.round((f / t) * 100) };
}
