-- Teams / Clubs (Vague 4) — obligation sociale pour la rétention.
-- Additif : nouvelles tables + RPC, aucune donnée existante touchée.
-- L'XP hebdo d'un club = somme des xp_transactions (amount>0) de ses membres
-- sur 7 jours, exactement comme get_weekly_leaderboard.

-- ---------- Tables ----------
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null check (btrim(name) <> '' and length(name) <= 40),
  emoji text not null default '🧠',
  join_code text not null unique,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.team_members (
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (team_id, user_id),
  unique (user_id) -- un seul club par joueur
);

create index if not exists idx_team_members_user on public.team_members(user_id);
create index if not exists idx_team_members_team on public.team_members(team_id);

alter table public.teams enable row level security;
alter table public.team_members enable row level security;

-- Lecture directe autorisée (les écritures passent par les RPC SECURITY DEFINER).
drop policy if exists teams_select on public.teams;
create policy teams_select on public.teams for select to authenticated using (true);
drop policy if exists team_members_select on public.team_members;
create policy team_members_select on public.team_members for select to authenticated using (true);

-- ---------- Génération de code de club unique ----------
create or replace function public._gen_team_code()
returns text
language plpgsql
as $$
declare
  code text;
begin
  loop
    code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    exit when not exists (select 1 from public.teams where join_code = code);
  end loop;
  return code;
end;
$$;

-- ---------- create_team ----------
create or replace function public.create_team(p_name text, p_emoji text default '🧠')
returns table (id uuid, name text, emoji text, join_code text, member_count bigint, weekly_xp bigint)
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
  v_uid uuid := auth.uid();
  v_id uuid;
  v_code text;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;
  v_code := public._gen_team_code();
  insert into public.teams (name, emoji, join_code, created_by)
  values (btrim(p_name), coalesce(nullif(btrim(p_emoji), ''), '🧠'), v_code, v_uid)
  returning teams.id into v_id;

  -- Le créateur rejoint son club (déplace son adhésion existante).
  delete from public.team_members where user_id = v_uid;
  insert into public.team_members (team_id, user_id) values (v_id, v_uid);

  return query
    select t.id, t.name, t.emoji, t.join_code,
           (select count(*) from public.team_members m where m.team_id = t.id)::bigint,
           0::bigint
    from public.teams t where t.id = v_id;
end;
$$;

-- ---------- join_team ----------
create or replace function public.join_team(p_join_code text)
returns boolean
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
  v_uid uuid := auth.uid();
  v_team uuid;
  v_count int;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;
  select id into v_team from public.teams where join_code = upper(btrim(p_join_code));
  if v_team is null then
    return false;
  end if;
  select count(*) into v_count from public.team_members where team_id = v_team;
  if v_count >= 20 then
    return false; -- club plein
  end if;
  delete from public.team_members where user_id = v_uid; -- un seul club à la fois
  insert into public.team_members (team_id, user_id) values (v_team, v_uid)
    on conflict do nothing;
  return true;
end;
$$;

-- ---------- get_my_team ----------
create or replace function public.get_my_team()
returns table (id uuid, name text, emoji text, join_code text, member_count bigint, weekly_xp bigint)
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
  v_uid uuid := auth.uid();
begin
  return query
  select t.id, t.name, t.emoji, t.join_code,
    (select count(*) from public.team_members m where m.team_id = t.id)::bigint as member_count,
    coalesce((
      select sum(xt.amount)
      from public.team_members m
      join public.xp_transactions xt
        on xt.user_id = m.user_id
       and xt.created_at >= now() - interval '7 days'
       and xt.amount > 0
      where m.team_id = t.id
    ), 0)::bigint as weekly_xp
  from public.teams t
  join public.team_members me on me.team_id = t.id and me.user_id = v_uid
  limit 1;
end;
$$;

-- ---------- get_team_leaderboard ----------
create or replace function public.get_team_leaderboard(p_limit int default 30)
returns table (id uuid, name text, emoji text, join_code text, member_count bigint, weekly_xp bigint)
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
begin
  return query
  select t.id, t.name, t.emoji, t.join_code,
    (select count(*) from public.team_members m where m.team_id = t.id)::bigint as member_count,
    coalesce((
      select sum(xt.amount)
      from public.team_members m
      join public.xp_transactions xt
        on xt.user_id = m.user_id
       and xt.created_at >= now() - interval '7 days'
       and xt.amount > 0
      where m.team_id = t.id
    ), 0)::bigint as weekly_xp
  from public.teams t
  order by weekly_xp desc, t.name asc
  limit p_limit;
end;
$$;

grant execute on function public.create_team(text, text) to authenticated;
grant execute on function public.join_team(text) to authenticated;
grant execute on function public.get_my_team() to authenticated;
grant execute on function public.get_team_leaderboard(int) to authenticated;
