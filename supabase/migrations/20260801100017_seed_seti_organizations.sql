-- SETI 우주기관(Space Agencies) 확장의 비대칭 "기관" 카탈로그.
-- 테라포밍 마스의 기업(Corporation), 듄: 임페리움의 리더와 동일한
-- player_factions 테이블/구조를 재사용한다 (docs/games/seti.md 참고).
-- 사용자 확인 완료된 11개 기관을 시드한다. 우주기관 확장이 없는 기본판에는
-- 기관이 존재하지 않으므로 전부 space-agencies 확장에 종속시킨다.
insert into public.player_factions (game_id, expansion_id, group_slug, group_name_ko, group_name_en, slug, name_ko, name_en)
select g.id, e.id, null, null, null, f.slug, f.name_ko, f.name_en
from (
  values
    ('orbital-dynamics', '오비탈 다이나믹스', 'Orbital Dynamics'),
    ('fenwick-research-center', '펜윅 리서치 센터', 'Fenwick Research Center'),
    ('stratus-core', '스트라투스 코어', 'Stratus Core'),
    ('deep-sky-survey', '딥 스카이 서베이', 'Deep Sky Survey'),
    ('turing-systems', '튜링 시스템', 'Turing Systems'),
    ('sentinel-probe-network', '센티넬 프로브 네트워크', 'Sentinel Probe Network'),
    ('cosmos-strategy-group', '코스모스 스트래티지 그룹', 'Cosmos Strategy Group'),
    ('mission-relay', '미션 릴레이', 'Mission Relay'),
    ('xenolab', '제노랩', 'XENOLAB'),
    ('future-span-institute', '퓨처스팬 인스티튜트', 'Future Span Institute'),
    ('helion-assembly', '헬리온 어셈블리', 'Helion Assembly')
) as f (slug, name_ko, name_en)
join public.games g on g.slug = 'seti'
join public.expansions e on e.game_id = g.id and e.slug = 'space-agencies';
