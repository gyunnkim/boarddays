-- 게스트(익명 로그인) 사용자는 매치를 기록할 수 없다. Supabase 익명 세션은
-- 일반 회원과 동일한 Postgres `authenticated` 롤을 사용하므로 auth.role()로는
-- 구분할 수 없고, JWT의 is_anonymous claim으로 구분해야 한다.
--
-- match_players/match_expansions/match_terraforming_mars_colonies의 insert
-- 정책은 건드리지 않는다 (전부 is_own_match(match_id)를 거치는데, 애초에
-- 익명 사용자가 매치를 만들 수 없으면 참조할 match_id 자체가 생기지 않는다).

drop policy "matches_owner_insert" on public.matches;

create policy "matches_owner_insert"
  on public.matches for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  );
