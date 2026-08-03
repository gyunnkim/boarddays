"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getGameCapability } from "@/lib/domain/capabilities";

export type CreateMatchState = { error?: string } | undefined;

interface ParsedPlayer {
  id: string;
  name: string;
  score: number;
  factionId: string | null;
}

function parsePlayers(
  formData: FormData,
  playerIds: string[],
  hasFactions: boolean,
): ParsedPlayer[] | null {
  const players: ParsedPlayer[] = [];

  for (const id of playerIds) {
    const name = formData.get(`player_name_${id}`);
    const scoreRaw = formData.get(`player_score_${id}`);
    const factionRaw = formData.get(`player_faction_${id}`);

    if (typeof name !== "string" || !name.trim()) return null;

    const score = Number(scoreRaw);
    if (!Number.isFinite(score)) return null;

    const factionId =
      hasFactions && typeof factionRaw === "string" && factionRaw
        ? factionRaw
        : null;
    if (hasFactions && !factionId) return null;

    players.push({
      id,
      name: name.trim(),
      score,
      factionId,
    });
  }

  return players;
}

/**
 * 점수 내림차순 표준 경쟁 순위(1224 방식): 동점자는 같은 순위를 받고,
 * 다음 순위는 동점자 수만큼 건너뛴다. 동점 처리 규칙 자체는 게임별로
 * 아직 확인되지 않았으므로(각 docs/games/*.md 참고) 특정 게임 룰을
 * 가정하지 않는 중립적인 방식만 사용한다.
 */
function assignRanks(players: ParsedPlayer[]): Map<string, number> {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const ranks = new Map<string, number>();

  sorted.forEach((player, index) => {
    if (index > 0 && sorted[index - 1].score === player.score) {
      ranks.set(player.id, ranks.get(sorted[index - 1].id)!);
    } else {
      ranks.set(player.id, index + 1);
    }
  });

  return ranks;
}

export async function createMatch(
  _state: CreateMatchState,
  formData: FormData,
): Promise<CreateMatchState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const gameId = formData.get("game_id");
  if (typeof gameId !== "string" || !gameId) {
    return { error: "게임 정보가 올바르지 않습니다." };
  }

  const { data: game, error: gameError } = await supabase
    .from("games")
    .select("id, slug")
    .eq("id", gameId)
    .single();

  const capability = game ? getGameCapability(game.slug) : null;
  if (gameError || !game || !capability) {
    return { error: "게임 정보가 올바르지 않습니다." };
  }

  const expansionIds = formData.getAll("expansion_ids").filter(
    (v): v is string => typeof v === "string" && v.length > 0,
  );
  const playerIds = formData.getAll("player_ids").filter(
    (v): v is string => typeof v === "string" && v.length > 0,
  );

  if (playerIds.length === 0) {
    return { error: "플레이어를 1명 이상 입력해 주세요." };
  }

  const players = parsePlayers(formData, playerIds, capability.hasFactions);
  if (!players) {
    return { error: "플레이어 정보를 다시 확인해 주세요." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  if (profileError) {
    return { error: "내 이름 정보를 불러오지 못했습니다." };
  }

  const myName = profile.display_name;
  const meMatches = myName ? players.filter((p) => p.name === myName) : [];
  if (meMatches.length > 1) {
    return {
      error: "\"나\"로 등록된 이름을 가진 플레이어가 여러 명입니다. 이름을 확인해 주세요.",
    };
  }
  const meId = meMatches[0]?.id ?? null;

  if (capability.hasFactions) {
    const factionIds = players.map((p) => p.factionId);
    if (new Set(factionIds).size !== factionIds.length) {
      return {
        error: `같은 ${capability.factionLabel ?? "진영"}을 두 명 이상 선택할 수 없습니다.`,
      };
    }
  }

  const { data: match, error: matchError } = await supabase
    .from("matches")
    .insert({ user_id: user.id, game_id: game.id })
    .select("id")
    .single();

  if (matchError || !match) {
    return { error: "매치를 저장하지 못했습니다." };
  }

  const cleanupAndFail = async (message: string) => {
    await supabase.from("matches").delete().eq("id", match.id);
    return { error: message };
  };

  if (expansionIds.length > 0) {
    const { error: expansionsError } = await supabase
      .from("match_expansions")
      .insert(expansionIds.map((expansionId) => ({ match_id: match.id, expansion_id: expansionId })));

    if (expansionsError) {
      return cleanupAndFail("확장팩 정보를 저장하지 못했습니다.");
    }
  }

  const ranks = assignRanks(players);

  const { error: playersError } = await supabase.from("match_players").insert(
    players.map((p) => ({
      match_id: match.id,
      name: p.name,
      score: p.score,
      rank: ranks.get(p.id)!,
      is_win: ranks.get(p.id) === 1,
      is_me: p.id === meId,
      faction_id: p.factionId,
    })),
  );

  if (playersError) {
    return cleanupAndFail("플레이어 정보를 저장하지 못했습니다.");
  }

  redirect("/dashboard");
}
