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
    { data: playerNames, error: playerNamesError },
  ] = await Promise.all([
    supabase
      .from("expansions")
      .select("id, slug, name_ko, name_en")
      .eq("game_id", game.id)
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
    supabase.from("player_names").select("name").order("created_at"),
  ]);

  if (expansionsError || factionsResult.error || playerNamesError) {
    throw new Error("게임 확장팩 정보를 불러오지 못했습니다.");
  }

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
        capability={capability}
        myNames={(playerNames ?? []).map((n) => n.name)}
      />
    </div>
  );
}
