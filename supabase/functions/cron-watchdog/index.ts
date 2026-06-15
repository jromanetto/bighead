// Supabase Edge Function: Cron Watchdog
//
// Crons used to fail silently (no alerting). This polls cron.job_run_details
// (via the SECURITY DEFINER rpc get_recent_cron_failures) and emails a digest
// when any scheduled job failed in the last window. Scheduled hourly by pg_cron
// with a slight overlap so a failure is never missed between runs.
//
// Auth: CRON_SECRET or service role. Secrets reused from the image-audit job:
// RESEND_API_KEY_BIGHEAD, AUDIT_EMAIL_TO.

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

interface CronFailure {
  jobname: string;
  status: string;
  return_message: string | null;
  start_time: string;
  end_time: string | null;
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function sendAlert(failures: CronFailure[]): Promise<boolean> {
  if (!RESEND_KEY) {
    console.warn("RESEND_API_KEY_BIGHEAD not set — skipping email");
    return false;
  }
  const rows = failures
    .map(
      (f) =>
        `<tr><td style="padding:4px 8px"><b>${esc(f.jobname)}</b></td>` +
        `<td style="padding:4px 8px">${esc(f.start_time)}</td>` +
        `<td style="padding:4px 8px;color:#b91c1c">${esc(f.return_message ?? f.status)}</td></tr>`,
    )
    .join("");
  const html =
    `<h2>🚨 BIGHEAD — ${failures.length} cron(s) en échec</h2>` +
    `<table style="border-collapse:collapse;font-family:system-ui,sans-serif">` +
    `<tr><th style="text-align:left;padding:4px 8px">Job</th>` +
    `<th style="text-align:left;padding:4px 8px">Début</th>` +
    `<th style="text-align:left;padding:4px 8px">Erreur</th></tr>${rows}</table>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: [EMAIL_TO],
      subject: `🚨 BIGHEAD : ${failures.length} cron(s) en échec`,
      html,
    }),
  });
  if (!res.ok) {
    console.error("resend send failed", res.status, await res.text());
    return false;
  }
  return true;
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

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const { data, error } = await supabase.rpc("get_recent_cron_failures", {
    p_minutes: 70,
  });
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const failures = (data ?? []) as CronFailure[];
  let emailed = false;
  if (failures.length > 0) {
    emailed = await sendAlert(failures);
  }

  return new Response(
    JSON.stringify({ failures: failures.length, emailed }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
