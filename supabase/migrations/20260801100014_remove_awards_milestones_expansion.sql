-- "업적과 기업상"(Awards & Milestones, slug: awards-milestones) 확장을
-- 카탈로그에서 제외한다.
--
-- 배경: docs/games/terraforming-mars.md의 "확인 필요" 항목이었던 이
-- 확장의 취급 방식을 사용자에게 확인한 결과, 기본 점수 계산식에 이미
-- 업적(Milestones)/기업상(Awards) 항목이 포함되어 있고 이 확장은 기업이나
-- 맵을 추가하지 않으므로(20260801100009_terraforming_mars_factions.sql,
-- 20260801100010_terraforming_mars_maps.sql 참고) 별도 확장으로 다루지
-- 않기로 확정되었다.
--
-- match_expansions.expansion_id는 on delete cascade가 아니므로
-- (20260801100003_create_matches.sql), 이 확장을 이미 선택한 매치가 있으면
-- 단순 delete가 FK 위반으로 실패한다. 이 프로젝트는 아직 초기 단계라
-- 실사용 데이터가 거의 없을 것으로 예상되지만, 안전하게 처리하기 위해
-- 이 확장에 연결된 match_expansions 행을 먼저 정리한 뒤 expansions에서
-- 삭제한다. 매치 자체, 다른 확장 선택, 플레이어 결과는 건드리지 않는다 —
-- 그 매치에서 "업적과 기업상"이 선택되어 있었다는 표시만 제거된다.
delete from public.match_expansions
where expansion_id in (
  select e.id
  from public.expansions e
  join public.games g on g.id = e.game_id
  where g.slug = 'terraforming-mars' and e.slug = 'awards-milestones'
);

delete from public.expansions e
using public.games g
where e.game_id = g.id
  and g.slug = 'terraforming-mars'
  and e.slug = 'awards-milestones';
