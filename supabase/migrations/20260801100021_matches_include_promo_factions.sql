-- "프로모 기업 추가" 토글 사용 여부를 매치 레코드에 저장한다 (사용자 확정,
-- 2026-08-04). docs/games/terraforming-mars.md "프로모 기업 (확장 아님)"
-- 절 참고: 프로모 기업 10종은 확장팩이 아니므로 match_expansions로는
-- 저장하지 않고, matches에 별도 boolean 컬럼을 둔다.
--
-- terraforming_mars_map_id와 동일한 패턴으로 게임에 관계없이 공유하는
-- 컬럼으로 둔다. 다른 게임(듄/SETI) 매치에는 항상 기본값 false로 남는다.
alter table public.matches
  add column include_promo_factions boolean not null default false;
