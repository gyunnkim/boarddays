import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { runWithAuthRetry } from "@/lib/supabase/with-retry";
import { buildDashboardStats } from "@/lib/domain/stats";
import { buildMatchHistory } from "@/lib/domain/match-history";
import { Badge } from "@/components/badge";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { pickLocalized } from "@/lib/i18n/config";
import { formatTemplate } from "@/lib/i18n/format";

function formatPercent(rate: number | null) {
  if (rate === null) return "—";
  return `${Math.round(rate * 100)}%`;
}

function formatDate(playedAt: string) {
  return playedAt.replaceAll("-", ".");
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
  const [
    { data: games, error: gamesError },
    { data: matches, error: matchesError },
    { data: matchPlayers, error: matchPlayersError },
    { data: matchExpansions, error: matchExpansionsError },
    { data: expansions, error: expansionsError },
  ] = await runWithAuthRetry(() =>
    Promise.all([
      supabase
        .from("games")
        .select("id, slug, name_ko, name_en")
        .order("slug"),
      supabase.from("matches").select("id, game_id, played_at"),
      // RLS(matches_owner_all 경유)가 본인 매치의 플레이어만 노출하므로
      // is_me로 거르지 않고 매치에 참여한 모든 플레이어를 가져온다.
      supabase
        .from("match_players")
        .select("match_id, name, score, rank, is_win, is_me"),
      supabase.from("match_expansions").select("match_id, expansion_id"),
      supabase.from("expansions").select("id, name_ko, name_en"),
    ]),
  );

  if (
    gamesError ||
    matchesError ||
    matchPlayersError ||
    matchExpansionsError ||
    expansionsError
  ) {
    throw new Error("대시보드 데이터를 불러오지 못했습니다.");
  }

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
  const allMatchPlayers = (matchPlayers ?? []).map((p) => ({
    matchId: p.match_id,
    name: p.name,
    score: p.score,
    rank: p.rank,
    isWin: p.is_win,
    isMe: p.is_me,
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
          <p className="text-sm text-zinc-400">{dict.dashboard.totalMatches}</p>
          <p className="mt-2 text-3xl font-semibold text-zinc-50">
            {stats.totalMatches}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
          <p className="text-sm text-zinc-400">{dict.dashboard.winRate}</p>
          <p className="mt-2 text-3xl font-semibold text-zinc-50">
            {formatPercent(stats.overallWinRate)}
          </p>
        </div>
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
          <ul className="mt-4 space-y-3">
            {visibleHistory.map((entry) => {
              const lastRank =
                entry.players[entry.players.length - 1]?.rank ??
                entry.myRank;
              const cardTone =
                entry.myRank === 1
                  ? "border-l-4 border-l-sky-500 border-y border-r border-zinc-800 bg-sky-500/10"
                  : entry.myRank === lastRank
                    ? "border-l-4 border-l-red-500 border-y border-r border-zinc-800 bg-red-500/10"
                    : "border-l-4 border-l-yellow-500 border-y border-r border-zinc-800 bg-yellow-500/10";

              return (
                <li
                  key={entry.matchId}
                  className={`rounded-xl p-4 sm:p-5 ${cardTone}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge>
                        {pickLocalized(locale, entry.game.nameKo, entry.game.nameEn)}
                      </Badge>
                      {entry.expansions.map((expansion) => (
                        <Badge key={expansion.id}>
                          {pickLocalized(locale, expansion.nameKo, expansion.nameEn)}
                        </Badge>
                      ))}
                    </div>
                    <span className="text-xs text-zinc-500">
                      {formatDate(entry.playedAt)}
                    </span>
                  </div>
                  <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
                    {entry.players.map((player, index) => (
                      <li
                        key={`${entry.matchId}-${index}-${player.name}`}
                        className={
                          player.isMe
                            ? "flex items-center gap-1.5 font-medium text-zinc-50"
                            : "flex items-center gap-1.5 text-zinc-400"
                        }
                      >
                        <span
                          className={
                            player.isWin ? "text-emerald-400" : "text-zinc-500"
                          }
                        >
                          {formatTemplate(dict.dashboard.rankTemplate, {
                            n: player.rank,
                          })}
                        </span>
                        <span>{player.name}</span>
                        <span>
                          {formatTemplate(dict.dashboard.scoreTemplate, {
                            n: player.score,
                          })}
                        </span>
                        {player.isMe && (
                          <Badge>{dict.dashboard.you}</Badge>
                        )}
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
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
