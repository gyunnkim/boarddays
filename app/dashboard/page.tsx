import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { runWithAuthRetry } from "@/lib/supabase/with-retry";
import { buildDashboardStats } from "@/lib/domain/stats";
import { buildMatchHistory } from "@/lib/domain/match-history";
import { getGameCapability } from "@/lib/domain/capabilities";
import { Badge } from "@/components/badge";
import { MatchHistoryList } from "@/components/match-history-list";
import { MatchHistoryFilters } from "@/components/match-history-filters";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { pickLocalized } from "@/lib/i18n/config";
import { formatTemplate } from "@/lib/i18n/format";

function formatPercent(rate: number | null) {
  if (rate === null) return "—";
  return `${Math.round(rate * 100)}%`;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    game?: string;
    map?: string;
    corp?: string;
    corpMine?: string;
  }>;
}) {
  const {
    game: selectedSlug,
    map: selectedMapSlug,
    corp: selectedCorpSlug,
    corpMine: selectedCorpMine,
  } = await searchParams;
  const supabase = await createClient();
  const locale = await getLocale();
  const dict = getDictionary(locale);

  // 로그인/회원가입/게스트 입장 직후에는 방금 발급된 JWT로 인해
  // PostgREST가 아주 짧게 "JWT issued at future"(PGRST303)를 반환할 수
  // 있다. 실제 세션은 유효하므로, 이 경우에 한해 짧게 재시도한다
  // (lib/supabase/with-retry.ts 참고).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    { data: games, error: gamesError },
    { data: matches, error: matchesError },
    { data: matchPlayers, error: matchPlayersError },
    { data: matchExpansions, error: matchExpansionsError },
    { data: expansions, error: expansionsError },
    { data: terraformingMarsMaps, error: terraformingMarsMapsError },
    { data: playerFactions, error: playerFactionsError },
    { data: viewerProfile, error: viewerProfileError },
  ] = await runWithAuthRetry(() =>
    Promise.all([
      supabase.from("games").select("id, slug, name_ko, name_en").order("slug"),
      // RLS(matches_select_owner_or_name_match 경유)가 본인 소유 매치뿐
      // 아니라, 로그인한 사용자의 표시 이름과 같은 이름의 플레이어가 등장하는
      // 매치도 함께 노출한다.
      supabase
        .from("matches")
        .select("id, game_id, played_at, terraforming_mars_map_id"),
      // 마찬가지로 match_players도 소유 매치 또는 이름이 일치하는 매치의
      // 플레이어를 모두 가져온다. is_me는 매치를 "기록한" 사람 기준으로
      // 고정된 값이라 로그인한 사용자 본인을 가리키지 않을 수 있으므로,
      // 아래에서 viewerProfile.display_name과 비교해 다시 계산한다.
      supabase
        .from("match_players")
        .select("match_id, name, score, rank, is_win, is_me, faction_id"),
      supabase.from("match_expansions").select("match_id, expansion_id"),
      supabase.from("expansions").select("id, name_ko, name_en"),
      supabase
        .from("terraforming_mars_maps")
        .select("id, slug, name_ko, name_en"),
      supabase.from("player_factions").select("id, slug, name_ko, name_en"),
      user
        ? supabase
            .from("profiles")
            .select("display_name")
            .eq("id", user.id)
            .single()
        : Promise.resolve({ data: null, error: null }),
    ]),
  );

  if (
    gamesError ||
    matchesError ||
    matchPlayersError ||
    matchExpansionsError ||
    expansionsError ||
    terraformingMarsMapsError ||
    playerFactionsError ||
    viewerProfileError
  ) {
    throw new Error("대시보드 데이터를 불러오지 못했습니다.");
  }

  const viewerName = viewerProfile?.display_name ?? null;

  const gameCatalog = (games ?? []).map((g) => ({
    id: g.id,
    slug: g.slug,
    nameKo: g.name_ko,
    nameEn: g.name_en,
  }));
  const matchRecords = (matches ?? []).map((m) => ({
    id: m.id,
    gameId: m.game_id,
    playedAt: m.played_at,
    mapId: m.terraforming_mars_map_id,
  }));
  // "나"는 더 이상 매치를 기록한 사람이 저장해 둔 is_me가 아니라, 지금
  // 로그인한 사용자의 표시 이름과 같은 이름의 플레이어로 조회 시점에 다시
  // 판단한다. viewerName이 없으면(아직 설정에서 이름을 정하지 않은 사용자)
  // 아무도 "나"로 표시되지 않는다.
  const allMatchPlayers = (matchPlayers ?? []).map((p) => ({
    matchId: p.match_id,
    name: p.name,
    score: p.score,
    rank: p.rank,
    isWin: p.is_win,
    isMe: viewerName !== null && p.name === viewerName,
    factionId: p.faction_id,
  }));
  const myMatchResults = allMatchPlayers
    .filter((p) => p.isMe)
    .map((p) => ({
      matchId: p.matchId,
      score: p.score,
      rank: p.rank,
      isWin: p.isWin,
    }));

  const stats = buildDashboardStats(
    gameCatalog,
    matchRecords.map((m) => ({ id: m.id, gameId: m.gameId })),
    myMatchResults.map((r) => ({ matchId: r.matchId, isWin: r.isWin })),
  );

  const history = buildMatchHistory(
    gameCatalog,
    matchRecords,
    myMatchResults,
    (matchExpansions ?? []).map((e) => ({
      matchId: e.match_id,
      expansionId: e.expansion_id,
    })),
    (expansions ?? []).map((e) => ({
      id: e.id,
      nameKo: e.name_ko,
      nameEn: e.name_en,
    })),
    allMatchPlayers,
    (terraformingMarsMaps ?? []).map((m) => ({
      id: m.id,
      slug: m.slug,
      nameKo: m.name_ko,
      nameEn: m.name_en,
    })),
    (playerFactions ?? []).map((f) => ({
      id: f.id,
      slug: f.slug,
      nameKo: f.name_ko,
      nameEn: f.name_en,
    })),
  );

  const selectedGame = selectedSlug
    ? gameCatalog.find((g) => g.slug === selectedSlug)
    : undefined;
  const gameFilteredHistory = selectedGame
    ? history.filter((entry) => entry.game.id === selectedGame.id)
    : history;

  // 맵/기업 필터는 특정 게임을 고른 뒤, 그 게임의 capability가 지원하는
  // 경우에만 노출한다(게임 이름을 직접 분기하지 않음).
  const gameCapability = selectedGame
    ? getGameCapability(selectedGame.slug)
    : null;
  const showMapFilter = gameCapability?.hasMapSelection ?? false;
  const showFactionFilter = gameCapability?.hasFactions ?? false;

  const availableMaps = showMapFilter
    ? Array.from(
        new Map(
          gameFilteredHistory
            .filter((entry) => entry.map !== null)
            .map((entry) => [entry.map!.slug, entry.map!]),
        ).values(),
      )
    : [];
  // "기업"(진영) 필터의 기본 선택지는 매치 참여자 누구든 그 진영을 썼는지
  // 기준으로 넓게 잡는다. "나" 칩을 함께 켜면 그중 내("isMe") 플레이어가
  // 그 진영을 쓴 매치로 좁힌다.
  const availableFactions = showFactionFilter
    ? Array.from(
        new Map(
          gameFilteredHistory
            .flatMap((entry) => entry.players)
            .filter((player) => player.faction !== null)
            .map((player) => [player.faction!.slug, player.faction!]),
        ).values(),
      ).sort((a, b) =>
        pickLocalized(locale, a.nameKo, a.nameEn).localeCompare(
          pickLocalized(locale, b.nameKo, b.nameEn),
        ),
      )
    : [];
  const onlyMyFaction = Boolean(selectedCorpSlug) && selectedCorpMine === "1";

  const visibleHistory = gameFilteredHistory
    .filter((entry) => !selectedMapSlug || entry.map?.slug === selectedMapSlug)
    .filter(
      (entry) =>
        !selectedCorpSlug ||
        entry.players.some(
          (player) =>
            player.faction?.slug === selectedCorpSlug &&
            (!onlyMyFaction || player.isMe),
        ),
    );

  // 상단 "전적" 요약은 게임/맵/기업 필터가 걸려 있으면 그 필터를 통과한
  // 매치만으로 다시 계산한다(필터 없으면 buildMatchHistory가 만든 목록
  // 전체이므로 결과적으로 전체 전적과 같다).
  const isFiltered = Boolean(selectedSlug || selectedMapSlug || selectedCorpSlug);
  const summaryTotal = visibleHistory.length;
  const summaryWins = visibleHistory.filter((entry) => entry.isWin).length;
  const summaryWinRate = summaryTotal > 0 ? summaryWins / summaryTotal : null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-50">
            {dict.dashboard.title}
          </h1>
          <p className="mt-1 text-sm text-stone-400">
            {dict.dashboard.subtitle}
          </p>
        </div>
        {user?.is_anonymous === true ? (
          <div className="flex flex-col items-end gap-1">
            <Link
              href="/signup"
              className="rounded-md bg-amber-100 px-3 py-2 text-sm font-medium text-stone-950 transition-colors hover:bg-amber-200"
            >
              {dict.dashboard.guestSignupCta}
            </Link>
            <p className="text-xs text-stone-500">
              {dict.dashboard.guestNewMatchHint}
            </p>
          </div>
        ) : (
          <Link
            href="/dashboard/matches/new"
            className="rounded-md bg-amber-100 px-3 py-2 text-sm font-medium text-stone-950 transition-colors hover:bg-amber-200"
          >
            {dict.dashboard.newMatch}
          </Link>
        )}
      </div>

      <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-6">
        <p className="text-sm text-stone-400">
          {dict.dashboard.record}
          {isFiltered && (
            <span className="ml-2 text-xs text-stone-500">
              {dict.dashboard.recordFilteredHint}
            </span>
          )}
        </p>
        <p className="mt-2 text-3xl font-semibold text-stone-50">
          {formatTemplate(dict.dashboard.overallSummaryTemplate, {
            total: summaryTotal,
            wins: summaryWins,
            losses: summaryTotal - summaryWins,
            rate: formatPercent(summaryWinRate),
          })}
        </p>
      </div>

      <div>
        <h2 className="text-lg font-medium text-stone-100">
          {dict.dashboard.perGameTitle}
        </h2>
        <p className="mt-1 text-sm text-stone-500">
          {dict.dashboard.perGameHint}
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.perGame.map(({ game, totalMatches, winRate }) => {
            const isActive = selectedGame?.id === game.id;
            return (
              <Link
                key={game.id}
                href={isActive ? "/dashboard" : `/dashboard?game=${game.slug}`}
                className={`rounded-xl border p-6 text-left transition-colors ${
                  isActive
                    ? "border-amber-500/70 bg-stone-800/80"
                    : "border-stone-800 bg-stone-900/60 hover:border-stone-700"
                }`}
              >
                <Badge>{pickLocalized(locale, game.nameKo, game.nameEn)}</Badge>
                {totalMatches > 0 ? (
                  <p className="mt-4 text-sm text-stone-400">
                    {formatTemplate(dict.dashboard.playedSummaryTemplate, {
                      count: totalMatches,
                      rate: formatPercent(winRate),
                    })}
                  </p>
                ) : (
                  <p className="mt-4 text-sm text-stone-500">
                    {dict.dashboard.noMatchesForGame}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-stone-100">
            {dict.dashboard.historyTitle}
            {selectedGame
              ? ` · ${pickLocalized(locale, selectedGame.nameKo, selectedGame.nameEn)}`
              : ""}
          </h2>
          {selectedGame && (
            <Link
              href="/dashboard"
              className="text-sm text-stone-400 hover:text-stone-200"
            >
              {dict.dashboard.showAll}
            </Link>
          )}
        </div>

        <MatchHistoryFilters
          gameSlug={selectedGame?.slug}
          availableMaps={availableMaps}
          availableFactions={availableFactions}
          selectedMapSlug={selectedMapSlug}
          selectedCorpSlug={selectedCorpSlug}
          onlyMyFaction={onlyMyFaction}
          factionFilterLabel={
            gameCapability?.factionLabel ?? dict.dashboard.factionFilterLabel
          }
          locale={locale}
          dict={dict}
        />

        {visibleHistory.length > 0 ? (
          <MatchHistoryList
            key={selectedGame?.slug ?? "all"}
            entries={visibleHistory}
            locale={locale}
            dict={dict}
          />
        ) : (
          <p className="mt-4 text-sm text-stone-500">
            {selectedGame
              ? dict.dashboard.historyEmptyFiltered
              : dict.dashboard.historyEmpty}
          </p>
        )}
      </div>
    </div>
  );
}
