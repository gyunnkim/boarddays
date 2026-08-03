import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { buildDashboardStats } from "@/lib/domain/stats";
import { buildMatchHistory } from "@/lib/domain/match-history";
import { Badge } from "@/components/badge";

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

  const [
    { data: games, error: gamesError },
    { data: matches, error: matchesError },
    { data: myResults, error: resultsError },
    { data: matchExpansions, error: matchExpansionsError },
    { data: expansions, error: expansionsError },
  ] = await Promise.all([
    supabase.from("games").select("id, slug, name_ko, name_en").order("slug"),
    supabase.from("matches").select("id, game_id, played_at"),
    supabase
      .from("match_players")
      .select("match_id, score, rank, is_win")
      .eq("is_me", true),
    supabase.from("match_expansions").select("match_id, expansion_id"),
    supabase.from("expansions").select("id, name_ko"),
  ]);

  if (
    gamesError ||
    matchesError ||
    resultsError ||
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
  const myMatchResults = (myResults ?? []).map((r) => ({
    matchId: r.match_id,
    score: r.score,
    rank: r.rank,
    isWin: r.is_win,
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
    (expansions ?? []).map((e) => ({ id: e.id, nameKo: e.name_ko })),
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
          <h1 className="text-2xl font-semibold text-zinc-50">대시보드</h1>
          <p className="mt-1 text-sm text-zinc-400">
            지금까지 기록한 전적을 한눈에 확인하세요.
          </p>
        </div>
        <Link
          href="/dashboard/matches/new"
          className="rounded-md bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-200"
        >
          새 매치 기록
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
          <p className="text-sm text-zinc-400">총 게임 횟수</p>
          <p className="mt-2 text-3xl font-semibold text-zinc-50">
            {stats.totalMatches}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
          <p className="text-sm text-zinc-400">승률</p>
          <p className="mt-2 text-3xl font-semibold text-zinc-50">
            {formatPercent(stats.overallWinRate)}
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-medium text-zinc-100">게임별 기록</h2>
        <p className="mt-1 text-sm text-zinc-500">
          게임을 클릭하면 아래 전적 기록을 해당 게임만 필터링해서 볼 수
          있어요. 다시 클릭하면 필터가 해제됩니다.
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
                    ? "border-zinc-50 bg-zinc-800/80"
                    : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"
                }`}
              >
                <Badge>{game.nameKo}</Badge>
                {totalMatches > 0 ? (
                  <p className="mt-4 text-sm text-zinc-400">
                    플레이 {totalMatches}회 · 승률 {formatPercent(winRate)}
                  </p>
                ) : (
                  <p className="mt-4 text-sm text-zinc-500">
                    아직 기록한 매치가 없습니다.
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
            전적 기록
            {selectedGame ? ` · ${selectedGame.nameKo}` : ""}
          </h2>
          {selectedGame && (
            <Link
              href="/dashboard"
              className="text-sm text-zinc-400 hover:text-zinc-200"
            >
              전체 보기
            </Link>
          )}
        </div>

        {visibleHistory.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {visibleHistory.map((entry) => (
              <li
                key={entry.matchId}
                className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{entry.game.nameKo}</Badge>
                    {entry.expansions.map((expansion) => (
                      <Badge key={expansion.id}>{expansion.nameKo}</Badge>
                    ))}
                  </div>
                  <span className="text-xs text-zinc-500">
                    {formatDate(entry.playedAt)}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-4 text-sm">
                  <span
                    className={
                      entry.isWin
                        ? "font-medium text-emerald-400"
                        : "font-medium text-red-400"
                    }
                  >
                    {entry.isWin ? "승" : "패"}
                  </span>
                  <span className="text-zinc-300">{entry.myRank}위</span>
                  <span className="text-zinc-300">{entry.myScore}점</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-zinc-500">
            {selectedGame
              ? "이 게임으로 기록한 매치가 없습니다."
              : "아직 기록한 매치가 없습니다."}
          </p>
        )}
      </div>
    </div>
  );
}
