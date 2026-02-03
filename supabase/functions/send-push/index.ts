// Supabase Edge Function: Send Push Notification
// Generic function to send push notifications to specific users or broadcast
// Used for: duel invites, tournament alerts, achievements, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const EXPO_ACCESS_TOKEN = Deno.env.get("EXPO_ACCESS_TOKEN");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: "default" | null;
  badge?: number;
  channelId?: string;
  priority?: "default" | "normal" | "high";
  ttl?: number;
}

interface PushRequest {
  // Target: specific user(s) or broadcast
  user_id?: string;
  user_ids?: string[];
  broadcast?: boolean;

  // Notification content
  title: string;
  body: string;
  data?: Record<string, unknown>;

  // Options
  sound?: boolean;
  priority?: "default" | "normal" | "high";
  ttl?: number;
  channelId?: string;
}

// Predefined notification templates
const TEMPLATES: Record<string, { title: string; body: string; data?: Record<string, unknown> }> = {
  duel_invite: {
    title: "⚔️ Défi en duel !",
    body: "{username} te défie en duel !",
    data: { screen: "duel" },
  },
  duel_accepted: {
    title: "⚔️ Défi accepté !",
    body: "{username} a accepté ton défi. C'est parti !",
    data: { screen: "duel" },
  },
  duel_result: {
    title: "🏆 Résultat du duel",
    body: "{result}",
    data: { screen: "duel" },
  },
  tournament_start: {
    title: "🏆 Tournoi commencé !",
    body: "Le tournoi {name} vient de démarrer. Rejoins la compétition !",
    data: { screen: "tournament" },
  },
  tournament_ending: {
    title: "⏰ Tournoi se termine bientôt !",
    body: "Plus que {time} pour participer au tournoi !",
    data: { screen: "tournament" },
  },
  achievement: {
    title: "🎖️ Nouveau succès !",
    body: "Tu as débloqué : {achievement}",
    data: { screen: "profile" },
  },
  level_up: {
    title: "⬆️ Niveau supérieur !",
    body: "Félicitations ! Tu es maintenant niveau {level}",
    data: { screen: "profile" },
  },
  streak_reminder: {
    title: "🔥 Garde ta série !",
    body: "Joue aujourd'hui pour maintenir ta série de {days} jours !",
    data: { screen: "home" },
  },
  friend_joined: {
    title: "👋 Nouvel ami !",
    body: "{username} a rejoint BIGHEAD !",
    data: { screen: "friends" },
  },
};

async function sendExpoPush(messages: ExpoPushMessage[]): Promise<{ sent: number; failed: number }> {
  const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
  const BATCH_SIZE = 100;

  let sent = 0;
  let failed = 0;

  for (let i = 0; i < messages.length; i += BATCH_SIZE) {
    const batch = messages.slice(i, i + BATCH_SIZE);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (EXPO_ACCESS_TOKEN) {
      headers["Authorization"] = `Bearer ${EXPO_ACCESS_TOKEN}`;
    }

    try {
      const response = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers,
        body: JSON.stringify(batch),
      });

      if (!response.ok) {
        console.error(`Expo API error: ${response.status}`);
        failed += batch.length;
        continue;
      }

      const result = await response.json();
      const tickets = result.data || [];

      for (const ticket of tickets) {
        if (ticket.status === "ok") {
          sent++;
        } else {
          failed++;
          console.error(`Push failed: ${ticket.message || ticket.details?.error}`);
        }
      }

      // Rate limit protection
      if (i + BATCH_SIZE < messages.length) {
        await new Promise((r) => setTimeout(r, 100));
      }
    } catch (error) {
      console.error(`Batch failed:`, error);
      failed += batch.length;
    }
  }

  return { sent, failed };
}

// Replace template variables like {username} with actual values
function applyTemplate(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), value);
  }
  return result;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body: PushRequest & { template?: string; variables?: Record<string, string> } = await req.json();

    // Use template if provided
    let title = body.title;
    let notifBody = body.body;
    let data = body.data || {};

    if (body.template && TEMPLATES[body.template]) {
      const tmpl = TEMPLATES[body.template];
      title = applyTemplate(tmpl.title, body.variables || {});
      notifBody = applyTemplate(tmpl.body, body.variables || {});
      data = { ...tmpl.data, ...data };
    }

    if (!title || !notifBody) {
      return new Response(
        JSON.stringify({ error: "Missing title or body (or valid template)" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get target tokens
    let tokens: { user_id: string; push_token: string }[] = [];

    if (body.user_id) {
      // Single user
      const { data: user } = await supabase
        .from("users")
        .select("id, push_token")
        .eq("id", body.user_id)
        .not("push_token", "is", null)
        .single();

      if (user?.push_token) {
        tokens = [{ user_id: user.id, push_token: user.push_token }];
      }
    } else if (body.user_ids && body.user_ids.length > 0) {
      // Multiple users
      const { data: users } = await supabase
        .from("users")
        .select("id, push_token")
        .in("id", body.user_ids)
        .not("push_token", "is", null);

      tokens = (users || []).map((u) => ({
        user_id: u.id,
        push_token: u.push_token,
      }));
    } else if (body.broadcast) {
      // All users with push tokens
      const { data: allTokens } = await supabase.rpc("get_active_push_tokens");
      tokens = allTokens || [];
    } else {
      return new Response(
        JSON.stringify({ error: "Specify user_id, user_ids, or broadcast: true" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (tokens.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No valid push tokens found", sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build messages
    const messages: ExpoPushMessage[] = tokens.map((t) => ({
      to: t.push_token,
      title,
      body: notifBody,
      data,
      sound: body.sound !== false ? "default" : null,
      priority: body.priority || "high",
      ttl: body.ttl || 86400,
      channelId: body.channelId || "default",
    }));

    // Send
    const result = await sendExpoPush(messages);

    console.log(`Push sent: ${result.sent}, failed: ${result.failed}`);

    return new Response(
      JSON.stringify({
        success: true,
        total: tokens.length,
        ...result,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
