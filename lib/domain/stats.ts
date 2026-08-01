export interface GameCatalogEntry {
  id: string;
  slug: string;
  nameKo: string;
  nameEn: string;
}

export interface MatchSummary {
  id: string;
  gameId: string;
}

export interface MyResult {
  matchId: string;
  isWin: boolean;
}

export interface GameStats {
  game: GameCatalogEntry;
  totalMatches: number;
  wins: number;
  winRate: number | null;
}

export interface DashboardStats {
  totalMatches: number;
  totalWins: number;
  overallWinRate: number | null;
  perGame: GameStats[];
}

/**
 * 매치/게임/내 결과 목록을 조합해 대시보드 통계를 계산하는 순수 함수.
 * Server Component에서 세 개의 flat 쿼리 결과를 넘겨 호출한다.
 */
export function buildDashboardStats(
  games: GameCatalogEntry[],
  matches: MatchSummary[],
  myResults: MyResult[],
): DashboardStats {
  const gameIdByMatchId = new Map(matches.map((m) => [m.id, m.gameId]));

  const resultsByGame = new Map<string, MyResult[]>();
  for (const result of myResults) {
    const gameId = gameIdByMatchId.get(result.matchId);
    if (!gameId) continue;

    const list = resultsByGame.get(gameId) ?? [];
    list.push(result);
    resultsByGame.set(gameId, list);
  }

  const perGame = games.map((game) => {
    const results = resultsByGame.get(game.id) ?? [];
    const wins = results.filter((r) => r.isWin).length;

    return {
      game,
      totalMatches: results.length,
      wins,
      winRate: results.length > 0 ? wins / results.length : null,
    };
  });

  const totalMatches = myResults.length;
  const totalWins = myResults.filter((r) => r.isWin).length;

  return {
    totalMatches,
    totalWins,
    overallWinRate: totalMatches > 0 ? totalWins / totalMatches : null,
    perGame,
  };
}
