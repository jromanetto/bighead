// Supabase Edge Function: Send Web Push (PWA daily reminder)
// Envoie le rappel quotidien à tous les abonnés web push (play.bighead-quizz.com).
// Déclenchée par le cron VPS (même pattern que send-daily-notification).
//
// Secrets requis : VAPID_KEYS_JWK (paire JWK), VAPID_CONTACT (mailto:),
// CRON_SECRET (auth de l'appelant).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as webpush from "jsr:@negrel/webpush@0.5.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_KEYS_JWK = Deno.env.get("VAPID_KEYS_JWK")!;
const VAPID_CONTACT = Deno.env.get("VAPID_CONTACT") ?? "mailto:julien@romanetto.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SubscriptionRow {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  lang: string;
}

const MESSAGES: Record<string, { title: string; body: string }> = {
  fr: {
    title: "BIGHEAD",
    body: "🧠 Ton défi du jour t’attend ! Garde ta série 🔥",
  },
  en: {
    title: "BIGHEAD",
    body: "🧠 Your daily challenge is waiting! Keep your streak 🔥",
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Auth : CRON_SECRET ou service role key, comme send-daily-notification.
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

  // Payload custom optionnel (annonces : nouveau défi, événement...).
  // Sans body, on envoie le rappel quotidien par défaut.
  let custom: { title?: string; body?: string; url?: string; tag?: string } = {};
  try {
    custom = await req.json();
  } catch {
    // pas de body = rappel quotidien
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const { data, error } = await supabase
    .from("web_push_subscriptions")
    .select("id, endpoint, p256dh, auth, lang");
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const subs = (data ?? []) as SubscriptionRow[];
  if (subs.length === 0) {
    return new Response(JSON.stringify({ sent: 0, pruned: 0, failed: 0 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const vapidKeys = await webpush.importVapidKeys(JSON.parse(VAPID_KEYS_JWK), {
    extractable: false,
  });
  const appServer = await webpush.ApplicationServer.new({
    contactInformation: VAPID_CONTACT,
    vapidKeys,
  });

  let sent = 0;
  let pruned = 0;
  let failed = 0;
  const sentIds: string[] = [];
  const goneIds: string[] = [];

  for (const sub of subs) {
    const msg = MESSAGES[sub.lang] ?? MESSAGES.fr;
    const payload = JSON.stringify({
      title: custom.title ?? msg.title,
      body: custom.body ?? msg.body,
      url: custom.url ?? "/play/daily",
      tag: custom.tag ?? "bh-daily",
    });
    try {
      const subscriber = appServer.subscribe({
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      });
      await subscriber.pushTextMessage(payload, { urgency: webpush.Urgency.Normal });
      sent++;
      sentIds.push(sub.id);
    } catch (err) {
      // 404/410 = abonnement mort (navigateur désabonné) → purge.
      const status = err instanceof webpush.PushMessageError
        ? err.response.status
        : null;
      if (status === 404 || status === 410) {
        goneIds.push(sub.id);
        pruned++;
      } else {
        failed++;
        console.error(`push failed for ${sub.id}:`, err);
      }
    }
  }

  if (sentIds.length > 0) {
    await supabase
      .from("web_push_subscriptions")
      .update({ last_notified_at: new Date().toISOString() })
      .in("id", sentIds);
  }
  if (goneIds.length > 0) {
    await supabase.from("web_push_subscriptions").delete().in("id", goneIds);
  }

  return new Response(JSON.stringify({ sent, pruned, failed }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
