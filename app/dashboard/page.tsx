import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { runWithAuthRetry } from "@/lib/supabase/with-retry";
import { buildDashboardStats } from "@/lib/domain/stats";
import { buildMatchHistory } from "@/lib/domain/match-history";
import { Badge } from "@/components/badge";
import { MatchHistoryList } from "@/components/match-history-list";
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
  searchParams: Promise<{ game?: string }>;
}) {
  const { game: selectedSlug } = await searchParams;
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
    { data: viewerProfile, error: viewerProfileError },
  ] = await runWithAuthRetry(() =>
    Promise.all([
      supabase
        .from("games")
        .select("id, slug, name_ko, name_en")
        .order("slug"),
      // RLS(matches_select_owner_or_name_match 경유)가 본인 소유 매치뿐
      // 아니라, 로그인한 사용자의 표시 이름과 같은 이름의 플레이어가 등장하는
      // 매치도 함께 노출한다.
      supabase.from("matches").select("id, game_id, played_at"),
      // 마찬가지로 match_players도 소유 매치 또는 이름이 일치하는 매치의
      // 플레이어를 모두 가져온다. is_me는 매치를 "기록한" 사람 기준으로
      // 고정된 값이라 로그인한 사용자 본인을 가리키지 않을 수 있으므로,
      // 아래에서 viewerProfile.display_name과 비교해 다시 계산한다.
      supabase
        .from("match_players")
        .select("match_id, name, score, rank, is_win, is_me"),
      supabase.from("match_expansions").select("match_id, expansion_id"),
      supabase.from("expansions").select("id, name_ko, name_en"),
      user
        ? supabase.from("profiles").select("display_name").eq("id", user.id).single()
        : Promise.resolve({ data: null, error: null }),
    ]),
  );

  if (
    gamesError ||
    matchesError ||
    matchPlayersError ||
    matchExpansionsError ||
    expansionsError ||
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
  );

  const selectedGame = selectedSlug
    ? gameCatalog.find((g) => g.slug === selectedSlug)
    : undefined;
  const visibleHistory = selectedGame
    ? history.filter((entry) => entry.game.id === selectedGame.id)
    : history;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-50">
            {dict.dashboard.title}
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            {dict.dashboard.subtitle}
          </p>
        </div>
        <Link
          href="/dashboard/matches/new"
          className="rounded-md bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-200"
        >
          {dict.dashboard.newMatch}
        </Link>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
        <p className="text-sm text-zinc-400">{dict.dashboard.record}</p>
        <p className="mt-2 text-3xl font-semibold text-zinc-50">
          {formatTemplate(dict.dashboard.overallSummaryTemplate, {
            total: stats.totalMatches,
            wins: stats.totalWins,
            losses: stats.totalMatches - stats.totalWins,
            rate: formatPercent(stats.overallWinRate),
          })}
        </p>
      </div>

      <div>
        <h2 className="text-lg font-medium text-zinc-100">
          {dict.dashboard.perGameTitle}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">{dict.dashboard.perGameHint}</p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.perGame.map(({ game, totalMatches, winRate }) => {
            const isActive = selectedGame?.id === game.id;
            return (
              <Link
                key={game.id}
                href={isActive ? "/dashboard" : `/dashboard?game=${game.slug}`}
                className={`rounded-xl border p-6 text-left transition-colors ${
                  isActive
                    ? "border-zinc-50 bg-zinc-800/80"
                    : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"
                }`}
              >
                <Badge>{pickLocalized(locale, game.nameKo, game.nameEn)}</Badge>
                {totalMatches > 0 ? (
                  <p className="mt-4 text-sm text-zinc-400">
                    {formatTemplate(dict.dashboard.playedSummaryTemplate, {
                      count: totalMatches,
                      rate: formatPercent(winRate),
                    })}
                  </p>
                ) : (
                  <p className="mt-4 text-sm text-zinc-500">
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
          <h2 className="text-lg font-medium text-zinc-100">
            {dict.dashboard.historyTitle}
            {selectedGame
              ? ` · ${pickLocalized(locale, selectedGame.nameKo, selectedGame.nameEn)}`
              : ""}
          </h2>
          {selectedGame && (
            <Link
              href="/dashboard"
              className="text-sm text-zinc-400 hover:text-zinc-200"
            >
              {dict.dashboard.showAll}
            </Link>
          )}
        </div>

        {visibleHistory.length > 0 ? (
          <MatchHistoryList
            key={selectedGame?.slug ?? "all"}
            entries={visibleHistory}
            locale={locale}
            dict={dict}
          />
        ) : (
          <p className="mt-4 text-sm text-zinc-500">
            {selectedGame
              ? dict.dashboard.historyEmptyFiltered
              : dict.dashboard.historyEmpty}
          </p>
        )}
      </div>
    </div>
  );
}
