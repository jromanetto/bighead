// Supabase Edge Function: Audit Question Images (garde-fou quotidien)
//
// Contexte : 3 épisodes de plaintes images (URLs mortes wikimedia 02/2026,
// drapeaux-spoilers réattachés par restore_flag_images.ts, etc.) réparés en
// one-shot sans garde-fou. Cette fonction est le garde-fou permanent :
//
//  1. SPOILERS — toute question active avec une image drapeau dont le texte
//     ne demande PAS d'identifier le drapeau ("ce drapeau"/"this flag") se
//     fait retirer son image (backup dans original_image_url).
//  2. URLS MORTES — toutes les URLs d'images distinctes sont testées (HEAD,
//     séquencé pour éviter le rate-limit). 404/410 → image retirée (backup),
//     autres erreurs (5xx/timeout) → signalées sans action.
//  3. EMAIL — rapport envoyé via Resend à AUDIT_EMAIL_TO uniquement s'il y a
//     des findings ou des actions (zéro bruit sinon).
//
// Secrets : RESEND_API_KEY_BIGHEAD, AUDIT_EMAIL_TO, CRON_SECRET.
// Cron VPS : tous les jours à 08h00 Paris.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_KEY = Deno.env.get("RESEND_API_KEY_BIGHEAD");
const EMAIL_TO = Deno.env.get("AUDIT_EMAIL_TO") ?? "julien@romanetto.com";
const EMAIL_FROM = "BIGHEAD Bot <audit@bighead-quizz.com>";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface QuestionRow {
  id: string;
  category: string;
  question_text: string;
  correct_answer: string;
  image_url: string;
}

/** Une question avec image drapeau doit demander d'identifier CE drapeau. */
function isFlagImage(url: string): boolean {
  return url.includes("flagcdn.com") || url.includes("question-images/flags/");
}
function asksToIdentifyFlag(text: string): boolean {
  const t = text.toLowerCase();
  return t.includes("ce drapeau") || t.includes("this flag");
}

async function headStatus(url: string): Promise<number> {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(10_000),
    });
    return res.status;
  } catch {
    return 0; // réseau/timeout — signalé, jamais auto-supprimé
  }
}

