-- Stats communautaires d'un défi hebdo (moyenne de réussite pour se situer).
create or replace function public.get_challenge_community_stats(p_challenge_id uuid)
returns table(players bigint, avg_accuracy_pct integer, avg_correct numeric)
language sql security definer set search_path to 'public', 'pg_temp'
as $$
  select count(*)::bigint,
    round(avg(correct_count::numeric / nullif(current_position, 0)) * 100)::int,
    round(avg(correct_count), 1)
  from public.weekly_challenge_progress
  where challenge_id = p_challenge_id and current_position > 0;
$$;
grant execute on function public.get_challenge_community_stats(uuid) to anon, authenticated;
