-- 테라포밍 마스 기업 카탈로그 확장 (사용자 확정, 2026-08-04).
-- docs/games/terraforming-mars.md "기본 제공"/"프로모 기업 (확장 아님)" 절
-- 참고.
--
-- 1) 기본 제공(확장 없이 항상 선택 가능) 기업에 Saturn Systems, Teractor
--    2종을 추가해 10종 -> 12종으로 만든다. 기존 10종과 동일하게
--    expansion_id/group_slug 모두 null로 둔다(그룹 없이 목록에 바로 노출).
insert into public.player_factions (game_id, expansion_id, group_slug, group_name_ko, group_name_en, slug, name_ko, name_en)
select g.id, null, null, null, null, f.slug, f.name_en, f.name_en
from (
  values
    ('saturn-systems', 'Saturn Systems'),
    ('teractor', 'Teractor')
) as f (slug, name_en)
join public.games g on g.slug = 'terraforming-mars';

-- 2) 프로모 기업 10종. "확장팩"이 아니므로 expansion_id는 null로 두고
--    (match_expansions와 무관하게 매치 단위 boolean 토글로만 켜고 끈다),
--    group_slug = 'promo'로 표시해 매치 입력 폼이 이 값으로 "프로모 기업
--    추가" 토글 on일 때만 선택지에 노출하도록 필터링한다(group_slug은 이미
--    진영 선택 UI에서 <optgroup>으로 묶어 보여주는 용도로 쓰이던 컬럼이라
--    새 컬럼을 추가하지 않고 재사용한다).
insert into public.player_factions (game_id, expansion_id, group_slug, group_name_ko, group_name_en, slug, name_ko, name_en)
select g.id, null, 'promo', '프로모 기업', 'Promo corporations', f.slug, f.name_en, f.name_en
from (
  values
    ('arcadian-communities', 'Arcadian Communities'),
    ('recyclon', 'Recyclon'),
    ('splice', 'Splice'),
    ('factorum', 'Factorum'),
    ('mons-insurance', 'Mons Insurance'),
    ('philares', 'Philares'),
    ('astrodrill-enterprise', 'Astrodrill Enterprise'),
    ('pharmacy-union', 'Pharmacy Union'),
    ('kuiper-cooperative', 'Kuiper Cooperative'),
    ('tycho-magnetics', 'Tycho Magnetics')
) as f (slug, name_en)
join public.games g on g.slug = 'terraforming-mars';
