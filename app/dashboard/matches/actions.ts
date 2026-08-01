"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getGameCapability } from "@/lib/domain/capabilities";

export type CreateMatchState = { error?: string } | undefined;

interface ParsedPlayer {
  id: string;
  name: string;
  score: number;
  rank: number;
  isWin: boolean;
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
    const rankRaw = formData.get(`player_rank_${id}`);
    const factionRaw = formData.get(`player_faction_${id}`);

    if (typeof name !== "string" || !name.trim()) return null;

    const score = Number(scoreRaw);
    const rank = Number(rankRaw);
    if (!Number.isFinite(score) || !Number.isInteger(rank) || rank <= 0) {
      return null;
    }

    const factionId =
      hasFactions && typeof factionRaw === "string" && factionRaw
        ? factionRaw
        : null;
    if (hasFactions && !factionId) return null;

    players.push({
      id,
      name: name.trim(),
      score,
      rank,
      isWin: formData.get(`player_is_win_${id}`) === "on",
      factionId,
    });
  }

  return players;
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
  const meId = formData.get("is_me");

  if (playerIds.length === 0) {
    return { error: "플레이어를 1명 이상 입력해 주세요." };
  }
  if (typeof meId !== "string" || !playerIds.includes(meId)) {
    return { error: "\"나\"로 표시할 플레이어를 선택해 주세요." };
  }

  const players = parsePlayers(formData, playerIds, capability.hasFactions);
  if (!players) {
    return { error: "플레이어 정보를 다시 확인해 주세요." };
  }

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

  const { error: playersError } = await supabase.from("match_players").insert(
    players.map((p) => ({
      match_id: match.id,
      name: p.name,
      score: p.score,
      rank: p.rank,
      is_win: p.isWin,
      is_me: p.id === meId,
      faction_id: p.factionId,
    })),
  );

  if (playersError) {
    return cleanupAndFail("플레이어 정보를 저장하지 못했습니다.");
  }

  redirect("/dashboard");
}