async function sendReport(subject: string, html: string): Promise<boolean> {
  if (!RESEND_KEY) {
    console.warn("RESEND_API_KEY_BIGHEAD not set — skipping email");
    return false;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: EMAIL_FROM, to: [EMAIL_TO], subject, html }),
  });
  if (!res.ok) console.error("resend send failed", res.status, await res.text());
  return res.ok;
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const cronSecret = Deno.env.get("CRON_SECRET");
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  const isAuthorized =
    (cronSecret && token === cronSecret) || token === SERVICE_ROLE_KEY;
  if (!isAuthorized) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // ---- Règle 1 : drapeaux-spoilers ----
  // Paginé : PostgREST plafonne à 1000 rows par requête.
  const rows: QuestionRow[] = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("questions")
      .select("id, category, question_text, correct_answer, image_url")
      .eq("is_active", true)
      .not("image_url", "is", null)
      .order("id")
      .range(from, from + PAGE - 1);
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    rows.push(...((data ?? []) as QuestionRow[]));
    if (!data || data.length < PAGE) break;
  }
  const spoilers = rows.filter(
    (q) => isFlagImage(q.image_url) && !asksToIdentifyFlag(q.question_text),
  );

  for (const q of spoilers) {
    await supabase
      .from("questions")
      .update({ original_image_url: q.image_url, image_url: null })
      .eq("id", q.id);
  }

  // ---- Règle 2 : URLs mortes (HEAD séquencé sur les URLs distinctes) ----
  const remaining = rows.filter((q) => !spoilers.includes(q));
  const byUrl = new Map<string, QuestionRow[]>();
  for (const q of remaining) {
    const list = byUrl.get(q.image_url) ?? [];
    list.push(q);
    byUrl.set(q.image_url, list);
  }

  // Lots de 6 en parallèle : ~6x plus rapide que le séquentiel (limite
  // wall-clock edge 150s) tout en restant sous le rate-limit Storage
  // (les 429 isolés sont retentés après une pause).
  const dead: Array<{ url: string; status: number; count: number }> = [];
  const flaky: Array<{ url: string; status: number; count: number }> = [];
  const entries = [...byUrl.entries()];
  const BATCH = 6;
  for (let i = 0; i < entries.length; i += BATCH) {
    const batch = entries.slice(i, i + BATCH);
    await Promise.all(
      batch.map(async ([url, qs]) => {
        let status = await headStatus(url);
        if (status === 429) {
          await new Promise((r) => setTimeout(r, 2_000));
          status = await headStatus(url);
        }
        if (status === 404 || status === 410) {
          dead.push({ url, status, count: qs.length });
          for (const q of qs) {
            await supabase
              .from("questions")
              .update({ original_image_url: q.image_url, image_url: null })
              .eq("id", q.id);
          }
        } else if (status !== 200 && status !== 429) {
          flaky.push({ url, status, count: qs.length });
        }
      }),
    );
    await new Promise((r) => setTimeout(r, 100));
  }

  const summary = {
    checked_questions: rows.length,
    checked_urls: byUrl.size,
    spoilers_disabled: spoilers.length,
    dead_urls_disabled: dead.length,
    flaky_urls: flaky.length,
  };

  // ---- Email (uniquement si quelque chose à dire) ----
  let emailed = false;
  if (spoilers.length > 0 || dead.length > 0 || flaky.length > 0) {
    const spoilerRows = spoilers
      .slice(0, 20)
      .map(
        (q) =>
          `<tr><td>${esc(q.category)}</td><td>${esc(q.question_text.slice(0, 90))}</td><td>${esc(q.correct_answer)}</td></tr>`,
      )
      .join("");
    const deadRows = dead
      .slice(0, 20)
      .map(
        (d) =>
          `<tr><td>${d.status}</td><td>${d.count}</td><td>${esc(d.url)}</td></tr>`,
      )
      .join("");
    const flakyRows = flaky
      .slice(0, 20)
      .map(
        (f) =>
          `<tr><td>${f.status || "timeout"}</td><td>${f.count}</td><td>${esc(f.url)}</td></tr>`,
      )
      .join("");

    const html = `
      <h2>🛡️ Audit images BIGHEAD — actions du jour</h2>
      <p><b>${spoilers.length}</b> image(s) spoiler retirée(s) ·
         <b>${dead.length}</b> URL(s) morte(s) désactivée(s) ·
         <b>${flaky.length}</b> URL(s) instable(s) à surveiller ·
         ${summary.checked_urls} URLs vérifiées sur ${summary.checked_questions} questions.</p>
      ${spoilers.length ? `<h3>Spoilers retirés (image drapeau sans question d'identification)</h3><table border="1" cellpadding="4"><tr><th>Catégorie</th><th>Question</th><th>Réponse</th></tr>${spoilerRows}</table>` : ""}
      ${dead.length ? `<h3>URLs mortes désactivées (404/410)</h3><table border="1" cellpadding="4"><tr><th>Status</th><th>Questions</th><th>URL</th></tr>${deadRows}</table>` : ""}
      ${flaky.length ? `<h3>URLs instables (aucune action automatique)</h3><table border="1" cellpadding="4"><tr><th>Status</th><th>Questions</th><th>URL</th></tr>${flakyRows}</table>` : ""}
      <p style="color:#888">Les images retirées sont sauvegardées dans <code>original_image_url</code> (restauration possible).
      Garde-fou : edge function <code>audit-question-images</code>, cron quotidien 08h00.</p>`;

    emailed = await sendReport(
      `🛡️ BIGHEAD images : ${spoilers.length + dead.length} action(s), ${flaky.length} alerte(s)`,
      html,
    );
  }

  return new Response(JSON.stringify({ ...summary, emailed }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
