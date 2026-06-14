// Supabase Edge Function: Generate Kid Questions
//
// The AI re-rating revealed the library is mostly adult trivia: only ~8% sits
// at levels 1-2 (ages 5-8), so Family mode for young kids has a thin pool.
// This generates fresh, genuinely-easy bilingual (FR+EN) questions at level
// 1-2 and inserts them into the main `questions` table with consistent
// difficulty / min_age / ai_difficulty. One category per call; drive in a loop.
//
// Auth: CRON_SECRET or service role.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;
const MODEL = Deno.env.get("ANTHROPIC_MODEL") ?? "claude-sonnet-4-5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface KidQ {
  level: number; // 1 or 2
  fr: { q: string; correct: string; wrong: string[]; why: string };
  en: { q: string; correct: string; wrong: string[]; why: string };
}

function buildPrompt(category: string, count: number, avoid: string[]): string {
  return `You write quiz questions for VERY YOUNG children (ages 5 to 8) for a
family quiz game. Generate EXACTLY ${count} questions in the category "${category}".

Hard rules:
- A 5-to-8 year old must be able to answer from everyday life: animals, colours,
  the body, food, weather, seasons, very common nature/science, counting,
  famous kid characters. NO niche trivia, NO dates, NO specialists.
- Each question: 1 correct answer + 3 wrong answers. The wrong answers must be
  clearly wrong to a child but still plausible (same kind of thing), never
  trick answers.
- Fully bilingual: a French version AND an English version of the same question.
- "level": 1 for the very easiest (age 5-6), 2 for slightly older (7-8).
- A one-sentence kid-friendly explanation ("why") in each language.
- Keep questions short and concrete. Vary the topics; do NOT repeat ideas.
${avoid.length ? `- Do NOT generate any of these existing questions:\n${avoid.map((a) => `  • ${a}`).join("\n")}` : ""}

Return ONLY this JSON, nothing else:
{"questions":[{"level":1,"fr":{"q":"...","correct":"...","wrong":["...","...","..."],"why":"..."},"en":{"q":"...","correct":"...","wrong":["...","...","..."],"why":"..."}}]}
The array must contain EXACTLY ${count} objects.`;
}

async function callClaude(prompt: string): Promise<KidQ[]> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 8000,
      temperature: 0.8,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Claude ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = data.content?.[0]?.text ?? "";
  const match = text.match(/\{[\s\S]*"questions"[\s\S]*\}/);
  if (!match) throw new Error("No questions JSON");
  const parsed = JSON.parse(match[0]);
  if (!Array.isArray(parsed.questions)) throw new Error("Missing questions array");
  return parsed.questions;
}

const AGE: Record<number, number> = { 1: 6, 2: 8 };

function validSide(s: KidQ["fr"]): boolean {
  return (
    !!s &&
    typeof s.q === "string" && s.q.length > 4 &&
    typeof s.correct === "string" && s.correct.length > 0 &&
    Array.isArray(s.wrong) && s.wrong.length === 3 &&
    s.wrong.every((w) => typeof w === "string" && w.length > 0)
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const cronSecret = Deno.env.get("CRON_SECRET");
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!((cronSecret && token === cronSecret) || token === SERVICE_ROLE_KEY)) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let category = "general";
  let count = 15;
  try {
    const body = await req.json();
    if (body?.category) category = String(body.category);
    if (body?.count) count = Math.max(1, Math.min(25, Number(body.count)));
  } catch {
    // defaults
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // A few existing easy questions in this category, to steer away from dupes.
  const { data: existing } = await supabase
    .from("questions")
    .select("question_text")
    .eq("category", category)
    .eq("language", "fr")
    .lte("min_age", 8)
    .limit(20);
  const avoid = (existing ?? []).map((r) => r.question_text as string);

  let generated: KidQ[];
  try {
    generated = await callClaude(buildPrompt(category, count, avoid));
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const rows: Record<string, unknown>[] = [];
  for (const item of generated) {
    const level = item.level === 1 ? 1 : 2;
    if (!validSide(item.fr) || !validSide(item.en)) continue;
    const base = {
      category,
      difficulty: level,
      ai_difficulty: level,
      min_age: AGE[level],
      is_active: true,
    };
    rows.push({
      ...base,
      language: "fr",
      question_text: item.fr.q.trim(),
      correct_answer: item.fr.correct.trim(),
      wrong_answers: item.fr.wrong.map((w) => w.trim()),
      explanation: item.fr.why?.trim() ?? null,
    });
    rows.push({
      ...base,
      language: "en",
      question_text: item.en.q.trim(),
      correct_answer: item.en.correct.trim(),
      wrong_answers: item.en.wrong.map((w) => w.trim()),
      explanation: item.en.why?.trim() ?? null,
    });
  }

  // Skip exact-text duplicates already present (case-insensitive).
  const texts = rows.map((r) => (r.question_text as string).toLowerCase());
  const { data: dupes } = await supabase
    .from("questions")
    .select("question_text")
    .in("question_text", rows.map((r) => r.question_text as string));
  const dupeSet = new Set(
    (dupes ?? []).map((d) => (d.question_text as string).toLowerCase()),
  );
  const fresh = rows.filter(
    (r) => !dupeSet.has((r.question_text as string).toLowerCase()),
  );
  // also drop in-batch dup texts
  const seen = new Set<string>();
  const toInsert = fresh.filter((r) => {
    const k = (r.question_text as string).toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  let inserted = 0;
  if (toInsert.length > 0) {
    const { error, count: c } = await supabase
      .from("questions")
      .insert(toInsert, { count: "exact" });
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    inserted = c ?? toInsert.length;
  }

  return new Response(
    JSON.stringify({
      category,
      generated: generated.length,
      inserted, // rows (FR+EN), so ~2x questions
      skipped_dupes: rows.length - toInsert.length,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
