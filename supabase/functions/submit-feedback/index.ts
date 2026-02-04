// Supabase Edge Function: Submit App Feedback
// Stores user feedback in database and sends email notification

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface FeedbackRequest {
  rating: number;
  feedback_text?: string;
  app_version?: string;
  device_info?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get user from auth header if available
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    const body: FeedbackRequest = await req.json();

    // Validate rating
    if (!body.rating || body.rating < 1 || body.rating > 5) {
      return new Response(
        JSON.stringify({ error: "Rating must be between 1 and 5" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Insert feedback into database
    const { data: feedback, error: insertError } = await supabase
      .from("app_feedback")
      .insert({
        user_id: userId,
        rating: body.rating,
        feedback_text: body.feedback_text || null,
        app_version: body.app_version || null,
        device_info: body.device_info || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error(`Failed to save feedback: ${insertError.message}`);
    }

    console.log("Feedback saved:", feedback.id);

    // Send email notification if RESEND_API_KEY is configured
    if (RESEND_API_KEY && body.feedback_text) {
      try {
        const stars = "★".repeat(body.rating) + "☆".repeat(5 - body.rating);
        const emailBody = `
Nouveau feedback BIGHEAD

Note: ${stars} (${body.rating}/5)

${body.feedback_text ? `Commentaire:\n${body.feedback_text}` : "Pas de commentaire"}

---
Version: ${body.app_version || "N/A"}
Device: ${body.device_info || "N/A"}
User ID: ${userId || "Anonyme"}
Date: ${new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" })}
        `.trim();

        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "BIGHEAD <noreply@bighead-app.com>",
            to: ["contact@jrmanagement.org"],
            subject: `[BIGHEAD] Feedback ${stars}`,
            text: emailBody,
          }),
        });

        if (!emailResponse.ok) {
          console.error("Email send failed:", await emailResponse.text());
        } else {
          console.log("Email notification sent");
        }
      } catch (emailError) {
        // Don't fail the request if email fails
        console.error("Email error:", emailError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        id: feedback.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
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
