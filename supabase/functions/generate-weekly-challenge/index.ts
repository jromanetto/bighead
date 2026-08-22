// Supabase Edge Function: Generate Weekly Challenge
// Deployed with verify_jwt=false — auth gating relies on URL secrecy +
// the function only creates new challenges, no destructive operations.
// Cron sends `Authorization: Bearer ${get_service_role_jwt()}` (sb_secret_*).
//
// Picks the least-recently-used active theme, generates ~20 bilingual
// (FR + EN) trivia questions via Claude with educational "learning_fact"
// cards, and stores them in `weekly_challenges` + `weekly_challenge_questions`.
//
// Robustesse (fix août 2026) : le validateur ÉCARTE les questions fautives
// (fuite de réponse, champ manquant) au lieu de rejeter tout le lot — un seul
// mauvais item ne fait plus échouer un créneau entier. On garde >= MIN_QUESTIONS.
//
// Triggered every 2 days by pg_cron. Can also be invoked manually for testing:
// POST with optional {"theme_slug": "...", "start_date": "..."}.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANTHROPIC_MODEL = Deno.env.get("ANTHROPIC_MODEL") ?? "claude-sonnet-4-5";

// Cadence : 1 défi tous les 2 jours. On garde au plus QUEUE_BUFFER défis themed
// "upcoming" d'avance ; le cron quotidien complète après chaque clôture.
const QUEUE_BUFFER = 3;
// On demande 20 questions mais on accepte de shipper le lot si au moins
// MIN_QUESTIONS survivent au nettoyage (fuite/champ manquant écartés).
const MIN_QUESTIONS = 15;

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

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function buildPrompt(theme: Theme): string {
  return `You are an expert trivia question writer. Generate exactly 20 bilingual (French + English) multiple-choice trivia questions on the theme: "${theme.label_en}" (FR: "${theme.label_fr}").

Theme description: ${theme.description_en ?? theme.label_en}

DIFFICULTY MIX — MANDATORY, and ordered from easy to hard:
- EXACTLY 10 questions at difficulty 1 (EASY): famous, widely-known facts a casual player recognizes; the 3 wrong answers clearly less plausible so the right one stands out.
- EXACTLY 7 questions at difficulty 2 (MEDIUM): require genuine familiarity with the theme.
- EXACTLY 3 questions at difficulty 3 (HARD): precise, deep-cut facts with close distractors — still 100% verifiable (Wikipedia-grade), never obscure-to-the-point-of-unknowable.
Output them IN THIS ORDER: the 10 easy first, then the 7 medium, then the 3 hard. Set the "difficulty" field correctly (1, 2 or 3) on EACH question.

Requirements per question:
- Each question must have ONE clear correct answer and THREE plausible but unambiguous wrong answers.
- DO NOT reveal the answer in the question text (no "Which is the largest planet, Jupiter or Mars?"). The correct answer word/phrase must NOT appear anywhere in the question text, in EITHER language.
- Cover diverse sub-topics within the theme — avoid clustering on one aspect.
- The "learning_fact" is a short (1-2 sentence) interesting educational fact about the correct answer, NOT a repetition of the question. It teaches the user something new.
- All four answer options should be of similar length and grammatical form so the correct one is not obvious by shape alone.
- Use proper French (avec accents) and proper English.

CRITICAL — SELF-CHECK before including each question (real hallucinations have shipped — be paranoid):
1. CONSISTENCY: re-read your own learning_fact. If it implies a different answer than your correct_answer, DISCARD this question.
2. ETYMOLOGY: only generate name-origin / etymology questions when the etymology is well-documented (Wikipedia-grade). If unsure, skip.
3. DATES & RECORDS: be precise. If you can't pin down a year/record with confidence, choose a different angle.
4. VERIFIABILITY: every fact must be one a knowledgeable human could verify on Wikipedia. If you're guessing, skip.
5. ANSWER ALIGNMENT: the correct_answer must be the ONLY answer that fits both the question AND the learning_fact.
6. NO LEAK: the correct answer must never appear in the question text (FR or EN).
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

// Nettoie un lot : ÉCARTE (n'échoue pas sur) les questions fautives — champ
// manquant, mauvais nombre de distracteurs, difficulté invalide, ou fuite de la
// réponse dans l'énoncé (FR ou EN). Retourne les questions valides.
function sanitizeQuestions(qs: BilingualQuestion[]): BilingualQuestion[] {
  if (!Array.isArray(qs)) return [];
  const valid: BilingualQuestion[] = [];
  for (const q of qs) {
    if (!q) continue;
    const required = [
      "question_fr", "correct_answer_fr", "wrong_answers_fr",
      "question_en", "correct_answer_en", "wrong_answers_en",
    ];
    let ok = true;
    for (const key of required) {
      // @ts-ignore dynamic field check
      const v = q[key];
      if (!v || (Array.isArray(v) && v.length === 0)) { ok = false; break; }
    }
    if (!ok) continue;
    if (!Array.isArray(q.wrong_answers_fr) || q.wrong_answers_fr.length !== 3) continue;
    if (!Array.isArray(q.wrong_answers_en) || q.wrong_answers_en.length !== 3) continue;
    if (![1, 2, 3].includes(q.difficulty)) continue;
    // Fuite : la réponse correcte ne doit pas apparaître dans l'énoncé (FR/EN).
    const caFr = (q.correct_answer_fr || "").toLowerCase();
    if (caFr.length > 3 && (q.question_fr || "").toLowerCase().includes(caFr)) continue;
    const caEn = (q.correct_answer_en || "").toLowerCase();
    if (caEn.length > 3 && (q.question_en || "").toLowerCase().includes(caEn)) continue;
    valid.push(q);
  }
  return valid;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

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

  // Marque un défi en échec SANS le laisser bloquer son créneau : status='failed'
  // (le dedup guard ne matche que upcoming/active), donc le prochain run réessaie.
  async function markFailed(id: string, reason: string) {
    await supabase.from("weekly_challenges").update({
      generation_status: "failed",
      status: "failed",
      generation_error: reason.slice(0, 500),
    }).eq("id", id);
  }

  try {
    let forcedThemeSlug: string | null = null;
    let forceStartDate: string | null = null;
    if (req.method === "POST") {
      try {
        const body = await req.json();
        forcedThemeSlug = body?.theme_slug ?? null;
        forceStartDate = body?.start_date ?? null;
      } catch (_) {
        // empty body OK
      }
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

    // 2. Cadence : un nouveau défi tous les 2 jours (fenêtre start .. start+1).
    const now = new Date();
    let start: Date;
    if (forceStartDate) {
      start = new Date(forceStartDate + "T00:00:00Z");
    } else {
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
    end.setUTCDate(end.getUTCDate() + 1); // fenêtre de 2 jours
    const startStr = isoDate(start);

    // 2b. Dedup guard: skip si un défi themed READY/en cours existe déjà pour ce
    // créneau. On ignore volontairement les 'failed' pour permettre le retry.
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
          skipped: "themed challenge already exists for this slot",
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
        target_difficulty: null,
        start_date: isoDate(start),
        end_date: isoDate(end),
        status: "upcoming",
        generation_status: "generating",
      })
      .select()
      .single();
    if (insErr || !challenge) throw new Error(`insert challenge failed: ${insErr?.message}`);

    // 4. Génération via Claude — jusqu'à 2 lots, on garde le meilleur nettoyé.
    let valid: BilingualQuestion[] = [];
    let genError: string | null = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const questions = await callClaude(buildPrompt(theme));
        const cleaned = sanitizeQuestions(questions);
        if (cleaned.length > valid.length) valid = cleaned;
        if (valid.length >= 20) break; // lot parfait, inutile de retenter
      } catch (e: any) {
        genError = e?.message ?? String(e);
      }
    }

    if (valid.length < MIN_QUESTIONS) {
      const reason = genError
        ? `generation error: ${genError}`
        : `only ${valid.length} valid questions after sanitize (min ${MIN_QUESTIONS})`;
      await markFailed(challenge.id, reason);
      throw new Error(`Validation failed: ${reason}`);
    }

    // 5. Insert questions — triées facile → difficile.
    const ordered = [...valid].sort((a, b) => a.difficulty - b.difficulty);
    const rows = ordered.map((q, idx) => ({
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
      await markFailed(challenge.id, `insert questions failed: ${qErr.message}`);
      throw new Error(`insert questions failed: ${qErr.message}`);
    }

    // 6. Mark ready + activate if start_date is today or earlier
    const todayStr = isoDate(new Date());
    const finalStatus = challenge.start_date <= todayStr ? "active" : "upcoming";

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
