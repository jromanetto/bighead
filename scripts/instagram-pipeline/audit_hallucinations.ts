/**
 * Audit existing trivia questions for HALLUCINATIONS via Claude.
 *
 * Detects internal contradictions between question, correct_answer, wrong_answers, and explanation.
 *
 * Usage:
 *   tsx audit_hallucinations.ts priority1   # weekly_challenge archived questions (~56)
 *   tsx audit_hallucinations.ts priority2   # random sample of 100 questions
 *   tsx audit_hallucinations.ts both        # run both
 *
 * Flags:
 *   --dry-run   don't disable, just log
 */

import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_KEY");
  process.exit(1);
}
if (!ANTHROPIC_API_KEY) {
  console.error("Missing ANTHROPIC_API_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

const MODEL = "claude-sonnet-4-5";
const BATCH_SIZE = 10;
const COST_CAP_USD = 5;
const MAX_BATCHES = 50;

// Claude Sonnet 4.5 pricing (per 1M tokens, March 2026)
const PRICE_INPUT = 3.0 / 1_000_000;
const PRICE_OUTPUT = 15.0 / 1_000_000;

const CACHE_PATH = "/tmp/audit_cache.json";
const UNCERTAIN_PATH = "/tmp/audit_uncertain.json";

type Verdict = "ok" | "contradiction" | "wrong_answer" | "uncertain";

type Question = {
  id: string;
  language: string | null;
  category: string | null;
  question_text: string;
  correct_answer: string;
  wrong_answers: string[] | null;
  explanation: string | null;
};

type AuditResult = {
  id: string;
  verdict: Verdict;
  reason: string;
};

type CacheEntry = AuditResult & {
  question_text: string;
  correct_answer: string;
  explanation: string | null;
  language: string | null;
  audited_at: string;
};

type Cache = Record<string, CacheEntry>;

const DRY_RUN = process.argv.includes("--dry-run");
const MODE = (process.argv[2] || "priority1") as "priority1" | "priority2" | "both";

function loadCache(): Cache {
  try {
    return JSON.parse(fs.readFileSync(CACHE_PATH, "utf-8"));
  } catch {
    return {};
  }
}

function saveCache(c: Cache) {
  fs.writeFileSync(CACHE_PATH, JSON.stringify(c, null, 2));
}

let totalInputTokens = 0;
let totalOutputTokens = 0;

function costSoFar() {
  return totalInputTokens * PRICE_INPUT + totalOutputTokens * PRICE_OUTPUT;
}

/**
 * Ask Claude to fact-check a batch of questions.
 */
async function auditBatch(batch: Question[]): Promise<AuditResult[]> {
  const lines = batch.map((q) => {
    const wrongs = (q.wrong_answers || []).join(" / ");
    return `[${q.id}] [LANG_${(q.language || "??").toUpperCase()}] Question: "${q.question_text}" | Correct: "${q.correct_answer}" | Wrong: [${wrongs}] | Explanation: "${q.explanation || "(none)"}"`;
  });

  const userPrompt = `You are a fact-checker. For each question below, respond ONLY with a JSON array (no markdown, no prose around it):
[{ "id": "uuid", "verdict": "ok" | "contradiction" | "wrong_answer" | "uncertain", "reason": "1-sentence" }]

Detection rules:
- "contradiction" = the explanation directly contradicts the correct_answer.
  Real example: answer "Kia" + explanation "Kia means rising from Asia" when question asks for a brand named after Seoul. The etymology in the explanation doesn't match the supposed origin in the question.
  Another example: answer "Volvo" + explanation "Volvo means I roll in Latin" when question asks for a brand whose name is Latin for iron.
- "wrong_answer" = you are highly confident (>90%) the correct_answer is factually wrong by general knowledge. Be conservative.
- "uncertain" = you can't verify with confidence — return this unless something is clearly wrong.
- "ok" = consistent and likely correct.

BE STRICT on contradictions (the explanation telling a different story than the question implies).
BE LENIENT on uncertain (we'd rather keep a borderline question than nuke a good one).

Respond with the JSON array only, in the same order as the inputs. ${batch.length} questions:

${lines.join("\n")}`;

  const resp = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2000,
    messages: [{ role: "user", content: userPrompt }],
  });

  totalInputTokens += resp.usage.input_tokens;
  totalOutputTokens += resp.usage.output_tokens;

  const textBlock = resp.content.find((b) => b.type === "text") as
    | { type: "text"; text: string }
    | undefined;
  if (!textBlock) throw new Error("No text in Claude response");

  let raw = textBlock.text.trim();
  // strip code fences if any
  raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  // grab first JSON array if Claude added prose
  const startIdx = raw.indexOf("[");
  const endIdx = raw.lastIndexOf("]");
  if (startIdx >= 0 && endIdx > startIdx) {
    raw = raw.slice(startIdx, endIdx + 1);
  }

  let parsed: AuditResult[];
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    console.error("[parse-fail]", raw.slice(0, 500));
    throw e;
  }

  // sanity defaults
  return parsed.map((p) => ({
    id: p.id,
    verdict: (["ok", "contradiction", "wrong_answer", "uncertain"].includes(p.verdict)
      ? p.verdict
      : "uncertain") as Verdict,
    reason: p.reason || "(no reason)",
  }));
}

