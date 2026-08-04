-- 20260801100023은 match_players_select_owner_or_name_match의 자기 참조
-- (match_players 정책이 match_players를 다시 조회)만 고쳤다. 하지만 matches
-- 와 match_players는 여전히 서로의 정책 안에서 서로를 raw 서브쿼리로
-- 조회하고 있었다: matches_select_owner_or_name_match는 match_players를
-- 조회하고, match_players의 나머지 모든 정책(owner insert/update/delete +
-- select의 소유자 branch)은 matches를 조회한다. 두 테이블이 서로의 정책을
-- 순환 참조하는 것도 자기 자신을 참조하는 것과 동일하게
-- "infinite recursion detected in policy for relation ..." 오류를 낸다 —
-- 한쪽만 고쳐서는 순환이 끊이지 않는다.
--
-- matches/match_players/match_expansions/match_terraforming_mars_colonies
-- 네 테이블의 정책에서 다른 RLS 테이블을 참조하는 raw 서브쿼리를 전부
-- 제거하고, SECURITY DEFINER 함수 두 개(테이블 소유자 권한으로 실행되어
-- RLS를 우회하므로 재귀를 만들지 않는다) 뒤로 감춘다.

create function public.is_own_match(target_match_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.matches
    where id = target_match_id and user_id = auth.uid()
  );
$$;

grant execute on function public.is_own_match(uuid) to authenticated;

-- matches -------------------------------------------------------------------

drop policy "matches_select_owner_or_name_match" on public.matches;

create policy "matches_select_owner_or_name_match"
  on public.matches for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.viewer_name_matches_player_in_match(matches.id)
  );

-- matches_owner_insert/update/delete는 matches.user_id만 보고 다른 테이블을
-- 조회하지 않으므로 순환과 무관하다 (변경 없음).

-- match_players ---------------------------------------------------------------

drop policy "match_players_owner_insert" on public.match_players;
drop policy "match_players_owner_update" on public.match_players;
drop policy "match_players_owner_delete" on public.match_players;
drop policy "match_players_select_owner_or_name_match" on public.match_players;

create policy "match_players_owner_insert"
  on public.match_players for insert
  to authenticated
  with check (public.is_own_match(match_id));

create policy "match_players_owner_update"
  on public.match_players for update
  to authenticated
  using (public.is_own_match(match_id))
  with check (public.is_own_match(match_id));

create policy "match_players_owner_delete"
  on public.match_players for delete
  to authenticated
  using (public.is_own_match(match_id));

create policy "match_players_select_owner_or_name_match"
  on public.match_players for select
  to authenticated
  using (
    public.is_own_match(match_id)
    or public.viewer_name_matches_player_in_match(match_id)
  );

-- match_expansions --------------------------------------------------------------

drop policy "match_expansions_owner_insert" on public.match_expansions;
drop policy "match_expansions_owner_update" on public.match_expansions;
drop policy "match_expansions_owner_delete" on public.match_expansions;
drop policy "match_expansions_select_owner_or_name_match" on public.match_expansions;

create policy "match_expansions_owner_insert"
  on public.match_expansions for insert
  to authenticated
  with check (public.is_own_match(match_id));

create policy "match_expansions_owner_update"
  on public.match_expansions for update
  to authenticated
  using (public.is_own_match(match_id))
  with check (public.is_own_match(match_id));

create policy "match_expansions_owner_delete"
  on public.match_expansions for delete
  to authenticated
  using (public.is_own_match(match_id));

create policy "match_expansions_select_owner_or_name_match"
  on public.match_expansions for select
  to authenticated
  using (
    public.is_own_match(match_id)
    or public.viewer_name_matches_player_in_match(match_id)
  );

-- match_terraforming_mars_colonies -----------------------------------------------

drop policy "match_terraforming_mars_colonies_owner_insert" on public.match_terraforming_mars_colonies;
drop policy "match_terraforming_mars_colonies_owner_update" on public.match_terraforming_mars_colonies;
drop policy "match_terraforming_mars_colonies_owner_delete" on public.match_terraforming_mars_colonies;
drop policy "match_terraforming_mars_colonies_select_owner_or_name_match" on public.match_terraforming_mars_colonies;

create policy "match_terraforming_mars_colonies_owner_insert"
  on public.match_terraforming_mars_colonies for insert
  to authenticated
  with check (public.is_own_match(match_id));

create policy "match_terraforming_mars_colonies_owner_update"
  on public.match_terraforming_mars_colonies for update
  to authenticated
  using (public.is_own_match(match_id))
  with check (public.is_own_match(match_id));

create policy "match_terraforming_mars_colonies_owner_delete"
  on public.match_terraforming_mars_colonies for delete
  to authenticated
  using (public.is_own_match(match_id));

create policy "match_terraforming_mars_colonies_select_owner_or_name_match"
  on public.match_terraforming_mars_colonies for select
  to authenticated
  using (
    public.is_own_match(match_id)
    or public.viewer_name_matches_player_in_match(match_id)
  );
