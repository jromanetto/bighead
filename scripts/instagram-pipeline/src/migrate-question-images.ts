/**
 * Migrate question images from external CDNs to Supabase Storage.
 *
 * Usage:
 *   cd scripts/instagram-pipeline && npx tsx src/migrate-question-images.ts
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_KEY in .env
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "question-images";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

/** Guess content-type from URL or response headers */
function getContentType(url: string, headers: Headers): string {
  const ct = headers.get("content-type");
  if (ct && ct.startsWith("image/")) return ct.split(";")[0];

  // Fallback: guess from URL extension
  if (url.includes(".svg")) return "image/svg+xml";
  if (url.includes(".png")) return "image/png";
  if (url.includes(".webp")) return "image/webp";
  if (url.includes(".gif")) return "image/gif";
  return "image/jpeg"; // default
}

/** Get file extension from content type */
function extFromContentType(ct: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/svg+xml": "svg",
    "image/gif": "gif",
  };
  return map[ct] ?? "jpg";
}

async function main() {
  console.log("=== Migrate question images to Supabase Storage ===\n");

  // 1. Fetch all questions with an image_url
  const { data: questions, error } = await supabase
    .from("questions")
    .select("id, image_url, original_image_url")
    .not("image_url", "is", null);

  if (error) {
    console.error("Failed to fetch questions:", error.message);
    process.exit(1);
  }

  console.log(`Found ${questions.length} questions with images\n`);

  // Filter out questions already migrated (image_url already points to Supabase)
  const supabaseHost = new URL(process.env.SUPABASE_URL!).host;
  const toMigrate = questions.filter(
    (q: any) => !q.image_url.includes(supabaseHost)
  );
  const alreadyMigrated = questions.length - toMigrate.length;

  if (alreadyMigrated > 0) {
    console.log(`Skipping ${alreadyMigrated} already migrated\n`);
  }

  if (toMigrate.length === 0) {
    console.log("Nothing to migrate!");
    return;
  }

  let success = 0;
  let failed = 0;

  for (const q of toMigrate) {
    const url = q.image_url as string;
    const id = q.id as string;

    try {
      // Download with retry for rate-limited sources
      let res: Response | null = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        if (url.includes("wikimedia.org")) {
          await new Promise((r) => setTimeout(r, 5000));
        }
        res = await fetch(url, {
          headers: {
            "User-Agent":
              "BigHeadQuizApp/1.0 (https://bighead-quizz.com; julien@romanetto.com)",
          },
          redirect: "follow",
        });
        if (res.status !== 429) break;
        console.log(`  RETRY ${id} (attempt ${attempt + 1}/3, got 429)`);
        await new Promise((r) => setTimeout(r, 10000 * (attempt + 1)));
      }

      if (!res || !res.ok) {
        console.log(`  SKIP ${id} - HTTP ${res?.status} for ${url}`);
        failed++;
        continue;
      }

      const contentType = getContentType(url, res.headers);
      const ext = extFromContentType(contentType);
      const buffer = Buffer.from(await res.arrayBuffer());
      const path = `${id}.${ext}`;

      console.log(
        `  [${success + failed + 1}/${toMigrate.length}] ${id} (${(buffer.length / 1024).toFixed(0)}KB, ${contentType})`
      );

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, buffer, { contentType, upsert: true });

      if (uploadError) {
        console.log(`  FAIL upload ${id}: ${uploadError.message}`);
        failed++;
        continue;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET).getPublicUrl(path);

      // Update question: save original URL, set new URL
      const { error: updateError } = await supabase
        .from("questions")
        .update({
          original_image_url: url,
          image_url: publicUrl,
        })
        .eq("id", id);

      if (updateError) {
        console.log(`  FAIL update ${id}: ${updateError.message}`);
        failed++;
        continue;
      }

      success++;
    } catch (err: any) {
      console.log(`  ERROR ${id}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n=== Done ===`);
  console.log(`  Migrated: ${success}`);
  console.log(`  Failed:   ${failed}`);
  console.log(`  Skipped:  ${alreadyMigrated} (already on Supabase)`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
