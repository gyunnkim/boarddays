-- 20260801100022의 match_players_select_owner_or_name_match 정책이
-- match_players 테이블 자신의 select 정책 안에서 다시 match_players를
-- 서브쿼리로 조회했다. RLS가 걸린 테이블은 자기 자신의 정책 조건 안에서
-- 스스로를 재조회할 수 없다 — Postgres가 이를 감지하면
-- "infinite recursion detected in policy for relation match_players"
-- 오류를 던지고, 이 정책이 관여하는 모든 조회(대시보드 전체)가 깨진다.
--
-- 표준 해법은 자기 참조 서브쿼리를 SECURITY DEFINER 함수로 감싸는 것이다.
-- 이 함수는 테이블 소유자(이 프로젝트의 모든 테이블을 만든 postgres 롤)
-- 권한으로 실행되고, FORCE ROW LEVEL SECURITY를 켠 적이 없으므로 테이블
-- 소유자는 자동으로 RLS를 우회한다. 즉 함수 내부의 match_players 조회는
-- RLS 정책을 다시 평가하지 않으므로 재귀가 끊긴다.
create function public.viewer_name_matches_player_in_match(target_match_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.match_players mp
    join public.profiles p on p.id = auth.uid()
    where mp.match_id = target_match_id
      and mp.name = p.display_name
  );
$$;

grant execute on function public.viewer_name_matches_player_in_match(uuid) to authenticated;

drop policy "match_players_select_owner_or_name_match" on public.match_players;

create policy "match_players_select_owner_or_name_match"
  on public.match_players for select
  to authenticated
  using (
    exists (
      select 1 from public.matches
      where matches.id = match_players.match_id
        and matches.user_id = auth.uid()
    )
    or public.viewer_name_matches_player_in_match(match_players.match_id)
  );
