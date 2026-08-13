-- "Gotta catch 'em all" flag/country collection: one row per country a user has
-- answered correctly in the Geography section.
CREATE TABLE IF NOT EXISTS public.geo_collection (
  user_id      uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  country_code text NOT NULL,
  caught_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, country_code)
);

ALTER TABLE public.geo_collection ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "geo_collection_select_own" ON public.geo_collection;
CREATE POLICY "geo_collection_select_own"
  ON public.geo_collection FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "geo_collection_insert_own" ON public.geo_collection;
CREATE POLICY "geo_collection_insert_own"
  ON public.geo_collection FOR INSERT WITH CHECK (auth.uid() = user_id);
