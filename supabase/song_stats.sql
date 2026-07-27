-- Heartstrings Jaco — global likes & shares
-- Run this once in the Supabase SQL Editor (Dashboard → SQL → New query).

create table if not exists public.song_stats (
  song_id text primary key,
  likes bigint not null default 0 check (likes >= 0),
  shares bigint not null default 0 check (shares >= 0),
  updated_at timestamptz not null default now()
);

alter table public.song_stats enable row level security;

-- Anyone can read totals (needed for the public website)
drop policy if exists "Public read song_stats" on public.song_stats;
create policy "Public read song_stats"
  on public.song_stats
  for select
  to anon, authenticated
  using (true);

-- Direct writes are blocked; clients use the security-definer functions below.

create or replace function public.song_like(p_song_id text)
returns public.song_stats
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.song_stats;
begin
  if p_song_id is null or length(trim(p_song_id)) = 0 then
    raise exception 'song_id required';
  end if;

  insert into public.song_stats (song_id, likes, shares)
  values (p_song_id, 1, 0)
  on conflict (song_id) do update
    set likes = public.song_stats.likes + 1,
        updated_at = now()
  returning * into result;

  return result;
end;
$$;

create or replace function public.song_unlike(p_song_id text)
returns public.song_stats
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.song_stats;
begin
  if p_song_id is null or length(trim(p_song_id)) = 0 then
    raise exception 'song_id required';
  end if;

  insert into public.song_stats (song_id, likes, shares)
  values (p_song_id, 0, 0)
  on conflict (song_id) do update
    set likes = greatest(public.song_stats.likes - 1, 0),
        updated_at = now()
  returning * into result;

  return result;
end;
$$;

create or replace function public.song_share(p_song_id text)
returns public.song_stats
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.song_stats;
begin
  if p_song_id is null or length(trim(p_song_id)) = 0 then
    raise exception 'song_id required';
  end if;

  insert into public.song_stats (song_id, likes, shares)
  values (p_song_id, 0, 1)
  on conflict (song_id) do update
    set shares = public.song_stats.shares + 1,
        updated_at = now()
  returning * into result;

  return result;
end;
$$;

grant usage on schema public to anon, authenticated;
grant select on public.song_stats to anon, authenticated;
grant execute on function public.song_like(text) to anon, authenticated;
grant execute on function public.song_unlike(text) to anon, authenticated;
grant execute on function public.song_share(text) to anon, authenticated;

-- Optional: live updates across open browsers
-- Dashboard → Database → Publications → supabase_realtime → add song_stats
-- Or run:
-- alter publication supabase_realtime add table public.song_stats;
