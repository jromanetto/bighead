import { supabase } from "./supabase";
import type { Question, Category } from "../types/database";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || "";

/**
 * Fetch all active categories
 */
export const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("code");

  if (error) throw error;
  return data || [];
};

/**
 * Mark a question as seen by user
 */
export const markQuestionSeen = async (
  userId: string,
  questionId: string,
  wasCorrect?: boolean
): Promise<void> => {
  const { error } = await supabase.rpc("mark_question_seen", {
    p_user_id: userId,
    p_question_id: questionId,
    p_was_correct: wasCorrect ?? null,
  });

  if (error) {
    console.error("Error marking question seen:", error);
  }
};

/**
 * Get user's question coverage stats
 */
export interface QuestionStats {
  total_questions: number;
  questions_seen: number;
  coverage_percent: number;
  needs_new_questions: boolean;
}

export const getUserQuestionStats = async (userId: string): Promise<QuestionStats | null> => {
  const { data, error } = await supabase.rpc("get_user_question_stats", {
    p_user_id: userId,
  });

  if (error) {
    console.error("Error getting question stats:", error);
    return null;
  }

  return data?.[0] || null;
};

/**
 * Get questions prioritizing unseen ones
 */
export const getUnseenQuestions = async (
  userId: string,
  category?: string,
  count: number = 10,
  language: string = "en"
): Promise<Question[]> => {
  const { data, error } = await supabase.rpc("get_unseen_questions", {
    p_user_id: userId,
    p_category: category || null,
    p_limit: count,
    p_language: language,
  });

  if (error) {
    console.error("Error getting unseen questions:", error);
    // Fallback to regular question fetch
    return getQuestions({ count, language });
  }

  return (data as Question[]) || [];
};

/**
 * Trigger AI question generation (when user has seen > 80% of questions)
 */
export const triggerQuestionGeneration = async (
  userId: string,
  category?: string,
  count: number = 10,
  language: string = "en"
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-questions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        user_id: userId,
        category,
        count,
        language,
      }),
    });

    const result = await response.json();
    return {
      success: result.success,
      message: result.message || result.error || "Unknown error",
    };
  } catch (error) {
    console.error("Error triggering question generation:", error);
    return {
      success: false,
      message: "Failed to generate questions",
    };
  }
};

/**
 * Check if user needs new questions and trigger generation if so
 */
export const checkAndGenerateQuestions = async (
  userId: string,
  language: string = "en"
): Promise<void> => {
  const stats = await getUserQuestionStats(userId);

  if (stats?.needs_new_questions) {
    console.log(`User has seen ${stats.coverage_percent}% of questions, triggering generation...`);
    await triggerQuestionGeneration(userId, undefined, 20, language);
  }
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
  category: string;
  difficulty: number;
  question: string;
  answers: string[];
  correctIndex: number;
  explanation: string | null;
  imageUrl: string | null;
  imageCredit: string | null;
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
    category: question.category,
    difficulty: question.difficulty,
    question: question.question_text,
    answers: shuffledAnswers,
    correctIndex,
    explanation: question.explanation,
    imageUrl: (question as any).image_url || null,
    imageCredit: (question as any).image_credit || null,
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
