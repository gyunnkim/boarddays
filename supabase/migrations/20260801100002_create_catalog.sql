-- games / expansions: 지원 게임과 확장팩 카탈로그.
-- 사용자 소유 데이터가 아니라 서비스 전체가 공유하는 참조 데이터다.
create table public.games (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_ko text not null,
  name_en text not null,
  created_at timestamptz not null default now()
);

create table public.expansions (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games (id) on delete cascade,
  slug text not null,
  name_ko text not null,
  name_en text not null,
  created_at timestamptz not null default now(),
  unique (game_id, slug)
);

alter table public.games enable row level security;
alter table public.expansions enable row level security;

-- 카탈로그는 읽기 전용 참조 데이터다. insert/update/delete 정책은 두지
-- 않는다 (service role만 변경 가능).
create policy "games_select_authenticated"
  on public.games for select
  to authenticated
  using (true);

create policy "expansions_select_authenticated"
  on public.expansions for select
  to authenticated
  using (true);
