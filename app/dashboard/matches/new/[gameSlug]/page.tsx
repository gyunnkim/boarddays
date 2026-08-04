import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getGameCapability } from "@/lib/domain/capabilities";
import { MatchForm } from "./match-form";
import { GuestGate } from "@/components/guest-gate";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { pickLocalized } from "@/lib/i18n/config";

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
  const locale = await getLocale();
  const dict = getDictionary(locale);

  // 게스트(익명) 세션은 매치를 저장할 수 없으므로, 폼을 채웠다가 저장 시점에
  // 막히는 대신 입력을 시작하기 전에 회원가입 안내로 보낸다. URL을 직접
  // 입력해서 들어오는 경로도 있어 대시보드 버튼과 별개로 여기서도 확인한다.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.is_anonymous === true) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-stone-50">
            {dict.newMatch.title}
          </h1>
        </div>
        <GuestGate dict={dict} />
      </div>
    );
  }

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
          .order("name_en")
      : Promise.resolve({ data: [], error: null }),
    supabase.from("profiles").select("display_name").maybeSingle(),
    capability.hasMapSelection
      ? supabase
          .from("terraforming_mars_maps")
          .select("id, map_group_slug, slug, name_ko, name_en")
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
        <h1 className="text-2xl font-semibold text-stone-50">
          {pickLocalized(locale, game.name_ko, game.name_en)}
        </h1>
        <p className="mt-1 text-sm text-stone-400">{dict.newMatch.fillHint}</p>
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
        locale={locale}
        dict={dict.matchForm}
      />
    </div>
  );
}
