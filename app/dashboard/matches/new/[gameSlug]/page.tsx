import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getGameCapability } from "@/lib/domain/capabilities";
import { MatchForm } from "./match-form";

export default async function NewMatchGameFormPage({
  params,
}: {
  params: Promise<{ gameSlug: string }>;
}) {
  const { gameSlug } = await params;
  const capability = getGameCapability(gameSlug);

  if (!capability) {
    redirect("/dashboard/matches/new");
  }

  const supabase = await createClient();

  const { data: game, error: gameError } = await supabase
    .from("games")
    .select("id, slug, name_ko, name_en")
    .eq("slug", gameSlug)
    .single();

  if (gameError || !game) {
    redirect("/dashboard/matches/new");
  }

  const [
    { data: expansions, error: expansionsError },
    factionsResult,
    { data: profile, error: profileError },
    mapsResult,
    coloniesResult,
    lastMatchResult,
  ] = await Promise.all([
    supabase
      .from("expansions")
      .select("id, slug, name_ko, name_en")
      .eq("game_id", game.id)
      .order("sort_order", { ascending: true, nullsFirst: false })
      .order("slug"),
    capability.hasFactions
      ? supabase
          .from("player_factions")
          .select(
            "id, expansion_id, group_slug, group_name_ko, group_name_en, slug, name_ko, name_en",
          )
          .eq("game_id", game.id)
          .order("group_slug")
      : Promise.resolve({ data: [], error: null }),
    supabase.from("profiles").select("display_name").maybeSingle(),
    capability.hasMapSelection
      ? supabase
          .from("terraforming_mars_maps")
          .select("id, expansion_id, slug, name_ko, name_en")
          .order("slug")
      : Promise.resolve({ data: [], error: null }),
    capability.colonyDraw
      ? supabase
          .from("terraforming_mars_colonies")
          .select("id, slug, name_ko, name_en")
          .order("slug")
      : Promise.resolve({ data: [], error: null }),
    // "기본값은 직전 매치와 동일한 구성을 유지" (docs/games/terraforming-mars.md) —
    // 이 게임으로 기록한 가장 최근 매치의 확장팩 구성을 기본값으로 사용한다.
    // 게임에 관계없이 동작하는 일반 메커니즘이라 특정 게임에 하드코딩하지 않는다.
    supabase
      .from("matches")
      .select("id")
      .eq("game_id", game.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (
    expansionsError ||
    factionsResult.error ||
    profileError ||
    mapsResult.error ||
    coloniesResult.error ||
    lastMatchResult.error
  ) {
    throw new Error("게임 확장팩 정보를 불러오지 못했습니다.");
  }

  let defaultExpansionIds: string[] = [];
  if (lastMatchResult.data) {
    const { data: lastExpansions, error: lastExpansionsError } = await supabase
      .from("match_expansions")
      .select("expansion_id")
      .eq("match_id", lastMatchResult.data.id);

    if (lastExpansionsError) {
      throw new Error("직전 매치 확장팩 정보를 불러오지 못했습니다.");
    }

    defaultExpansionIds = (lastExpansions ?? []).map((e) => e.expansion_id);
  }

  const myNames = profile?.display_name ? [profile.display_name] : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-50">
          {game.name_ko}
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          사용한 확장팩과 플레이어별 결과를 입력하세요.
        </p>
      </div>

      <MatchForm
        game={game}
        expansions={expansions ?? []}
        factions={factionsResult.data ?? []}
        maps={mapsResult.data ?? []}
        colonies={coloniesResult.data ?? []}
        capability={capability}
        myNames={myNames}
        defaultExpansionIds={defaultExpansionIds}
      />
    </div>
  );
}
