// Supabase Edge Function: Delete Account (Apple 5.1.1(v) compliance)
// Verifies caller's JWT, then permanently deletes the auth user.
// Cascades cleanup for tables not covered by FK constraints.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1. Verify caller's JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = user.id;
    console.log(`[delete-account] Deleting user ${userId}`);

    // 2. Cleanup tables not covered by FK CASCADE (best-effort, errors logged)
    // Duels where this user was host OR guest
    try {
      await admin.from("duels").delete().or(`host_id.eq.${userId},guest_id.eq.${userId}`);
    } catch (e) {
      console.error("[delete-account] duels cleanup failed:", e);
    }

    // Friend challenges created by this user
    try {
      await admin.from("friend_challenges").delete().eq("creator_id", userId);
    } catch (e) {
      console.error("[delete-account] friend_challenges cleanup failed:", e);
    }

    // Tournament participants
    try {
      await admin.from("tournament_participants").delete().eq("user_id", userId);
    } catch (e) {
      console.error("[delete-account] tournament_participants cleanup failed:", e);
    }

    // Public user profile (users table). Most FKs from this row should cascade.
    try {
      await admin.from("users").delete().eq("id", userId);
    } catch (e) {
      console.error("[delete-account] users cleanup failed:", e);
    }

    // 3. Delete the auth user (this is the source of truth)
    const { error: deleteErr } = await admin.auth.admin.deleteUser(userId);
    if (deleteErr) {
      console.error("[delete-account] auth deletion failed:", deleteErr);
      return new Response(
        JSON.stringify({ error: `Auth deletion failed: ${deleteErr.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[delete-account] Successfully deleted user ${userId}`);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[delete-account] Unexpected error:", error);
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
