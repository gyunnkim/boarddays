-- 매치 조회 범위를 "소유자" 뿐 아니라 "표시 이름이 일치하는 참가자"까지
-- 넓힌다. 예: 김기훈 계정이 기록한 매치에 "강보석"이라는 이름의 플레이어가
-- 있고, 다른 계정이 profiles.display_name을 "강보석"으로 설정했다면 그
-- 계정도 그 매치를 조회할 수 있어야 한다 (읽기 전용 — insert/update/delete는
-- 여전히 matches.user_id = auth.uid()인 소유자만 가능하다).
--
-- 기존 "for all" 단일 정책은 select까지 소유자로 제한하므로, 각 테이블마다
-- 소유자 전용 insert/update/delete 정책과, 넓어진 select 정책으로 나눈다.
--
-- profiles_select_own 정책이 이미 id = auth.uid()를 허용하므로 아래
-- 서브쿼리는 추가 권한 없이 동작한다.

-- matches -----------------------------------------------------------------

drop policy "matches_owner_all" on public.matches;

create policy "matches_owner_insert"
  on public.matches for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "matches_owner_update"
  on public.matches for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "matches_owner_delete"
  on public.matches for delete
  to authenticated
  using (user_id = auth.uid());

create policy "matches_select_owner_or_name_match"
  on public.matches for select
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.match_players mp
      join public.profiles p on p.id = auth.uid()
      where mp.match_id = matches.id and mp.name = p.display_name
    )
  );

-- match_players -------------------------------------------------------------

drop policy "match_players_owner_all" on public.match_players;

create policy "match_players_owner_insert"
  on public.match_players for insert
  to authenticated
  with check (
    exists (
      select 1 from public.matches
      where matches.id = match_players.match_id
        and matches.user_id = auth.uid()
    )
  );

create policy "match_players_owner_update"
  on public.match_players for update
  to authenticated
  using (
    exists (
      select 1 from public.matches
      where matches.id = match_players.match_id
        and matches.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.matches
      where matches.id = match_players.match_id
        and matches.user_id = auth.uid()
    )
  );

create policy "match_players_owner_delete"
  on public.match_players for delete
  to authenticated
  using (
    exists (
      select 1 from public.matches
      where matches.id = match_players.match_id
        and matches.user_id = auth.uid()
    )
  );

create policy "match_players_select_owner_or_name_match"
  on public.match_players for select
  to authenticated
  using (
    exists (
      select 1 from public.matches
      where matches.id = match_players.match_id
        and matches.user_id = auth.uid()
    )
    or exists (
      select 1 from public.match_players mp
      join public.profiles p on p.id = auth.uid()
      where mp.match_id = match_players.match_id and mp.name = p.display_name
    )
  );

-- match_expansions ------------------------------------------------------------

drop policy "match_expansions_owner_all" on public.match_expansions;

create policy "match_expansions_owner_insert"
  on public.match_expansions for insert
  to authenticated
  with check (
    exists (
      select 1 from public.matches
      where matches.id = match_expansions.match_id
        and matches.user_id = auth.uid()
    )
  );

create policy "match_expansions_owner_update"
  on public.match_expansions for update
  to authenticated
  using (
    exists (
      select 1 from public.matches
      where matches.id = match_expansions.match_id
        and matches.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.matches
      where matches.id = match_expansions.match_id
        and matches.user_id = auth.uid()
    )
  );

create policy "match_expansions_owner_delete"
  on public.match_expansions for delete
  to authenticated
  using (
    exists (
      select 1 from public.matches
      where matches.id = match_expansions.match_id
        and matches.user_id = auth.uid()
    )
  );

create policy "match_expansions_select_owner_or_name_match"
  on public.match_expansions for select
  to authenticated
  using (
    exists (
      select 1 from public.matches
      where matches.id = match_expansions.match_id
        and matches.user_id = auth.uid()
    )
    or exists (
      select 1 from public.match_players mp
      join public.profiles p on p.id = auth.uid()
      where mp.match_id = match_expansions.match_id and mp.name = p.display_name
    )
  );

-- match_terraforming_mars_colonies ---------------------------------------------

drop policy "match_terraforming_mars_colonies_owner_all" on public.match_terraforming_mars_colonies;

create policy "match_terraforming_mars_colonies_owner_insert"
  on public.match_terraforming_mars_colonies for insert
  to authenticated
  with check (
    exists (
      select 1 from public.matches
      where matches.id = match_terraforming_mars_colonies.match_id
        and matches.user_id = auth.uid()
    )
  );

create policy "match_terraforming_mars_colonies_owner_update"
  on public.match_terraforming_mars_colonies for update
  to authenticated
  using (
    exists (
      select 1 from public.matches
      where matches.id = match_terraforming_mars_colonies.match_id
        and matches.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.matches
      where matches.id = match_terraforming_mars_colonies.match_id
        and matches.user_id = auth.uid()
    )
  );

create policy "match_terraforming_mars_colonies_owner_delete"
  on public.match_terraforming_mars_colonies for delete
  to authenticated
  using (
    exists (
      select 1 from public.matches
      where matches.id = match_terraforming_mars_colonies.match_id
        and matches.user_id = auth.uid()
    )
  );

create policy "match_terraforming_mars_colonies_select_owner_or_name_match"
  on public.match_terraforming_mars_colonies for select
  to authenticated
  using (
    exists (
      select 1 from public.matches
      where matches.id = match_terraforming_mars_colonies.match_id
        and matches.user_id = auth.uid()
    )
    or exists (
      select 1 from public.match_players mp
      join public.profiles p on p.id = auth.uid()
      where mp.match_id = match_terraforming_mars_colonies.match_id and mp.name = p.display_name
    )
  );
