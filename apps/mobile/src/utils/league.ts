/**
 * Weekly league (Duolingo-style) computed purely from the existing weekly
 * leaderboard — no new tables/cron. Players are chunked into divisions by rank;
 * each division has a promotion zone (top) and a relegation zone (bottom), and a
 * tier that rises as the division index falls. Read-only, so zero risk.
 */

export const DIVISION_SIZE = 30;

export interface LeagueTier {
  name: string; // English name; localize in the UI
  emoji: string;
  color: string;
}

// index 0 = top division. Beyond the list, everyone stays Bronze.
const TIERS: LeagueTier[] = [
  { name: "Diamond", emoji: "💎", color: "#7dd3fc" },
  { name: "Platinum", emoji: "🏆", color: "#e5e7eb" },
  { name: "Gold", emoji: "🥇", color: "#fbbf24" },
  { name: "Silver", emoji: "🥈", color: "#cbd5e1" },
  { name: "Bronze", emoji: "🥉", color: "#f59e0b" },
];

export type Zone = "promote" | "relegate" | "safe";

/** 0-based division index for a 1-based overall rank. */
export function divisionOf(rank: number, size: number = DIVISION_SIZE): number {
  return Math.floor((Math.max(1, rank) - 1) / size);
}

/** Tier for a division index (clamped to Bronze). */
export function tierForDivision(divisionIndex: number): LeagueTier {
  return TIERS[Math.min(Math.max(0, divisionIndex), TIERS.length - 1)];
}

/** The slice of entries belonging to a division. */
export function sliceDivision<T>(entries: T[], divisionIndex: number, size: number = DIVISION_SIZE): T[] {
  const start = divisionIndex * size;
  return entries.slice(start, start + size);
}

/**
 * Zone for a 0-based index within a division of `count` members.
 * Promote/relegate counts scale to the division so small (early-stage) divisions
 * still show meaningful zones. The top division never promotes; a single-division
 * league never relegates.
 */
export function zoneForIndex(
  indexInDivision: number,
  count: number,
  opts: { isTopDivision: boolean; isLastDivision: boolean; promote?: number; relegate?: number } = {
    isTopDivision: false,
    isLastDivision: false,
  },
): Zone {
  const promote = opts.promote ?? Math.max(1, Math.floor(count * 0.2));
  const relegate = opts.relegate ?? Math.max(1, Math.floor(count * 0.2));
  if (!opts.isTopDivision && indexInDivision < promote) return "promote";
  if (!opts.isLastDivision && indexInDivision >= count - relegate) return "relegate";
  return "safe";
}
