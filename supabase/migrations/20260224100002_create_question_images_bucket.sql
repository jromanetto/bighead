-- Migration: Create question-images storage bucket
-- Migrates question images from external CDNs to self-hosted Supabase Storage

-- Create the bucket (public, images only, 10MB max)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'question-images',
  'question-images',
  true,
  10485760,  -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- RLS: anyone can read (public bucket)
CREATE POLICY "Anyone can view question images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'question-images');

-- RLS: only service_role can write (no user uploads)
-- service_role bypasses RLS by default, so no INSERT/UPDATE/DELETE policy needed

-- Add column to keep track of original external URL
ALTER TABLE questions ADD COLUMN IF NOT EXISTS original_image_url TEXT;
