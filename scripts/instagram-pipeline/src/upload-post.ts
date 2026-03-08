import { writeFileSync, unlinkSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

export interface UploadPostResult {
  success: boolean;
  postId?: string;
  platforms: string[];
  publishedAt?: string;
  message: string;
}

/**
 * Post a video to multiple platforms via Upload-Post API.
 * https://api.upload-post.com
 */
/** Send a single upload request to Upload-Post */
async function sendUpload(
  videoBuffer: Buffer,
  description: string,
  platforms: string[],
  user: string,
  apiKey: string,
  mediaType?: "REELS" | "STORIES",
  scheduleDatetime?: string
): Promise<UploadPostResult> {
  const formData = new globalThis.FormData();
  const file = new globalThis.File([new Uint8Array(videoBuffer)], "video.mp4", { type: "video/mp4" });
  formData.append("video", file);
  formData.append("user", user);
  formData.append("title", description);

  for (const platform of platforms) {
    formData.append("platform[]", platform);
  }

  if (mediaType) {
    formData.append("media_type", mediaType);
  }

  if (scheduleDatetime) {
    formData.append("publishAt", scheduleDatetime);
  }

  const label = mediaType || "REELS";
  console.log(`  Uploading to Upload-Post [${label}] (${platforms.join(", ")})...`);
  const res = await fetch("https://api.upload-post.com/api/upload", {
    method: "POST",
    headers: { Authorization: `Apikey ${apiKey}` },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    console.error(`  Upload-Post [${label}] error:`, JSON.stringify(data, null, 2));
    return { success: false, platforms, message: data.message || data.error || `HTTP ${res.status}` };
  }

  console.log(`  Upload-Post [${label}] response:`, JSON.stringify(data, null, 2));
  return {
    success: true,
    postId: data.id || data.postId,
    platforms,
    publishedAt: scheduleDatetime || new Date().toISOString(),
    message: data.message || "Posted successfully",
  };
}

/** Post a video as both Reel + Story via Upload-Post API */
export async function uploadPost(
  videoUrl: string,
  description: string,
  platforms: string[],
  user: string,
  scheduleDatetime?: string
): Promise<UploadPostResult> {
  const apiKey = process.env.UPLOAD_POST_KEY;
  if (!apiKey) throw new Error("Missing UPLOAD_POST_KEY in env");

  // Download video once
  console.log("  Downloading video for upload...");
  const videoRes = await fetch(videoUrl);
  if (!videoRes.ok) throw new Error(`Failed to download video: ${videoRes.status}`);
  const videoBuffer = Buffer.from(await videoRes.arrayBuffer());
  console.log(`  Downloaded ${(videoBuffer.length / 1024 / 1024).toFixed(1)} MB`);

  // Separate Instagram from other platforms
  const hasInstagram = platforms.includes("instagram");
  const otherPlatforms = platforms.filter(p => p !== "instagram");

  // Post Reel (Instagram + other platforms)
  const reelResult = await sendUpload(videoBuffer, description, platforms, user, apiKey, "REELS", scheduleDatetime);

  // Post Story (Instagram only, no caption needed)
  if (hasInstagram) {
    console.log("  Also posting as Instagram Story...");
    const storyResult = await sendUpload(videoBuffer, "", ["instagram"], user, apiKey, "STORIES", scheduleDatetime);
    if (!storyResult.success) {
      console.warn(`  ⚠️ Story upload failed: ${storyResult.message}`);
    } else {
      console.log("  ✅ Story posted!");
    }
  }

  return reelResult;
}
