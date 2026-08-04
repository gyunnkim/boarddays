import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getGameCapability } from "@/lib/domain/capabilities";
import { Badge } from "@/components/badge";
import { GuestGate } from "@/components/guest-gate";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { pickLocalized } from "@/lib/i18n/config";

const GAME_ART: Record<string, string> = {
  "dune-imperium": "/games/dune.jpeg",
  seti: "/games/seti.jpeg",
  "terraforming-mars": "/games/tfm.jpeg",
};

export default async function NewMatchGamePage() {
  const supabase = await createClient();
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isGuest = user?.is_anonymous === true;

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
        <h1 className="text-2xl font-semibold text-stone-50">
          {dict.newMatch.title}
        </h1>
        <p className="mt-1 text-sm text-stone-400">{dict.newMatch.subtitle}</p>
      </div>

      {isGuest ? (
        <GuestGate dict={dict} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(games ?? []).map((game) => {
            const capability = getGameCapability(game.slug);
            const art = GAME_ART[game.slug];

            if (!capability) {
              return (
                <div
                  key={game.id}
                  className="relative flex aspect-[4/3] flex-col justify-end gap-1 overflow-hidden rounded-xl border border-stone-800 bg-stone-900/30 p-6 opacity-60"
                >
                  <span className="relative z-10 text-lg font-medium text-stone-300">
                    {pickLocalized(locale, game.name_ko, game.name_en)}
                  </span>
                  <span className="relative z-10">
                    <Badge>{dict.dashboard.comingSoon}</Badge>
                  </span>
                </div>
              );
            }

            return (
              <Link
                key={game.id}
                href={`/dashboard/matches/new/${game.slug}`}
                className="group relative flex aspect-[4/3] flex-col justify-end gap-1 overflow-hidden rounded-xl border border-stone-800 bg-stone-900/60 p-6 transition-colors hover:border-stone-600"
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
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-transparent" />
                <span className="relative z-10 text-lg font-medium text-stone-50">
                  {game.name_ko}
                </span>
                <span className="relative z-10 text-sm text-stone-400">
                  {game.name_en}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
