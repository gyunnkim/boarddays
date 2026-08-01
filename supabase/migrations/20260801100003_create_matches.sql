-- matches / match_players / match_expansions: 한 번의 플레이 기록.
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  game_id uuid not null references public.games (id),
  played_at date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.match_players (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id) on delete cascade,
  name text not null,
  score integer not null,
  rank integer not null check (rank > 0),
  is_win boolean not null default false,
  is_me boolean not null default false,
  created_at timestamptz not null default now()
);

-- 매치당 "나"로 표시된 플레이어는 최대 1명이어야 한다.
-- 최소 1명이 있어야 한다는 제약은 매치 입력 화면(4단계)에서 앱 레벨로 보장한다.
create unique index match_players_one_is_me_per_match
  on public.match_players (match_id)
  where is_me;

create table public.match_expansions (
  match_id uuid not null references public.matches (id) on delete cascade,
  expansion_id uuid not null references public.expansions (id),
  primary key (match_id, expansion_id)
);

-- match_expansions에 연결하는 확장팩은 반드시 그 매치와 같은 게임 소속이어야
-- 한다. 애플리케이션 로직 실수로 다른 게임의 확장팩이 섞이는 것을 DB
-- 레벨에서 막는다.
create function public.check_match_expansion_game()
returns trigger
language plpgsql
as $$
declare
  match_game_id uuid;
  expansion_game_id uuid;
begin
  select game_id into match_game_id from public.matches where id = new.match_id;
  select game_id into expansion_game_id from public.expansions where id = new.expansion_id;

  if match_game_id is null or expansion_game_id is null then
    raise exception 'invalid match or expansion reference';
  end if;

  if match_game_id <> expansion_game_id then
    raise exception 'expansion % does not belong to the game of match %', new.expansion_id, new.match_id;
  end if;

  return new;
end;
$$;

create trigger match_expansions_check_game
  before insert or update on public.match_expansions
  for each row execute function public.check_match_expansion_game();

-- updated_at 자동 갱신
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger matches_set_updated_at
  before update on public.matches
  for each row execute function public.set_updated_at();

alter table public.matches enable row level security;
alter table public.match_players enable row level security;
alter table public.match_expansions enable row level security;

create policy "matches_owner_all"
  on public.matches for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "match_players_owner_all"
  on public.match_players for all
  to authenticated
  using (
    exists (
      select 1 from public.matches
      where matches.id = match_players.match_id
        and matches.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.matches
      where matches.id = match_players.match_id
        and matches.user_id = auth.uid()
    )
  );

create policy "match_expansions_owner_all"
  on public.match_expansions for all
  to authenticated
  using (
    exists (
      select 1 from public.matches
      where matches.id = match_expansions.match_id
        and matches.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.matches
      where matches.id = match_expansions.match_id
        and matches.user_id = auth.uid()
    )
  );
