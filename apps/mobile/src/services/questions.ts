import { supabase } from "./supabase";
import type { Question, Category } from "../types/database";

/**
 * Fetch all active categories
 */
export const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (error) throw error;
  return data || [];
};

/**
 * Fetch questions for a game
 */
export interface GetQuestionsParams {
  categoryId?: string;
  difficulty?: number;
  count?: number;
  excludeIds?: string[];
  language?: string;
}

export const getQuestions = async ({
  categoryId,
  difficulty,
  count = 10,
  excludeIds = [],
  language = "en",
}: GetQuestionsParams = {}): Promise<Question[]> => {
  let query = supabase
    .from("questions")
    .select("*")
    .eq("is_active", true)
    .eq("language", language);

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  if (difficulty) {
    query = query.eq("difficulty", difficulty);
  }

  if (excludeIds.length > 0) {
    query = query.not("id", "in", `(${excludeIds.join(",")})`);
  }

  // Random selection using Supabase
  // Note: For truly random, you might want to use a custom RPC function
  const { data, error } = await query.limit(count * 2); // Get more than needed for shuffling

  if (error) throw error;

  // Shuffle and return requested count
  const shuffled = (data || []).sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

/**
 * Get questions by specific IDs (for challenges)
 */
export const getQuestionsByIds = async (ids: string[]): Promise<Question[]> => {
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .in("id", ids);

  if (error) throw error;

  // Return in the same order as the ids array
  const questionMap = new Map(data?.map((q) => [q.id, q]));
  return ids.map((id) => questionMap.get(id)).filter(Boolean) as Question[];
};

/**
 * Format question for display (shuffles answers)
 */
export interface FormattedQuestion {
  id: string;
  categoryId: string;
  difficulty: number;
  question: string;
  answers: string[];
  correctIndex: number;
  explanation: string | null;
}

export const formatQuestionForGame = (question: Question): FormattedQuestion => {
  // Combine correct and wrong answers
  const allAnswers = [question.correct_answer, ...question.wrong_answers];

  // Shuffle answers
  const shuffledAnswers = allAnswers.sort(() => Math.random() - 0.5);

  // Find new index of correct answer
  const correctIndex = shuffledAnswers.indexOf(question.correct_answer);

  return {
    id: question.id,
    categoryId: question.category_id,
    difficulty: question.difficulty,
    question: question.question_text,
    answers: shuffledAnswers,
    correctIndex,
    explanation: question.explanation,
  };
};

/**
 * Format multiple questions for a game
 */
export const formatQuestionsForGame = (
  questions: Question[]
): FormattedQuestion[] => {
  return questions.map(formatQuestionForGame);
};
