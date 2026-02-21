import { createClient } from "@supabase/supabase-js";

const BUCKET = "instagram-videos";

function supabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
}

/** Ensure the public bucket exists */
export async function ensureBucket(): Promise<void> {
  const sb = supabase();
  const { data: buckets } = await sb.storage.listBuckets();

  if (!buckets?.find((b) => b.name === BUCKET)) {
    const { error } = await sb.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: ["video/mp4", "video/quicktime"],
    });
    if (error) throw new Error(`Failed to create bucket: ${error.message}`);
    console.log(`Created storage bucket: ${BUCKET}`);
  }
}

/** Download video from HeyGen URL and upload to Supabase Storage */
export async function uploadVideo(
  heygenVideoUrl: string,
  filename: string
): Promise<string> {
  const sb = supabase();

  // Download from HeyGen
  console.log("  Downloading video from HeyGen...");
  const videoRes = await fetch(heygenVideoUrl);
  if (!videoRes.ok) {
    throw new Error(`Failed to download video: ${videoRes.status}`);
  }
  const videoBuffer = Buffer.from(await videoRes.arrayBuffer());
  console.log(`  Video size: ${(videoBuffer.length / 1024 / 1024).toFixed(1)}MB`);

  // Upload to Supabase
  const path = `reels/${filename}`;
  const { error } = await sb.storage
    .from(BUCKET)
    .upload(path, videoBuffer, {
      contentType: "video/mp4",
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload to Supabase: ${error.message}`);
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = sb.storage.from(BUCKET).getPublicUrl(path);

  console.log(`  Uploaded to: ${publicUrl}`);
  return publicUrl;
}
