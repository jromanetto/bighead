-- Table pour tracker les vidéos quiz postées sur Instagram
CREATE TABLE IF NOT EXISTS instagram_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  question jsonb NOT NULL,
  heygen_video_id text,
  video_url text,
  supabase_storage_path text,
  instagram_media_id text,
  instagram_permalink text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'uploading', 'publishing', 'published', 'error')),
  error text
);

-- Index pour éviter les doublons de questions
CREATE INDEX idx_instagram_posts_created ON instagram_posts (created_at DESC);
CREATE INDEX idx_instagram_posts_status ON instagram_posts (status);
