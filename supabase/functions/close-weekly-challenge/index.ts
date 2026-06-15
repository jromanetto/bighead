// Supabase Edge Function: Close Weekly Challenge
// Deployed with verify_jwt=false — auth gating relies on URL secrecy +
// idempotency of the logic (we accept calls only from pg_cron internally).
// Cron sends `Authorization: Bearer ${get_service_role_jwt()}` (sb_secret_*).
//
// Triggered weekly by pg_cron (Sunday 23:00 UTC) BEFORE the new one is
// generated. Closes EVERY currently `active` challenge (there can be a
// 'themed' AND a 'news' one running in parallel):
//   - sets status to `closed`, awards completion XP + badges to players;
//   - for challenge_type='themed': mirrors the bilingual questions into the
//     main `questions` table (one FR row + one EN row each) using the theme's
//     target_category;
//   - for challenge_type='news': SKIPS question migration (news questions go
//     stale and would pollute the general DB);
//   - marks the challenge `archived`.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WCQuestion {
  id: string;
  challenge_id: string;
  position: number;
  difficulty: number;
  question_fr: string;
  correct_answer_fr: string;
  wrong_answers_fr: string[];
  learning_fact_fr: string | null;
  question_en: string;
  correct_answer_en: string;
  wrong_answers_en: string[];
  learning_fact_en: string | null;
  image_url: string | null;
  image_credit: string | null;
}

function badgeFor(correctCount: number): string | null {
  if (correctCount >= 27) return "expert";   // 90%+
  if (correctCount >= 24) return "advanced"; // 80%+
  if (correctCount >= 18) return "good";     // 60%+
  return null;
}

function xpFor(correctCount: number, dayStreak: number): number {
  const base = correctCount * 10;
  const streakBonus = Math.min(dayStreak, 7) * 15;
  const perfectBonus = correctCount >= 30 ? 200 : 0;
  return base + streakBonus + perfectBonus;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // Auth gate: only the cron (sends CRON_SECRET) or service role may run this.
  // Previously relied on URL secrecy (no auth) — a public, guessable endpoint
  // that could trigger LLM generation / close challenges.
  {
    const cronSecret = Deno.env.get("CRON_SECRET");
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    const ok = (cronSecret && token === cronSecret) ||
      token === Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!ok) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    let forcedId: string | null = null;
    if (req.method === "POST") {
      try {
        const body = await req.json();
        forcedId = body?.challenge_id ?? null;
      } catch (_) { /* empty body OK */ }
    }

    // 1. Find the challenge(s) to close. There can be BOTH a themed and a news
    //    challenge active simultaneously, so we process all of them.
    let query = supabase.from("weekly_challenges").select("*");
    if (forcedId) {
      query = query.eq("id", forcedId);
    } else {
      query = query.eq("status", "active").order("end_date", { ascending: true });
    }
    const { data: challenges, error: selErr } = await query;
    if (selErr) throw new Error(`select active challenge: ${selErr.message}`);
    if (!challenges || challenges.length === 0) {
      return new Response(JSON.stringify({ success: true, skipped: "no active challenge" }), {
        status: 200,
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    const results: Array<Record<string, unknown>> = [];

    for (const challenge of challenges) {
      const isNews = challenge.challenge_type === "news";

      // 2. Mark closed
      await supabase.from("weekly_challenges")
        .update({ status: "closed", closed_at: new Date().toISOString() })
        .eq("id", challenge.id);

      // 3. Award final XP + badge per player (BOTH types).
      const { data: progress, error: pErr } = await supabase
        .from("weekly_challenge_progress")
        .select("id, user_id, correct_count, best_day_streak, final_xp_awarded")
        .eq("challenge_id", challenge.id);
      if (pErr) throw new Error(`fetch progress: ${pErr.message}`);

      let totalAwarded = 0;
      for (const p of progress ?? []) {
        if (p.final_xp_awarded > 0) continue;
        const xp = xpFor(p.correct_count, p.best_day_streak);
        const badge = badgeFor(p.correct_count);
        const { error: xpErr } = await supabase.rpc("award_xp", {
          p_user_id: p.user_id,
          p_amount: xp,
          p_source: "challenge",
          p_metadata: {
            weekly_challenge_id: challenge.id,
            theme: challenge.theme_slug,
            challenge_type: challenge.challenge_type,
            correct_count: p.correct_count,
            badge,
          },
          p_dedupe_key: `weekly_${challenge.id}`,
        });
        if (xpErr) {
          console.error(`award_xp failed for user ${p.user_id}:`, xpErr.message);
          continue;
        }
        await supabase.from("weekly_challenge_progress")
          .update({
            final_score: p.correct_count,
            final_xp_awarded: xp,
            badge_earned: badge,
          })
          .eq("id", p.id);
        totalAwarded++;
      }

      // 4. Migrate questions to main `questions` table — THEMED ONLY.
      //    News questions go stale; skip migration so they don't pollute the
      //    general DB.
      let migratedCount = 0;
      if (!isNews) {
        const { data: wcQs, error: wqErr } = await supabase
          .from("weekly_challenge_questions")
          .select("*")
          .eq("challenge_id", challenge.id)
          .order("position");
        if (wqErr) throw new Error(`fetch wc questions: ${wqErr.message}`);

        for (const q of (wcQs ?? []) as WCQuestion[]) {
          // Skip if already migrated
          if (q.archived_question_id_fr && q.archived_question_id_en) continue;

          const baseRow = {
            category: challenge.target_category,
            difficulty: q.difficulty,
            image_url: q.image_url,
            image_credit: q.image_credit,
            is_active: true,
          };

          const frRow = {
            ...baseRow,
            question_text: q.question_fr,
            correct_answer: q.correct_answer_fr,
            wrong_answers: q.wrong_answers_fr,
            explanation: q.learning_fact_fr,
            language: "fr",
          };
          const enRow = {
            ...baseRow,
            question_text: q.question_en,
            correct_answer: q.correct_answer_en,
            wrong_answers: q.wrong_answers_en,
            explanation: q.learning_fact_en,
            language: "en",
          };

          const { data: insFr, error: frErr } = await supabase.from("questions").insert(frRow).select("id").single();
          const { data: insEn, error: enErr } = await supabase.from("questions").insert(enRow).select("id").single();
          if (frErr || enErr) {
            console.error(`migrate q ${q.position}: fr=${frErr?.message} en=${enErr?.message}`);
            continue;
          }

          await supabase.from("weekly_challenge_questions").update({
            archived_question_id_fr: insFr?.id,
            archived_question_id_en: insEn?.id,
          }).eq("id", q.id);
          migratedCount++;
        }
      }

      // 5. Final state : archived
      await supabase.from("weekly_challenges")
        .update({ status: "archived", archived_at: new Date().toISOString() })
        .eq("id", challenge.id);

      results.push({
        challenge_id: challenge.id,
        theme: challenge.theme_slug,
        challenge_type: challenge.challenge_type,
        players_awarded: totalAwarded,
        questions_migrated: migratedCount,
        migration_skipped: isNews,
        target_category: challenge.target_category,
      });
    }

    return new Response(JSON.stringify({
      success: true,
      closed: results.length,
      challenges: results,
    }), {
      status: 200,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  } catch (err: any) {
    console.error("close-weekly-challenge error:", err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }
});