async function fetchPriority1(): Promise<Question[]> {
  // @ts-ignore raw SQL via PostgREST not possible — use 2-step
  const { data: archived, error: err1 } = await (supabase as any)
    .from("weekly_challenge_questions")
    .select("archived_question_id_fr, archived_question_id_en");
  if (err1) throw err1;

  const ids = new Set<string>();
  for (const row of archived || []) {
    if (row.archived_question_id_fr) ids.add(row.archived_question_id_fr);
    if (row.archived_question_id_en) ids.add(row.archived_question_id_en);
  }

  if (ids.size === 0) return [];

  const { data, error } = await (supabase as any)
    .from("questions")
    .select(
      "id, language, category, question_text, correct_answer, wrong_answers, explanation, is_active"
    )
    .in("id", Array.from(ids))
    .eq("is_active", true);
  if (error) throw error;
  return (data || []) as Question[];
}

async function fetchPriority2(): Promise<Question[]> {
  // Use a server-side RPC-style random sample via the raw URL would be cleaner,
  // but PostgREST doesn't expose ORDER BY RANDOM(). Workaround: pull many ids and sample.
  // Better: use rpc with raw SQL via Supabase function. Since we can't,
  // we fetch a chunk ordered by created_at desc and randomize client-side from a large window.
  const { data, error } = await (supabase as any)
    .from("questions")
    .select(
      "id, language, category, question_text, correct_answer, wrong_answers, explanation"
    )
    .eq("is_active", true)
    .not("explanation", "is", null)
    .limit(5000);
  if (error) throw error;
  const all = (data || []) as Question[];
  // shuffle & take 100
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all.slice(0, 100);
}

async function disableQuestions(ids: string[]) {
  if (ids.length === 0) return;
  // batch UPDATE 50 at a time
  for (let i = 0; i < ids.length; i += 50) {
    const chunk = ids.slice(i, i + 50);
    const { error } = await (supabase as any)
      .from("questions")
      .update({ is_active: false })
      .in("id", chunk);
    if (error) {
      console.error("[disable-error]", error);
      throw error;
    }
  }
}

