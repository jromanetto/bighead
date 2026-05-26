/**
 * Date helpers — all return UTC-day-boundary YYYY-MM-DD strings so they match
 * what we store in Supabase across the codebase.
 */

/**
 * Returns YYYY-MM-DD for today (UTC).
 */
export function getTodayIsoDate(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Returns YYYY-MM-DD for a date N days from today (UTC).
 * `offset` can be negative (e.g. `-1` for yesterday).
 */
export function getDayOffset(offset: number): string {
  return new Date(Date.now() + offset * 86400000).toISOString().split("T")[0];
}

type Lang = "en" | "fr" | "es" | "de";

const REL_STRINGS: Record<
  Lang,
  { just: string; m: string; h: string; d: string }
> = {
  en: { just: "just now", m: "m ago", h: "h ago", d: "d ago" },
  fr: { just: "à l’instant", m: "min", h: "h", d: "j" },
  es: { just: "ahora", m: "min", h: "h", d: "d" },
  de: { just: "gerade eben", m: "Min.", h: "Std.", d: "T" },
};

/**
 * Lightweight "5m ago" / "2h ago" formatter for a Date or ISO string.
 * Uses UTC math (no timezone awareness needed for the deltas).
 *
 * For translation-key-driven formatting (e.g. activity feed), keep using the
 * dedicated `t("activityTimeAgo*")` strings inside the component instead.
 */
export function relativeTimeAgo(
  date: Date | string,
  lang: Lang = "en"
): string {
  const dict = REL_STRINGS[lang] ?? REL_STRINGS.en;
  const then = typeof date === "string" ? new Date(date).getTime() : date.getTime();
  const diffSec = Math.max(1, Math.floor((Date.now() - then) / 1000));
  if (diffSec < 60) return dict.just;
  const mins = Math.floor(diffSec / 60);
  if (mins < 60) {
    return lang === "en" ? `${mins}${dict.m}` : `${mins} ${dict.m}`;
  }
  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    return lang === "en" ? `${hours}${dict.h}` : `${hours} ${dict.h}`;
  }
  const days = Math.floor(hours / 24);
  return lang === "en" ? `${days}${dict.d}` : `${days} ${dict.d}`;
}
