// Supabase Edge Function: Requalify Difficulties (daily)
//
// Runs the live difficulty requalification: questions answered enough times
// get nudged ±1 level toward what players actually experience (the "3 mistakes
// → harder / very high success → easier" rule), bounded around the AI base.
// Driven by a daily VPS cron. Auth: CRON_SECRET or service role.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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
  const { data, error } = await supabase.rpc("requalify_question_difficulties");
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const row = Array.isArray(data) ? data[0] : data;
  return new Response(
    JSON.stringify({ harder: row?.harder ?? 0, easier: row?.easier ?? 0 }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
