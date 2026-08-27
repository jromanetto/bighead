/**
 * Liens stores (source unique). Vérifiés live le 27/08/2026 :
 * - App Store : "BIGHEAD - Culture Quiz App"
 * - Play Store : com.jroma51.bighead
 *
 * Le landing marketing (bighead.jrmanagement.org) n'a PAS de bouton store → les
 * liens partagés qui y pointaient ne convertissaient pas. On pointe donc les
 * partages directement vers l'App Store (canal principal FR/iOS). Le smart-link
 * multi-plateforme (deep-link + store selon l'OS) existe déjà pour le défi hebdo
 * via bighead-quizz.com/invite/quiz/<id> ; TODO: page /get générique idem.
 */
export const APP_STORE_URL = "https://apps.apple.com/app/id6758253365";
export const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.jroma51.bighead";

/** Lien d'install à mettre dans les partages sans cible spécifique (daily flex). */
export const INSTALL_URL = APP_STORE_URL;
