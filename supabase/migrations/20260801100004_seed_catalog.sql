-- 게임/확장팩 카탈로그 초기 데이터.
-- docs/requirements.md, docs/game-rules.md, docs/games/*.md 에 확정된
-- 목록만 시드한다. 테라포밍 마스의 Corporate Era, Promos는 공식 확장
-- 카탈로그 편입 여부가 아직 "확인 필요" 상태라 시드하지 않는다.
insert into public.games (slug, name_ko, name_en) values
  ('dune-imperium', '듄: 임페리움', 'Dune: Imperium'),
  ('seti', 'SETI', 'SETI: Search for Extraterrestrial Intelligence'),
  ('terraforming-mars', '테라포밍 마스', 'Terraforming Mars');

insert into public.expansions (game_id, slug, name_ko, name_en)
select g.id, e.slug, e.name_ko, e.name_en
from (
  values
    ('dune-imperium', 'rise-of-ix', '익스의 부상', 'Rise of Ix'),
    ('dune-imperium', 'immortality', '불멸', 'Immortality'),
    ('seti', 'space-agencies', '우주기관', 'Space Agencies'),
    ('terraforming-mars', 'hellas-elysium', '헬라스 & 엘리시움', 'Hellas & Elysium'),
    ('terraforming-mars', 'venus-next', '비너스 넥스트', 'Venus Next'),
    ('terraforming-mars', 'prelude', '서곡', 'Prelude'),
    ('terraforming-mars', 'colonies', '개척기지', 'Colonies'),
    ('terraforming-mars', 'turmoil', '격동', 'Turmoil'),
    ('terraforming-mars', 'amazonis-borealis', '아마조니스 & 보레알리스', 'Amazonis & Vastitas Borealis'),
    ('terraforming-mars', 'utopia-kimmeria', '유토피아 & 킴메리아', 'Utopia & Cimmeria'),
    ('terraforming-mars', 'awards-milestones', '업적과 기업상', 'Awards & Milestones'),
    ('terraforming-mars', 'prelude-2', '서곡 2', 'Prelude 2')
) as e (game_slug, slug, name_ko, name_en)
join public.games g on g.slug = e.game_slug;
