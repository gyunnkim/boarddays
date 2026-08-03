-- expansions.sort_order: 매치 입력 화면에서 확장팩을 표시하는 순서.
-- 지금까지는 slug 알파벳순으로 표시되어 사용자가 요청한 순서(실물 확장팩
-- 발매/구성 순서)와 달랐다. nullable로 두고, 값이 있는 게임만 이 순서를
-- 사용하고 없으면 기존처럼 slug순으로 정렬한다(앱 쿼리에서 fallback 처리).
alter table public.expansions
  add column sort_order integer;

-- 테라포밍 마스 확장팩 표시 순서(사용자 요청 순서). "업적과 기업상"은
-- 별도 migration(20260801100014)에서 카탈로그에서 제외하므로 여기서는
-- sort_order를 부여하지 않는다. 다른 게임(듄/SETI)의 확장은 건드리지
-- 않는다 — sort_order는 null로 남아 기존 slug순 정렬을 그대로 사용한다.
update public.expansions e
set sort_order = v.sort_order
from (
  values
    ('hellas-elysium', 1),
    ('venus-next', 2),
    ('prelude', 3),
    ('colonies', 4),
    ('turmoil', 5),
    ('prelude-2', 6),
    ('amazonis-borealis', 7),
    ('utopia-kimmeria', 8)
) as v (slug, sort_order)
where e.slug = v.slug
  and e.game_id = (select id from public.games where slug = 'terraforming-mars');
