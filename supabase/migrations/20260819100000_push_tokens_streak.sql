-- Ajoute daily_streak à la RPC des tokens push, pour personnaliser la notif
-- quotidienne (titre streak-aware, loss aversion). Additif.
drop function if exists public.get_active_push_tokens_with_language();

create function public.get_active_push_tokens_with_language()
returns table(user_id uuid, push_token text, language text, daily_streak integer)
language plpgsql
as $$
begin
  return query
  select u.id, u.push_token, coalesce(us.language, 'fr') as language,
         coalesce(u.daily_streak, 0)::int as daily_streak
  from users u
  left join user_settings us on us.user_id = u.id
  where u.push_token is not null
    and u.push_token <> ''
    and u.push_token like 'ExponentPushToken%'
    and (u.push_token_updated_at is null or u.push_token_updated_at > now() - interval '30 days');
end;
$$;
