import { createClient } from "@supabase/supabase-js";
import type { QuizQuestion } from "./generate-question.js";

function supabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
}

export type InstagramPost = {
  id?: string;
  created_at?: string;
  question: QuizQuestion;
  heygen_video_id?: string;
  video_url?: string;
  supabase_storage_path?: string;
  instagram_media_id?: string;
  instagram_permalink?: string;
  status: "pending" | "generating" | "uploading" | "publishing" | "published" | "error";
  error?: string;
};

/** Create a new post record */
export async function createPost(question: QuizQuestion): Promise<string> {
  const sb = supabase();
  // @ts-ignore - table not in generated types
  const { data, error } = await sb
    .from("instagram_posts")
    .insert({ question, status: "pending" })
    .select("id")
    .single();

  if (error) throw new Error(`DB insert failed: ${error.message}`);
  return data.id;
}

/** Update post status and data */
export async function updatePost(
  id: string,
  updates: Partial<InstagramPost>
): Promise<void> {
  const sb = supabase();
  // @ts-ignore
  const { error } = await sb
    .from("instagram_posts")
    .update(updates)
    .eq("id", id);

  if (error) throw new Error(`DB update failed: ${error.message}`);
}

/** Get previously posted questions to avoid duplicates */
export async function getPreviousQuestions(): Promise<string[]> {
  const sb = supabase();
  // @ts-ignore
  const { data, error } = await sb
    .from("instagram_posts")
    .select("question")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return [];
  return (data || []).map((row: any) => row.question?.question).filter(Boolean);
}
