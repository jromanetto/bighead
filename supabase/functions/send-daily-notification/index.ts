// Supabase Edge Function: Send Daily Notification
// Sends push notifications with the question of the day to all active users
// Triggered by external cron (GitHub Actions or Vercel Cron)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const EXPO_ACCESS_TOKEN = Deno.env.get("EXPO_ACCESS_TOKEN"); // Optional for higher rate limits

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

interface ExpoPushTicket {
  status: "ok" | "error";
  id?: string;
  message?: string;
  details?: { error?: string };
}

// Send notifications to Expo Push Service in batches
async function sendExpoPushNotifications(
  messages: ExpoPushMessage[]
): Promise<ExpoPushTicket[]> {
  const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
  const BATCH_SIZE = 100; // Expo recommends max 100 per request

  const allTickets: ExpoPushTicket[] = [];

  // Process in batches
  for (let i = 0; i < messages.length; i += BATCH_SIZE) {
    const batch = messages.slice(i, i + BATCH_SIZE);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "Accept-Encoding": "gzip, deflate",
    };

    // Add access token if available (for higher rate limits)
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
        const errorText = await response.text();
        console.error(`Expo API error: ${response.status} - ${errorText}`);
        // Mark all as failed in this batch
        batch.forEach(() => {
          allTickets.push({
            status: "error",
            message: `HTTP ${response.status}: ${errorText}`,
          });
        });
        continue;
      }

      const result = await response.json();
      const tickets = result.data || [];
      allTickets.push(...tickets);

      // Small delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < messages.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error(`Batch ${i / BATCH_SIZE + 1} failed:`, error);
      batch.forEach(() => {
        allTickets.push({
          status: "error",
          message: error.message,
        });
      });
    }
  }

  return allTickets;
}

// Truncate question for notification body (max ~100 chars looks good)
function truncateQuestion(question: string, maxLength: number = 80): string {
  if (question.length <= maxLength) return question;
  return question.substring(0, maxLength - 3) + "...";
}

// Get emoji for category
function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    "Culture Générale": "🧠",
    Histoire: "📜",
    Sport: "⚽",
    Géographie: "🌍",
    Cinéma: "🎬",
    Musique: "🎵",
    Sciences: "🔬",
    Littérature: "📚",
    Art: "🎨",
    "Jeux Vidéo": "🎮",
    Technologie: "💻",
  };
  return emojis[category] || "🧠";
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify authorization
    const authHeader = req.headers.get("Authorization");
    const cronSecret = Deno.env.get("CRON_SECRET");

    // Allow: CRON_SECRET, service role key, or anon key (for testing)
    const token = authHeader?.replace("Bearer ", "");
    const isValidCronSecret = cronSecret && token === cronSecret;
    const isValidServiceRole = token === SUPABASE_SERVICE_ROLE_KEY;

    // If CRON_SECRET is set, require either it or service role key
    if (cronSecret && !isValidCronSecret && !isValidServiceRole) {
      console.log("Auth failed. Token:", token?.substring(0, 20) + "...");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // 1. Get or create today's question (French)
    console.log("Getting today's question...");
    const { data: dailyQuestion, error: questionError } = await supabase.rpc(
      "get_or_create_daily_question",
      { target_date: new Date().toISOString().split('T')[0], p_language: 'fr' }
    );

    if (questionError || !dailyQuestion || dailyQuestion.length === 0) {
      throw new Error(
        `Failed to get daily question: ${questionError?.message || "No question returned"}`
      );
    }

    const question = dailyQuestion[0];
    console.log(`Daily question: ${question.question_text}`);

    // 2. Get all active push tokens
    console.log("Fetching active push tokens...");
    const { data: tokens, error: tokensError } = await supabase.rpc(
      "get_active_push_tokens"
    );

    if (tokensError) {
      throw new Error(`Failed to get push tokens: ${tokensError.message}`);
    }

    if (!tokens || tokens.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No active push tokens found",
          question_id: question.question_id,
          notifications_sent: 0,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Found ${tokens.length} active push tokens`);

    // 3. Prepare notification messages
    const emoji = getCategoryEmoji(question.category);
    const title = `${emoji} Question du jour !`;
    const body = truncateQuestion(question.question_text);

    const messages: ExpoPushMessage[] = tokens.map(
      (t: { user_id: string; push_token: string }) => ({
        to: t.push_token,
        title,
        body,
        data: {
          type: "daily_question",
          questionId: question.question_id,
          dailyQuestionId: question.id,
          screen: "daily", // For deep linking
        },
        sound: "default",
        priority: "high",
        channelId: "reminders",
        ttl: 86400, // 24 hours
      })
    );

    // 4. Send notifications
    console.log(`Sending ${messages.length} notifications...`);
    const tickets = await sendExpoPushNotifications(messages);

    // 5. Log results
    let sent = 0;
    let failed = 0;

    for (let i = 0; i < tickets.length; i++) {
      const ticket = tickets[i];
      const token = tokens[i];

      const status = ticket.status === "ok" ? "sent" : "failed";
      const errorMessage =
        ticket.status === "error"
          ? ticket.message || ticket.details?.error
          : null;

      // Log to database
      await supabase.rpc("log_notification_result", {
        p_daily_question_id: question.id,
        p_user_id: token.user_id,
        p_push_token: token.push_token,
        p_status: status,
        p_error_message: errorMessage,
      });

      if (ticket.status === "ok") {
        sent++;
      } else {
        failed++;
        console.error(
          `Failed to send to ${token.push_token}: ${errorMessage}`
        );

        // If token is invalid, we might want to remove it
        if (
          ticket.details?.error === "DeviceNotRegistered" ||
          ticket.details?.error === "InvalidCredentials"
        ) {
          await supabase
            .from("users")
            .update({ push_token: null, push_token_updated_at: null })
            .eq("id", token.user_id);
          console.log(`Removed invalid token for user ${token.user_id}`);
        }
      }
    }

    console.log(`Notifications sent: ${sent}, failed: ${failed}`);

    return new Response(
      JSON.stringify({
        success: true,
        question: {
          id: question.id,
          text: question.question_text,
          category: question.category,
        },
        notifications: {
          total: tokens.length,
          sent,
          failed,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
