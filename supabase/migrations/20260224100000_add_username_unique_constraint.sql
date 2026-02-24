-- Fix duplicate usernames before adding UNIQUE constraint
-- Append _1, _2, etc. to duplicates (keep the oldest row unchanged)
DO $$
DECLARE
  dup RECORD;
  row_rec RECORD;
  counter INT;
BEGIN
  FOR dup IN
    SELECT username
    FROM users
    GROUP BY username
    HAVING COUNT(*) > 1
  LOOP
    counter := 1;
    FOR row_rec IN
      SELECT id
      FROM users
      WHERE username = dup.username
      ORDER BY created_at ASC
      OFFSET 1  -- skip the oldest row
    LOOP
      UPDATE users
      SET username = dup.username || '_' || counter
      WHERE id = row_rec.id;
      counter := counter + 1;
    END LOOP;
  END LOOP;
END $$;

-- Now add the UNIQUE constraint (if not already present)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_username_unique') THEN
    ALTER TABLE users ADD CONSTRAINT users_username_unique UNIQUE (username);
  END IF;
END $$;
