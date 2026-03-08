const GRAPH_BASE = "https://graph.instagram.com/v21.0";

/** Step 1: Create a Reel container with the video URL */
async function createReelContainer(
  videoUrl: string,
  caption: string,
  token: string,
  userId: string
): Promise<string> {
  const params = new URLSearchParams({
    media_type: "REELS",
    video_url: videoUrl,
    caption,
    access_token: token,
  });

  const res = await fetch(`${GRAPH_BASE}/${userId}/media`, {
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
async function waitForContainer(
  containerId: string,
  token: string,
  maxWaitMs = 300_000
): Promise<void> {
  const start = Date.now();
  const pollInterval = 10_000;

  while (Date.now() - start < maxWaitMs) {
    const params = new URLSearchParams({
      fields: "status_code",
      access_token: token,
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
async function publishMedia(
  containerId: string,
  token: string,
  userId: string
): Promise<{ id: string; permalink?: string }> {
  const params = new URLSearchParams({
    creation_id: containerId,
    access_token: token,
  });

  const res = await fetch(`${GRAPH_BASE}/${userId}/media_publish`, {
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
    access_token: token,
  });
  const mediaRes = await fetch(`${GRAPH_BASE}/${data.id}?${mediaParams}`);
  const mediaData = await mediaRes.json();

  return { id: data.id, permalink: mediaData.permalink };
}

/** Full flow: create container → wait → publish */
export async function postReelToInstagram(
  videoUrl: string,
  caption: string,
  token?: string,
  userId?: string
): Promise<{ mediaId: string; permalink?: string }> {
  const t = token || process.env.INSTAGRAM_ACCESS_TOKEN!;
  const u = userId || process.env.INSTAGRAM_USER_ID!;

  console.log("📸 Creating Instagram Reel container...");
  const containerId = await createReelContainer(videoUrl, caption, t, u);

  console.log("⏳ Waiting for Instagram processing...");
  await waitForContainer(containerId, t);

  console.log("🚀 Publishing Reel...");
  const result = await publishMedia(containerId, t, u);

  console.log(`✅ Reel published: ${result.permalink || result.id}`);
  return { mediaId: result.id, permalink: result.permalink };
}

/** Create a Story container */
async function createStoryContainer(
  videoUrl: string,
  token: string,
  userId: string
): Promise<string> {
  const params = new URLSearchParams({
    media_type: "STORIES",
    video_url: videoUrl,
    access_token: token,
  });

  const res = await fetch(`${GRAPH_BASE}/${userId}/media`, {
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
  videoUrl: string,
  token?: string,
  userId?: string
): Promise<{ mediaId: string }> {
  const t = token || process.env.INSTAGRAM_ACCESS_TOKEN!;
  const u = userId || process.env.INSTAGRAM_USER_ID!;

  console.log("📖 Creating Instagram Story container...");
  const containerId = await createStoryContainer(videoUrl, t, u);

  console.log("⏳ Waiting for Instagram Story processing...");
  await waitForContainer(containerId, t);

  console.log("🚀 Publishing Story...");
  const result = await publishMedia(containerId, t, u);

  console.log(`✅ Story published: ${result.id}`);
  return { mediaId: result.id };
}
