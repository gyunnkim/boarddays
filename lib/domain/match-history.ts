import type { GameCatalogEntry } from "./stats";

/**
 * 2026년 8월 이전 테라포밍 마스 매치는 확장팩 선택을 정확히 기록하지
 * 않았다(사용자 확정). 이 시점 이전에 생성된 테라포밍 마스 매치는 확장팩
 * 배지를 표시하지 않고, 이후 새로 기록되는 매치부터 표시한다. 다른
 * 게임에는 적용하지 않는다.
 */
const TFM_EXPANSION_DISPLAY_CUTOFF = "2026-08-01T00:00:00Z";

export interface MatchRecord {
  id: string;
  gameId: string;
  playedAt: string;
  createdAt: string;
  /** 테라포밍 마스 매치가 사용한 맵. 다른 게임이거나 미지정이면 null. */
  mapId: string | null;
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

export interface MapCatalogEntry {
  id: string;
  nameKo: string;
  nameEn: string;
}

export interface FactionCatalogEntry {
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
  factionId: string | null;
}

export interface MatchHistoryPlayer {
  name: string;
  score: number;
  rank: number;
  isWin: boolean;
  isMe: boolean;
  /**
   * 진영(기업/리더/기관) 표시명. 듄/SETI는 아직 전적 목록에 표시하지
   * 않기로 했으므로(사용자 확정, 이후 별도 작업) 테라포밍 마스 매치에서만
   * 채워진다.
   */
  faction: FactionCatalogEntry | null;
}

export interface MatchHistoryEntry {
  matchId: string;
  game: GameCatalogEntry;
  playedAt: string;
  myScore: number;
  myRank: number;
  isWin: boolean;
  expansions: ExpansionCatalogEntry[];
  /** 테라포밍 마스 매치가 사용한 맵. 그 외에는 null. */
  map: MapCatalogEntry | null;
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
  mapCatalog: MapCatalogEntry[] = [],
  factionCatalog: FactionCatalogEntry[] = [],
): MatchHistoryEntry[] {
  const gameById = new Map(games.map((g) => [g.id, g]));
  const matchById = new Map(matches.map((m) => [m.id, m]));
  const expansionById = new Map(expansionCatalog.map((e) => [e.id, e]));
  const mapById = new Map(mapCatalog.map((m) => [m.id, m]));
  const factionById = new Map(factionCatalog.map((f) => [f.id, f]));

  const expansionsByMatch = new Map<string, ExpansionCatalogEntry[]>();
  for (const link of matchExpansions) {
    const expansion = expansionById.get(link.expansionId);
    if (!expansion) continue;

    const list = expansionsByMatch.get(link.matchId) ?? [];
    list.push(expansion);
    expansionsByMatch.set(link.matchId, list);
  }

  const playersByMatch = new Map<string, MatchPlayerRecord[]>();
  for (const player of allPlayers) {
    const list = playersByMatch.get(player.matchId) ?? [];
    list.push(player);
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

    // 듄/SETI의 리더·기관 표시는 별도 작업에서 진행하기로 했으므로
    // (사용자 확정), 진영명은 테라포밍 마스 매치에서만 채운다.
    const isTerraformingMars = game.slug === "terraforming-mars";
    const showExpansions =
      !isTerraformingMars ||
      new Date(match.createdAt) >= new Date(TFM_EXPANSION_DISPLAY_CUTOFF);

    const players: MatchHistoryPlayer[] = (
      playersByMatch.get(match.id) ?? []
    ).map((player) => ({
      name: player.name,
      score: player.score,
      rank: player.rank,
      isWin: player.isWin,
      isMe: player.isMe,
      faction:
        isTerraformingMars && player.factionId
          ? (factionById.get(player.factionId) ?? null)
          : null,
    }));

    entries.push({
      matchId: match.id,
      game,
      playedAt: match.playedAt,
      myScore: result.score,
      myRank: result.rank,
      map: isTerraformingMars && match.mapId ? (mapById.get(match.mapId) ?? null) : null,
      players,
      expansions: showExpansions ? (expansionsByMatch.get(match.id) ?? []) : [],
      isWin: result.isWin,
    });
  }

  return entries.sort((a, b) => b.playedAt.localeCompare(a.playedAt));
}
