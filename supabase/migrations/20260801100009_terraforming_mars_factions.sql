-- 테라포밍 마스 기업(Corporation) 카탈로그.
-- docs/games/terraforming-mars.md "확장팩 / 옵션이 매치 설정에 미치는
-- 영향" 표와 "기본 제공" 절에 있는 기업만 시드한다. Corporate Era/Promos는
-- 정식 확장 카탈로그 편입 여부가 "확인 필요" 상태라 시드하지 않는다.
--
-- 주의: 기업 한글 표시명(name_ko)은 사양 문서에 별도로 주어지지 않았다.
-- 잘못된 번역을 임의로 만들어 넣는 대신, 확인 전까지 영문 표기(name_en)를
-- name_ko에도 그대로 사용한다 — 확인 필요.

-- 기본 제공 (확장 없이 항상 선택 가능) 10종.
insert into public.player_factions (game_id, expansion_id, group_slug, group_name_ko, group_name_en, slug, name_ko, name_en)
select g.id, null, null, null, null, f.slug, f.name_en, f.name_en
from (
  values
    ('credicor', 'Credicor'),
    ('ecoline', 'Ecoline'),
    ('helion', 'Helion'),
    ('interplanetary-cinematics', 'Interplanetary Cinematics'),
    ('inventrix', 'Inventrix'),
    ('mining-guild', 'Mining Guild'),
    ('phoblog', 'Phoblog'),
    ('tharsis-republic', 'Tharsis Republic'),
    ('thorgate', 'Thorgate'),
    ('unmi', 'UNMI')
) as f (slug, name_en)
join public.games g on g.slug = 'terraforming-mars';

-- 확장팩별 추가 기업. 헬라스&엘리시움 / 아마조니스&보레알리스 /
-- 유토피아&킴메리아 / 업적과 기업상은 문서상 기업을 추가하지 않는다.
insert into public.player_factions (game_id, expansion_id, group_slug, group_name_ko, group_name_en, slug, name_ko, name_en)
select g.id, e.id, null, null, null, f.slug, f.name_en, f.name_en
from (
  values
    ('venus-next', 'aphrodite', 'Aphrodite'),
    ('venus-next', 'celectic', 'Celectic'),
    ('venus-next', 'manutech', 'Manutech'),
    ('venus-next', 'msi', 'MSI'),
    ('venus-next', 'viron', 'Viron'),
    ('prelude', 'cheung-shing-mars', 'Cheung Shing Mars'),
    ('prelude', 'point-luna', 'Point Luna'),
    ('prelude', 'robinson-industries', 'Robinson Industries'),
    ('prelude', 'valley-trust', 'Valley Trust'),
    ('prelude', 'vitor', 'VITOR'),
    ('colonies', 'arklight', 'Arklight'),
    ('colonies', 'aridor', 'Aridor'),
    ('colonies', 'polyphemos', 'Polyphemos'),
    ('colonies', 'poseidon', 'Poseidon'),
    ('colonies', 'stormcraft', 'Stormcraft'),
    ('turmoil', 'lakefront-resorts', 'Lakefront Resorts'),
    ('turmoil', 'pristar', 'Pristar'),
    ('turmoil', 'septem-tribus', 'Septem Tribus'),
    ('turmoil', 'terralabs', 'Terralabs'),
    ('turmoil', 'utopia-invest', 'Utopia Invest'),
    ('prelude-2', 'ecotec', 'Ecotec'),
    ('prelude-2', 'nirgal-enterprises', 'Nirgal Enterprises'),
    ('prelude-2', 'palladin-shipping', 'Palladin Shipping'),
    ('prelude-2', 'sagitta-frontier-services', 'Sagitta Frontier Services'),
    ('prelude-2', 'spire', 'Spire')
) as f (expansion_slug, slug, name_en)
join public.games g on g.slug = 'terraforming-mars'
join public.expansions e on e.game_id = g.id and e.slug = f.expansion_slug;
