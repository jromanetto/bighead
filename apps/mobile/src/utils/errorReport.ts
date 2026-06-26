import * as Sentry from "@sentry/react-native";

/**
 * Remontée centralisée des erreurs "douces" — celles qui ne lèvent pas
 * d'exception non catchée (un `catch` qui ne fait que `console.error`, ou un
 * écran d'erreur affiché à l'utilisateur). Sans ça, Sentry ne les voit jamais
 * et on ne peut pas alerter sur un pic d'écrans d'erreur.
 *
 * Tag `feature` + tag `error_screen` (pour les règles d'alerte Sentry).
 */

/** Une exception a été catchée et avalée (chargement KO, submit KO, …). */
export function reportCaught(
  feature: string,
  err: unknown,
  detail?: Record<string, unknown>,
): void {
  try {
    Sentry.captureException(err, {
      tags: { feature, error_screen: feature },
      extra: detail,
    });
  } catch {
    // ne jamais casser le flux user pour une remontée d'erreur
  }
}

/** Un écran d'erreur plein écran a été montré à l'utilisateur. */
export function reportErrorScreen(
  feature: string,
  detail?: Record<string, unknown>,
): void {
  try {
    Sentry.captureMessage(`error_screen:${feature}`, {
      level: "error",
      tags: { feature, error_screen: feature },
      extra: detail,
    });
  } catch {
    // idem
  }
}
