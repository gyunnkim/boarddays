import type { GameCatalogEntry } from "./stats";
import { getGameCapability } from "./capabilities";

/**
 * 2026년 8월 이전에 플레이한 테라포밍 마스 매치는 확장팩 선택을 정확히
 * 기록하지 않았다(사용자 확정). 이 시점 이전 played_at을 가진 테라포밍
 * 마스 매치는 확장팩 배지를 표시하지 않고, 이후 플레이한 매치부터
 * 표시한다. 다른 게임에는 적용하지 않는다.
 *
 * 매치를 실제로 기록한(DB에 insert한) 시각인 created_at은 기준으로 쓸 수
 * 없다 — 옛 TFMCounter 기록을 옮겨온 과거 전적들은 played_at은 실제
 * 플레이한 과거 날짜지만 created_at은 옮겨온 시점(2026-08-04)이라, created_at
 * 기준으로는 모두 "새 기록"으로 잘못 분류된다.
 */
const TFM_EXPANSION_DISPLAY_CUTOFF = "2026-08-01";

export interface MatchRecord {
  id: string;
  gameId: string;
  playedAt: string;
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
   * 진영(기업/리더/기관) 표시명. 게임이 진영을 가지는지(capabilities의
   * hasFactions)로만 판단하고 게임 종류를 직접 분기하지 않는다.
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

    const isTerraformingMars = game.slug === "terraforming-mars";
    const showExpansions =
      !isTerraformingMars || match.playedAt >= TFM_EXPANSION_DISPLAY_CUTOFF;
    // 진영(듄 리더/SETI 기관/테라포밍 마스 기업) 표시는 게임 종류를 직접
    // 분기하지 않고, 그 게임이 진영을 가지는지(hasFactions)로만 판단한다.
    const showFactions = getGameCapability(game.slug)?.hasFactions ?? false;

    const players: MatchHistoryPlayer[] = (
      playersByMatch.get(match.id) ?? []
    ).map((player) => ({
      name: player.name,
      score: player.score,
      rank: player.rank,
      isWin: player.isWin,
      isMe: player.isMe,
      faction:
        showFactions && player.factionId
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
