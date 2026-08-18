-- Prime Time stats (Vague 2 → complétion) : participants du jour + percentile
-- du joueur, calculés depuis les résultats daily (user_daily_challenges).
-- Additif : un seul RPC en lecture, aucune table touchée.

create or replace function public.get_prime_time_stats()
returns table (participants bigint, my_correct bigint, percentile int)
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
  v_uid uuid := auth.uid();
  v_total bigint;
  v_mine bigint;
begin
  -- Score du jour de chaque joueur = nb de bonnes réponses aujourd'hui.
  create temp table _pt on commit drop as
    select user_id, count(*) filter (where is_correct) as correct
    from public.user_daily_challenges
    where completed_at >= date_trunc('day', now())
    group by user_id;

  select count(*) into v_total from _pt;
  select coalesce((select p.correct from _pt p where p.user_id = v_uid), 0) into v_mine;

  return query
  select
    v_total,
    v_mine,
    case
      when v_total = 0 then 0
      else round(100.0 * (select count(*) from _pt p where p.correct < v_mine) / v_total)::int
    end;
end;
$$;

grant execute on function public.get_prime_time_stats() to authenticated;
