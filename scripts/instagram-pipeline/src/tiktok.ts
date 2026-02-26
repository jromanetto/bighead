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

/** Upload video via FILE_UPLOAD for Direct Post */
export async function postVideoFromFile(
  videoBuffer: Buffer,
  title: string
): Promise<{ publishId: string }> {
  const creatorInfo = await getCreatorInfo();
  const privacyLevel = creatorInfo.privacy_level_options.includes("PUBLIC_TO_EVERYONE")
    ? "PUBLIC_TO_EVERYONE"
    : "SELF_ONLY";

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
      video_size: videoBuffer.length,
      chunk_size: videoBuffer.length,
      total_chunk_count: 1,
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

  return await uploadChunks(videoBuffer, initData.data);
}

/** Upload video as draft to creator's inbox (no audit required) */
export async function postVideoAsDraft(
  videoBuffer: Buffer,
  title: string
): Promise<{ publishId: string }> {
  const initBody = {
    post_info: {
      title: title.slice(0, 2200),
      is_aigc: true,
    },
    source_info: {
      source: "FILE_UPLOAD",
      video_size: videoBuffer.length,
      chunk_size: videoBuffer.length,
      total_chunk_count: 1,
    },
  };

  console.log("  Using inbox/draft endpoint (no audit required)");

  const initRes = await fetch(`${TIKTOK_BASE}/post/publish/inbox/video/init/`, {
    method: "POST",
    headers: await headers(),
    body: JSON.stringify(initBody),
  });

  const initData = await initRes.json();
  if (initData.error?.code !== "ok") {
    throw new Error(`TikTok draft init failed: ${JSON.stringify(initData.error)}`);
  }

  return await uploadChunks(videoBuffer, initData.data);
}

/** Upload video chunks to TikTok upload URL */
async function uploadChunks(
  videoBuffer: Buffer,
  initData: { publish_id: string; upload_url: string }
): Promise<{ publishId: string }> {
  const { publish_id, upload_url } = initData;

  const uploadRes = await fetch(upload_url, {
    method: "PUT",
    headers: {
      "Content-Range": `bytes 0-${videoBuffer.length - 1}/${videoBuffer.length}`,
      "Content-Length": String(videoBuffer.length),
      "Content-Type": "video/mp4",
    },
    body: new Uint8Array(videoBuffer),
  });

  if (uploadRes.status !== 201 && uploadRes.status !== 206) {
    throw new Error(`TikTok chunk upload failed: HTTP ${uploadRes.status}`);
  }

  console.log("  Video uploaded successfully");
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

/** Full flow: try Direct Post, fallback to draft upload if unaudited */
export async function postVideoToTikTok(
  videoUrl: string,
  title: string
): Promise<{ publishId: string }> {
  console.log("🎵 Posting to TikTok...");
  console.log(`  Title: "${title.slice(0, 80)}..."`);

  // Download video (needed for both FILE_UPLOAD and draft)
  const videoRes = await fetch(videoUrl);
  if (!videoRes.ok) throw new Error(`Failed to download video: ${videoRes.status}`);
  const videoBuffer = Buffer.from(await videoRes.arrayBuffer());
  console.log(`  Downloaded ${(videoBuffer.length / 1024 / 1024).toFixed(1)} MB`);

  let publishId: string;
  let isDraft = false;

  try {
    // Try Direct Post first
    const result = await postVideoFromFile(videoBuffer, title);
    publishId = result.publishId;
  } catch (directPostError) {
    const msg = directPostError instanceof Error ? directPostError.message : String(directPostError);

    // If unaudited, fallback to draft upload (inbox endpoint)
    if (msg.includes("unaudited_client_can_only_post_to_private_accounts")) {
      console.log("  Direct Post not available (app not audited), uploading as draft...");
      const result = await postVideoAsDraft(videoBuffer, title);
      publishId = result.publishId;
      isDraft = true;
    } else {
      throw directPostError;
    }
  }

  console.log(`  Publish ID: ${publishId}`);

  // Poll status
  const maxWait = 120_000;
  const start = Date.now();
  const doneStatus = isDraft ? "SEND_TO_USER_INBOX" : "PUBLISH_COMPLETE";

  while (Date.now() - start < maxWait) {
    await new Promise((r) => setTimeout(r, 10_000));
    const status = await getPublishStatus(publishId);
    console.log(`  TikTok status: ${status.status}`);

    if (status.status === "PUBLISH_COMPLETE") {
      console.log("✅ TikTok video published!");
      return { publishId };
    }
    if (status.status === "SEND_TO_USER_INBOX") {
      console.log("✅ TikTok draft sent to creator inbox (publish manually from TikTok app)");
      return { publishId };
    }
    if (status.status === "FAILED") {
      throw new Error(`TikTok publish failed: ${status.fail_reason}`);
    }
  }

  console.log("  ⚠️  TikTok publish timeout (may still be processing)");
  return { publishId };
}
