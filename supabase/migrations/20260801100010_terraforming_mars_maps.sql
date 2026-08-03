-- terraforming_mars_maps: 테라포밍 마스 매치에서 선택하는 보드 맵 카탈로그.
-- 다른 게임에는 "맵"이라는 개념이 없어 player_factions처럼 여러 게임이
-- 공유하는 구조로 일반화하지 않고, 이 게임 전용 테이블로 둔다
-- (실제로 반복되는 문제가 생기면 그때 일반화한다).
--
-- expansion_id가 null인 맵은 기본판에 포함되어 항상 선택 가능하다
-- (THARSIS). 나머지는 해당 확장팩이 매치에 선택된 경우에만 선택 가능하다.
create table public.terraforming_mars_maps (
  id uuid primary key default gen_random_uuid(),
  expansion_id uuid references public.expansions (id) on delete cascade,
  slug text not null unique,
  name_ko text not null,
  name_en text not null,
  created_at timestamptz not null default now()
);

alter table public.terraforming_mars_maps enable row level security;

create policy "terraforming_mars_maps_select_authenticated"
  on public.terraforming_mars_maps for select
  to authenticated
  using (true);

-- 맵 이름은 사양 문서(docs/games/terraforming-mars.md)에 등장하는 표기를
-- 그대로 사용한다. 별도 한글 표시명이 문서에 없어 우선 동일 표기를
-- name_ko/name_en 양쪽에 사용한다 — 확인 필요.
insert into public.terraforming_mars_maps (expansion_id, slug, name_ko, name_en)
values (null, 'tharsis', 'THARSIS', 'THARSIS');

insert into public.terraforming_mars_maps (expansion_id, slug, name_ko, name_en)
select e.id, m.slug, m.name_en, m.name_en
from (
  values
    ('hellas-elysium', 'hellas', 'HELLAS'),
    ('hellas-elysium', 'elysium', 'ELYSIUM'),
    ('amazonis-borealis', 'amazonis-planitia', 'AMAZONIS PLANITIA'),
    ('amazonis-borealis', 'vastitas-borealis', 'VASTITAS BOREALIS'),
    ('utopia-kimmeria', 'utopia-planitia', 'UTOPIA PLANITIA'),
    ('utopia-kimmeria', 'terra-cimmeria', 'TERRA CIMMERIA')
) as m (expansion_slug, slug, name_en)
join public.expansions e on e.slug = m.expansion_slug
join public.games g on g.id = e.game_id and g.slug = 'terraforming-mars';
