// Supabase Edge Function: Generate "World Monuments" weekly challenge (photos)
//
// A guess-the-monument weekly challenge with a clear photo per question. Uses
// each monument's Wikipedia lead image (stable upload.wikimedia.org thumbnail),
// HEAD-verified before insert (Wikimedia needs a descriptive User-Agent), so no
// broken image ships. Bilingual FR+EN with an educational learning fact.
//
// Auth: CRON_SECRET or service role. Body: {start_date?: "YYYY-MM-DD"}.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const UA = "BigheadQuiz/1.0 (https://play.bighead-quizz.com; julien@romanetto.com)";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Monument {
  wiki: string;
  fr: string;
  en: string;
  factFr: string;
  factEn: string;
}

const MONUMENTS: Monument[] = [
  { wiki: "Tour_Eiffel", fr: "La tour Eiffel", en: "The Eiffel Tower", factFr: "Construite à Paris en 1889 pour l'Exposition universelle, elle mesure 330 mètres.", factEn: "Built in Paris in 1889 for the World's Fair, it stands 330 metres tall." },
  { wiki: "Colisée", fr: "Le Colisée", en: "The Colosseum", factFr: "Cet amphithéâtre de Rome pouvait accueillir 50 000 spectateurs il y a près de 2000 ans.", factEn: "This amphitheatre in Rome could hold 50,000 spectators nearly 2,000 years ago." },
  { wiki: "Taj_Mahal", fr: "Le Taj Mahal", en: "The Taj Mahal", factFr: "Ce mausolée de marbre blanc en Inde fut bâti par un empereur en mémoire de son épouse.", factEn: "This white marble mausoleum in India was built by an emperor in memory of his wife." },
  { wiki: "Statue_de_la_Liberté", fr: "La statue de la Liberté", en: "The Statue of Liberty", factFr: "Offerte par la France aux États-Unis, elle accueille les bateaux à l'entrée de New York.", factEn: "A gift from France to the USA, it welcomes ships at the entrance of New York." },
  { wiki: "Grande_Muraille", fr: "La Grande Muraille de Chine", en: "The Great Wall of China", factFr: "Longue de milliers de kilomètres, elle protégeait la Chine des invasions.", factEn: "Thousands of kilometres long, it protected China from invasions." },
  { wiki: "Machu_Picchu", fr: "Le Machu Picchu", en: "Machu Picchu", factFr: "Cette cité inca perchée dans les montagnes du Pérou fut construite au XVe siècle.", factEn: "This Inca city high in the mountains of Peru was built in the 15th century." },
  { wiki: "Pyramide_de_Khéops", fr: "Les pyramides de Gizeh", en: "The Pyramids of Giza", factFr: "La grande pyramide d'Égypte est la seule des sept merveilles du monde antique encore debout.", factEn: "Egypt's Great Pyramid is the only one of the seven ancient wonders still standing." },
  { wiki: "Big_Ben", fr: "Big Ben", en: "Big Ben", factFr: "Cette célèbre horloge de Londres sonne les heures depuis 1859.", factEn: "This famous London clock has chimed the hours since 1859." },
  { wiki: "Sagrada_Família", fr: "La Sagrada Família", en: "The Sagrada Família", factFr: "Cette basilique de Barcelone, dessinée par Gaudí, est en construction depuis 1882.", factEn: "This basilica in Barcelona, designed by Gaudí, has been under construction since 1882." },
  { wiki: "Christ_Rédempteur_(Rio_de_Janeiro)", fr: "Le Christ Rédempteur", en: "Christ the Redeemer", factFr: "Cette immense statue veille sur la ville de Rio de Janeiro, au Brésil.", factEn: "This huge statue watches over the city of Rio de Janeiro, in Brazil." },
  { wiki: "Opéra_de_Sydney", fr: "L'opéra de Sydney", en: "The Sydney Opera House", factFr: "Son toit en forme de voiles blanches est l'emblème de l'Australie.", factEn: "Its roof shaped like white sails is a symbol of Australia." },
  { wiki: "Tour_de_Pise", fr: "La tour de Pise", en: "The Leaning Tower of Pisa", factFr: "Cette tour italienne penche à cause d'un sol trop mou sous ses fondations.", factEn: "This Italian tower leans because of soft ground beneath its foundations." },
  { wiki: "Parthénon", fr: "Le Parthénon", en: "The Parthenon", factFr: "Ce temple grec domine l'Acropole d'Athènes depuis près de 2500 ans.", factEn: "This Greek temple has crowned the Acropolis of Athens for nearly 2,500 years." },
  { wiki: "Mont-Saint-Michel", fr: "Le Mont-Saint-Michel", en: "Mont-Saint-Michel", factFr: "Cette abbaye française sur un îlot est parfois entourée par la mer à marée haute.", factEn: "This French abbey on a tiny island is sometimes surrounded by the sea at high tide." },
  { wiki: "Pétra", fr: "Pétra", en: "Petra", factFr: "Cette cité antique de Jordanie est taillée directement dans la roche rose.", factEn: "This ancient city in Jordan is carved directly into pink rock." },
  { wiki: "Angkor_Vat", fr: "Angkor Vat", en: "Angkor Wat", factFr: "Ce gigantesque temple du Cambodge est le plus grand monument religieux du monde.", factEn: "This giant temple in Cambodia is the largest religious monument in the world." },
  { wiki: "Burj_Khalifa", fr: "Le Burj Khalifa", en: "The Burj Khalifa", factFr: "À Dubaï, c'est le plus haut gratte-ciel du monde avec plus de 800 mètres.", factEn: "In Dubai, it is the tallest skyscraper in the world at over 800 metres." },
  { wiki: "Stonehenge", fr: "Stonehenge", en: "Stonehenge", factFr: "Ce cercle de pierres géantes en Angleterre a été dressé il y a plus de 4000 ans.", factEn: "This circle of giant stones in England was raised more than 4,000 years ago." },
  { wiki: "Château_de_Neuschwanstein", fr: "Le château de Neuschwanstein", en: "Neuschwanstein Castle", factFr: "Ce château d'Allemagne a inspiré celui de la Belle au bois dormant de Disney.", factEn: "This castle in Germany inspired Disney's Sleeping Beauty castle." },
  { wiki: "Porte_de_Brandebourg", fr: "La porte de Brandebourg", en: "The Brandenburg Gate", factFr: "Ce monument de Berlin est devenu le symbole de la réunification de l'Allemagne.", factEn: "This monument in Berlin became the symbol of Germany's reunification." },
];

