import { getAccessToken } from "./tiktok-auth.js";

const TIKTOK_BASE = "https://open.tiktokapis.com/v2";

async function headers() {
  const token = await getAccessToken();
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json; charset=UTF-8",
  };
}

/** Query creator info to check what privacy levels are available */
export async function getCreatorInfo(): Promise<{
  privacy_level_options: string[];
  max_video_post_duration_sec: number;
}> {
  const res = await fetch(`${TIKTOK_BASE}/post/publish/creator_info/query/`, {
    method: "POST",
    headers: await headers(),
  });

  const data = await res.json();
  if (data.error?.code !== "ok") {
    throw new Error(`TikTok creator info failed: ${JSON.stringify(data.error)}`);
  }

  return data.data;
}

/** Direct Post: post a video from a URL */
export async function postVideoFromUrl(
  videoUrl: string,
  title: string
): Promise<{ publishId: string }> {
  // Query creator info to get available privacy levels
  const creatorInfo = await getCreatorInfo();
  console.log(`  TikTok privacy options: ${creatorInfo.privacy_level_options.join(", ")}`);

  // Pick best available privacy level
  const privacyLevel = creatorInfo.privacy_level_options.includes("PUBLIC_TO_EVERYONE")
    ? "PUBLIC_TO_EVERYONE"
    : creatorInfo.privacy_level_options.includes("FOLLOWER_OF_CREATOR")
      ? "FOLLOWER_OF_CREATOR"
      : "SELF_ONLY";

  console.log(`  Using privacy level: ${privacyLevel}`);

  const body = {
    post_info: {
      title: title.slice(0, 2200),
      privacy_level: privacyLevel,
      disable_duet: false,
      disable_comment: false,
      disable_stitch: false,
      is_aigc: true, // AI-generated content disclosure
    },
    source_info: {
      source: "PULL_FROM_URL",
      video_url: videoUrl,
    },
  };

  const res = await fetch(`${TIKTOK_BASE}/post/publish/video/init/`, {
    method: "POST",
    headers: await headers(),
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (data.error?.code !== "ok") {
    throw new Error(`TikTok video post failed: ${JSON.stringify(data.error)}`);
  }

  return { publishId: data.data.publish_id };
}

/** Upload video via FILE_UPLOAD (chunked) for when PULL_FROM_URL doesn't work */
export async function postVideoFromFile(
  videoBuffer: Buffer,
  title: string
): Promise<{ publishId: string }> {
  const creatorInfo = await getCreatorInfo();
  const privacyLevel = creatorInfo.privacy_level_options.includes("PUBLIC_TO_EVERYONE")
    ? "PUBLIC_TO_EVERYONE"
    : "SELF_ONLY";

  const videoSize = videoBuffer.length;
  // Use single chunk for files under 64MB (TikTok's limit per chunk)
  const chunkSize = videoSize;
  const totalChunkCount = 1;

  // Step 1: Initialize upload
  const initBody = {
    post_info: {
      title: title.slice(0, 2200),
      privacy_level: privacyLevel,
      disable_duet: false,
      disable_comment: false,
      disable_stitch: false,
      is_aigc: true,
    },
    source_info: {
      source: "FILE_UPLOAD",
      video_size: videoSize,
      chunk_size: chunkSize,
      total_chunk_count: totalChunkCount,
    },
  };

  const initRes = await fetch(`${TIKTOK_BASE}/post/publish/video/init/`, {
    method: "POST",
    headers: await headers(),
    body: JSON.stringify(initBody),
  });

  const initData = await initRes.json();
  if (initData.error?.code !== "ok") {
    throw new Error(`TikTok upload init failed: ${JSON.stringify(initData.error)}`);
  }

  const { publish_id, upload_url } = initData.data;

  // Step 2: Upload chunks sequentially
  for (let i = 0; i < totalChunkCount; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, videoSize);
    const chunk = videoBuffer.subarray(start, end);

    const uploadRes = await fetch(upload_url, {
      method: "PUT",
      headers: {
        "Content-Range": `bytes ${start}-${end - 1}/${videoSize}`,
        "Content-Length": String(chunk.length),
        "Content-Type": "video/mp4",
      },
      body: new Uint8Array(chunk),
    });

    if (uploadRes.status !== 201 && uploadRes.status !== 206) {
      throw new Error(`TikTok chunk upload failed: HTTP ${uploadRes.status}`);
    }

    console.log(`  Uploaded chunk ${i + 1}/${totalChunkCount}`);
  }

  return { publishId: publish_id };
}

/** Check publish status */
export async function getPublishStatus(publishId: string): Promise<{
  status: string;
  fail_reason?: string;
}> {
  const res = await fetch(`${TIKTOK_BASE}/post/publish/status/fetch/`, {
    method: "POST",
    headers: await headers(),
    body: JSON.stringify({ publish_id: publishId }),
  });

  const data = await res.json();
  if (data.error?.code !== "ok") {
    throw new Error(`TikTok status check failed: ${JSON.stringify(data.error)}`);
  }

  return {
    status: data.data.status,
    fail_reason: data.data.fail_reason,
  };
}

/** Full flow: post video from URL with FILE_UPLOAD fallback */
export async function postVideoToTikTok(
  videoUrl: string,
  title: string
): Promise<{ publishId: string }> {
  console.log("🎵 Posting to TikTok...");
  console.log(`  Title: "${title.slice(0, 80)}..."`);

  let publishId: string;

  try {
    const result = await postVideoFromUrl(videoUrl, title);
    publishId = result.publishId;
  } catch (urlError) {
    const msg = urlError instanceof Error ? urlError.message : String(urlError);
    console.log(`  PULL_FROM_URL failed: ${msg}`);
    console.log("  Falling back to FILE_UPLOAD...");

    // Download video and upload via FILE_UPLOAD
    const videoRes = await fetch(videoUrl);
    if (!videoRes.ok) throw new Error(`Failed to download video: ${videoRes.status}`);
    const videoBuffer = Buffer.from(await videoRes.arrayBuffer());
    console.log(`  Downloaded ${(videoBuffer.length / 1024 / 1024).toFixed(1)} MB`);

    const result = await postVideoFromFile(videoBuffer, title);
    publishId = result.publishId;
  }

  console.log(`  Publish ID: ${publishId}`);

  // Poll status (TikTok processes quickly compared to Instagram)
  const maxWait = 120_000; // 2 minutes
  const start = Date.now();

  while (Date.now() - start < maxWait) {
    await new Promise((r) => setTimeout(r, 10_000));
    const status = await getPublishStatus(publishId);
    console.log(`  TikTok status: ${status.status}`);

    if (status.status === "PUBLISH_COMPLETE") {
      console.log("✅ TikTok video published!");
      return { publishId };
    }
    if (status.status === "FAILED") {
      throw new Error(`TikTok publish failed: ${status.fail_reason}`);
    }
  }

  // Even if we timeout, the video might still be processing
  console.log("  ⚠️  TikTok publish timeout (may still be processing)");
  return { publishId };
}
