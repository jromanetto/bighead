/**
 * Compte à rebours jusqu'au prochain défi hebdo, pour cadrer la demande de notif
 * (« Nouveau défi demain — on te prévient ? »). Le défi suivant démarre le
 * lendemain de `end_date`, à minuit UTC (cf. generate-weekly-challenge).
 */
export function daysUntilNextChallenge(endDate: string, now: Date = new Date()): number | null {
  const end = new Date(`${endDate}T00:00:00Z`);
  if (isNaN(end.getTime())) return null;
  const nextStart = end.getTime() + 86_400_000;
  const days = Math.ceil((nextStart - now.getTime()) / 86_400_000);
  return Math.max(1, days);
}

export function nextChallengeLabel(days: number | null, lang: "fr" | "en"): string {
  if (days == null) return lang === "fr" ? "bientôt" : "soon";
  if (days === 1) return lang === "fr" ? "demain" : "tomorrow";
  return lang === "fr" ? `dans ${days} jours` : `in ${days} days`;
}
