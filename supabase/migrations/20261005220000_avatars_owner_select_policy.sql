-- Fix (2026-10-05): avatar upload failed with "new row violates row-level
-- security policy" since 20260615120500 dropped the only SELECT policy on
-- `avatars`. The app uploads with upsert: true, and Storage upserts need
-- SELECT (+ UPDATE) on top of INSERT. Re-add SELECT scoped to the user's own
-- folder: upsert/remove work again, without re-opening bucket-wide listing.
CREATE POLICY "Users can view their own avatar files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
