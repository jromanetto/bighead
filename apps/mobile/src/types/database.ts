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
          best_chain: number;
          daily_streak: number;
          last_daily_challenge: string | null;
          perfect_games: number;
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
          best_chain?: number;
          daily_streak?: number;
          last_daily_challenge?: string | null;
          perfect_games?: number;
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
          best_chain?: number;
          daily_streak?: number;
          last_daily_challenge?: string | null;
          perfect_games?: number;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          code: string;
          name: string;
          icon: string;
          color: string;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          icon: string;
          color: string;
          is_active?: boolean;
        };
        Update: {
          code?: string;
          name?: string;
          icon?: string;
          color?: string;
          is_active?: boolean;
        };
      };
      questions: {
        Row: {
          id: string;
          category: string;
          difficulty: number;
          question_text: string;
          correct_answer: string;
          wrong_answers: string[];
          explanation: string | null;
          language: string;
          times_played: number;
          times_correct: number;
          is_active: boolean;
          image_url: string | null;
          image_credit: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          category?: string;
          difficulty?: number;
          question_text: string;
          correct_answer: string;
          wrong_answers: string[];
          explanation?: string | null;
          language?: string;
          times_played?: number;
          times_correct?: number;
          is_active?: boolean;
          image_url?: string | null;
          image_credit?: string | null;
          created_at?: string;
        };
        Update: {
          category?: string;
          difficulty?: number;
          question_text?: string;
          correct_answer?: string;
          wrong_answers?: string[];
          explanation?: string | null;
          language?: string;
          times_played?: number;
          times_correct?: number;
          is_active?: boolean;
          image_url?: string | null;
          image_credit?: string | null;
        };
      };
      game_results: {
        Row: {
          id: string;
          user_id: string | null;
          mode: "chain_solo" | "party";
          score: number;
          correct_count: number;
          total_questions: number;
          max_chain: number;
          duration_seconds: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          mode: "chain_solo" | "party";
          score: number;
          correct_count?: number;
          total_questions?: number;
          max_chain?: number;
          duration_seconds?: number | null;
          created_at?: string;
        };
        Update: {
          user_id?: string | null;
          mode?: "chain_solo" | "party";
          score?: number;
          correct_count?: number;
          total_questions?: number;
          max_chain?: number;
          duration_seconds?: number | null;
        };
      };
      achievements: {
        Row: {
          id: string;
          code: string;
          name: string;
          description: string;
          icon: string;
          category: "games" | "score" | "streak" | "social" | "special";
          requirement_type: string;
          requirement_value: number;
          xp_reward: number;
          is_secret: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          description: string;
          icon: string;
          category: "games" | "score" | "streak" | "social" | "special";
          requirement_type: string;
          requirement_value?: number;
          xp_reward?: number;
          is_secret?: boolean;
          created_at?: string;
        };
        Update: {
          code?: string;
          name?: string;
          description?: string;
          icon?: string;
          category?: "games" | "score" | "streak" | "social" | "special";
          requirement_type?: string;
          requirement_value?: number;
          xp_reward?: number;
          is_secret?: boolean;
        };
      };
      user_achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          unlocked_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          achievement_id: string;
          unlocked_at?: string;
        };
        Update: {
          user_id?: string;
          achievement_id?: string;
          unlocked_at?: string;
        };
      };
      daily_challenges: {
        Row: {
          id: string;
          challenge_date: string;
          question_id: string | null;
          category: string | null;
          bonus_xp: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          challenge_date: string;
          question_id?: string | null;
          category?: string | null;
          bonus_xp?: number;
          created_at?: string;
        };
        Update: {
          challenge_date?: string;
          question_id?: string | null;
          category?: string | null;
          bonus_xp?: number;
        };
      };
      user_daily_challenges: {
        Row: {
          id: string;
          user_id: string;
          challenge_id: string;
          completed_at: string;
          is_correct: boolean;
          answer_time_ms: number | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          challenge_id: string;
          completed_at?: string;
          is_correct: boolean;
          answer_time_ms?: number | null;
        };
        Update: {
          user_id?: string;
          challenge_id?: string;
          completed_at?: string;
          is_correct?: boolean;
          answer_time_ms?: number | null;
        };
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          sound_enabled: boolean;
          haptic_enabled: boolean;
          notifications_enabled: boolean;
          language: string;
          theme: string;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          sound_enabled?: boolean;
          haptic_enabled?: boolean;
          notifications_enabled?: boolean;
          language?: string;
          theme?: string;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          sound_enabled?: boolean;
          haptic_enabled?: boolean;
          notifications_enabled?: boolean;
          language?: string;
          theme?: string;
          onboarding_completed?: boolean;
          updated_at?: string;
        };
      };
      duels: {
        Row: {
          id: string;
          code: string;
          host_id: string;
          guest_id: string | null;
          status: "waiting" | "playing" | "finished" | "cancelled";
          category: string;
          rounds_total: number;
          current_round: number;
          host_score: number;
          guest_score: number;
          winner_id: string | null;
          created_at: string;
          started_at: string | null;
          finished_at: string | null;
        };
        Insert: {
          id?: string;
          code: string;
          host_id: string;
          guest_id?: string | null;
          status?: "waiting" | "playing" | "finished" | "cancelled";
          category?: string;
          rounds_total?: number;
          current_round?: number;
          host_score?: number;
          guest_score?: number;
          winner_id?: string | null;
          created_at?: string;
          started_at?: string | null;
          finished_at?: string | null;
        };
        Update: {
          code?: string;
          host_id?: string;
          guest_id?: string | null;
          status?: "waiting" | "playing" | "finished" | "cancelled";
          category?: string;
          rounds_total?: number;
          current_round?: number;
          host_score?: number;
          guest_score?: number;
          winner_id?: string | null;
          started_at?: string | null;
          finished_at?: string | null;
        };
      };
      duel_rounds: {
        Row: {
          id: string;
          duel_id: string;
          round_number: number;
          question_id: string;
          host_answer: string | null;
          host_answer_time_ms: number | null;
          host_correct: boolean | null;
          guest_answer: string | null;
          guest_answer_time_ms: number | null;
          guest_correct: boolean | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          duel_id: string;
          round_number: number;
          question_id: string;
          host_answer?: string | null;
          host_answer_time_ms?: number | null;
          host_correct?: boolean | null;
          guest_answer?: string | null;
          guest_answer_time_ms?: number | null;
          guest_correct?: boolean | null;
          created_at?: string;
        };
        Update: {
          duel_id?: string;
          round_number?: number;
          question_id?: string;
          host_answer?: string | null;
          host_answer_time_ms?: number | null;
          host_correct?: boolean | null;
          guest_answer?: string | null;
          guest_answer_time_ms?: number | null;
          guest_correct?: boolean | null;
        };
      };
      tournaments: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          start_date: string;
          end_date: string;
          category: string;
          entry_fee: number;
          prize_pool: number;
          max_participants: number | null;
          status: "upcoming" | "active" | "finished";
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          start_date: string;
          end_date: string;
          category?: string;
          entry_fee?: number;
          prize_pool?: number;
          max_participants?: number | null;
          status?: "upcoming" | "active" | "finished";
          created_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          start_date?: string;
          end_date?: string;
          category?: string;
          entry_fee?: number;
          prize_pool?: number;
          max_participants?: number | null;
          status?: "upcoming" | "active" | "finished";
        };
      };
      tournament_participants: {
        Row: {
          id: string;
          tournament_id: string;
          user_id: string;
          score: number;
          games_played: number;
          best_score: number;
          rank: number | null;
          joined_at: string;
        };
        Insert: {
          id?: string;
          tournament_id: string;
          user_id: string;
          score?: number;
          games_played?: number;
          best_score?: number;
          rank?: number | null;
          joined_at?: string;
        };
        Update: {
          tournament_id?: string;
          user_id?: string;
          score?: number;
          games_played?: number;
          best_score?: number;
          rank?: number | null;
        };
      };
      push_tokens: {
        Row: {
          id: string;
          user_id: string;
          token: string;
          platform: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          token: string;
          platform?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          token?: string;
          platform?: string;
          updated_at?: string;
        };
      };
      user_questions_seen: {
        Row: {
          id: string;
          user_id: string;
          question_id: string;
          seen_at: string;
          times_seen: number;
          last_correct: boolean | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          question_id: string;
          seen_at?: string;
          times_seen?: number;
          last_correct?: boolean | null;
        };
        Update: {
          user_id?: string;
          question_id?: string;
          seen_at?: string;
          times_seen?: number;
          last_correct?: boolean | null;
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
      check_achievements: {
        Args: { p_user_id: string };
        Returns: {
          achievement_code: string;
          achievement_name: string;
          achievement_icon: string;
          xp_reward: number;
        }[];
      };
      get_daily_challenge: {
        Args: Record<string, never>;
        Returns: {
          id: string;
          challenge_date: string;
          question_id: string;
          category: string;
          bonus_xp: number;
          question_text: string;
          correct_answer: string;
          wrong_answers: string[];
        }[];
      };
      create_duel: {
        Args: { p_host_id: string; p_category?: string; p_rounds?: number };
        Returns: { duel_id: string; duel_code: string }[];
      };
      join_duel: {
        Args: { p_code: string; p_guest_id: string };
        Returns: { success: boolean; duel_id: string | null; message: string }[];
      };
      get_duel_questions: {
        Args: { p_duel_id: string };
        Returns: {
          round_number: number;
          question_id: string;
          question_text: string;
          correct_answer: string;
          wrong_answers: string[];
        }[];
      };
      submit_duel_answer: {
        Args: {
          p_duel_id: string;
          p_user_id: string;
          p_round_number: number;
          p_answer: string;
          p_answer_time_ms: number;
        };
        Returns: { success: boolean; is_correct: boolean; correct_answer: string }[];
      };
      finish_duel: {
        Args: { p_duel_id: string };
        Returns: { winner_id: string | null; host_score: number; guest_score: number }[];
      };
      mark_question_seen: {
        Args: { p_user_id: string; p_question_id: string; p_was_correct?: boolean | null };
        Returns: void;
      };
      get_user_question_stats: {
        Args: { p_user_id: string };
        Returns: {
          total_questions: number;
          questions_seen: number;
          coverage_percent: number;
          needs_new_questions: boolean;
        }[];
      };
      get_unseen_questions: {
        Args: { p_user_id: string; p_category?: string | null; p_limit?: number; p_language?: string };
        Returns: {
          id: string;
          question_text: string;
          correct_answer: string;
          wrong_answers: string[];
          category: string;
          difficulty: number;
          image_url: string | null;
          image_credit: string | null;
        }[];
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

export type Functions<T extends keyof Database["public"]["Functions"]> =
  Database["public"]["Functions"][T];

// Convenience types
export type User = Tables<"users">;
export type Category = Tables<"categories">;
export type Question = Tables<"questions">;
export type GameResult = Tables<"game_results">;
export type Achievement = Tables<"achievements">;
export type UserAchievement = Tables<"user_achievements">;
export type DailyChallenge = Tables<"daily_challenges">;
export type UserDailyChallenge = Tables<"user_daily_challenges">;
export type UserSettings = Tables<"user_settings">;
export type Duel = Tables<"duels">;
export type DuelRound = Tables<"duel_rounds">;
export type Tournament = Tables<"tournaments">;
export type TournamentParticipant = Tables<"tournament_participants">;
export type PushToken = Tables<"push_tokens">;
export type UserQuestionSeen = Tables<"user_questions_seen">;
export type LeaderboardEntry = Views<"leaderboard">;
