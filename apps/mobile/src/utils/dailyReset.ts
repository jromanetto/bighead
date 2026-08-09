/**
 * Helpers pour le compte à rebours de la Daily Brain.
 * La question du jour + le streak se réinitialisent à minuit UTC (c'est la
 * frontière de jour utilisée partout côté serveur : dedupe `daily_brain_<date>`,
 * `last_daily_challenge`). On aligne le compte à rebours dessus pour ne pas
 * afficher "reset !" alors que la daily n'a pas encore tourné (bug de fuseau).
 */

/** Formatte une durée en ms en "Xh Ym" (ou "Ym" si < 1h). */
export function formatShortDuration(ms: number): string {
  const totalMin = Math.max(0, Math.floor(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

/** Millisecondes restantes avant le prochain minuit UTC (reset de la daily). */
export function msUntilDailyReset(now: Date = new Date()): number {
  const next = new Date(now);
  next.setUTCHours(24, 0, 0, 0); // minuit UTC prochain (= reset serveur)
  return next.getTime() - now.getTime();
}

/** Chaîne lisible du temps restant avant le reset de la daily (ex: "5h 12m"). */
export function timeUntilDailyReset(now: Date = new Date()): string {
  return formatShortDuration(msUntilDailyReset(now));
}
