-- Add TikTok publish ID column to instagram_posts
ALTER TABLE instagram_posts ADD COLUMN IF NOT EXISTS tiktok_publish_id text;
