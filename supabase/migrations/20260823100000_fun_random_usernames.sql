-- Pseudos random "fun" pour les nouveaux users anonymes.
-- Avant : 'Player_' || 8 chars d'UUID -> illisible, avatar toujours "P".
-- Après : Animal + Adjectif (+ nombre si besoin), ex "RenardMalin", "HibouZen42".
-- L'initiale de l'avatar (username.charAt(0)) varie donc naturellement.
--
-- ⚠️ username a une contrainte UNIQUE : si le trigger handle_new_user insère un
-- doublon, l'insert auth échoue. On boucle donc jusqu'à trouver un nom libre,
-- avec un fallback garanti-unique (md5) en dernier recours.

CREATE OR REPLACE FUNCTION public.gen_random_username()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  adjs text[] := ARRAY[
    'Malin','Rapide','Curieux','Vif','Genial','Fute','Brave','Sage','Ruse','Zen',
    'Cosmique','Turbo','Agile','Vaillant','Habile','Fier','Joyeux','Costaud','Futee','Malicieux'
  ];
  nouns text[] := ARRAY[
    'Renard','Tigre','Hibou','Lynx','Panda','Koala','Aigle','Loutre','Requin','Faucon',
    'Castor','Dauphin','Corbeau','Belette','Blaireau','Herisson','Ecureuil','Phoque','Guepard','Manchot'
  ];
  candidate text;
  i int;
BEGIN
  FOR i IN 1..12 LOOP
    candidate := nouns[1 + floor(random() * array_length(nouns, 1))::int]
              || adjs[1 + floor(random() * array_length(adjs, 1))::int];
    -- Pas de nombre au 1er essai (plus joli), sinon on suffixe pour désambiguïser.
    IF i > 1 THEN
      candidate := candidate || (10 + floor(random() * 990))::int;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE username = candidate) THEN
      RETURN candidate;
    END IF;
  END LOOP;
  -- Fallback unique par construction.
  RETURN 'Joueur' || substr(md5(random()::text || clock_timestamp()::text), 1, 6);
END;
$$;

-- Le trigger utilise le nouveau générateur pour les users sans username fourni.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.users (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', public.gen_random_username())
  );
  RETURN NEW;
END;
$$;
