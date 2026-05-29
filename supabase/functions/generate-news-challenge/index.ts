// Supabase Edge Function: Generate News Challenge
// Deployed with verify_jwt=false — auth gating relies on URL secrecy +
// the function only creates new challenges, no destructive operations.
// Cron sends `Authorization: Bearer ${get_service_role_jwt()}` (sb_secret_*).
//
// Builds a weekly "This Week in News" quiz from Wikipedia Current Events.
// Pulls the past 7 daily portal pages, keeps ONLY positive/neutral event
// categories (sports, science/tech, arts/culture, business, elections,
// international agreements), explicitly DROPS war/death/disaster/crime/health,
// then asks Claude Sonnet to generate 8-15 bilingual (FR + EN) trivia
// questions. Stores them as a challenge_type='news' row.
//
// Triggered weekly by pg_cron (Monday 08:00 UTC). Can be invoked manually
// for testing : POST /generate-news-challenge with an empty body.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANTHROPIC_MODEL = Deno.env.get("ANTHROPIC_MODEL") ?? "claude-sonnet-4-5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Section headers we KEEP (positive / neutral). Matched case-insensitively as
// substrings against the wikitext section title.
const INCLUDE_SECTIONS = [
  "sports",
  "science and technology",
  "arts and culture",
  "business and economy",
  "politics and elections",
  "international relations",
];

// Section headers we DROP entirely (sensitive). Checked first; if a section
// title matches any of these, the whole section is skipped.
const EXCLUDE_SECTIONS = [
  "armed conflicts and attacks",
  "disasters and accidents",
  "law and crime",
  "health and environment",
];

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// Monday of the ISO week containing `d` (UTC).
function getMondayOf(d: Date): Date {
  const r = new Date(d);
  const day = r.getUTCDay(); // 0=Sun..6=Sat
  const diff = day === 0 ? -6 : 1 - day;
  r.setUTCDate(r.getUTCDate() + diff);
  r.setUTCHours(0, 0, 0, 0);
  return r;
}

