import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { buildDashboardStats } from "@/lib/domain/stats";
import { Badge } from "@/components/badge";

function formatPercent(rate: number | null) {
  if (rate === null) return "—";
  return `${Math.round(rate * 100)}%`;
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const [
    { data: games, error: gamesError },
    { data: matches, error: matchesError },
    { data: myResults, error: resultsError },
  ] = await Promise.all([
    supabase.from("games").select("id, slug, name_ko, name_en").order("slug"),
    supabase.from("matches").select("id, game_id"),
    supabase.from("match_players").select("match_id, is_win").eq("is_me", true),
  ]);

  if (gamesError || matchesError || resultsError) {
    throw new Error("대시보드 데이터를 불러오지 못했습니다.");
  }

  const stats = buildDashboardStats(
    (games ?? []).map((g) => ({
      id: g.id,
      slug: g.slug,
      nameKo: g.name_ko,
      nameEn: g.name_en,
    })),
    (matches ?? []).map((m) => ({ id: m.id, gameId: m.game_id })),
    (myResults ?? []).map((r) => ({ matchId: r.match_id, isWin: r.is_win })),
  );

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
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.perGame.map(({ game, totalMatches, winRate }) => (
            <div
              key={game.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6"
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
