import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getGameCapability } from "@/lib/domain/capabilities";
import { Badge } from "@/components/badge";

export default async function NewMatchGamePage() {
  const supabase = await createClient();
  const { data: games, error } = await supabase
    .from("games")
    .select("id, slug, name_ko, name_en")
    .order("slug");

  if (error) {
    throw new Error("게임 목록을 불러오지 못했습니다.");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-50">새 매치 기록</h1>
        <p className="mt-1 text-sm text-zinc-400">
          먼저 플레이한 게임을 선택하세요.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(games ?? []).map((game) => {
          const capability = getGameCapability(game.slug);

          if (!capability) {
            return (
              <div
                key={game.id}
                className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 opacity-60"
              >
                <span className="text-lg font-medium text-zinc-300">
                  {game.name_ko}
                </span>
                <Badge>준비 중</Badge>
              </div>
            );
          }

          return (
            <Link
              key={game.id}
              href={`/dashboard/matches/new/${game.slug}`}
              className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 transition-colors hover:border-zinc-600 hover:bg-zinc-900"
            >
              <span className="text-lg font-medium text-zinc-50">
                {game.name_ko}
              </span>
              <span className="text-sm text-zinc-400">{game.name_en}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
