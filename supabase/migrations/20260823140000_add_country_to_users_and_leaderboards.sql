-- Pays du joueur (drapeau au classement + profil). Code ISO 2 lettres minuscules
-- (ex 'fr'), rempli côté client depuis la région de l'appareil (expo-localization).
-- Fallback : backfill depuis la langue UI (fr→fr, en→gb, es→es, de→de).

alter table public.users add column if not exists country text;

-- Vue all-time : expose country (append en fin pour un CREATE OR REPLACE sûr).
create or replace view public.leaderboard as
select
  u.id,
  coalesce(nullif(btrim(u.username), ''), 'Joueur ' || upper(substr(replace(u.id::text, '-', ''), 1, 4))) as username,
  u.avatar_url,
  u.total_xp,
  u.level,
  u.games_played,
  u.best_chain,
  row_number() over (order by u.total_xp desc) as rank,
  u.country
from public.users u
where u.total_xp > 0;

-- RPC weekly : ajoute country au retour (DROP requis : changement de type).
drop function if exists public.get_weekly_leaderboard(integer);

create function public.get_weekly_leaderboard(limit_count integer default 50)
returns table(id uuid, username text, avatar_url text, weekly_xp bigint, weekly_games bigint, best_chain integer, rank bigint, country text)
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
begin
  return query
  select
    u.id,
    coalesce(nullif(btrim(u.username), ''), 'Joueur ' || upper(substr(replace(u.id::text, '-', ''), 1, 4))),
    u.avatar_url,
    coalesce(sum(xt.amount), 0)::bigint as weekly_xp,
    count(xt.id)::bigint as weekly_games,
    coalesce(u.best_chain, 0) as best_chain,
    row_number() over (order by coalesce(sum(xt.amount), 0) desc) as rank,
    u.country
  from users u
  left join xp_transactions xt
    on u.id = xt.user_id
    and xt.created_at >= now() - interval '7 days'
    and xt.amount > 0
  group by u.id, u.username, u.avatar_url, u.best_chain, u.country
  having count(xt.id) > 0
  order by weekly_xp desc
  limit limit_count;
end;
$function$;

-- Backfill langue -> pays pour les users existants (drapeaux immédiats).
update public.users u
set country = case us.language
  when 'fr' then 'fr' when 'en' then 'gb' when 'es' then 'es' when 'de' then 'de'
end
from public.user_settings us
where us.user_id = u.id and u.country is null and us.language in ('fr','en','es','de');
