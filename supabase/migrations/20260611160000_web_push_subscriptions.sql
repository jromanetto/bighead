-- Web Push (PWA) : abonnements navigateur pour le rappel quotidien.
-- Une row par endpoint navigateur ; un user peut en avoir plusieurs (devices).
-- L'envoi se fait côté serveur (edge function service-role) — les clients ne
-- lisent/écrivent que leurs propres rows.

CREATE TABLE IF NOT EXISTS web_push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  lang TEXT NOT NULL DEFAULT 'fr',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_notified_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_web_push_user ON web_push_subscriptions(user_id);

ALTER TABLE web_push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "web_push_own_select" ON web_push_subscriptions;
CREATE POLICY "web_push_own_select" ON web_push_subscriptions
  FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "web_push_own_insert" ON web_push_subscriptions;
CREATE POLICY "web_push_own_insert" ON web_push_subscriptions
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "web_push_own_update" ON web_push_subscriptions;
CREATE POLICY "web_push_own_update" ON web_push_subscriptions
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "web_push_own_delete" ON web_push_subscriptions;
CREATE POLICY "web_push_own_delete" ON web_push_subscriptions
  FOR DELETE USING (user_id = (SELECT auth.uid()));
