// Supabase Edge Function: Generate Animal Photo Questions (kid-friendly)
//
// "Which animal is this?" with a clear photo is perfect for young kids and the
// image pipeline is now reliable. Uses each animal's Wikipedia lead image
// (stable upload.wikimedia.org thumbnail), HEAD-verified before insert so no
// broken image ever ships. The daily image-audit guardrail catches any future
// breakage. Bilingual FR+EN, level 1-2, category 'animals'.
//
// Auth: CRON_SECRET or service role. Processes the whole curated list per call.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Animal {
  wiki: string; // FR Wikipedia title
  fr: string;
  en: string;
  level: 1 | 2;
}

// Curated, kid-recognizable animals. Level 1 = everyday, 2 = slightly less common.
const ANIMALS: Animal[] = [
  { wiki: "Lion", fr: "Le lion", en: "Lion", level: 1 },
  { wiki: "Tigre", fr: "Le tigre", en: "Tiger", level: 1 },
  { wiki: "Éléphant_d'Afrique", fr: "L'éléphant", en: "Elephant", level: 1 },
  { wiki: "Girafe", fr: "La girafe", en: "Giraffe", level: 1 },
  { wiki: "Zèbre", fr: "Le zèbre", en: "Zebra", level: 1 },
  { wiki: "Panda_géant", fr: "Le panda", en: "Panda", level: 1 },
  { wiki: "Kangourou", fr: "Le kangourou", en: "Kangaroo", level: 2 },
  { wiki: "Hippopotame_amphibie", fr: "L'hippopotame", en: "Hippopotamus", level: 2 },
  { wiki: "Rhinocéros", fr: "Le rhinocéros", en: "Rhinoceros", level: 2 },
  { wiki: "Chameau", fr: "Le chameau", en: "Camel", level: 2 },
  { wiki: "Ours_brun", fr: "L'ours", en: "Bear", level: 1 },
  { wiki: "Loup_gris", fr: "Le loup", en: "Wolf", level: 1 },
  { wiki: "Renard_roux", fr: "Le renard", en: "Fox", level: 2 },
  { wiki: "Cheval", fr: "Le cheval", en: "Horse", level: 1 },
  { wiki: "Vache_domestique", fr: "La vache", en: "Cow", level: 1 },
  { wiki: "Mouton", fr: "Le mouton", en: "Sheep", level: 1 },
  { wiki: "Cochon", fr: "Le cochon", en: "Pig", level: 1 },
  { wiki: "Lapin", fr: "Le lapin", en: "Rabbit", level: 1 },
  { wiki: "Chat", fr: "Le chat", en: "Cat", level: 1 },
  { wiki: "Chien", fr: "Le chien", en: "Dog", level: 1 },
  { wiki: "Poule", fr: "La poule", en: "Hen", level: 1 },
  { wiki: "Canard", fr: "Le canard", en: "Duck", level: 1 },
  { wiki: "Manchot_empereur", fr: "Le manchot", en: "Penguin", level: 1 },
  { wiki: "Grand_dauphin", fr: "Le dauphin", en: "Dolphin", level: 1 },
  { wiki: "Requin_blanc", fr: "Le requin", en: "Shark", level: 1 },
  { wiki: "Baleine_à_bosse", fr: "La baleine", en: "Whale", level: 1 },
  { wiki: "Pieuvre", fr: "La pieuvre", en: "Octopus", level: 2 },
  { wiki: "Tortue_marine", fr: "La tortue", en: "Turtle", level: 1 },
  { wiki: "Grenouille", fr: "La grenouille", en: "Frog", level: 1 },
  { wiki: "Serpent", fr: "Le serpent", en: "Snake", level: 1 },
  { wiki: "Crocodile", fr: "Le crocodile", en: "Crocodile", level: 1 },
  { wiki: "Hibou", fr: "Le hibou", en: "Owl", level: 1 },
  { wiki: "Aigle", fr: "L'aigle", en: "Eagle", level: 2 },
  { wiki: "Perroquet", fr: "Le perroquet", en: "Parrot", level: 1 },
  { wiki: "Flamant_rose", fr: "Le flamant rose", en: "Flamingo", level: 2 },
  { wiki: "Papillon", fr: "Le papillon", en: "Butterfly", level: 1 },
  { wiki: "Abeille", fr: "L'abeille", en: "Bee", level: 1 },
  { wiki: "Coccinelle", fr: "La coccinelle", en: "Ladybug", level: 1 },
  { wiki: "Escargot", fr: "L'escargot", en: "Snail", level: 1 },
  { wiki: "Koala", fr: "Le koala", en: "Koala", level: 2 },
  { wiki: "Singe", fr: "Le singe", en: "Monkey", level: 1 },
  { wiki: "Écureuil", fr: "L'écureuil", en: "Squirrel", level: 1 },
];

const UA = "BigheadQuiz/1.0 (https://play.bighead-quizz.com; julien@romanetto.com)";

async function leadImage(wikiTitle: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`,
      { headers: { "User-Agent": UA, "Api-User-Agent": UA } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    const src = data?.thumbnail?.source as string | undefined;
    if (!src) return null;
    // Verify it resolves as an image (Wikimedia needs a descriptive UA on the
    // image host too, else it 403s).
    const head = await fetch(src, { method: "HEAD", headers: { "User-Agent": UA } });
    if (!head.ok) return null;
    if (!(head.headers.get("content-type") ?? "").startsWith("image/")) return null;
    return src;
  } catch {
    return null;
  }
}

function pick3Wrong<T>(pool: T[], exclude: T): T[] {
  const others = pool.filter((x) => x !== exclude);
  for (let i = others.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [others[i], others[j]] = [others[j], others[i]];
  }
  return others.slice(0, 3);
}

const AGE: Record<number, number> = { 1: 6, 2: 8 };

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

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // Animals that already have a photo "which animal is this?" question — skip.
  const { data: existing } = await supabase
    .from("questions")
    .select("correct_answer")
    .eq("category", "animals")
    .eq("language", "fr")
    .not("image_url", "is", null)
    .ilike("question_text", "%quel est cet animal%");
  const have = new Set((existing ?? []).map((r) => r.correct_answer as string));

  const frNames = ANIMALS.map((a) => a.fr);
  const enNames = ANIMALS.map((a) => a.en);

  const rows: Record<string, unknown>[] = [];
  let noImage = 0;
  let skipped = 0;

  for (const a of ANIMALS) {
    if (have.has(a.fr)) {
      skipped++;
      continue;
    }
    await new Promise((r) => setTimeout(r, 250)); // be gentle with Wikipedia
    const img = await leadImage(a.wiki);
    if (!img) {
      noImage++;
      continue;
    }
    const base = {
      category: "animals",
      difficulty: a.level,
      ai_difficulty: a.level,
      min_age: AGE[a.level],
      image_url: img,
      image_credit: "Wikimedia Commons",
      is_active: true,
    };
    rows.push({
      ...base,
      language: "fr",
      question_text: "Quel est cet animal ?",
      correct_answer: a.fr,
      wrong_answers: pick3Wrong(frNames, a.fr),
    });
    rows.push({
      ...base,
      language: "en",
      question_text: "Which animal is this?",
      correct_answer: a.en,
      wrong_answers: pick3Wrong(enNames, a.en),
    });
  }

  let inserted = 0;
  if (rows.length > 0) {
    const { error, count } = await supabase
      .from("questions")
      .insert(rows, { count: "exact" });
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    inserted = count ?? rows.length;
  }

  return new Response(
    JSON.stringify({ inserted, skipped_existing: skipped, no_image: noImage }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
