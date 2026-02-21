import "dotenv/config";
import { generateQuestion } from "./generate-question.js";
import {
  generateVideoAgent,
  waitForVideo,
} from "./heygen.js";
import { postReelToInstagram, postStoryToInstagram } from "./instagram.js";
import { ensureBucket, uploadVideo } from "./storage.js";
import { createPost, updatePost, getPreviousQuestions } from "./db.js";

const DRY_RUN = process.argv.includes("--dry-run");
const SKIP_INSTAGRAM = process.argv.includes("--skip-instagram");

async function main() {
  const startTime = Date.now();
  console.log(`\n${"=".repeat(60)}`);
  console.log(`🎬 BigHead Instagram Quiz Pipeline`);
  console.log(`📅 ${new Date().toISOString()}`);
  console.log(`${"=".repeat(60)}\n`);

  // Validate env vars
  const required: string[] = ["ANTHROPIC_API_KEY"];
  if (!DRY_RUN) {
    required.push("HEYGEN_API_KEY", "SUPABASE_URL", "SUPABASE_SERVICE_KEY");
  }
  if (!DRY_RUN && !SKIP_INSTAGRAM) {
    required.push("INSTAGRAM_ACCESS_TOKEN", "INSTAGRAM_USER_ID");
  }

  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing env var: ${key}`);
    }
  }

  // Step 1: Generate question
  console.log("🧠 Step 1: Generating quiz question with Claude...");
  const previousQuestions = await getPreviousQuestions();
  const question = await generateQuestion(previousQuestions);
  console.log(`  Hook: "${question.hook}"`);
  console.log(`  Question: "${question.question}"`);
  console.log(`  Answer: ${question.answer.toUpperCase()} - ${question.answer_text}`);
  console.log(`  Fun fact: "${question.fun_fact}"`);
  console.log(`  Intro: "${question.intro_script.slice(0, 80)}..."`);
  console.log(`  Outro: "${question.outro_script.slice(0, 80)}..."`);
  console.log(`  Outfit: "${question.outfit}"`);
  console.log(`  Expression: "${question.expression}"\n`);

  if (DRY_RUN) {
    console.log("🏁 Dry run complete. Question generated successfully.");
    console.log(JSON.stringify(question, null, 2));
    return;
  }

  // Create DB record
  const postId = await createPost(question);
  console.log(`  DB record created: ${postId}\n`);

  try {
    // Step 2: Generate video with HeyGen Video Agent
    console.log("🎥 Step 2: Generating video with HeyGen Video Agent...");
    await updatePost(postId, { status: "generating" });

    const videoId = await generateVideoAgent(question);

    console.log(`  Video ID: ${videoId}`);
    await updatePost(postId, { heygen_video_id: videoId });

    // Step 3: Wait for video
    console.log("\n⏳ Step 3: Waiting for HeyGen rendering...");
    const heygenVideoUrl = await waitForVideo(videoId);
    console.log(`  Video ready: ${heygenVideoUrl}\n`);
    await updatePost(postId, { video_url: heygenVideoUrl });

    // Step 4: Upload to Supabase Storage
    console.log("☁️  Step 4: Uploading to Supabase Storage...");
    await updatePost(postId, { status: "uploading" });
    await ensureBucket();
    const filename = `quiz-${new Date().toISOString().slice(0, 10)}-${postId.slice(0, 8)}.mp4`;
    const publicUrl = await uploadVideo(heygenVideoUrl, filename);
    await updatePost(postId, { supabase_storage_path: publicUrl });
    console.log();

    if (SKIP_INSTAGRAM) {
      console.log("⏭️  Skipping Instagram (--skip-instagram flag)");
      await updatePost(postId, { status: "published" });
    } else {
      // Step 5: Post to Instagram
      console.log("📸 Step 5: Publishing to Instagram Reels...");
      await updatePost(postId, { status: "publishing" });

      const caption = [
        question.caption,
        "",
        question.hashtags.join(" "),
        "",
        "📲 Télécharge BigHead sur l'App Store pour plus de quiz !",
        "🔗 Lien en bio",
      ].join("\n");

      const result = await postReelToInstagram(publicUrl, caption);
      await updatePost(postId, {
        instagram_media_id: result.mediaId,
        instagram_permalink: result.permalink,
      });

      // Step 6: Post to Instagram Stories
      console.log("\n📖 Step 6: Publishing to Instagram Stories...");
      try {
        const storyResult = await postStoryToInstagram(publicUrl);
        console.log(`  Story media ID: ${storyResult.mediaId}`);
      } catch (storyError) {
        const msg = storyError instanceof Error ? storyError.message : String(storyError);
        console.warn(`  ⚠️  Story posting failed (non-blocking): ${msg}`);
      }

      await updatePost(postId, { status: "published" });
    }

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