// ISO 8601 week number + year.
function isoWeek(d: Date): { year: number; week: number } {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((t.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { year: t.getUTCFullYear(), week };
}

// Strip MediaWiki markup from a single line down to readable plaintext.
function stripWiki(line: string): string {
  let s = line;
  // <ref>...</ref> blocks
  s = s.replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, "");
  s = s.replace(/<ref[^>]*\/>/gi, "");
  // {{templates}} (e.g. citations, flags)
  s = s.replace(/\{\{[^{}]*\}\}/g, "");
  s = s.replace(/\{\{[^{}]*\}\}/g, ""); // second pass for simple nesting
  // [[link|text]] -> text ; [[link]] -> link
  s = s.replace(/\[\[([^\]|]*)\|([^\]]*)\]\]/g, "$2");
  s = s.replace(/\[\[([^\]]*)\]\]/g, "$1");
  // [http://url text] -> text ; [http://url] -> ""
  s = s.replace(/\[https?:\/\/\S+\s+([^\]]*)\]/g, "$1");
  s = s.replace(/\[https?:\/\/\S+\]/g, "");
  // bold/italics
  s = s.replace(/'''''/g, "").replace(/'''/g, "").replace(/''/g, "");
  // remaining html tags
  s = s.replace(/<[^>]+>/g, "");
  // leading bullets/asterisks/colons
  s = s.replace(/^[\*#:;\s]+/, "");
  // collapse whitespace
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

// Fetch one daily Current Events page and return the kept (non-sensitive)
// event lines. Also returns how many lines were dropped for sensitivity.
async function fetchDayEvents(
  d: Date,
): Promise<{ kept: string[]; dropped: number }> {
  const y = d.getUTCFullYear();
  const month = MONTHS[d.getUTCMonth()];
  const day = String(d.getUTCDate()); // no leading zero
  const pageTitle = `Portal%3ACurrent_events%2F${y}_${month}_${day}`;
  const url =
    `https://en.wikipedia.org/w/api.php?action=parse&page=${pageTitle}` +
    `&prop=wikitext&format=json&formatversion=2`;

  const res = await fetch(url, {
    headers: { "User-Agent": "BigHead/1.0 (https://bighead.app)" },
  });
  if (!res.ok) return { kept: [], dropped: 0 };
  const data = await res.json();
  const wikitext: string = data?.parse?.wikitext ?? "";
  if (!wikitext) return { kept: [], dropped: 0 };

  const lines = wikitext.split("\n");
  const kept: string[] = [];
  let dropped = 0;

  // Track current section sensitivity. Section headers in the portal show up as
  // ;Header or ==Header== or *'''Header'''. We treat a line that is a known
  // section keyword (and has few/no other tokens) as a header.
  let sectionExcluded = false;
  let sectionIncluded = false;

  for (const raw of lines) {
    const plain = stripWiki(raw);
    if (!plain) continue;
    const lower = plain.toLowerCase();

    // Header detection: a short line that equals/contains a known section name.
    const matchedExclude = EXCLUDE_SECTIONS.find((s) => lower.includes(s));
    const matchedInclude = INCLUDE_SECTIONS.find((s) => lower.includes(s));
    const looksLikeHeader = plain.length < 60 && (matchedExclude || matchedInclude);

    if (looksLikeHeader) {
      sectionExcluded = !!matchedExclude;
      sectionIncluded = !!matchedInclude && !matchedExclude;
      continue;
    }

    // Only collect bullet-style event lines (the raw line started with * or #).
    const isBullet = /^[\*#]/.test(raw.trim());
    if (!isBullet) continue;

    if (sectionExcluded) {
      dropped++;
      continue;
    }
    if (!sectionIncluded) {
      // Outside a kept section -> skip (don't count as sensitivity drop).
      continue;
    }
    // Inside a kept section: final defensive keyword filter on the event text.
    if (/\b(killed|dead|deaths?|dies|died|murder|massacre|war|attack|bombing|shooting|earthquake|crash|terror|hostage|invasion|wounded|casualt)/i.test(plain)) {
      dropped++;
      continue;
    }
    if (plain.length >= 20) kept.push(plain);
  }

  return { kept, dropped };
}

function buildPrompt(digest: string, eventCount: number): string {
  return `You are an expert trivia question writer creating a "This Week in News" quiz from REAL current events of the past 7 days.

Below is a curated digest of notable, non-sensitive events from this week (sports results, science & technology, arts & culture, business & economy, elections/appointments, international agreements). Generate multiple-choice trivia questions about THIS WEEK's notable events.

=== THIS WEEK'S EVENTS DIGEST (${eventCount} events) ===
${digest}
=== END DIGEST ===

Generate 15 multiple-choice trivia questions about THIS WEEK's notable events.

STRICT RULES:
- Only ask about verifiable facts present in the digest above. Do NOT invent events not in the digest.
- NEVER make trivia out of deaths, violence, war, disasters, or crime — even if any slipped into the digest, skip them entirely.
- Focus on: sports results & records, scientific discoveries, space, tech launches, cultural events, awards, elections/appointments, business milestones, international agreements/summits.
- Each question: ONE correct answer + THREE plausible but unambiguous wrong answers.
- Do NOT leak the answer in the question text.
- Add a 1-sentence "learning_fact" giving extra context about the correct answer (not a repeat of the question).
- Vary difficulty (1 easy, 2 medium, 3 hard). All four options similar in length & form.
- Proper French (avec accents) and proper English.

If there aren't enough non-sensitive events for 15 questions, generate fewer (MINIMUM 8). Quality over quantity — never pad with fabricated facts.

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
    }
  ]
}

The "questions" array must contain between 8 and 15 objects.`;
}

async function callClaude(prompt: string): Promise<BilingualQuestion[]> {
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
      temperature: 0.6,
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
  if (qs.length < 8 || qs.length > 15) {
    return `expected 8-15 questions, got ${qs.length}`;
  }
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
    const lowerQFr = (q.question_fr || "").toLowerCase();
    if (lowerQFr.includes((q.correct_answer_fr || "").toLowerCase()) && q.correct_answer_fr.length > 3) {
      return `question ${i + 1}: French answer leaks into the question`;
    }
    const lowerQEn = (q.question_en || "").toLowerCase();
    if (lowerQEn.includes((q.correct_answer_en || "").toLowerCase()) && q.correct_answer_en.length > 3) {
      return `question ${i + 1}: English answer leaks into the question`;
    }
  }
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    // 1. Past 7 days : yesterday back to 7 days ago (UTC).
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const days: Date[] = [];
    for (let i = 1; i <= 7; i++) {
      const d = new Date(today);
      d.setUTCDate(d.getUTCDate() - i);
      days.push(d);
    }

    // 2-3. Fetch + parse + filter each daily page.
    let allEvents: string[] = [];
    let totalDropped = 0;
    for (const d of days) {
      try {
        const { kept, dropped } = await fetchDayEvents(d);
        allEvents = allEvents.concat(kept);
        totalDropped += dropped;
      } catch (e) {
        console.warn(`fetch ${isoDate(d)} failed:`, (e as Error).message);
      }
    }

    // Dedupe + cap at ~80 events.
    const seen = new Set<string>();
    const deduped: string[] = [];
    for (const ev of allEvents) {
      const key = ev.toLowerCase().slice(0, 80);
      if (seen.has(key)) continue;
      seen.add(key);
      deduped.push(ev);
      if (deduped.length >= 80) break;
    }

    if (deduped.length < 8) {
      return new Response(JSON.stringify({
        success: false,
        error: `Not enough non-sensitive events to build a quiz (${deduped.length} found, need >= 8). Dropped ${totalDropped} sensitive events.`,
      }), {
        status: 422,
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    const digest = deduped.map((e, i) => `${i + 1}. ${e}`).join("\n");

    // 4-5. Generate via Claude.
    const questions = await callClaude(buildPrompt(digest, deduped.length));

    // 6. Validate.
    const validationError = validateQuestions(questions);
    if (validationError) {
      throw new Error(`Validation failed: ${validationError}`);
    }

    // 7. Compute dates. start = Monday of this week, end = +6.
    //    theme_slug is a FIXED 'news' (FK to weekly_challenge_themes.slug —
    //    seeded once, is_active=false so the themed rotation never picks it).
    //    The ISO week only feeds the challenge title for clarity.
    const start = getMondayOf(today);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 6);
    const { year, week } = isoWeek(start);
    const themeSlug = "news";
    const weekLabel = `${year} W${String(week).padStart(2, "0")}`;

    // 9. Archive any existing active/upcoming news challenge first (only one
    //    active news challenge at a time).
    await supabase
      .from("weekly_challenges")
      .update({ status: "archived", archived_at: new Date().toISOString() })
      .eq("challenge_type", "news")
      .in("status", ["active", "upcoming"]);

    // 8. Insert the challenge row.
    const { data: challenge, error: insErr } = await supabase
      .from("weekly_challenges")
      .insert({
        theme_slug: themeSlug,
        theme_label_fr: "L'actu de la semaine",
        theme_label_en: "This Week in News",
        description_fr: "Teste-toi sur l'actualité des 7 derniers jours",
        description_en: "Test yourself on the last 7 days of news",
        emoji: "📰",
        color: "#0ea5e9",
        target_category: "general",
        challenge_type: "news",
        start_date: isoDate(start),
        end_date: isoDate(end),
        status: "active",
        generation_status: "ready",
        total_questions: questions.length,
      })
      .select()
      .single();
    if (insErr || !challenge) throw new Error(`insert challenge failed: ${insErr?.message}`);

    // Insert questions.
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

    return new Response(JSON.stringify({
      success: true,
      challenge_id: challenge.id,
      theme_slug: themeSlug,
      week: weekLabel,
      challenge_type: "news",
      start_date: challenge.start_date,
      end_date: challenge.end_date,
      questions_inserted: rows.length,
      events_used: deduped.length,
      sensitive_events_dropped: totalDropped,
    }), {
      status: 200,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  } catch (err: any) {
    console.error("generate-news-challenge error:", err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }
});
