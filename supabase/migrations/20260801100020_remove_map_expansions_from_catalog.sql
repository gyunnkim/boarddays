-- 헬라스 & 엘리시움 / 아마조니스 & 보레알리스 / 유토피아 & 킴메리아를
-- expansions 카탈로그에서 제거한다 (사용자 확정, 2026-08-04).
-- docs/games/terraforming-mars.md "맵 옵션 (확장과 무관)" 절 참고: 이 3개는
-- 더 이상 "확장팩" 엔티티가 아니므로 매치 입력 화면의 "확장팩 선택" 목록과
-- 매치 히스토리의 "사용 확장팩" 표시에 나타나면 안 된다.
--
-- 20260801100019에서 이미 terraforming_mars_maps.map_group_slug로 맵 그룹
-- 정보를 이관했으므로(expansions에 대한 FK 없이 독립 slug로 존재), 이제
-- expansions 행 자체를 지워도 맵 카탈로그는 영향을 받지 않는다.
--
-- 20260801100014(업적과 기업상 제거)와 동일한 패턴: match_expansions에
-- 이미 연결된 매치가 있으면 단순 delete가 FK 위반으로 실패하므로, 연결된
-- match_expansions 행을 먼저 정리한 뒤 expansions에서 삭제한다. 매치 자체,
-- 다른 확장 선택, 플레이어 결과, 맵 선택은 건드리지 않는다 — 그 매치에서
-- 이 3개가 "선택된 확장팩"으로 표시되어 있었다는 흔적만 제거된다.
delete from public.match_expansions
where expansion_id in (
  select e.id
  from public.expansions e
  join public.games g on g.id = e.game_id
  where g.slug = 'terraforming-mars'
    and e.slug in ('hellas-elysium', 'amazonis-borealis', 'utopia-kimmeria')
);

delete from public.expansions e
using public.games g
where e.game_id = g.id
  and g.slug = 'terraforming-mars'
  and e.slug in ('hellas-elysium', 'amazonis-borealis', 'utopia-kimmeria');
