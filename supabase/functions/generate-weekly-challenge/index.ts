// Supabase Edge Function: Generate Weekly Challenge
// Deployed with verify_jwt=false — auth gating relies on URL secrecy +
// the function only creates new challenges, no destructive operations.
// Cron sends `Authorization: Bearer ${get_service_role_jwt()}` (sb_secret_*).
//
// Picks the least-recently-used active theme, generates 20 bilingual
// (FR + EN) trivia questions via Claude Sonnet 4.6 with educational
// "learning_fact" cards, and stores them in `weekly_challenges` +
// `weekly_challenge_questions`.
//
// Triggered weekly by pg_cron (Sunday 23:30 UTC). Can also be invoked
// manually for testing : POST /generate-weekly-challenge with optional
// {"theme_slug": "..."} body to force a specific theme.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANTHROPIC_MODEL = Deno.env.get("ANTHROPIC_MODEL") ?? "claude-sonnet-4-5";

// Cadence : 1 défi tous les 2 jours. On garde au plus QUEUE_BUFFER défis themed
// "upcoming" d'avance ; le cron quotidien complète après chaque clôture.
const QUEUE_BUFFER = 3;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Theme {
  slug: string;
  label_fr: string;
  label_en: string;
  description_fr: string | null;
  description_en: string | null;
  emoji: string;
  color: string;
  target_category: string;
}

interface BilingualQuestion {
  difficulty: 1 | 2 | 3;
  question_fr: string;
  correct_answer_fr: string;
  wrong_answers_fr: string[];
  learning_fact_fr: string;
  question_en: string;
  correct_answer_en: string;
  wrong_answers_en: string[];
  learning_fact_en: string;
}

