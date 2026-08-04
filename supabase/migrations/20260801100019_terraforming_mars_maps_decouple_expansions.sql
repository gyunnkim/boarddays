-- 맵 선택을 "사용 확장팩" 선택과 완전히 분리한다 (사용자 확정, 2026-08-04).
-- docs/games/terraforming-mars.md "맵 옵션 (확장과 무관)" 절 참고.
--
-- 지금까지 terraforming_mars_maps.expansion_id는 맵이 특정 확장팩(헬라스&
-- 엘리시움 등)에 속함을 나타내고, check_match_map 트리거가 "그 확장팩이
-- match_expansions에 있어야 그 맵을 고를 수 있다"를 강제했다. 이제 헬라스&
-- 엘리시움/아마조니스&보레알리스/유토피아&킴메리아는 더 이상 "확장팩"
-- 엔티티로 취급하지 않으므로(다음 migration에서 expansions 카탈로그에서도
-- 제거한다), 맵을 expansions/match_expansions에 묶어 검증하는 방식 자체를
-- 없앤다.
--
-- 대신 맵을 3개 그룹으로 나누는 매치 설정 화면 전용 "맵 추가 탭" 토글
-- 식별자(map_group_slug)를 둔다. 이 값은 expansions.slug를 참조하는 FK가
-- 아니라 매치 입력 UI(lib/domain/capabilities.ts의 mapGroups)가 정의하는
-- 순수 문자열 식별자다. null이면 토글과 무관하게 항상 맵 풀에 포함되는
-- 기본 맵(THARSIS)이다.
alter table public.terraforming_mars_maps
  add column map_group_slug text;

-- 기존 expansion_id 연결을 이용해 map_group_slug를 채운 뒤 expansion_id를
-- 제거한다(같은 slug 문자열을 그대로 재사용해 맵 추가 탭 토글 식별자로
-- 이어간다).
update public.terraforming_mars_maps m
set map_group_slug = e.slug
from public.expansions e
where m.expansion_id = e.id;

drop trigger matches_check_map on public.matches;
drop function public.check_match_map();

alter table public.terraforming_mars_maps
  drop column expansion_id;
