import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getGameCapability } from "@/lib/domain/capabilities";
import { Badge } from "@/components/badge";

const GAME_ART: Record<string, string> = {
  "dune-imperium": "/games/dune-imperium.jpg",
  seti: "/games/seti.jpg",
};

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
          const art = GAME_ART[game.slug];

          if (!capability) {
            return (
              <div
                key={game.id}
                className="relative flex aspect-[4/3] flex-col justify-end gap-1 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 opacity-60"
              >
                <span className="relative z-10 text-lg font-medium text-zinc-300">
                  {game.name_ko}
                </span>
                <span className="relative z-10">
                  <Badge>준비 중</Badge>
                </span>
              </div>
            );
          }

          return (
            <Link
              key={game.id}
              href={`/dashboard/matches/new/${game.slug}`}
              className="group relative flex aspect-[4/3] flex-col justify-end gap-1 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 transition-colors hover:border-zinc-600"
            >
              {art && (
                <Image
                  src={art}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover opacity-25 transition-opacity duration-300 ease-out group-hover:opacity-70"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/40 to-transparent" />
              <span className="relative z-10 text-lg font-medium text-zinc-50">
                {game.name_ko}
              </span>
              <span className="relative z-10 text-sm text-zinc-400">
                {game.name_en}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
