"use client";

import { useRouter } from "next/navigation";
import { pickLocalized } from "@/lib/i18n/config";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type {
  FactionCatalogEntry,
  MapCatalogEntry,
} from "@/lib/domain/match-history";

export function MatchHistoryFilters({
  gameSlug,
  availableMaps,
  availableFactions,
  selectedMapSlug,
  selectedCorpSlug,
  onlyMyFaction,
  factionFilterLabel,
  locale,
  dict,
}: {
  gameSlug?: string;
  availableMaps: MapCatalogEntry[];
  availableFactions: FactionCatalogEntry[];
  selectedMapSlug?: string;
  selectedCorpSlug?: string;
  onlyMyFaction: boolean;
  factionFilterLabel: string;
  locale: Locale;
  dict: Dictionary;
}) {
  const router = useRouter();

  if (availableMaps.length === 0 && availableFactions.length === 0) {
    return null;
  }

  function buildHref(overrides: {
    map?: string | null;
    corp?: string | null;
    corpMine?: string | null;
  }) {
    const params = new URLSearchParams();
    if (gameSlug) params.set("game", gameSlug);

    const nextMap =
      overrides.map !== undefined ? overrides.map : selectedMapSlug;
    if (nextMap) params.set("map", nextMap);

    const nextCorp =
      overrides.corp !== undefined ? overrides.corp : selectedCorpSlug;
    if (nextCorp) params.set("corp", nextCorp);

    // corp 필터가 없으면 "나" 상태도 의미가 없으므로 함께 초기화한다.
    const nextCorpMine =
      overrides.corpMine !== undefined
        ? overrides.corpMine
        : onlyMyFaction
          ? "1"
          : null;
    if (nextCorp && nextCorpMine === "1") params.set("corpMine", "1");

    const query = params.toString();
    return query ? `/dashboard?${query}` : "/dashboard";
  }

  const selectClass =
    "rounded-md border border-stone-800 bg-stone-900 px-2 py-1 text-xs text-stone-200 focus:border-stone-600 focus:outline-none";

  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
      {availableMaps.length > 0 && (
        <label className="flex items-center gap-1.5 text-xs text-stone-500">
          {dict.dashboard.mapFilterLabel}
          <select
            value={selectedMapSlug ?? ""}
            onChange={(event) =>
              router.push(buildHref({ map: event.target.value || null }))
            }
            className={selectClass}
          >
            <option value="">{dict.dashboard.filterAll}</option>
            {availableMaps.map((map) => (
              <option key={map.id} value={map.slug}>
                {pickLocalized(locale, map.nameKo, map.nameEn)}
              </option>
            ))}
          </select>
        </label>
      )}

      {availableFactions.length > 0 && (
        <>
          <label className="flex items-center gap-1.5 text-xs text-stone-500">
            {factionFilterLabel}
            <select
              value={selectedCorpSlug ?? ""}
              onChange={(event) =>
                router.push(
                  buildHref({
                    corp: event.target.value || null,
                    corpMine: event.target.value ? undefined : null,
                  }),
                )
              }
              className={selectClass}
            >
              <option value="">{dict.dashboard.filterAll}</option>
              {availableFactions.map((faction) => (
                <option key={faction.id} value={faction.slug}>
                  {pickLocalized(locale, faction.nameKo, faction.nameEn)}
                </option>
              ))}
            </select>
          </label>

          {selectedCorpSlug && (
            <label className="flex items-center gap-1.5 text-xs text-stone-400">
              <input
                type="checkbox"
                checked={onlyMyFaction}
                onChange={(event) =>
                  router.push(
                    buildHref({ corpMine: event.target.checked ? "1" : null }),
                  )
                }
                className="h-3.5 w-3.5 rounded border-stone-700 bg-stone-900 text-amber-500 focus:ring-amber-500/50"
              />
              {dict.dashboard.you}
            </label>
          )}
        </>
      )}
    </div>
  );
}
