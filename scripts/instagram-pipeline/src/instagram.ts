const GRAPH_BASE = "https://graph.instagram.com/v21.0";

function igUserId() {
  return process.env.INSTAGRAM_USER_ID!;
}

function accessToken() {
  return process.env.INSTAGRAM_ACCESS_TOKEN!;
}

/** Step 1: Create a Reel container with the video URL */
export async function createReelContainer(
  videoUrl: string,
  caption: string
): Promise<string> {
  const params = new URLSearchParams({
    media_type: "REELS",
    video_url: videoUrl,
    caption,
    access_token: accessToken(),
  });

  const res = await fetch(`${GRAPH_BASE}/${igUserId()}/media`, {
    method: "POST",
    body: params,
  });

  const data = await res.json();
  if (data.error) {
    throw new Error(
      `Instagram container creation failed: ${JSON.stringify(data.error)}`
    );
  }

  return data.id;
}

/** Step 2: Poll container status until ready */
export async function waitForContainer(
  containerId: string,
  maxWaitMs = 300_000
): Promise<void> {
  const start = Date.now();
  const pollInterval = 10_000; // 10s

  while (Date.now() - start < maxWaitMs) {
    const params = new URLSearchParams({
      fields: "status_code",
      access_token: accessToken(),
    });

    const res = await fetch(`${GRAPH_BASE}/${containerId}?${params}`);
    const data = await res.json();
    const status = data.status_code;

    console.log(`  Instagram container ${containerId}: ${status}`);

    if (status === "FINISHED") return;
    if (status === "ERROR") {
      throw new Error(`Instagram container error: ${JSON.stringify(data)}`);
    }

    await new Promise((r) => setTimeout(r, pollInterval));
  }

  throw new Error(`Instagram container timed out after ${maxWaitMs / 1000}s`);
}

/** Step 3: Publish the Reel */
export async function publishReel(containerId: string): Promise<{
  id: string;
  permalink?: string;
}> {
  const params = new URLSearchParams({
    creation_id: containerId,
    access_token: accessToken(),
  });

  const res = await fetch(`${GRAPH_BASE}/${igUserId()}/media_publish`, {
    method: "POST",
    body: params,
  });

  const data = await res.json();
  if (data.error) {
    throw new Error(
      `Instagram publish failed: ${JSON.stringify(data.error)}`
    );
  }

  // Get permalink
  const mediaParams = new URLSearchParams({
    fields: "permalink",
    access_token: accessToken(),
  });
  const mediaRes = await fetch(`${GRAPH_BASE}/${data.id}?${mediaParams}`);
  const mediaData = await mediaRes.json();

  return { id: data.id, permalink: mediaData.permalink };
}

/** Full flow: create container → wait → publish */
export async function postReelToInstagram(
  videoUrl: string,
  caption: string
): Promise<{ mediaId: string; permalink?: string }> {
  console.log("📸 Creating Instagram Reel container...");
  const containerId = await createReelContainer(videoUrl, caption);

  console.log("⏳ Waiting for Instagram processing...");
  await waitForContainer(containerId);

  console.log("🚀 Publishing Reel...");
  const result = await publishReel(containerId);

  console.log(`✅ Reel published: ${result.permalink || result.id}`);
  return { mediaId: result.id, permalink: result.permalink };
}

/** Create a Story container (no caption supported for Stories) */
async function createStoryContainer(videoUrl: string): Promise<string> {
  const params = new URLSearchParams({
    media_type: "STORIES",
    video_url: videoUrl,
    access_token: accessToken(),
  });

  const res = await fetch(`${GRAPH_BASE}/${igUserId()}/media`, {
    method: "POST",
    body: params,
  });

  const data = await res.json();
  if (data.error) {
    throw new Error(
      `Instagram Story container failed: ${JSON.stringify(data.error)}`
    );
  }

  return data.id;
}

/** Full flow: create Story container → wait → publish */
export async function postStoryToInstagram(
  videoUrl: string
): Promise<{ mediaId: string }> {
  console.log("📖 Creating Instagram Story container...");
  const containerId = await createStoryContainer(videoUrl);

  console.log("⏳ Waiting for Instagram Story processing...");
  await waitForContainer(containerId);

  console.log("🚀 Publishing Story...");
  const result = await publishReel(containerId);

  console.log(`✅ Story published: ${result.id}`);
  return { mediaId: result.id };
}
