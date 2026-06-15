-- M1 (audit 2026-06-15): the `avatars` and `question-images` buckets are
-- public=true, so files are served via the public CDN path
-- (/storage/v1/object/public/...) which bypasses RLS. The "Anyone can view"
-- SELECT policies therefore only added enumeration via the list() API — unused
-- by the app and exploitable (listing question-images spoils upcoming quiz
-- answers). Drop them; image display via the public URL is unaffected.
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view question images" ON storage.objects;
