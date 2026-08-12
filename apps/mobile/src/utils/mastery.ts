/**
 * Per-category mastery tiers. Gamifies the raw questions_correct/played stats
 * into a Bronze -> Platinum ladder that rewards BOTH accuracy and volume (you
 * can't get Platinum on 3 lucky questions). Drives "master every category".
 */

export type MasteryTier = "none" | "bronze" | "silver" | "gold" | "platinum";

export const TIER_ORDER: MasteryTier[] = ["none", "bronze", "silver", "gold", "platinum"];

export interface MasteryResult {
  tier: MasteryTier;
  index: number; // 0..4
  accuracy: number; // 0..1
}

interface TierRule {
  tier: Exclude<MasteryTier, "none">;
  minPlayed: number;
  minAccuracy: number;
}

// Ordered from hardest to easiest; first match wins.
const RULES: TierRule[] = [
  { tier: "platinum", minPlayed: 50, minAccuracy: 0.9 },
  { tier: "gold", minPlayed: 25, minAccuracy: 0.8 },
  { tier: "silver", minPlayed: 12, minAccuracy: 0.65 },
  { tier: "bronze", minPlayed: 4, minAccuracy: 0 },
];

export function masteryLevel(correct: number, played: number): MasteryResult {
  const accuracy = played > 0 ? correct / played : 0;
  let tier: MasteryTier = "none";
  for (const r of RULES) {
    if (played >= r.minPlayed && accuracy >= r.minAccuracy) {
      tier = r.tier;
      break;
    }
  }
  return { tier, index: TIER_ORDER.indexOf(tier), accuracy };
}

export function masteryEmoji(tier: MasteryTier): string {
  switch (tier) {
    case "platinum": return "💎";
    case "gold": return "🥇";
    case "silver": return "🥈";
    case "bronze": return "🥉";
    default: return "▫️";
  }
}

/**
 * Overall mastery 0..1 across categories: average tier progress (index/4).
 * Empty list -> 0.
 */
export function overallMastery(results: MasteryResult[]): number {
  if (!results.length) return 0;
  const sum = results.reduce((acc, r) => acc + r.index / 4, 0);
  return sum / results.length;
}
