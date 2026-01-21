-- BIGHEAD Categories Seed Data

INSERT INTO public.categories (name, slug, name_en, icon, color, sort_order) VALUES
  ('Histoire', 'history', 'History', '🏛️', '#8B5CF6', 1),
  ('Géographie', 'geography', 'Geography', '🌍', '#10B981', 2),
  ('Science', 'science', 'Science', '🔬', '#3B82F6', 3),
  ('Sport', 'sports', 'Sports', '⚽', '#F59E0B', 4),
  ('Pop Culture', 'pop-culture', 'Pop Culture', '🎬', '#EC4899', 5)
ON CONFLICT (slug) DO NOTHING;
