import { supabase } from "./supabase";

export interface Category {
  id: string;
  code: string;
  name: string;
  icon: string;
  color: string;
  is_active: boolean;
}

/**
 * Get all active categories
 */
export const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) throw error;
  return data || [];
};

/**
 * Get questions by category
 */
export const getQuestionsByCategory = async (
  category: string,
  limit: number = 10
): Promise<any[]> => {
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("category", category)
    .eq("is_active", true)
    .limit(limit);

  if (error) throw error;
  return data || [];
};

/**
 * Get question count by category
 */
export const getCategoryStats = async (): Promise<{ code: string; count: number }[]> => {
  const { data, error } = await supabase
    .from("questions")
    .select("category")
    .eq("is_active", true);

  if (error) throw error;

  // Count by category
  const counts: { [key: string]: number } = {};
  ((data || []) as any[]).forEach((q) => {
    const cat = q.category || "general";
    counts[cat] = (counts[cat] || 0) + 1;
  });

  return Object.entries(counts).map(([code, count]) => ({ code, count }));
};
