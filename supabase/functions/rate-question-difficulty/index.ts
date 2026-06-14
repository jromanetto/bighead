// Supabase Edge Function: Rate Question Difficulty (AI cold-start)
//
// Re-rates question difficulty on a 1-6 AGE scale using Claude Haiku, because
// the legacy `difficulty` (1-5) conflates "niche knowledge" with "age" (e.g.
// "lightest chemical element?" sat at level 1). Family mode needs true
// age-appropriateness. Writes `ai_difficulty` (immutable base), `difficulty`
// (effective, = base at cold start) and `min_age` (level->age).
//
// Processes one batch per call (default 50 unrated questions). Drive it in a
// loop until {remaining: 0}. Auth: CRON_SECRET or service role.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;
// Haiku: fast + cheap, plenty for a rating task.
const MODEL = Deno.env.get("ANTHROPIC_RATING_MODEL") ?? "claude-haiku-4-5-20251001";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Row {
  id: string;
  question_text: string;
  correct_answer: string;
  category: string;
  language: string;
}

const SCALE = `Rate each quiz question by the YOUNGEST age at which a GENERAL person
(NOT a fan or specialist of the topic) would reliably know the answer. Judge
how widely known the answer is across the whole population of that age, not how
a hobbyist would feel.

Levels (1-6):
1 = very young child (5-6): everyday basics — the Moon, primary colours, common
    animals, 2+2, a cat says meow.
2 = child (7-8): simple things taught early — continents, basic seasons,
    very famous characters (Mario, Mickey).
3 = pre-teen (9-11): primary-school general knowledge, mainstream pop culture
    a kid that age would know.
4 = teen (12-14): middle-school level, broader general culture, well-known
    history/science/geography.
5 = older teen (15-17): high-school level, more specialised culture, less
    common facts.
6 = adult / expert: niche, specialist, obscure or very technical knowledge a
    general adult would likely NOT know (deep fandom trivia, advanced science,
    rare history).

Key rule: niche fandom or specialist trivia is HIGH (5-6) even if fans find it
easy, because a general person of a young age would not know it. "Lightest
chemical element = hydrogen" is 4-5 (school chemistry), NOT 1. "Naruto's rival's
clan = Uchiha" is 6 (deep fandom). "What shines in the sky at night = the Moon"
is 1.`;

function buildPrompt(rows: Row[]): string {
  const items = rows
    .map(
      (r, i) =>
        `${i}\t[${r.category}/${r.language}] ${r.question_text} → ${r.correct_answer}`,
    )
    .join("\n");
  return `${SCALE}

Rate every item below. Return ONLY a compact JSON object of the form
{"ratings":[{"i":0,"l":3},{"i":1,"l":6}, ...]} with one entry per item, where
"i" is the item index and "l" is the level 1-6. No prose, no extra keys.

Items:
${items}`;
}

async function rateBatch(rows: Row[]): Promise<Map<number, number>> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4000,
      temperature: 0,
      messages: [{ role: "user", content: buildPrompt(rows) }],
    }),
  });
  if (!res.ok) throw new Error(`Claude ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = data.content?.[0]?.text ?? "";
  const match = text.match(/\{[\s\S]*"ratings"[\s\S]*\}/);
  if (!match) throw new Error("No ratings JSON in response");
  const parsed = JSON.parse(match[0]);
  const out = new Map<number, number>();
  for (const r of parsed.ratings ?? []) {
    const i = Number(r.i);
    const l = Math.max(1, Math.min(6, Math.round(Number(r.l))));
    if (Number.isInteger(i) && l >= 1 && l <= 6) out.set(i, l);
  }
  return out;
}

const AGE: Record<number, number> = { 1: 6, 2: 8, 3: 10, 4: 12, 5: 15, 6: 18 };

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

  let batch = 50;
  try {
    const body = await req.json();
    if (body?.batch) batch = Math.max(1, Math.min(100, Number(body.batch)));
  } catch {
    // no body
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const { data, error } = await supabase
    .from("questions")
    .select("id, question_text, correct_answer, category, language")
    .eq("is_active", true)
    .is("ai_difficulty", null)
    .limit(batch);
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const rows = (data ?? []) as Row[];
  if (rows.length === 0) {
    return new Response(JSON.stringify({ rated: 0, remaining: 0, done: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let ratings: Map<number, number>;
  try {
    ratings = await rateBatch(rows);
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let rated = 0;
  for (let i = 0; i < rows.length; i++) {
    const level = ratings.get(i);
    if (!level) continue; // skip unrated items; a later run retries them
    const { error: upErr } = await supabase
      .from("questions")
      .update({
        ai_difficulty: level,
        difficulty: level,
        min_age: AGE[level],
        difficulty_updated_at: new Date().toISOString(),
      })
      .eq("id", rows[i].id);
    if (!upErr) rated++;
  }

  const { count } = await supabase
    .from("questions")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true)
    .is("ai_difficulty", null);

  return new Response(
    JSON.stringify({ rated, remaining: count ?? null, done: (count ?? 1) === 0 }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