function getNextMonday(from: Date): Date {
  const d = new Date(from);
  const day = d.getUTCDay();
  const daysUntilMonday = day === 0 ? 1 : (8 - day) % 7 || 7;
  d.setUTCDate(d.getUTCDate() + daysUntilMonday);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

const DIFFICULTY_SPEC: Record<number, { name: string; dist: string; tone: string }> = {
  1: {
    name: "EASY / ACCESSIBLE",
    dist: "16 easy (level 1), 4 medium (level 2), 0 hard",
    tone:
      "Target a casual player: famous, widely-known facts most people recognize. The three wrong answers should be clearly less plausible so the right one stands out.",
  },
  2: {
    name: "MEDIUM",
    dist: "5 easy (level 1), 11 medium (level 2), 4 hard (level 3)",
    tone: "Balanced: a fair amount require genuine familiarity with the theme.",
  },
  3: {
    name: "HARD / EXPERT",
    dist: "0 easy, 6 medium (level 2), 14 hard (level 3)",
    tone:
      "For enthusiasts: precise, deep-cut facts, close distractors. Still 100% verifiable (Wikipedia-grade) — hard, never obscure-to-the-point-of-unknowable.",
  },
};

function buildPrompt(theme: Theme, difficulty: number): string {
  const spec = DIFFICULTY_SPEC[difficulty] ?? DIFFICULTY_SPEC[2];
  return `You are an expert trivia question writer. Generate exactly 20 bilingual (French + English) multiple-choice trivia questions on the theme: "${theme.label_en}" (FR: "${theme.label_fr}").

Theme description: ${theme.description_en ?? theme.label_en}

OVERALL DIFFICULTY: ${spec.name}. ${spec.tone}
Difficulty distribution: ${spec.dist}.

Requirements per question:
- Each question must have ONE clear correct answer and THREE plausible but unambiguous wrong answers.
- DO NOT reveal the answer in the question text (no "Which is the largest planet, Jupiter or Mars?").
- Cover diverse sub-topics within the theme — avoid clustering on one aspect.
- The "learning_fact" is a short (1-2 sentence) interesting educational fact about the correct answer, NOT a repetition of the question. It teaches the user something new.
- All four answer options should be of similar length and grammatical form so the correct one is not obvious by shape alone.
- Use proper French (avec accents) and proper English.

CRITICAL — SELF-CHECK before including each question (real hallucinations have shipped — be paranoid):
1. CONSISTENCY: re-read your own learning_fact. If it implies a different answer than your correct_answer, DISCARD this question (real example: Q said "Korean brand named after Seoul → Kia" while the fact said "Kia means 'rising out of Asia'" — contradiction).
2. ETYMOLOGY: only generate name-origin / etymology questions when the etymology is well-documented (Wikipedia-grade). If unsure, skip (real example: "Volvo = Latin for iron → Volvo" is wrong; volvo means "I roll" from volvere, iron is ferrum).
3. DATES & RECORDS: be precise. If you can't pin down a year/record with confidence, choose a different angle.
4. VERIFIABILITY: every fact must be one a knowledgeable human could verify on Wikipedia. If you're guessing, skip.
5. ANSWER ALIGNMENT: the correct_answer must be the ONLY answer that fits both the question AND the learning_fact.
If a question fails any check, generate a different one. Quality > quantity, but still output 20.

Return STRICT JSON ONLY, no markdown, no commentary, in this exact shape:

{
  "questions": [
    {
      "difficulty": 1,
      "question_fr": "...",
      "correct_answer_fr": "...",
      "wrong_answers_fr": ["...", "...", "..."],
      "learning_fact_fr": "...",
      "question_en": "...",
      "correct_answer_en": "...",
      "wrong_answers_en": ["...", "...", "..."],
      "learning_fact_en": "..."
    },
    ... 19 more
  ]
}

The "questions" array must contain EXACTLY 20 objects.`;
}

// Claude renvoie occasionnellement du JSON légèrement malformé (virgule/quote
// manquante). On retente quelques fois avant d'abandonner — sinon un créneau
// reste vide alors qu'on génère tous les 2 jours sans surveillance.
async function callClaude(prompt: string, attempts = 3): Promise<BilingualQuestion[]> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await callClaudeOnce(prompt);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

async function callClaudeOnce(prompt: string): Promise<BilingualQuestion[]> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 16000,
      temperature: 0.7,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) {
    throw new Error(`Claude API ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  const text = data.content?.[0]?.text ?? "";
  const jsonMatch = text.match(/\{[\s\S]*"questions"[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON object found in Claude response");
  const parsed = JSON.parse(jsonMatch[0]);
  if (!Array.isArray(parsed.questions)) throw new Error("Missing 'questions' array");
  return parsed.questions;
}

function validateQuestions(qs: BilingualQuestion[]): string | null {
  if (qs.length !== 20) return `expected 20 questions, got ${qs.length}`;
  for (let i = 0; i < qs.length; i++) {
    const q = qs[i];
    const required = [
      "question_fr",
      "correct_answer_fr",
      "wrong_answers_fr",
      "question_en",
      "correct_answer_en",
      "wrong_answers_en",
    ];
    for (const key of required) {
      // @ts-ignore dynamic field check
      if (!q[key] || (Array.isArray(q[key]) && q[key].length === 0)) {
        return `question ${i + 1}: missing or empty field "${key}"`;
      }
    }
    if (!Array.isArray(q.wrong_answers_fr) || q.wrong_answers_fr.length !== 3) {
      return `question ${i + 1}: wrong_answers_fr must have exactly 3 items`;
    }
    if (!Array.isArray(q.wrong_answers_en) || q.wrong_answers_en.length !== 3) {
      return `question ${i + 1}: wrong_answers_en must have exactly 3 items`;
    }
    if (![1, 2, 3].includes(q.difficulty)) {
      return `question ${i + 1}: invalid difficulty ${q.difficulty}`;
    }
    // Light leak check : correct answer should not appear in question text
    const lowerQFr = (q.question_fr || "").toLowerCase();
    if (lowerQFr.includes((q.correct_answer_fr || "").toLowerCase()) && q.correct_answer_fr.length > 3) {
      return `question ${i + 1}: French answer leaks into the question`;
    }
  }
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

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
    let forcedThemeSlug: string | null = null;
    let forceStartDate: string | null = null;
    let forcedDifficulty: number | null = null;
    if (req.method === "POST") {
      try {
        const body = await req.json();
        forcedThemeSlug = body?.theme_slug ?? null;
        forceStartDate = body?.start_date ?? null;
        forcedDifficulty = typeof body?.target_difficulty === "number" ? body.target_difficulty : null;
      } catch (_) {
        // empty body OK
      }
    }

    // Niveau de difficulté du défi : explicite (body) sinon rotation
    // facile→moyen→difficile à partir du dernier défi themed généré.
    let targetDifficulty: number;
    if (forcedDifficulty && forcedDifficulty >= 1 && forcedDifficulty <= 3) {
      targetDifficulty = forcedDifficulty;
    } else {
      const { data: lastDiff } = await supabase
        .from("weekly_challenges")
        .select("target_difficulty")
        .eq("challenge_type", "themed")
        .not("target_difficulty", "is", null)
        .order("start_date", { ascending: false })
        .limit(1)
        .maybeSingle();
      const prev = lastDiff?.target_difficulty ?? 0;
      targetDifficulty = (prev % 3) + 1; // 1→2→3→1
    }

    // 1. Pick theme
    let theme: Theme;
    if (forcedThemeSlug) {
      const { data, error } = await supabase
        .from("weekly_challenge_themes")
        .select("*")
        .eq("slug", forcedThemeSlug)
        .single();
      if (error || !data) throw new Error(`Theme not found: ${forcedThemeSlug}`);
      theme = data as Theme;
    } else {
      const { data, error } = await supabase.rpc("pick_next_weekly_theme");
      if (error || !data) throw new Error(`pick_next_weekly_theme failed: ${error?.message}`);
      theme = data as Theme;
    }

    // 2. Cadence : un nouveau défi tous les 2 jours. La fenêtre fait 2 jours
    //    (start et start+1). On remplit une file tampon (QUEUE_BUFFER) puis on
    //    s'arrête, le cron quotidien complète au fur et à mesure des clôtures.
    const now = new Date();
    let start: Date;
    if (forceStartDate) {
      start = new Date(forceStartDate + "T00:00:00Z");
    } else {
      // Tampon : ne pas sur-générer. Stop si assez de défis themed à venir.
      const { data: upcoming } = await supabase
        .from("weekly_challenges")
        .select("id")
        .eq("challenge_type", "themed")
        .eq("status", "upcoming")
        .eq("generation_status", "ready");
      if ((upcoming?.length ?? 0) >= QUEUE_BUFFER) {
        return new Response(
          JSON.stringify({ success: true, skipped: `queue full (${upcoming?.length} upcoming)` }),
          { status: 200, headers: { ...corsHeaders, "content-type": "application/json" } },
        );
      }
      // Prochain créneau = lendemain du dernier défi themed programmé, sinon aujourd'hui.
      const { data: latest } = await supabase
        .from("weekly_challenges")
        .select("end_date")
        .eq("challenge_type", "themed")
        .in("status", ["active", "upcoming"])
        .order("end_date", { ascending: false })
        .limit(1)
        .maybeSingle();
      start = latest?.end_date ? new Date(latest.end_date + "T00:00:00Z") : new Date(now);
      start.setUTCHours(0, 0, 0, 0);
      if (latest?.end_date) start.setUTCDate(start.getUTCDate() + 1);
    }
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1); // fenêtre de 2 jours : start et start+1
    const startStr = isoDate(start);

    // 2b. Dedup guard: when triggered by cron (no force* args), skip if a themed
    // challenge already exists for this start_date — avoids duplicates when the
    // next week's challenge was pre-generated manually.
    if (!forcedThemeSlug && !forceStartDate) {
      const { data: existing } = await supabase
        .from("weekly_challenges")
        .select("id, theme_slug")
        .eq("challenge_type", "themed")
        .eq("start_date", startStr)
        .in("status", ["upcoming", "active"]);
      if (existing && existing.length > 0) {
        return new Response(JSON.stringify({
          success: true,
          skipped: "themed challenge already exists for this week",
          existing_id: existing[0].id,
          existing_theme: existing[0].theme_slug,
        }), {
          status: 200,
          headers: { ...corsHeaders, "content-type": "application/json" },
        });
      }
    }

    // 3. Create challenge row (status=upcoming, generation=generating)
    const { data: challenge, error: insErr } = await supabase
      .from("weekly_challenges")
      .insert({
        theme_slug: theme.slug,
        theme_label_fr: theme.label_fr,
        theme_label_en: theme.label_en,
        description_fr: theme.description_fr,
        description_en: theme.description_en,
        emoji: theme.emoji,
        color: theme.color,
        target_category: theme.target_category,
        target_difficulty: targetDifficulty,
        start_date: isoDate(start),
        end_date: isoDate(end),
        status: "upcoming",
        generation_status: "generating",
      })
      .select()
      .single();
    if (insErr || !challenge) throw new Error(`insert challenge failed: ${insErr?.message}`);

    // 4. Generate via Claude
    let questions: BilingualQuestion[];
    try {
      questions = await callClaude(buildPrompt(theme, targetDifficulty));
    } catch (e: any) {
      await supabase.from("weekly_challenges").update({
        generation_status: "failed",
        generation_error: e.message?.slice(0, 500),
      }).eq("id", challenge.id);
      throw e;
    }

    const validationError = validateQuestions(questions);
    if (validationError) {
      await supabase.from("weekly_challenges").update({
        generation_status: "failed",
        generation_error: validationError,
      }).eq("id", challenge.id);
      throw new Error(`Validation failed: ${validationError}`);
    }

    // 5. Insert questions
    const rows = questions.map((q, idx) => ({
      challenge_id: challenge.id,
      position: idx + 1,
      difficulty: q.difficulty,
      question_fr: q.question_fr,
      correct_answer_fr: q.correct_answer_fr,
      wrong_answers_fr: q.wrong_answers_fr,
      learning_fact_fr: q.learning_fact_fr,
      question_en: q.question_en,
      correct_answer_en: q.correct_answer_en,
      wrong_answers_en: q.wrong_answers_en,
      learning_fact_en: q.learning_fact_en,
    }));

    const { error: qErr } = await supabase.from("weekly_challenge_questions").insert(rows);
    if (qErr) {
      await supabase.from("weekly_challenges").update({
        generation_status: "failed",
        generation_error: qErr.message?.slice(0, 500),
      }).eq("id", challenge.id);
      throw new Error(`insert questions failed: ${qErr.message}`);
    }

    // 6. Mark ready + activate if start_date is today or earlier
    const todayStr = isoDate(new Date());
    const finalStatus = challenge.start_date <= todayStr ? "active" : "upcoming";

    // total_questions defaults to 30 in the schema; set it to the real count
    // (now 20 for themed) so the UI progress bar / "x/total" are correct.
    await supabase.from("weekly_challenges").update({
      generation_status: "ready",
      status: finalStatus,
      total_questions: rows.length,
    }).eq("id", challenge.id);

    // 7. Mark theme as used
    await supabase.from("weekly_challenge_themes")
      .update({ last_used_at: new Date().toISOString() })
      .eq("slug", theme.slug);

    return new Response(JSON.stringify({
      success: true,
      challenge_id: challenge.id,
      theme: theme.slug,
      start_date: challenge.start_date,
      end_date: challenge.end_date,
      status: finalStatus,
      questions_inserted: rows.length,
    }), {
      status: 200,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  } catch (err: any) {
    console.error("generate-weekly-challenge error:", err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }
});
