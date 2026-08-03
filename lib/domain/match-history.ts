import type { GameCatalogEntry } from "./stats";

export interface MatchRecord {
  id: string;
  gameId: string;
  playedAt: string;
}

export interface MyMatchResult {
  matchId: string;
  score: number;
  rank: number;
  isWin: boolean;
}

export interface MatchExpansionLink {
  matchId: string;
  expansionId: string;
}

export interface ExpansionCatalogEntry {
  id: string;
  nameKo: string;
  nameEn: string;
}

export interface MatchPlayerRecord {
  matchId: string;
  name: string;
  score: number;
  rank: number;
  isWin: boolean;
  isMe: boolean;
}

export interface MatchHistoryPlayer {
  name: string;
  score: number;
  rank: number;
  isWin: boolean;
  isMe: boolean;
}

export interface MatchHistoryEntry {
  matchId: string;
  game: GameCatalogEntry;
  playedAt: string;
  myScore: number;
  myRank: number;
  isWin: boolean;
  expansions: ExpansionCatalogEntry[];
  /** 매치에 참여한 모든 플레이어, 등수(rank) 오름차순 정렬. */
  players: MatchHistoryPlayer[];
}

/**
 * 매치/내 결과/사용한 확장팩/전체 플레이어를 조합해 최신순 전적 목록을
 * 만드는 순수 함수.
 * "나"로 표시된 플레이어가 없는 매치(myResults에 없음)는 전적에 포함하지
 * 않는다. 이 매치는 포함되면 그 매치에 참여한 모든 플레이어를 등수
 * 오름차순으로 함께 보여준다.
 */
export function buildMatchHistory(
  games: GameCatalogEntry[],
  matches: MatchRecord[],
  myResults: MyMatchResult[],
  matchExpansions: MatchExpansionLink[],
  expansionCatalog: ExpansionCatalogEntry[],
  allPlayers: MatchPlayerRecord[] = [],
): MatchHistoryEntry[] {
  const gameById = new Map(games.map((g) => [g.id, g]));
  const matchById = new Map(matches.map((m) => [m.id, m]));
  const expansionById = new Map(expansionCatalog.map((e) => [e.id, e]));

  const expansionsByMatch = new Map<string, ExpansionCatalogEntry[]>();
  for (const link of matchExpansions) {
    const expansion = expansionById.get(link.expansionId);
    if (!expansion) continue;

    const list = expansionsByMatch.get(link.matchId) ?? [];
    list.push(expansion);
    expansionsByMatch.set(link.matchId, list);
  }

  const playersByMatch = new Map<string, MatchHistoryPlayer[]>();
  for (const player of allPlayers) {
    const list = playersByMatch.get(player.matchId) ?? [];
    list.push({
      name: player.name,
      score: player.score,
      rank: player.rank,
      isWin: player.isWin,
      isMe: player.isMe,
    });
    playersByMatch.set(player.matchId, list);
  }
  for (const list of playersByMatch.values()) {
    list.sort((a, b) => a.rank - b.rank);
  }

  const entries: MatchHistoryEntry[] = [];
  for (const result of myResults) {
    const match = matchById.get(result.matchId);
    if (!match) continue;

    const game = gameById.get(match.gameId);
    if (!game) continue;

    entries.push({
      matchId: match.id,
      game,
      playedAt: match.playedAt,
      myScore: result.score,
      myRank: result.rank,
      isWin: result.isWin,
      expansions: expansionsByMatch.get(match.id) ?? [],
      players: playersByMatch.get(match.id) ?? [],
    });
  }

  return entries.sort((a, b) => b.playedAt.localeCompare(a.playedAt));
}
