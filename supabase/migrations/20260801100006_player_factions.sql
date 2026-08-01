-- player_factions: 게임별 플레이어 진영 카탈로그 (듄의 리더, SETI의 조직,
-- 테라포밍 마스의 기업처럼 확장팩에 따라 선택지가 늘어나는 비대칭 진영을
-- 공통 구조로 표현한다). games/expansions와 동일하게 읽기 전용 참조 데이터.
create table public.player_factions (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games (id) on delete cascade,
  expansion_id uuid references public.expansions (id) on delete cascade,
  group_slug text,
  group_name_ko text,
  group_name_en text,
  slug text not null,
  name_ko text not null,
  name_en text not null,
  created_at timestamptz not null default now(),
  unique (game_id, slug)
);

alter table public.player_factions enable row level security;

create policy "player_factions_select_authenticated"
  on public.player_factions for select
  to authenticated
  using (true);

-- 듄: 임페리움 기본판 리더 (가문당 2명).
insert into public.player_factions (game_id, expansion_id, group_slug, group_name_ko, group_name_en, slug, name_ko, name_en)
select g.id, null, f.group_slug, f.group_name_ko, f.group_name_en, f.slug, f.name_ko, f.name_en
from (
  values
    ('atreides', '아트레이드', 'Atreides', 'paul-atreides', '폴 아트레이드', 'Paul Atreides'),
    ('atreides', '아트레이드', 'Atreides', 'duke-leto-atreides', '레토 아트레이드 공작', 'Duke Leto Atreides'),
    ('harkonnen', '하코넨', 'Harkonnen', 'baron-vladimir-harkonnen', '블라디미르 하코넨 남작', 'Baron Vladimir Harkonnen'),
    ('harkonnen', '하코넨', 'Harkonnen', 'glossu-rabban', '글로서 "더 비스트" 라반', 'Glossu "the Beast" Rabban'),
    ('thorvald', '소르발드', 'Thorvald', 'earl-memnon-thorvald', '멤논 소르발드 공작', 'Earl Memnon Thorvald'),
    ('thorvald', '소르발드', 'Thorvald', 'countess-ariana-thorvald', '아리아나 소르발드 백작부인', 'Countess Ariana Thorvald'),
    ('richese', '리체스', 'Richese', 'helena-richese', '헬레나 리체스', 'Helena Richese'),
    ('richese', '리체스', 'Richese', 'count-ilban-richese', '일반 리체스 백작', 'Count Ilban Richese')
) as f (group_slug, group_name_ko, group_name_en, slug, name_ko, name_en)
join public.games g on g.slug = 'dune-imperium';

-- 듄: 임페리움 익스의 부상(rise-of-ix) 확장 추가 리더 (가문당 2명).
insert into public.player_factions (game_id, expansion_id, group_slug, group_name_ko, group_name_en, slug, name_ko, name_en)
select g.id, e.id, f.group_slug, f.group_name_ko, f.group_name_en, f.slug, f.name_ko, f.name_en
from (
  values
    ('vernius', '버니우스', 'Vernius', 'tessia-vernius', '테시아 버니우스', 'Tessia Vernius'),
    ('vernius', '버니우스', 'Vernius', 'prince-rhombur-vernius', '롬버 버니우스 대공', 'Prince Rhombur Vernius'),
    ('ecaz', '에카즈', 'Ecaz', 'ilesa-ecaz', '일레사 에카즈', 'Ilesa Ecaz'),
    ('ecaz', '에카즈', 'Ecaz', 'archduke-armand-ecaz', '아먼드 에카즈 대공', 'Archduke Armand Ecaz'),
    ('moritani', '모리타니', 'Moritani', 'princess-yuna-moritani', '유나 모리타니 "공주"', '"Princess" Yuna Moritani'),
    ('moritani', '모리타니', 'Moritani', 'viscount-hundro-moritani', '헌드로 모리타니 자작', 'Viscount Hundro Moritani')
) as f (group_slug, group_name_ko, group_name_en, slug, name_ko, name_en)
join public.games g on g.slug = 'dune-imperium'
join public.expansions e on e.game_id = g.id and e.slug = 'rise-of-ix';

-- match_players에 진영(리더/조직/기업 등) 선택 결과를 저장.
alter table public.match_players
  add column faction_id uuid references public.player_factions (id);

-- 한 매치 내에서 같은 진영을 두 플레이어가 선택할 수 없다 (예: 듄 리더는 유일).
create unique index match_players_unique_faction_per_match
  on public.match_players (match_id, faction_id)
  where faction_id is not null;

-- faction은 매치의 게임과 같은 게임 소속이어야 하고, 특정 확장팩 전용
-- faction이면 그 확장팩이 매치에 선택되어 있어야 한다.
create function public.check_match_player_faction()
returns trigger
language plpgsql
as $$
declare
  match_game_id uuid;
  faction_game_id uuid;
  faction_expansion_id uuid;
  expansion_included boolean;
begin
  if new.faction_id is null then
    return new;
  end if;

  select game_id into match_game_id from public.matches where id = new.match_id;
  select game_id, expansion_id into faction_game_id, faction_expansion_id
    from public.player_factions where id = new.faction_id;

  if match_game_id is null or faction_game_id is null then
    raise exception 'invalid match or faction reference';
  end if;

  if match_game_id <> faction_game_id then
    raise exception 'faction % does not belong to the game of match %', new.faction_id, new.match_id;
  end if;

  if faction_expansion_id is not null then
    select exists (
      select 1 from public.match_expansions
      where match_expansions.match_id = new.match_id
        and match_expansions.expansion_id = faction_expansion_id
    ) into expansion_included;

    if not expansion_included then
      raise exception 'faction % requires expansion % which is not selected for match %', new.faction_id, faction_expansion_id, new.match_id;
    end if;
  end if;

  return new;
end;
$$;

create trigger match_players_check_faction
  before insert or update on public.match_players
  for each row execute function public.check_match_player_faction();
