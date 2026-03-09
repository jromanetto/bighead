import "dotenv/config";
import { generateQuestion, translateQuestion } from "./generate-question.js";
import type { QuizQuestion } from "./generate-question.js";
import {
  generateVideo,
  waitForVideo,
} from "./heygen.js";
import type { VideoLang } from "./heygen.js";
import { uploadPost } from "./upload-post.js";
import { ensureBucket, uploadVideo } from "./storage.js";
import { createPost, updatePost, getPreviousQuestions } from "./db.js";

const DRY_RUN = process.argv.includes("--dry-run") || process.env.DRY_RUN === "true";
const SKIP_POSTING = process.argv.includes("--skip-posting") || process.env.SKIP_POSTING === "true";

// EN is enabled if we have an EN voice (Upload-Post handles account routing)
const HAS_EN = !!process.env.HEYGEN_VOICE_ID_EN;

// Platforms: "instagram", "tiktok", "youtube" (comma-separated)
const FR_PLATFORMS = (process.env.FR_PLATFORMS || "instagram").split(",").map(s => s.trim());
const EN_PLATFORMS = (process.env.EN_PLATFORMS || "instagram").split(",").map(s => s.trim());

// Upload-Post user profiles per language
const UPLOAD_POST_USER_FR = process.env.UPLOAD_POST_USER_FR || "bighead-fr";
const UPLOAD_POST_USER_EN = process.env.UPLOAD_POST_USER_EN || "bighead-en";

/** Generate video, upload, and post via Upload-Post for a given language */
async function processLang(
  question: QuizQuestion,
  lang: VideoLang,
  postId: string
) {
  const prefix = lang.toUpperCase();

  // Generate video
  console.log(`\n🎥 [${prefix}] Generating video with HeyGen v2 API...`);
  const videoId = await generateVideo(question, lang);
  console.log(`  Video ID: ${videoId}`);

  // Wait for rendering
  console.log(`\n⏳ [${prefix}] Waiting for HeyGen rendering...`);
  const heygenVideoUrl = await waitForVideo(videoId);
  console.log(`  Video ready: ${heygenVideoUrl}\n`);

  // Upload to Supabase Storage
  console.log(`☁️  [${prefix}] Uploading to Supabase Storage...`);
  await ensureBucket();
  const filename = `quiz-${lang}-${new Date().toISOString().slice(0, 10)}-${postId.slice(0, 8)}.mp4`;
  const publicUrl = await uploadVideo(heygenVideoUrl, filename);

  if (lang === "fr") {
    await updatePost(postId, { heygen_video_id: videoId, video_url: heygenVideoUrl, supabase_storage_path: publicUrl });
  }
  console.log();

  // Post via Upload-Post
  if (!SKIP_POSTING) {
    const platforms = lang === "fr" ? FR_PLATFORMS : EN_PLATFORMS;
    const isFr = lang === "fr";

    const caption = [
      question.caption,
      "",
      isFr
        ? "💬 Mets ta réponse en commentaire !"
        : "💬 Drop your answer in the comments!",
      "",
      question.hashtags.join(" "),
      "",
      isFr
        ? "📲 Télécharge BigHead sur l'App Store pour découvrir la réponse !"
        : "📲 Download BigHead on the App Store to find the answer!",
      isFr
        ? "🔗 Lien en bio | #quiz #bighead #shorts"
        : "🔗 Link in bio | #quiz #bighead #shorts",
    ].join("\n");

    const user = lang === "fr" ? UPLOAD_POST_USER_FR : UPLOAD_POST_USER_EN;
    console.log(`📤 [${prefix}] Publishing via Upload-Post (${platforms.join(", ")}) as ${user}...`);
    const result = await uploadPost(publicUrl, caption, platforms, user);

    if (result.success) {
      console.log(`✅ [${prefix}] Posted! ID: ${result.postId}`);
      if (lang === "fr") {
        await updatePost(postId, { instagram_media_id: result.postId } as any);
      }
    } else {
      console.warn(`⚠️  [${prefix}] Upload-Post failed: ${result.message}`);
    }
  } else {
    console.log(`⏭️  [${prefix}] Skipping posting (--skip-posting)`);
  }

  return publicUrl;
}

async function main() {
  const startTime = Date.now();
  console.log(`\n${"=".repeat(60)}`);
  console.log(`🎬 BigHead Instagram Quiz Pipeline`);
  console.log(`📅 ${new Date().toISOString()}`);
  console.log(`🌐 Languages: FR${HAS_EN ? " + EN" : " (EN not configured)"}`);
  console.log(`📤 Posting via: Upload-Post`);
  console.log(`${"=".repeat(60)}\n`);

  // Validate env vars
  const required: string[] = ["ANTHROPIC_API_KEY"];
  if (!DRY_RUN) {
    required.push("HEYGEN_API_KEY", "HEYGEN_AVATAR_ID", "HEYGEN_VOICE_ID", "SUPABASE_URL", "SUPABASE_SERVICE_KEY");
  }
  if (!DRY_RUN && !SKIP_POSTING) {
    required.push("UPLOAD_POST_KEY");
  }

  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing env var: ${key}`);
    }
  }

  // Step 1: Generate FR question
  console.log("🧠 Step 1: Generating quiz question with Claude...");
  const previousQuestions = await getPreviousQuestions();
  const frQuestion = await generateQuestion(previousQuestions);
  console.log(`  Hook: "${frQuestion.hook}"`);
  console.log(`  Question: "${frQuestion.question}"`);
  console.log(`  Answer: ${frQuestion.answer.toUpperCase()} - ${frQuestion.answer_text}`);
  console.log(`  Fun fact: "${frQuestion.fun_fact}"`);
  console.log(`  Category: "${frQuestion.category}"`);
  console.log(`  Outfit: "${frQuestion.outfit}"`);

  // Step 1b: Translate to EN if configured
  let enQuestion: QuizQuestion | null = null;
  if (HAS_EN) {
    console.log("\n🌐 Step 1b: Translating question to English...");
    enQuestion = await translateQuestion(frQuestion);
    console.log(`  EN Hook: "${enQuestion.hook}"`);
    console.log(`  EN Question: "${enQuestion.question}"`);
    console.log(`  EN Answer: ${enQuestion.answer.toUpperCase()} - ${enQuestion.answer_text}`);
  }

  if (DRY_RUN) {
    console.log("\n🏁 Dry run complete.");
    console.log("\n--- FR ---");
    console.log(JSON.stringify(frQuestion, null, 2));
    if (enQuestion) {
      console.log("\n--- EN ---");
      console.log(JSON.stringify(enQuestion, null, 2));
    }
    return;
  }

  // Create DB record
  const postId = await createPost(frQuestion);
  console.log(`  DB record created: ${postId}`);

  try {
    await updatePost(postId, { status: "generating" });

    // Process FR
    await processLang(frQuestion, "fr", postId);

    // Process EN (if configured)
    if (HAS_EN && enQuestion) {
      await processLang(enQuestion, "en", postId);
    }

    await updatePost(postId, { status: "published" });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
    console.log(`\n${"=".repeat(60)}`);
    console.log(`✅ Pipeline completed in ${elapsed}s`);
    console.log(`${"=".repeat(60)}\n`);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`\n❌ Pipeline failed: ${msg}`);
    await updatePost(postId, { status: "error", error: msg });
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
