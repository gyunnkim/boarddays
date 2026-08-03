-- terraforming_mars_colonies: 개척기지(Colonies) 확장의 개별 개척기지 타일
-- 카탈로그.
--
-- 확인 필요: docs/games/terraforming-mars.md에는 "개척기지 확장 포함 시
-- (플레이어 명수+2)개를 뽑는다"는 매치 흐름만 확정되어 있고, 실제 개척기지
-- 타일 이름(예: 실물 게임의 각 개척기지 카드명) 목록은 문서에 없다. 잘못된
-- 이름을 임의로 추측해 채워 넣는 대신 카탈로그 테이블 구조만 만들고 데이터는
-- 비워 둔다. "개척기지 뽑기" 기능이 실제로 뽑을 대상을 가지려면, 정확한
-- 개척기지 목록(KR/EN)을 확인한 뒤 별도 migration으로 seed해야 한다.
create table public.terraforming_mars_colonies (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_ko text not null,
  name_en text not null,
  created_at timestamptz not null default now()
);

alter table public.terraforming_mars_colonies enable row level security;

create policy "terraforming_mars_colonies_select_authenticated"
  on public.terraforming_mars_colonies for select
  to authenticated
  using (true);
