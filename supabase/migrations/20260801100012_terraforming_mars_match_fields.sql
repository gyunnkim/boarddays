-- 테라포밍 마스 매치 전용 필드: 맵, 플레이어 색상, 메가크레딧, 점수 세부
-- 항목, 개척기지 뽑기 결과. 다른 게임(듄/SETI) 매치에는 이 컬럼들이 항상
-- null로 남는다 (게임별 분기는 lib/domain/capabilities.ts의 capability로만
-- 판단하고, 여기 컬럼 존재 자체는 게임에 관계없이 공유한다).
alter table public.matches
  add column terraforming_mars_map_id uuid references public.terraforming_mars_maps (id);

alter table public.match_players
  add column color text check (color is null or color in ('red', 'blue', 'yellow', 'green', 'black')),
  add column megacredits integer,
  -- 점수 세부 항목(TR/업적/기업상/드루이드/숲/도시/카드 점수/의회)은 게임마다
  -- 구성이 다를 수 있어 고정 컬럼을 늘리는 대신 jsonb에 { key: value } 형태로
  -- 저장한다. 각 항목의 key/표시명은 lib/domain/capabilities.ts의
  -- scoreComponents가 데이터로 정의하고, match_players.score(합계)는 서버
  -- 액션이 이 항목들을 합산해 채운다.
  add column score_breakdown jsonb;

-- 개척기지 뽑기 결과: 매치당 여러 개척기지가 연결된다 (match_expansions와
-- 동일한 다대다 join 테이블 패턴).
create table public.match_terraforming_mars_colonies (
  match_id uuid not null references public.matches (id) on delete cascade,
  colony_id uuid not null references public.terraforming_mars_colonies (id),
  primary key (match_id, colony_id)
);

alter table public.match_terraforming_mars_colonies enable row level security;

create policy "match_terraforming_mars_colonies_owner_all"
  on public.match_terraforming_mars_colonies for all
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

-- 맵이 특정 확장팩 전용이면, 그 확장팩이 매치에 선택되어 있어야 한다.
-- 매치 생성 흐름상 matches를 먼저 만들고 match_expansions를 채운 뒤 맵을
-- update로 채우므로(맵 선택 시점에는 이미 match_expansions가 존재), 이
-- 트리거는 insert/update 양쪽에서 동작한다.
create function public.check_match_map()
returns trigger
language plpgsql
as $$
declare
  map_expansion_id uuid;
  expansion_included boolean;
begin
  if new.terraforming_mars_map_id is null then
    return new;
  end if;

  select expansion_id into map_expansion_id
    from public.terraforming_mars_maps where id = new.terraforming_mars_map_id;

  if map_expansion_id is null then
    return new;
  end if;

  select exists (
    select 1 from public.match_expansions
    where match_expansions.match_id = new.id
      and match_expansions.expansion_id = map_expansion_id
  ) into expansion_included;

  if not expansion_included then
    raise exception 'map % requires expansion % which is not selected for match %', new.terraforming_mars_map_id, map_expansion_id, new.id;
  end if;

  return new;
end;
$$;

create trigger matches_check_map
  before insert or update on public.matches
  for each row execute function public.check_match_map();

-- 개척기지는 해당 매치의 게임에 'colonies' slug 확장이 있고, 그 확장이 이
-- 매치에 선택되어 있는 경우에만 연결할 수 있다.
create function public.check_match_colony()
returns trigger
language plpgsql
as $$
declare
  match_game_id uuid;
  colonies_expansion_id uuid;
  expansion_included boolean;
begin
  select game_id into match_game_id from public.matches where id = new.match_id;

  if match_game_id is null then
    raise exception 'invalid match reference';
  end if;

  select id into colonies_expansion_id
    from public.expansions
    where game_id = match_game_id and slug = 'colonies';

  if colonies_expansion_id is null then
    raise exception 'match % game has no colonies expansion', new.match_id;
  end if;

  select exists (
    select 1 from public.match_expansions
    where match_expansions.match_id = new.match_id
      and match_expansions.expansion_id = colonies_expansion_id
  ) into expansion_included;

  if not expansion_included then
    raise exception 'match % does not have the colonies expansion selected', new.match_id;
  end if;

  return new;
end;
$$;

create trigger match_terraforming_mars_colonies_check
  before insert or update on public.match_terraforming_mars_colonies
  for each row execute function public.check_match_colony();
