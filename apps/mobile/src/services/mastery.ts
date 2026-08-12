import { supabase } from "./supabase";
import { masteryLevel, MasteryTier } from "../utils/mastery";

export interface CategoryMastery {
  code: string;
  name: string;
  icon: string;
  color: string;
  played: number;
  correct: number;
  accuracy: number;
  tier: MasteryTier;
  index: number;
}

/**
 * Per-category mastery for a user, joining stats with the category metadata,
 * sorted best-tier first. Returns [] for anonymous users / on error (never throws).
 */
export async function getCategoryMastery(userId: string): Promise<CategoryMastery[]> {
  try {
    const { data, error } = await supabase
      .from("user_category_stats")
      .select("questions_played, questions_correct, categories(code, name, icon, color)")
      .eq("user_id", userId);
    if (error || !data) return [];
    return (data as any[])
      .filter((r) => r.categories)
      .map((r) => {
        const m = masteryLevel(r.questions_correct || 0, r.questions_played || 0);
        return {
          code: r.categories.code,
          name: r.categories.name,
          icon: r.categories.icon || "🎯",
          color: r.categories.color || "#00c2cc",
          played: r.questions_played || 0,
          correct: r.questions_correct || 0,
          accuracy: m.accuracy,
          tier: m.tier,
          index: m.index,
        };
      })
      .sort((a, b) => b.index - a.index || b.played - a.played);
  } catch {
    return [];
  }
}
