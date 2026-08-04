"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getGameCapability, type GameCapability } from "@/lib/domain/capabilities";

export type CreateMatchState = { error?: string } | undefined;

/**
 * hasFactions가 true여도 factionsRequireExpansionSlug가 설정된 게임(SETI
 * 기관)은 해당 확장팩이 선택된 매치에서만 진영 선택을 필수로 요구한다.
 * match-form.tsx의 factionsEnabled 계산과 동일한 규칙을 서버에서도 적용해
 * 클라이언트가 렌더링하지 않은 필드를 필수값으로 오판하지 않게 한다.
 */
function factionsEnabled(
  capability: GameCapability,
  selectedExpansionSlugs: Set<string>,
): boolean {
  return (
    capability.hasFactions &&
    (!capability.factionsRequireExpansionSlug ||
      selectedExpansionSlugs.has(capability.factionsRequireExpansionSlug))
  );
}

interface ParsedPlayer {
  id: string;
  name: string;
  score: number;
  factionId: string | null;
  color: string | null;
  megacredits: number | null;
  scoreBreakdown: Record<string, number> | null;
}

function parsePlayers(
  formData: FormData,
  playerIds: string[],
  capability: GameCapability,
  selectedExpansionSlugs: Set<string>,
): ParsedPlayer[] | null {
  const players: ParsedPlayer[] = [];

  for (const id of playerIds) {
    const name = formData.get(`player_name_${id}`);
    if (typeof name !== "string" || !name.trim()) return null;

    const factionsOn = factionsEnabled(capability, selectedExpansionSlugs);
    const factionRaw = formData.get(`player_faction_${id}`);
    const factionId =
      factionsOn && typeof factionRaw === "string" && factionRaw
        ? factionRaw
        : null;
    if (factionsOn && !factionId) return null;

    let color: string | null = null;
    if (capability.playerColors) {
      const colorRaw = formData.get(`player_color_${id}`);
      if (
        typeof colorRaw !== "string" ||
        !capability.playerColors.some((c) => c.value === colorRaw)
      ) {
        return null;
      }
      color = colorRaw;
    }

    let megacredits: number | null = null;
    if (capability.hasMegacredits) {
      const mcRaw = formData.get(`player_mc_${id}`);
      const mc = Number(mcRaw);
      if (!Number.isFinite(mc)) return null;
      megacredits = mc;
    }

    let score: number;
    let scoreBreakdown: Record<string, number> | null = null;

    if (capability.scoreComponents) {
      const activeComponents = capability.scoreComponents.filter(
        (c) => !c.requiresExpansionSlug || selectedExpansionSlugs.has(c.requiresExpansionSlug),
      );

      const breakdown: Record<string, number> = {};
      let total = 0;
      for (const component of activeComponents) {
        const raw = formData.get(`player_score_${component.key}_${id}`);
        const value = Number(raw);
        if (!Number.isFinite(value)) return null;
        breakdown[component.key] = value;
        total += value;
      }
      score = total;
      scoreBreakdown = breakdown;
    } else {
      const scoreRaw = formData.get(`player_score_${id}`);
      const parsedScore = Number(scoreRaw);
      if (!Number.isFinite(parsedScore)) return null;
      score = parsedScore;
    }

    players.push({
      id,
      name: name.trim(),
      score,
      factionId,
      color,
      megacredits,
      scoreBreakdown,
    });
  }

  return players;
}

/**
 * 두 플레이어가 같은 순위를 받아야 하는지(완전히 동점인지) 판단한다.
 * 점수가 다르면 항상 동점이 아니다. 점수가 같을 때, 둘 다 megacredits(MC)
 * 값을 가진 게임(테라포밍 마스)이면 MC까지 같아야 동점으로 본다 — 테라포밍
 * 마스는 "점수가 같으면 MC가 높은 쪽이 승리"로 동점 처리 규칙이 확정되었다
 * (docs/games/terraforming-mars.md). MC가 없는 게임(듄/SETI)은
 * megacredits가 항상 null이라 이 비교가 적용되지 않고, 기존처럼 점수만으로
 * 동점을 판단하는 중립적인 방식이 그대로 유지된다.
 */
function isTie(a: ParsedPlayer, b: ParsedPlayer): boolean {
  if (a.score !== b.score) return false;
  if (a.megacredits !== null && b.megacredits !== null) {
    return a.megacredits === b.megacredits;
  }
  return true;
}

/**
 * 점수(그리고 필요 시 megacredits) 내림차순 표준 경쟁 순위(1224 방식):
 * 동점자는 같은 순위를 받고, 다음 순위는 동점자 수만큼 건너뛴다.
 */
