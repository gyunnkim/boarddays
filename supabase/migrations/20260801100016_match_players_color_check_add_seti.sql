-- match_players.color CHECK 제약조건이 듄/테라포밍 마스 색상만 허용하고
-- 있어서, SETI 전용 색상(beige/brown/purple)을 선택하면 매치 저장이
-- CHECK 위반으로 실패했다 (green은 두 팔레트에 겹쳐서 우연히 통과됨).
-- color 컬럼은 게임별로 공유되는 범용 컬럼이므로, 허용 목록을 모든
-- 게임의 팔레트(lib/domain/capabilities.ts) 합집합으로 넓힌다.
alter table public.match_players
  drop constraint match_players_color_check,
  add constraint match_players_color_check check (
    color is null or color in (
      'red', 'blue', 'yellow', 'green', 'black',
      'beige', 'brown', 'purple'
    )
  );