async function runAudit(label: string, questions: Question[]) {
  console.log(`\n=== ${label.toUpperCase()} ===`);
  console.log(`Fetched ${questions.length} questions to audit`);

  const cache = loadCache();
  const toAudit = questions.filter((q) => !cache[q.id]);
  console.log(`${toAudit.length} new (skipping ${questions.length - toAudit.length} cached)`);

  const allResults: AuditResult[] = [];
  // include cached results for stats
  for (const q of questions) {
    if (cache[q.id]) allResults.push(cache[q.id]);
  }

  let batchCount = 0;
  for (let i = 0; i < toAudit.length; i += BATCH_SIZE) {
    if (batchCount >= MAX_BATCHES) {
      console.warn(`[STOP] Hit MAX_BATCHES=${MAX_BATCHES}`);
      break;
    }
    if (costSoFar() > COST_CAP_USD) {
      console.warn(`[STOP] Cost cap $${COST_CAP_USD} exceeded: $${costSoFar().toFixed(3)}`);
      break;
    }
    const batch = toAudit.slice(i, i + BATCH_SIZE);
    process.stdout.write(`  batch ${batchCount + 1}/${Math.ceil(toAudit.length / BATCH_SIZE)} (${batch.length} q) ... `);
    try {
      const results = await auditBatch(batch);
      // upsert cache
      for (const r of results) {
        const orig = batch.find((b) => b.id === r.id);
        if (!orig) continue;
        cache[r.id] = {
          ...r,
          question_text: orig.question_text,
          correct_answer: orig.correct_answer,
          explanation: orig.explanation,
          language: orig.language,
          audited_at: new Date().toISOString(),
        };
        allResults.push(r);
      }
      const flags = results.filter((r) => r.verdict !== "ok").length;
      console.log(`OK (${flags} flag${flags === 1 ? "" : "s"}, $${costSoFar().toFixed(3)} so far)`);
    } catch (e: any) {
      console.log(`FAIL: ${e.message}`);
    }
    saveCache(cache);
    batchCount++;
  }

  // Tally
  const byVerdict: Record<Verdict, AuditResult[]> = {
    ok: [],
    contradiction: [],
    wrong_answer: [],
    uncertain: [],
  };
  for (const r of allResults) byVerdict[r.verdict].push(r);

  console.log(`\n--- ${label} Results ---`);
  console.log(`  ok:            ${byVerdict.ok.length}`);
  console.log(`  contradiction: ${byVerdict.contradiction.length}`);
  console.log(`  wrong_answer:  ${byVerdict.wrong_answer.length}`);
  console.log(`  uncertain:     ${byVerdict.uncertain.length}`);

  // To disable
  const toDisable = [...byVerdict.contradiction, ...byVerdict.wrong_answer];
  if (toDisable.length > 0) {
    console.log(`\nFlagged for disabling (${toDisable.length}):`);
    for (const r of toDisable.slice(0, 10)) {
      const c = cache[r.id];
      console.log(`  [${r.verdict}] ${r.id} (${c?.language})`);
      console.log(`    Q: ${c?.question_text?.slice(0, 100)}`);
      console.log(`    A: ${c?.correct_answer}`);
      console.log(`    Reason: ${r.reason}`);
    }
    if (!DRY_RUN) {
      console.log(`\n[DISABLING ${toDisable.length} questions]`);
      await disableQuestions(toDisable.map((r) => r.id));
      console.log("[done]");
    } else {
      console.log("[DRY RUN — not disabling]");
    }
  }

  // Append uncertains to file
  if (byVerdict.uncertain.length > 0) {
    let existing: any[] = [];
    try {
      existing = JSON.parse(fs.readFileSync(UNCERTAIN_PATH, "utf-8"));
    } catch {}
    const enriched = byVerdict.uncertain.map((r) => ({
      ...r,
      ...cache[r.id],
      source: label,
    }));
    // dedupe by id
    const merged = [...existing.filter((e) => !enriched.find((n) => n.id === e.id)), ...enriched];
    fs.writeFileSync(UNCERTAIN_PATH, JSON.stringify(merged, null, 2));
    console.log(`  uncertain logged to ${UNCERTAIN_PATH} (${merged.length} total)`);
  }

  return { byVerdict, toDisable };
}

async function main() {
  console.log(`Audit mode: ${MODE}, DRY_RUN: ${DRY_RUN}`);
  console.log(`Model: ${MODEL}, batch: ${BATCH_SIZE}, cost cap: $${COST_CAP_USD}\n`);

  const aggregate = {
    contradictions: [] as AuditResult[],
    wrong_answers: [] as AuditResult[],
    uncertain: [] as AuditResult[],
    ok: 0,
  };

  if (MODE === "priority1" || MODE === "both") {
    const qs = await fetchPriority1();
    const { byVerdict } = await runAudit("priority1", qs);
    aggregate.contradictions.push(...byVerdict.contradiction);
    aggregate.wrong_answers.push(...byVerdict.wrong_answer);
    aggregate.uncertain.push(...byVerdict.uncertain);
    aggregate.ok += byVerdict.ok.length;
  }
  if (MODE === "priority2" || MODE === "both") {
    const qs = await fetchPriority2();
    const { byVerdict } = await runAudit("priority2", qs);
    aggregate.contradictions.push(...byVerdict.contradiction);
    aggregate.wrong_answers.push(...byVerdict.wrong_answer);
    aggregate.uncertain.push(...byVerdict.uncertain);
    aggregate.ok += byVerdict.ok.length;
  }

  console.log(`\n========= FINAL REPORT =========`);
  console.log(`Total ok:            ${aggregate.ok}`);
  console.log(`Total contradictions disabled: ${aggregate.contradictions.length}`);
  console.log(`Total wrong_answer disabled:   ${aggregate.wrong_answers.length}`);
  console.log(`Total uncertain logged:        ${aggregate.uncertain.length}`);
  console.log(`Input tokens:  ${totalInputTokens}`);
  console.log(`Output tokens: ${totalOutputTokens}`);
  console.log(`Estimated cost: $${costSoFar().toFixed(4)}`);
}

main().catch((e) => {
  console.error("[fatal]", e);
  process.exit(1);
});