function assignRanks(players: ParsedPlayer[]): Map<string, number> {
  const sorted = [...players].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.megacredits !== null && b.megacredits !== null) {
      return b.megacredits - a.megacredits;
    }
    return 0;
  });
  const ranks = new Map<string, number>();

  sorted.forEach((player, index) => {
    if (index > 0 && isTie(sorted[index - 1], player)) {
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
  if (user.is_anonymous) {
    return {
      error: "게스트는 매치를 기록할 수 없습니다. 회원가입 후 이용해 주세요.",
    };
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

  // 클라이언트가 보낸 expansion_ids는 신뢰하지 않고, 이 게임 소속의 실제
  // 확장팩인지 확인한 뒤 slug를 조회한다. scoreComponents/개척기지 뽑기처럼
  // "이 확장팩이 선택됐는지"로 분기하는 로직에 사용한다.
  let selectedExpansionSlugs = new Set<string>();
  if (expansionIds.length > 0) {
    const { data: expansionRows, error: expansionLookupError } = await supabase
      .from("expansions")
      .select("id, slug")
      .eq("game_id", game.id)
      .in("id", expansionIds);

    if (
      expansionLookupError ||
      !expansionRows ||
      expansionRows.length !== expansionIds.length
    ) {
      return { error: "확장팩 정보가 올바르지 않습니다." };
    }
    selectedExpansionSlugs = new Set(expansionRows.map((e) => e.slug));
  }

  // 프로모 기업 사용 여부. 확장팩이 아니므로 match_expansions가 아니라
  // matches.include_promo_factions에 저장한다 (docs/games/terraforming-mars.md
  // "프로모 기업 (확장 아님)" 참고). capability.promoFactions가 없는
  // 게임(듄/SETI)에서는 항상 false로 남는다.
  const includePromoFactions =
    Boolean(capability.promoFactions) &&
    formData.get("include_promo_factions") === "true";

  const mapIdRaw = formData.get("terraforming_mars_map_id");
  const mapId =
    capability.hasMapSelection && typeof mapIdRaw === "string" && mapIdRaw
      ? mapIdRaw
      : null;
  if (capability.hasMapSelection && !mapId) {
    return { error: "맵을 선택해 주세요." };
  }

  const colonyIds = formData.getAll("colony_ids").filter(
    (v): v is string => typeof v === "string" && v.length > 0,
  );
  const coloniesApply = Boolean(
    capability.colonyDraw && selectedExpansionSlugs.has(capability.colonyDraw.expansionSlug),
  );

  const players = parsePlayers(formData, playerIds, capability, selectedExpansionSlugs);
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

  if (factionsEnabled(capability, selectedExpansionSlugs)) {
    const factionIds = players.map((p) => p.factionId);
    if (new Set(factionIds).size !== factionIds.length) {
      return {
        error: `같은 ${capability.factionLabel ?? "진영"}을 두 명 이상 선택할 수 없습니다.`,
      };
    }
  }

  if (capability.playerColors) {
    const colors = players.map((p) => p.color);
    if (new Set(colors).size !== colors.length) {
      return { error: "같은 색상을 두 명 이상 선택할 수 없습니다." };
    }
  }

  const { data: match, error: matchError } = await supabase
    .from("matches")
    .insert({
      user_id: user.id,
      game_id: game.id,
      include_promo_factions: includePromoFactions,
    })
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

  // 맵은 match_expansions가 먼저 저장되어 있어야 검증할 수 있으므로(맵이
  // 특정 확장팩 전용인 경우) 이 시점에 별도 update로 채운다.
  if (capability.hasMapSelection && mapId) {
    const { error: mapError } = await supabase
      .from("matches")
      .update({ terraforming_mars_map_id: mapId })
      .eq("id", match.id);

    if (mapError) {
      return cleanupAndFail("맵 정보를 저장하지 못했습니다.");
    }
  }

  if (coloniesApply && colonyIds.length > 0) {
    const { error: coloniesError } = await supabase
      .from("match_terraforming_mars_colonies")
      .insert(colonyIds.map((colonyId) => ({ match_id: match.id, colony_id: colonyId })));

    if (coloniesError) {
      return cleanupAndFail("개척기지 정보를 저장하지 못했습니다.");
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
      color: p.color,
      megacredits: p.megacredits,
      score_breakdown: p.scoreBreakdown,
    })),
  );

  if (playersError) {
    return cleanupAndFail("플레이어 정보를 저장하지 못했습니다.");
  }

  redirect("/dashboard");
}
