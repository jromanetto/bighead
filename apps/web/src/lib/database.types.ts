export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          category: string
          code: string
          created_at: string | null
          description: string
          icon: string
          id: string
          is_secret: boolean | null
          name: string
          requirement_type: string
          requirement_value: number
          xp_reward: number
        }
        Insert: {
          category: string
          code: string
          created_at?: string | null
          description: string
          icon: string
          id?: string
          is_secret?: boolean | null
          name: string
          requirement_type: string
          requirement_value?: number
          xp_reward?: number
        }
        Update: {
          category?: string
          code?: string
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          is_secret?: boolean | null
          name?: string
          requirement_type?: string
          requirement_value?: number
          xp_reward?: number
        }
        Relationships: []
      }
      activity_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          payload: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          payload?: Json
          user_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          payload?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      answer_analytics: {
        Row: {
          created_at: string | null
          id: string
          question_difficulty_at_time: number | null
          question_id: string
          tier: string | null
          time_to_answer_ms: number | null
          user_id: string | null
          user_skill_at_time: number | null
          was_correct: boolean
        }
        Insert: {
          created_at?: string | null
          id?: string
          question_difficulty_at_time?: number | null
          question_id: string
          tier?: string | null
          time_to_answer_ms?: number | null
          user_id?: string | null
          user_skill_at_time?: number | null
          was_correct: boolean
        }
        Update: {
          created_at?: string | null
          id?: string
          question_difficulty_at_time?: number | null
          question_id?: string
          tier?: string | null
          time_to_answer_ms?: number | null
          user_id?: string | null
          user_skill_at_time?: number | null
          was_correct?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "answer_analytics_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      app_feedback: {
        Row: {
          app_version: string | null
          created_at: string | null
          device_info: string | null
          feedback_text: string | null
          id: string
          rating: number
          user_id: string | null
        }
        Insert: {
          app_version?: string | null
          created_at?: string | null
          device_info?: string | null
          feedback_text?: string | null
          id?: string
          rating: number
          user_id?: string | null
        }
        Update: {
          app_version?: string | null
          created_at?: string | null
          device_info?: string | null
          feedback_text?: string | null
          id?: string
          rating?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      audio_questions: {
        Row: {
          audio_credit: string | null
          audio_duration_seconds: number
          audio_url: string
          category: string
          correct_answer: string
          created_at: string | null
          difficulty: number
          id: string
          is_active: boolean | null
          question_en: string
          question_fr: string
          subcategory: string | null
          times_correct: number | null
          times_played: number | null
          wrong_answers: string[]
        }
        Insert: {
          audio_credit?: string | null
          audio_duration_seconds?: number
          audio_url: string
          category?: string
          correct_answer: string
          created_at?: string | null
          difficulty?: number
          id?: string
          is_active?: boolean | null
          question_en?: string
          question_fr?: string
          subcategory?: string | null
          times_correct?: number | null
          times_played?: number | null
          wrong_answers: string[]
        }
        Update: {
          audio_credit?: string | null
          audio_duration_seconds?: number
          audio_url?: string
          category?: string
          correct_answer?: string
          created_at?: string | null
          difficulty?: number
          id?: string
          is_active?: boolean | null
          question_en?: string
          question_fr?: string
          subcategory?: string | null
          times_correct?: number | null
          times_played?: number | null
          wrong_answers?: string[]
        }
        Relationships: []
      }
      categories: {
        Row: {
          code: string
          color: string
          icon: string
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          code: string
          color: string
          icon: string
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          code?: string
          color?: string
          icon?: string
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      challenge_attempts: {
        Row: {
          challenge_id: string | null
          created_at: string | null
          game_id: string | null
          id: string
          score: number
          user_id: string | null
        }
        Insert: {
          challenge_id?: string | null
          created_at?: string | null
          game_id?: string | null
          id?: string
          score: number
          user_id?: string | null
        }
        Update: {
          challenge_id?: string | null
          created_at?: string | null
          game_id?: string | null
          id?: string
          score?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_attempts_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_attempts_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          code: string
          created_at: string | null
          creator_id: string | null
          expires_at: string | null
          game_id: string | null
          id: string
          mode: string | null
          question_ids: string[]
        }
        Insert: {
          code: string
          created_at?: string | null
          creator_id?: string | null
          expires_at?: string | null
          game_id?: string | null
          id?: string
          mode?: string | null
          question_ids: string[]
        }
        Update: {
          code?: string
          created_at?: string | null
          creator_id?: string | null
          expires_at?: string | null
          game_id?: string | null
          id?: string
          mode?: string | null
          question_ids?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "challenges_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenges_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenges_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_challenges: {
        Row: {
          bonus_xp: number | null
          category: string | null
          challenge_date: string
          created_at: string | null
          id: string
          question_id: string | null
        }
        Insert: {
          bonus_xp?: number | null
          category?: string | null
          challenge_date?: string
          created_at?: string | null
          id?: string
          question_id?: string | null
        }
        Update: {
          bonus_xp?: number | null
          category?: string | null
          challenge_date?: string
          created_at?: string | null
          id?: string
          question_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_challenges_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_questions: {
        Row: {
          category: string | null
          created_at: string | null
          date: string
          difficulty: number | null
          id: string
          language: string | null
          notifications_failed: number | null
          notifications_sent: number | null
          position: number
          question_id: string
          question_text: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          date: string
          difficulty?: number | null
          id?: string
          language?: string | null
          notifications_failed?: number | null
          notifications_sent?: number | null
          position?: number
          question_id: string
          question_text: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          date?: string
          difficulty?: number | null
          id?: string
          language?: string | null
          notifications_failed?: number | null
          notifications_sent?: number | null
          position?: number
          question_id?: string
          question_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_survival_results: {
        Row: {
          best_score: number | null
          created_at: string
          date: string
          id: string
          score: number
          time_ms: number | null
          user_id: string
        }
        Insert: {
          best_score?: number | null
          created_at?: string
          date: string
          id?: string
          score?: number
          time_ms?: number | null
          user_id: string
        }
        Update: {
          best_score?: number | null
          created_at?: string
          date?: string
          id?: string
          score?: number
          time_ms?: number | null
          user_id?: string
        }
        Relationships: []
      }
      duel_rounds: {
        Row: {
          created_at: string | null
          duel_id: string
          guest_answer: string | null
          guest_answer_time_ms: number | null
          guest_correct: boolean | null
          host_answer: string | null
          host_answer_time_ms: number | null
          host_correct: boolean | null
          id: string
          question_id: string
          round_number: number
        }
        Insert: {
          created_at?: string | null
          duel_id: string
          guest_answer?: string | null
          guest_answer_time_ms?: number | null
          guest_correct?: boolean | null
          host_answer?: string | null
          host_answer_time_ms?: number | null
          host_correct?: boolean | null
          id?: string
          question_id: string
          round_number: number
        }
        Update: {
          created_at?: string | null
          duel_id?: string
          guest_answer?: string | null
          guest_answer_time_ms?: number | null
          guest_correct?: boolean | null
          host_answer?: string | null
          host_answer_time_ms?: number | null
          host_correct?: boolean | null
          id?: string
          question_id?: string
          round_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "duel_rounds_duel_id_fkey"
            columns: ["duel_id"]
            isOneToOne: false
            referencedRelation: "duels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "duel_rounds_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      duels: {
        Row: {
          category: string | null
          code: string
          created_at: string | null
          current_round: number
          expires_at: string | null
          finished_at: string | null
          guest_answers: Json | null
          guest_id: string | null
          guest_played_at: string | null
          guest_score: number
          guest_time_ms: number | null
          host_answers: Json | null
          host_id: string
          host_played_at: string | null
          host_score: number
          host_time_ms: number | null
          id: string
          language: string | null
          mode: string
          questions_payload: Json | null
          rounds_total: number
          started_at: string | null
          status: string
          winner_id: string | null
        }
        Insert: {
          category?: string | null
          code: string
          created_at?: string | null
          current_round?: number
          expires_at?: string | null
          finished_at?: string | null
          guest_answers?: Json | null
          guest_id?: string | null
          guest_played_at?: string | null
          guest_score?: number
          guest_time_ms?: number | null
          host_answers?: Json | null
          host_id: string
          host_played_at?: string | null
          host_score?: number
          host_time_ms?: number | null
          id?: string
          language?: string | null
          mode?: string
          questions_payload?: Json | null
          rounds_total?: number
          started_at?: string | null
          status?: string
          winner_id?: string | null
        }
        Update: {
          category?: string | null
          code?: string
          created_at?: string | null
          current_round?: number
          expires_at?: string | null
          finished_at?: string | null
          guest_answers?: Json | null
          guest_id?: string | null
          guest_played_at?: string | null
          guest_score?: number
          guest_time_ms?: number | null
          host_answers?: Json | null
          host_id?: string
          host_played_at?: string | null
          host_score?: number
          host_time_ms?: number | null
          id?: string
          language?: string | null
          mode?: string
          questions_payload?: Json | null
          rounds_total?: number
          started_at?: string | null
          status?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "duels_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "duels_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "duels_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "duels_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "duels_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "duels_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      friend_challenge_attempts: {
        Row: {
          challenge_id: string
          completed_at: string | null
          correct_count: number
          id: string
          player_name: string
          score: number
          total_time_ms: number | null
          user_id: string | null
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          correct_count?: number
          id?: string
          player_name: string
          score?: number
          total_time_ms?: number | null
          user_id?: string | null
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          correct_count?: number
          id?: string
          player_name?: string
          score?: number
          total_time_ms?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "friend_challenge_attempts_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "friend_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friend_challenge_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friend_challenge_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      friend_challenges: {
        Row: {
          category: string | null
          code: string
          created_at: string | null
          creator_id: string
          expires_at: string | null
          id: string
          question_count: number | null
          question_ids: string[]
          status: string | null
          time_per_question: number | null
        }
        Insert: {
          category?: string | null
          code: string
          created_at?: string | null
          creator_id: string
          expires_at?: string | null
          id?: string
          question_count?: number | null
          question_ids: string[]
          status?: string | null
          time_per_question?: number | null
        }
        Update: {
          category?: string | null
          code?: string
          created_at?: string | null
          creator_id?: string
          expires_at?: string | null
          id?: string
          question_count?: number | null
          question_ids?: string[]
          status?: string | null
          time_per_question?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "friend_challenges_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friend_challenges_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      game_answers: {
        Row: {
          answer_time_ms: number | null
          chain_multiplier: number | null
          created_at: string | null
          game_id: string | null
          id: string
          is_correct: boolean
          player_name: string | null
          points_earned: number | null
          question_id: string | null
        }
        Insert: {
          answer_time_ms?: number | null
          chain_multiplier?: number | null
          created_at?: string | null
          game_id?: string | null
          id?: string
          is_correct: boolean
          player_name?: string | null
          points_earned?: number | null
          question_id?: string | null
        }
        Update: {
          answer_time_ms?: number | null
          chain_multiplier?: number | null
          created_at?: string | null
          game_id?: string | null
          id?: string
          is_correct?: boolean
          player_name?: string | null
          points_earned?: number | null
          question_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_answers_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      game_results: {
        Row: {
          correct_count: number
          created_at: string | null
          duration_seconds: number | null
          id: string
          max_chain: number
          mode: string
          score: number
          total_questions: number
          user_id: string | null
        }
        Insert: {
          correct_count?: number
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          max_chain?: number
          mode: string
          score?: number
          total_questions?: number
          user_id?: string | null
        }
        Update: {
          correct_count?: number
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          max_chain?: number
          mode?: string
          score?: number
          total_questions?: number
          user_id?: string | null
        }
        Relationships: []
      }
      games: {
        Row: {
          correct_count: number | null
          created_at: string | null
          duration_seconds: number | null
          id: string
          max_chain: number | null
          mode: string
          questions_count: number | null
          score: number
          user_id: string | null
        }
        Insert: {
          correct_count?: number | null
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          max_chain?: number | null
          mode: string
          questions_count?: number | null
          score?: number
          user_id?: string | null
        }
        Update: {
          correct_count?: number | null
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          max_chain?: number | null
          mode?: string
          questions_count?: number | null
          score?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "games_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      instagram_posts: {
        Row: {
          created_at: string | null
          error: string | null
          heygen_video_id: string | null
          id: string
          instagram_media_id: string | null
          instagram_permalink: string | null
          question: Json
          status: string | null
          supabase_storage_path: string | null
          tiktok_publish_id: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          error?: string | null
          heygen_video_id?: string | null
          id?: string
          instagram_media_id?: string | null
          instagram_permalink?: string | null
          question: Json
          status?: string | null
          supabase_storage_path?: string | null
          tiktok_publish_id?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          error?: string | null
          heygen_video_id?: string | null
          id?: string
          instagram_media_id?: string | null
          instagram_permalink?: string | null
          question?: Json
          status?: string | null
          supabase_storage_path?: string | null
          tiktok_publish_id?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      notification_dedupe: {
        Row: {
          kind: string
          ref: string
          sent_at: string
          user_id: string
        }
        Insert: {
          kind: string
          ref: string
          sent_at?: string
          user_id: string
        }
        Update: {
          kind?: string
          ref?: string
          sent_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_dedupe_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_dedupe_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_logs: {
        Row: {
          daily_question_id: string | null
          error_message: string | null
          id: string
          push_token: string
          sent_at: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          daily_question_id?: string | null
          error_message?: string | null
          id?: string
          push_token: string
          sent_at?: string | null
          status: string
          user_id?: string | null
        }
        Update: {
          daily_question_id?: string | null
          error_message?: string | null
          id?: string
          push_token?: string
          sent_at?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_daily_question_id_fkey"
            columns: ["daily_question_id"]
            isOneToOne: false
            referencedRelation: "daily_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          achievement: boolean
          friend_overtake: boolean
          streak_warning: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          achievement?: boolean
          friend_overtake?: boolean
          streak_warning?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          achievement?: boolean
          friend_overtake?: boolean
          streak_warning?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      player_skill: {
        Row: {
          best_streak: number | null
          category: string
          correct_answers: number | null
          created_at: string | null
          games_played: number | null
          id: string
          last_played_at: string | null
          rating_deviation: number | null
          skill_rating: number | null
          total_answers: number | null
          updated_at: string | null
          user_id: string
          win_streak: number | null
        }
        Insert: {
          best_streak?: number | null
          category: string
          correct_answers?: number | null
          created_at?: string | null
          games_played?: number | null
          id?: string
          last_played_at?: string | null
          rating_deviation?: number | null
          skill_rating?: number | null
          total_answers?: number | null
          updated_at?: string | null
          user_id: string
          win_streak?: number | null
        }
        Update: {
          best_streak?: number | null
          category?: string
          correct_answers?: number | null
          created_at?: string | null
          games_played?: number | null
          id?: string
          last_played_at?: string | null
          rating_deviation?: number | null
          skill_rating?: number | null
          total_answers?: number | null
          updated_at?: string | null
          user_id?: string
          win_streak?: number | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          agg_correct: number
          agg_shown: number
          ai_difficulty: number | null
          avg_time_ms: number | null
          category: string | null
          category_id: string | null
          correct_answer: string
          created_at: string | null
          difficulty: number | null
          difficulty_rating: number | null
          difficulty_updated_at: string | null
          empirical_difficulty: number | null
          explanation: string | null
          id: string
          image_credit: string | null
          image_url: string | null
          is_active: boolean | null
          language: string | null
          min_age: number | null
          options: Json | null
          original_image_url: string | null
          player_name: string | null
          question_text: string
          requalified_at: string | null
          times_correct: number | null
          times_played: number | null
          times_shown: number | null
          wrong_answers: string[]
        }
        Insert: {
          agg_correct?: number
          agg_shown?: number
          ai_difficulty?: number | null
          avg_time_ms?: number | null
          category?: string | null
          category_id?: string | null
          correct_answer: string
          created_at?: string | null
          difficulty?: number | null
          difficulty_rating?: number | null
          difficulty_updated_at?: string | null
          empirical_difficulty?: number | null
          explanation?: string | null
          id?: string
          image_credit?: string | null
          image_url?: string | null
          is_active?: boolean | null
          language?: string | null
          min_age?: number | null
          options?: Json | null
          original_image_url?: string | null
          player_name?: string | null
          question_text: string
          requalified_at?: string | null
          times_correct?: number | null
          times_played?: number | null
          times_shown?: number | null
          wrong_answers: string[]
        }
        Update: {
          agg_correct?: number
          agg_shown?: number
          ai_difficulty?: number | null
          avg_time_ms?: number | null
          category?: string | null
          category_id?: string | null
          correct_answer?: string
          created_at?: string | null
          difficulty?: number | null
          difficulty_rating?: number | null
          difficulty_updated_at?: string | null
          empirical_difficulty?: number | null
          explanation?: string | null
          id?: string
          image_credit?: string | null
          image_url?: string | null
          is_active?: boolean | null
          language?: string | null
          min_age?: number | null
          options?: Json | null
          original_image_url?: string | null
          player_name?: string | null
          question_text?: string
          requalified_at?: string | null
          times_correct?: number | null
          times_played?: number | null
          times_shown?: number | null
          wrong_answers?: string[]
        }
        Relationships: []
      }
      reddit_posts: {
        Row: {
          created_at: string | null
          error: string | null
          id: string
          language: string
          question_id: string | null
          reddit_post_id: string | null
          reddit_url: string | null
          status: string | null
          subreddit: string
          title: string
        }
        Insert: {
          created_at?: string | null
          error?: string | null
          id?: string
          language?: string
          question_id?: string | null
          reddit_post_id?: string | null
          reddit_url?: string | null
          status?: string | null
          subreddit: string
          title: string
        }
        Update: {
          created_at?: string | null
          error?: string | null
          id?: string
          language?: string
          question_id?: string | null
          reddit_post_id?: string | null
          reddit_url?: string | null
          status?: string | null
          subreddit?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "reddit_posts_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_codes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_codes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          code_used: string | null
          completed_at: string | null
          created_at: string
          id: string
          referee_user_id: string
          referrer_user_id: string
          rewarded_at: string | null
        }
        Insert: {
          code_used?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          referee_user_id: string
          referrer_user_id: string
          rewarded_at?: string | null
        }
        Update: {
          code_used?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          referee_user_id?: string
          referrer_user_id?: string
          rewarded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referee_user_id_fkey"
            columns: ["referee_user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referee_user_id_fkey"
            columns: ["referee_user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_user_id_fkey"
            columns: ["referrer_user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_user_id_fkey"
            columns: ["referrer_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      streak_freezes: {
        Row: {
          expires_at: string
          granted_at: string
          id: string
          source: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          expires_at: string
          granted_at?: string
          id?: string
          source: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          expires_at?: string
          granted_at?: string
          id?: string
          source?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "streak_freezes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "streak_freezes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_participants: {
        Row: {
          completed: boolean
          completed_at: string | null
          correct_answers: number
          id: string
          joined_at: string | null
          rank: number | null
          score: number
          total_time_ms: number
          tournament_id: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          correct_answers?: number
          id?: string
          joined_at?: string | null
          rank?: number | null
          score?: number
          total_time_ms?: number
          tournament_id: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          correct_answers?: number
          id?: string
          joined_at?: string | null
          rank?: number | null
          score?: number
          total_time_ms?: number
          tournament_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_participants_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_questions: {
        Row: {
          id: string
          question_id: string
          question_order: number
          tournament_id: string
        }
        Insert: {
          id?: string
          question_id: string
          question_order: number
          tournament_id: string
        }
        Update: {
          id?: string
          question_id?: string
          question_order?: number
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_questions_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          end_date: string
          id: string
          language: string | null
          name: string
          prize_xp: number | null
          questions_count: number
          start_date: string
          status: string
          time_limit_seconds: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          end_date: string
          id?: string
          language?: string | null
          name: string
          prize_xp?: number | null
          questions_count?: number
          start_date: string
          status?: string
          time_limit_seconds?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string
          id?: string
          language?: string | null
          name?: string
          prize_xp?: number | null
          questions_count?: number
          start_date?: string
          status?: string
          time_limit_seconds?: number | null
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_cached_questions: {
        Row: {
          cached_at: string | null
          category: string | null
          expires_at: string | null
          id: string
          question_ids: string[]
          user_id: string
        }
        Insert: {
          cached_at?: string | null
          category?: string | null
          expires_at?: string | null
          id?: string
          question_ids: string[]
          user_id: string
        }
        Update: {
          cached_at?: string | null
          category?: string | null
          expires_at?: string | null
          id?: string
          question_ids?: string[]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_cached_questions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_cached_questions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_category_stats: {
        Row: {
          best_chain: number | null
          category_id: string | null
          id: string
          questions_correct: number | null
          questions_played: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          best_chain?: number | null
          category_id?: string | null
          id?: string
          questions_correct?: number | null
          questions_played?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          best_chain?: number | null
          category_id?: string | null
          id?: string
          questions_correct?: number | null
          questions_played?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_category_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_category_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_daily_challenges: {
        Row: {
          answer_time_ms: number | null
          challenge_id: string
          completed_at: string | null
          id: string
          is_correct: boolean
          user_id: string
        }
        Insert: {
          answer_time_ms?: number | null
          challenge_id: string
          completed_at?: string | null
          id?: string
          is_correct: boolean
          user_id: string
        }
        Update: {
          answer_time_ms?: number | null
          challenge_id?: string
          completed_at?: string | null
          id?: string
          is_correct?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_daily_challenges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "daily_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_daily_challenges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_daily_challenges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_lifelines: {
        Row: {
          created_at: string
          double_xp: number
          fifty_fifty: number
          last_granted_at: string | null
          plus_5s: number
          skip: number
          user_id: string
        }
        Insert: {
          created_at?: string
          double_xp?: number
          fifty_fifty?: number
          last_granted_at?: string | null
          plus_5s?: number
          skip?: number
          user_id: string
        }
        Update: {
          created_at?: string
          double_xp?: number
          fifty_fifty?: number
          last_granted_at?: string | null
          plus_5s?: number
          skip?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_lifelines_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_lifelines_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_questions_seen: {
        Row: {
          id: string
          last_correct: boolean | null
          question_id: string
          seen_at: string | null
          times_seen: number | null
          user_id: string
        }
        Insert: {
          id?: string
          last_correct?: boolean | null
          question_id: string
          seen_at?: string | null
          times_seen?: number | null
          user_id: string
        }
        Update: {
          id?: string
          last_correct?: boolean | null
          question_id?: string
          seen_at?: string | null
          times_seen?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_questions_seen_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_questions_seen_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_questions_seen_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          auto_use_streak_freeze: boolean
          created_at: string | null
          haptic_enabled: boolean | null
          id: string
          language: string | null
          music_enabled: boolean | null
          music_volume: number | null
          notifications_enabled: boolean | null
          onboarding_completed: boolean | null
          sound_enabled: boolean | null
          sound_volume: number | null
          theme: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_use_streak_freeze?: boolean
          created_at?: string | null
          haptic_enabled?: boolean | null
          id?: string
          language?: string | null
          music_enabled?: boolean | null
          music_volume?: number | null
          notifications_enabled?: boolean | null
          onboarding_completed?: boolean | null
          sound_enabled?: boolean | null
          sound_volume?: number | null
          theme?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_use_streak_freeze?: boolean
          created_at?: string | null
          haptic_enabled?: boolean | null
          id?: string
          language?: string | null
          music_enabled?: boolean | null
          music_volume?: number | null
          notifications_enabled?: boolean | null
          onboarding_completed?: boolean | null
          sound_enabled?: boolean | null
          sound_volume?: number | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          best_chain: number | null
          created_at: string | null
          daily_streak: number | null
          email: string | null
          games_played: number | null
          games_won: number | null
          id: string
          is_premium: boolean | null
          last_daily_challenge: string | null
          level: number | null
          perfect_games: number | null
          premium_expires_at: string | null
          push_token: string | null
          push_token_updated_at: string | null
          referral_code: string | null
          referral_reward_claimed: boolean | null
          referred_by: string | null
          total_xp: number | null
          updated_at: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          best_chain?: number | null
          created_at?: string | null
          daily_streak?: number | null
          email?: string | null
          games_played?: number | null
          games_won?: number | null
          id: string
          is_premium?: boolean | null
          last_daily_challenge?: string | null
          level?: number | null
          perfect_games?: number | null
          premium_expires_at?: string | null
          push_token?: string | null
          push_token_updated_at?: string | null
          referral_code?: string | null
          referral_reward_claimed?: boolean | null
          referred_by?: string | null
          total_xp?: number | null
          updated_at?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          best_chain?: number | null
          created_at?: string | null
          daily_streak?: number | null
          email?: string | null
          games_played?: number | null
          games_won?: number | null
          id?: string
          is_premium?: boolean | null
          last_daily_challenge?: string | null
          level?: number | null
          perfect_games?: number | null
          premium_expires_at?: string | null
          push_token?: string | null
          push_token_updated_at?: string | null
          referral_code?: string | null
          referral_reward_claimed?: boolean | null
          referred_by?: string | null
          total_xp?: number | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      web_push_subscriptions: {
        Row: {
          auth: string
          created_at: string | null
          endpoint: string
          id: string
          lang: string
          last_notified_at: string | null
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string | null
          endpoint: string
          id?: string
          lang?: string
          last_notified_at?: string | null
          p256dh: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          lang?: string
          last_notified_at?: string | null
          p256dh?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "web_push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "web_push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_challenge_progress: {
        Row: {
          badge_earned: string | null
          best_day_streak: number
          challenge_id: string
          completed_at: string | null
          correct_count: number
          current_position: number
          daily_play_counts: Json
          day_streak: number
          final_score: number | null
          final_xp_awarded: number
          id: string
          last_played_at: string | null
          started_at: string | null
          user_id: string
        }
        Insert: {
          badge_earned?: string | null
          best_day_streak?: number
          challenge_id: string
          completed_at?: string | null
          correct_count?: number
          current_position?: number
          daily_play_counts?: Json
          day_streak?: number
          final_score?: number | null
          final_xp_awarded?: number
          id?: string
          last_played_at?: string | null
          started_at?: string | null
          user_id: string
        }
        Update: {
          badge_earned?: string | null
          best_day_streak?: number
          challenge_id?: string
          completed_at?: string | null
          correct_count?: number
          current_position?: number
          daily_play_counts?: Json
          day_streak?: number
          final_score?: number | null
          final_xp_awarded?: number
          id?: string
          last_played_at?: string | null
          started_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_challenge_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "weekly_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_challenge_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_challenge_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_challenge_questions: {
        Row: {
          archived_question_id_en: string | null
          archived_question_id_fr: string | null
          challenge_id: string
          correct_answer_en: string
          correct_answer_fr: string
          created_at: string | null
          difficulty: number
          id: string
          image_credit: string | null
          image_url: string | null
          learning_fact_en: string | null
          learning_fact_fr: string | null
          position: number
          question_en: string
          question_fr: string
          wrong_answers_en: string[]
          wrong_answers_fr: string[]
        }
        Insert: {
          archived_question_id_en?: string | null
          archived_question_id_fr?: string | null
          challenge_id: string
          correct_answer_en: string
          correct_answer_fr: string
          created_at?: string | null
          difficulty?: number
          id?: string
          image_credit?: string | null
          image_url?: string | null
          learning_fact_en?: string | null
          learning_fact_fr?: string | null
          position: number
          question_en: string
          question_fr: string
          wrong_answers_en: string[]
          wrong_answers_fr: string[]
        }
        Update: {
          archived_question_id_en?: string | null
          archived_question_id_fr?: string | null
          challenge_id?: string
          correct_answer_en?: string
          correct_answer_fr?: string
          created_at?: string | null
          difficulty?: number
          id?: string
          image_credit?: string | null
          image_url?: string | null
          learning_fact_en?: string | null
          learning_fact_fr?: string | null
          position?: number
          question_en?: string
          question_fr?: string
          wrong_answers_en?: string[]
          wrong_answers_fr?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "weekly_challenge_questions_archived_question_id_en_fkey"
            columns: ["archived_question_id_en"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_challenge_questions_archived_question_id_fr_fkey"
            columns: ["archived_question_id_fr"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_challenge_questions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "weekly_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_challenge_themes: {
        Row: {
          color: string
          created_at: string | null
          description_en: string | null
          description_fr: string | null
          emoji: string
          id: string
          is_active: boolean | null
          label_en: string
          label_fr: string
          last_used_at: string | null
          slug: string
          target_category: string
        }
        Insert: {
          color?: string
          created_at?: string | null
          description_en?: string | null
          description_fr?: string | null
          emoji: string
          id?: string
          is_active?: boolean | null
          label_en: string
          label_fr: string
          last_used_at?: string | null
          slug: string
          target_category?: string
        }
        Update: {
          color?: string
          created_at?: string | null
          description_en?: string | null
          description_fr?: string | null
          emoji?: string
          id?: string
          is_active?: boolean | null
          label_en?: string
          label_fr?: string
          last_used_at?: string | null
          slug?: string
          target_category?: string
        }
        Relationships: []
      }
      weekly_challenges: {
        Row: {
          archived_at: string | null
          challenge_type: string
          closed_at: string | null
          color: string
          created_at: string | null
          description_en: string | null
          description_fr: string | null
          emoji: string
          end_date: string
          generation_error: string | null
          generation_status: string
          id: string
          start_date: string
          status: string
          target_category: string
          theme_label_en: string
          theme_label_fr: string
          theme_slug: string
          total_players: number
          total_questions: number
          updated_at: string | null
        }
        Insert: {
          archived_at?: string | null
          challenge_type?: string
          closed_at?: string | null
          color: string
          created_at?: string | null
          description_en?: string | null
          description_fr?: string | null
          emoji: string
          end_date: string
          generation_error?: string | null
          generation_status?: string
          id?: string
          start_date: string
          status?: string
          target_category: string
          theme_label_en: string
          theme_label_fr: string
          theme_slug: string
          total_players?: number
          total_questions?: number
          updated_at?: string | null
        }
        Update: {
          archived_at?: string | null
          challenge_type?: string
          closed_at?: string | null
          color?: string
          created_at?: string | null
          description_en?: string | null
          description_fr?: string | null
          emoji?: string
          end_date?: string
          generation_error?: string | null
          generation_status?: string
          id?: string
          start_date?: string
          status?: string
          target_category?: string
          theme_label_en?: string
          theme_label_fr?: string
          theme_slug?: string
          total_players?: number
          total_questions?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "weekly_challenges_theme_slug_fkey"
            columns: ["theme_slug"]
            isOneToOne: false
            referencedRelation: "weekly_challenge_themes"
            referencedColumns: ["slug"]
          },
        ]
      }
      weekly_replay_results: {
        Row: {
          challenge_id: string
          completed_at: string | null
          correct_count: number
          current_position: number
          id: string
          started_at: string | null
          total_questions: number
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          correct_count?: number
          current_position?: number
          id?: string
          started_at?: string | null
          total_questions: number
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          correct_count?: number
          current_position?: number
          id?: string
          started_at?: string | null
          total_questions?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_replay_results_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "weekly_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_replay_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_replay_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      xp_transactions: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          metadata: Json | null
          source: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          metadata?: Json | null
          source: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          metadata?: Json | null
          source?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      leaderboard: {
        Row: {
          avatar_url: string | null
          best_chain: number | null
          games_played: number | null
          id: string | null
          level: number | null
          rank: number | null
          total_xp: number | null
          username: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _gen_referral_code: { Args: never; Returns: string }
      activate_due_weekly_challenges: { Args: never; Returns: number }
      admin_overview: { Args: never; Returns: Json }
      apply_referral: {
        Args: { p_referral_code: string; p_user_id: string }
        Returns: Json
      }
      available_streak_freezes: { Args: never; Returns: number }
      award_xp: {
        Args: {
          p_amount: number
          p_dedupe_key?: string
          p_metadata?: Json
          p_source: string
          p_user_id: string
        }
        Returns: number
      }
      check_achievements: {
        Args: { p_user_id: string }
        Returns: {
          achievement_code: string
          achievement_icon: string
          achievement_name: string
          xp_reward: number
        }[]
      }
      claim_daily_login_bonus: { Args: never; Returns: Json }
      claim_first_time_milestone: {
        Args: { p_milestone: string }
        Returns: Json
      }
      claim_lifeline_use_xp: { Args: never; Returns: Json }
      claim_open_duel: { Args: { p_duel_id: string }; Returns: Json }
      complete_referral_if_eligible: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      create_async_duel: {
        Args: { p_category: string; p_guest_id: string; p_language: string }
        Returns: string
      }
      create_duel: {
        Args: {
          p_category?: string
          p_host_id: string
          p_language?: string
          p_rounds?: number
        }
        Returns: {
          duel_code: string
          duel_id: string
        }[]
      }
      create_friend_challenge: {
        Args: {
          p_category?: string
          p_creator_id: string
          p_language?: string
          p_question_count?: number
          p_time_per_question?: number
        }
        Returns: {
          challenge_code: string
          challenge_id: string
          share_url: string
        }[]
      }
      create_open_duel: {
        Args: { p_category: string; p_language: string }
        Returns: string
      }
      create_weekly_tournament: { Args: never; Returns: string }
      elo_expected_score: {
        Args: { player_rating: number; question_rating: number }
        Returns: number
      }
      elo_new_rating: {
        Args: {
          actual_score: number
          expected_score: number
          k_factor?: number
          old_rating: number
        }
        Returns: number
      }
      ensure_referral_code: { Args: { p_user_id: string }; Returns: string }
      find_random_opponent: { Args: { p_level_band?: number }; Returns: string }
      finish_duel: {
        Args: { p_duel_id: string }
        Returns: {
          guest_score: number
          host_score: number
          winner_id: string
        }[]
      }
      generate_challenge_code: { Args: never; Returns: string }
      generate_duel_code: { Args: never; Returns: string }
      generate_friend_challenge_code: { Args: never; Returns: string }
      get_active_push_tokens: {
        Args: never
        Returns: {
          push_token: string
          user_id: string
        }[]
      }
      get_active_push_tokens_with_language: {
        Args: never
        Returns: {
          language: string
          push_token: string
          user_id: string
        }[]
      }
      get_activity_feed: {
        Args: { p_limit?: number; p_offset?: number }
        Returns: {
          avatar_url: string
          created_at: string
          event_type: string
          id: string
          payload: Json
          user_id: string
          username: string
        }[]
      }
      get_adaptive_questions: {
        Args: {
          p_category: string
          p_language?: string
          p_limit?: number
          p_tier?: string
          p_user_id: string
        }
        Returns: {
          category: string
          correct_answer: string
          difficulty: number
          difficulty_rating: number
          id: string
          image_credit: string
          image_url: string
          match_quality: number
          question_text: string
          wrong_answers: string[]
        }[]
      }
      get_current_tournament: {
        Args: never
        Returns: {
          end_date: string
          participants_count: number
          prize_xp: number
          questions_count: number
          start_date: string
          time_limit_seconds: number
          tournament_category: string
          tournament_description: string
          tournament_id: string
          tournament_name: string
          tournament_status: string
          user_participated: boolean
          user_rank: number
          user_score: number
        }[]
      }
      get_daily_challenge: {
        Args: never
        Returns: {
          out_bonus_xp: number
          out_category: string
          out_challenge_date: string
          out_challenge_id: string
          out_options: Json
          out_player_name: string
          out_question_id: string
          out_question_text: string
        }[]
      }
      get_daily_survival_leaderboard: {
        Args: { p_limit?: number }
        Returns: {
          avatar_url: string
          rank: number
          score: number
          time_ms: number
          user_id: string
          username: string
        }[]
      }
      get_duel_questions: {
        Args: { p_duel_id: string }
        Returns: {
          image_url: string
          options: Json
          player_name: string
          question_id: string
          question_text: string
          round_number: number
        }[]
      }
      get_family_questions: {
        Args: {
          p_category?: string
          p_language?: string
          p_limit?: number
          p_min_age: number
        }
        Returns: {
          category: string
          correct_answer: string
          difficulty: number
          id: string
          image_credit: string
          image_url: string
          min_age: number
          question_text: string
          wrong_answers: string[]
        }[]
      }
      get_friend_challenge: {
        Args: { p_code: string }
        Returns: {
          attempts_count: number
          best_score: number
          category: string
          code: string
          creator_name: string
          id: string
          question_count: number
          question_ids: string[]
          status: string
          time_per_question: number
        }[]
      }
      get_my_challenge_history: {
        Args: never
        Returns: {
          badge_earned: string
          best_replay_score: number
          challenge_id: string
          challenge_type: string
          color: string
          completed_at: string
          correct_count: number
          description_en: string
          description_fr: string
          emoji: string
          end_date: string
          final_score: number
          final_xp_awarded: number
          start_date: string
          theme_label_en: string
          theme_label_fr: string
          theme_slug: string
          total_questions: number
        }[]
      }
      get_my_duels: {
        Args: never
        Returns: {
          category: string
          created_at: string
          duel_id: string
          expires_at: string
          my_played_at: string
          my_role: string
          my_score: number
          opponent_avatar: string
          opponent_id: string
          opponent_played_at: string
          opponent_score: number
          opponent_username: string
          status: string
          winner_id: string
        }[]
      }
      get_my_lifelines: {
        Args: never
        Returns: {
          created_at: string
          double_xp: number
          fifty_fifty: number
          last_granted_at: string | null
          plus_5s: number
          skip: number
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "user_lifelines"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_or_create_daily_question: {
        Args: { p_language?: string; target_date?: string }
        Returns: {
          category: string
          correct_answer: string
          date: string
          difficulty: number
          id: string
          image_url: string
          options: Json
          question_id: string
          question_text: string
        }[]
      }
      get_or_create_daily_questions_v2: {
        Args: { p_language?: string; target_date?: string }
        Returns: {
          out_category: string
          out_correct_answer: string
          out_date: string
          out_difficulty: number
          out_id: string
          out_image_url: string
          out_options: Json
          out_position: number
          out_question_id: string
          out_question_text: string
        }[]
      }
      get_player_skill_summary: {
        Args: { p_user_id: string }
        Returns: {
          accuracy_percent: number
          best_streak: number
          category: string
          games_played: number
          skill_level: string
          skill_rating: number
        }[]
      }
      get_random_audio_questions: {
        Args: { p_category?: string; p_count?: number; p_language?: string }
        Returns: {
          audio_credit: string
          audio_duration_seconds: number
          audio_url: string
          category: string
          correct_answer: string
          difficulty: number
          id: string
          question: string
          subcategory: string
          wrong_answers: string[]
        }[]
      }
      get_referral_stats: { Args: never; Returns: Json }
      get_service_role_jwt: { Args: never; Returns: string }
      get_tournament_leaderboard: {
        Args: { p_limit?: number; p_tournament_id: string }
        Returns: {
          avatar_url: string
          correct_answers: number
          rank: number
          score: number
          total_time_ms: number
          user_id: string
          username: string
        }[]
      }
      get_tournament_questions: {
        Args: { p_tournament_id: string }
        Returns: {
          image_url: string
          options: Json
          player_name: string
          question_id: string
          question_order: number
          question_text: string
        }[]
      }
      get_unseen_questions: {
        Args: {
          p_category?: string
          p_language?: string
          p_limit?: number
          p_user_id: string
        }
        Returns: {
          category: string
          correct_answer: string
          difficulty: number
          id: string
          image_credit: string
          image_url: string
          question_text: string
          wrong_answers: string[]
        }[]
      }
      get_user_question_stats: {
        Args: { p_user_id: string }
        Returns: {
          coverage_percent: number
          needs_new_questions: boolean
          questions_seen: number
          total_questions: number
        }[]
      }
      get_weekly_challenge_leaderboard: {
        Args: { p_challenge_id: string; p_limit?: number }
        Returns: {
          avatar_url: string
          completed_at: string
          correct_count: number
          current_position: number
          day_streak: number
          rank: number
          user_id: string
          username: string
        }[]
      }
      get_weekly_leaderboard: {
        Args: { limit_count?: number }
        Returns: {
          avatar_url: string
          best_chain: number
          id: string
          rank: number
          username: string
          weekly_games: number
          weekly_xp: number
        }[]
      }
      grant_daily_lifelines: {
        Args: never
        Returns: {
          created_at: string
          double_xp: number
          fifty_fifty: number
          last_granted_at: string | null
          plus_5s: number
          skip: number
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "user_lifelines"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      grant_daily_streak_freezes: { Args: never; Returns: number }
      grant_premium: {
        Args: { p_duration_days?: number; p_user_id: string }
        Returns: boolean
      }
      grant_weekly_streak_freezes: { Args: never; Returns: number }
      is_user_premium: { Args: { p_user_id: string }; Returns: boolean }
      join_duel: {
        Args: { p_code: string; p_guest_id: string }
        Returns: {
          duel_id: string
          message: string
          success: boolean
        }[]
      }
      join_tournament: {
        Args: { p_tournament_id: string }
        Returns: {
          message: string
          success: boolean
        }[]
      }
      level_to_min_age: { Args: { p_level: number }; Returns: number }
      log_notification_result: {
        Args: {
          p_daily_question_id: string
          p_error_message?: string
          p_push_token: string
          p_status: string
          p_user_id: string
        }
        Returns: undefined
      }
      mark_question_seen: {
        Args: {
          p_question_id: string
          p_user_id: string
          p_was_correct?: boolean
        }
        Returns: undefined
      }
      notify_async_duel_event: {
        Args: { p_template: string; p_user_id: string; p_variables: Json }
        Returns: undefined
      }
      notify_user_if_enabled: {
        Args: {
          p_pref_col: string
          p_template: string
          p_user_id: string
          p_variables: Json
        }
        Returns: undefined
      }
      notify_weekly_challenge: {
        Args: { p_template: string }
        Returns: undefined
      }
      pick_next_weekly_theme: {
        Args: never
        Returns: {
          color: string
          created_at: string | null
          description_en: string | null
          description_fr: string | null
          emoji: string
          id: string
          is_active: boolean | null
          label_en: string
          label_fr: string
          last_used_at: string | null
          slug: string
          target_category: string
        }
        SetofOptions: {
          from: "*"
          to: "weekly_challenge_themes"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      recalculate_all_question_difficulties: { Args: never; Returns: number }
      record_answer_and_update_ratings: {
        Args: {
          p_question_id: string
          p_tier?: string
          p_time_ms?: number
          p_user_id: string
          p_was_correct: boolean
        }
        Returns: {
          new_player_skill: number
          new_question_difficulty: number
          skill_change: number
        }[]
      }
      record_audio_question_result: {
        Args: { p_question_id: string; p_was_correct: boolean }
        Returns: undefined
      }
      record_question_outcome: {
        Args: { p_question_id: string; p_was_correct: boolean }
        Returns: undefined
      }
      redeem_referral_code: { Args: { p_code: string }; Returns: Json }
      requalify_question_difficulties: {
        Args: never
        Returns: {
          easier: number
          harder: number
        }[]
      }
      scan_friend_overtakes: { Args: never; Returns: undefined }
      scan_streak_warnings: { Args: never; Returns: undefined }
      start_weekly_replay: { Args: { p_challenge_id: string }; Returns: string }
      submit_async_duel_play: {
        Args: { p_answers: Json; p_duel_id: string; p_total_time_ms: number }
        Returns: Json
      }
      submit_duel_answer: {
        Args: {
          p_answer: string
          p_answer_time_ms: number
          p_duel_id: string
          p_round_number: number
          p_user_id: string
        }
        Returns: {
          correct_answer: string
          is_correct: boolean
          success: boolean
        }[]
      }
      submit_friend_challenge_attempt: {
        Args: {
          p_challenge_code: string
          p_correct_count?: number
          p_player_name?: string
          p_score?: number
          p_total_time_ms?: number
          p_user_id?: string
        }
        Returns: {
          rank: number
          success: boolean
          total_attempts: number
        }[]
      }
      submit_replay_answer: {
        Args: { p_is_correct: boolean; p_position: number; p_replay_id: string }
        Returns: Json
      }
      submit_tournament_result: {
        Args: {
          p_correct_answers: number
          p_score: number
          p_total_time_ms: number
          p_tournament_id: string
        }
        Returns: {
          final_rank: number
          success: boolean
          total_participants: number
        }[]
      }
      submit_weekly_answer: {
        Args: {
          p_challenge_id: string
          p_is_correct: boolean
          p_position: number
        }
        Returns: Json
      }
      use_lifeline: { Args: { p_type: string }; Returns: number }
      use_streak_freeze: { Args: { p_user_id: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
