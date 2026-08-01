-- player_names: 사용자가 매치 입력 화면에서 선택할 수 있도록 등록해 둔 본인 이름 목록.
-- 매치 저장 시 입력된 플레이어 이름이 이 목록과 일치하면 해당 플레이어를 "나"로 표시한다.
create table public.player_names (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

alter table public.player_names enable row level security;

create policy "player_names_owner_all"
  on public.player_names for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
