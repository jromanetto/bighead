/**
 * BIGHEAD Database Types
 *
 * These types should match your Supabase schema.
 * You can regenerate them using: npx supabase gen types typescript
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string | null;
          username: string;
          avatar_url: string | null;
          total_xp: number;
          level: number;
          games_played: number;
          games_won: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          username: string;
          avatar_url?: string | null;
          total_xp?: number;
          level?: number;
          games_played?: number;
          games_won?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          username?: string;
          avatar_url?: string | null;
          total_xp?: number;
          level?: number;
          games_played?: number;
          games_won?: number;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          name_en: string | null;
          icon: string | null;
          color: string | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          name_en?: string | null;
          icon?: string | null;
          color?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          name?: string;
          slug?: string;
          name_en?: string | null;
          icon?: string | null;
          color?: string | null;
          is_active?: boolean;
          sort_order?: number;
        };
      };
      questions: {
        Row: {
          id: string;
          category_id: string;
          difficulty: number;
          question_text: string;
          correct_answer: string;
          wrong_answers: string[];
          explanation: string | null;
          language: string;
          times_played: number;
          times_correct: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          difficulty: number;
          question_text: string;
          correct_answer: string;
          wrong_answers: string[];
          explanation?: string | null;
          language?: string;
          times_played?: number;
          times_correct?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          category_id?: string;
          difficulty?: number;
          question_text?: string;
          correct_answer?: string;
          wrong_answers?: string[];
          explanation?: string | null;
          language?: string;
          times_played?: number;
          times_correct?: number;
          is_active?: boolean;
        };
      };
      games: {
        Row: {
          id: string;
          user_id: string | null;
          mode: "chain_solo" | "chain_duel" | "party";
          score: number;
          max_chain: number;
          questions_count: number;
          correct_count: number;
          duration_seconds: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          mode: "chain_solo" | "chain_duel" | "party";
          score: number;
          max_chain?: number;
          questions_count?: number;
          correct_count?: number;
          duration_seconds?: number | null;
          created_at?: string;
        };
        Update: {
          user_id?: string | null;
          mode?: "chain_solo" | "chain_duel" | "party";
          score?: number;
          max_chain?: number;
          questions_count?: number;
          correct_count?: number;
          duration_seconds?: number | null;
        };
      };
      game_answers: {
        Row: {
          id: string;
          game_id: string;
          question_id: string | null;
          player_name: string | null;
          is_correct: boolean;
          answer_time_ms: number | null;
          chain_multiplier: number;
          points_earned: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          game_id: string;
          question_id?: string | null;
          player_name?: string | null;
          is_correct: boolean;
          answer_time_ms?: number | null;
          chain_multiplier?: number;
          points_earned?: number;
          created_at?: string;
        };
        Update: {
          game_id?: string;
          question_id?: string | null;
          player_name?: string | null;
          is_correct?: boolean;
          answer_time_ms?: number | null;
          chain_multiplier?: number;
          points_earned?: number;
        };
      };
      challenges: {
        Row: {
          id: string;
          code: string;
          creator_id: string | null;
          game_id: string;
          question_ids: string[];
          mode: string;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          creator_id?: string | null;
          game_id: string;
          question_ids: string[];
          mode?: string;
          expires_at?: string;
          created_at?: string;
        };
        Update: {
          code?: string;
          creator_id?: string | null;
          game_id?: string;
          question_ids?: string[];
          mode?: string;
          expires_at?: string;
        };
      };
      challenge_attempts: {
        Row: {
          id: string;
          challenge_id: string;
          user_id: string | null;
          game_id: string | null;
          score: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          challenge_id: string;
          user_id?: string | null;
          game_id?: string | null;
          score: number;
          created_at?: string;
        };
        Update: {
          challenge_id?: string;
          user_id?: string | null;
          game_id?: string | null;
          score?: number;
        };
      };
      user_category_stats: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          questions_played: number;
          questions_correct: number;
          best_chain: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          questions_played?: number;
          questions_correct?: number;
          best_chain?: number;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          category_id?: string;
          questions_played?: number;
          questions_correct?: number;
          best_chain?: number;
          updated_at?: string;
        };
      };
    };
    Views: {
      leaderboard: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          total_xp: number;
          level: number;
          games_played: number;
          rank: number;
        };
      };
    };
    Functions: {
      generate_challenge_code: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
  };
}

// Utility types
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type Views<T extends keyof Database["public"]["Views"]> =
  Database["public"]["Views"][T]["Row"];

// Convenience types
export type User = Tables<"users">;
export type Category = Tables<"categories">;
export type Question = Tables<"questions">;
export type Game = Tables<"games">;
export type GameAnswer = Tables<"game_answers">;
export type Challenge = Tables<"challenges">;
export type ChallengeAttempt = Tables<"challenge_attempts">;
export type UserCategoryStats = Tables<"user_category_stats">;
export type LeaderboardEntry = Views<"leaderboard">;