async function leadImage(wikiTitle: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`,
      { headers: { "User-Agent": UA, "Api-User-Agent": UA } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    // Prefer the larger originalimage when available, else the thumbnail.
    const src = (data?.originalimage?.source as string | undefined) ??
      (data?.thumbnail?.source as string | undefined);
    if (!src) return null;
    const head = await fetch(src, { method: "HEAD", headers: { "User-Agent": UA } });
    if (!head.ok) return null;
    if (!(head.headers.get("content-type") ?? "").startsWith("image/")) return null;
    return src;
  } catch {
    return null;
  }
}

function pick3<T>(pool: T[], exclude: T): T[] {
  const o = pool.filter((x) => x !== exclude);
  for (let i = o.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [o[i], o[j]] = [o[j], o[i]];
  }
  return o.slice(0, 3);
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

  let startDate = "2026-06-15";
  try {
    const body = await req.json();
    if (body?.start_date) startDate = String(body.start_date);
  } catch {
    // default
  }
  const start = new Date(startDate + "T00:00:00Z");
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);
  const endDate = end.toISOString().slice(0, 10);

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // Resolve images first (so total_questions is accurate).
  const frNames = MONUMENTS.map((m) => m.fr);
  const enNames = MONUMENTS.map((m) => m.en);
  const resolved: { m: Monument; img: string }[] = [];
  for (const m of MONUMENTS) {
    await new Promise((r) => setTimeout(r, 250));
    const img = await leadImage(m.wiki);
    if (img) resolved.push({ m, img });
  }
  if (resolved.length < 8) {
    return new Response(
      JSON.stringify({ error: `only ${resolved.length} images resolved` }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  // Avoid duplicating a monuments challenge already created for this week.
  const { data: dup } = await supabase
    .from("weekly_challenges")
    .select("id")
    .eq("theme_slug", "topic_monuments")
    .eq("start_date", startDate)
    .maybeSingle();
  if (dup) {
    return new Response(
      JSON.stringify({ skipped: "already exists", challenge_id: dup.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const { data: challenge, error: insErr } = await supabase
    .from("weekly_challenges")
    .insert({
      theme_slug: "topic_monuments",
      theme_label_fr: "Monuments du monde",
      theme_label_en: "World Monuments",
      description_fr: "Reconnais les monuments les plus célèbres de la planète à partir d'une photo.",
      description_en: "Recognise the world's most famous monuments from a photo.",
      emoji: "🏛️",
      color: "#d97706",
      target_category: "geography",
      challenge_type: "themed",
      start_date: startDate,
      end_date: endDate,
      status: "upcoming",
      generation_status: "pending",
      total_questions: resolved.length,
    })
    .select("id")
    .single();
  if (insErr || !challenge) {
    return new Response(JSON.stringify({ error: insErr?.message ?? "insert failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const rows = resolved.map(({ m, img }, i) => ({
    challenge_id: challenge.id,
    position: i + 1,
    difficulty: 2,
    question_fr: "Quel est ce monument ?",
    correct_answer_fr: m.fr,
    wrong_answers_fr: pick3(frNames, m.fr),
    learning_fact_fr: m.factFr,
    question_en: "Which monument is this?",
    correct_answer_en: m.en,
    wrong_answers_en: pick3(enNames, m.en),
    learning_fact_en: m.factEn,
    image_url: img,
    image_credit: "Wikimedia Commons",
  }));

  const { error: qErr } = await supabase.from("weekly_challenge_questions").insert(rows);
  if (qErr) {
    await supabase.from("weekly_challenges").delete().eq("id", challenge.id);
    return new Response(JSON.stringify({ error: qErr.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  await supabase
    .from("weekly_challenges")
    .update({ generation_status: "ready", total_questions: rows.length })
    .eq("id", challenge.id);

  return new Response(
    JSON.stringify({
      challenge_id: challenge.id,
      start_date: startDate,
      end_date: endDate,
      questions: rows.length,
      monuments: resolved.map((r) => r.m.fr),
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
