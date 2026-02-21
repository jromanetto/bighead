import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

async function migrate() {
  const sb = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  const sql = `
    CREATE TABLE IF NOT EXISTS instagram_posts (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      created_at timestamptz DEFAULT now(),
      question jsonb NOT NULL,
      heygen_video_id text,
      video_url text,
      supabase_storage_path text,
      instagram_media_id text,
      instagram_permalink text,
      status text DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'uploading', 'publishing', 'published', 'error')),
      error text
    );
  `;

  // Use the SQL editor endpoint directly
  const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/`, {
    method: "POST",
    headers: {
      apikey: process.env.SUPABASE_SERVICE_KEY!,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY!}`,
      "Content-Type": "application/json",
    },
  });

  // Fallback: try inserting a test row to see if table exists
  const { error } = await sb
    .from("instagram_posts")
    .select("id")
    .limit(1);

  if (error?.message.includes("does not exist")) {
    console.log("Table does not exist. Please create it via Supabase Dashboard SQL Editor:");
    console.log(sql);
    process.exit(1);
  } else if (error) {
    console.log("Error:", error.message);
  } else {
    console.log("Table instagram_posts exists!");
  }
}

migrate();
