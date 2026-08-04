"use client";

import { useState } from "react";
import { Badge } from "@/components/badge";
import type { Locale } from "@/lib/i18n/config";
import { pickLocalized } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { formatTemplate } from "@/lib/i18n/format";
import type { MatchHistoryEntry } from "@/lib/domain/match-history";

const PAGE_SIZE = 20;

function formatDate(playedAt: string) {
  return playedAt.replaceAll("-", ".");
}

export function MatchHistoryList({
  entries,
  locale,
  dict,
}: {
  entries: MatchHistoryEntry[];
  locale: Locale;
  dict: Dictionary;
}) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const visibleEntries = entries.slice(0, visibleCount);
  const hasMore = visibleCount < entries.length;

  return (
    <>
      <ul className="mt-4 space-y-3">
        {visibleEntries.map((entry) => {
          const lastRank =
            entry.players[entry.players.length - 1]?.rank ?? entry.myRank;
          const cardTone =
            entry.myRank === 1
              ? "border-l-4 border-l-blue-500 border-y border-r border-stone-800 bg-blue-500/10"
              : entry.myRank === lastRank
                ? "border-l-4 border-l-red-500 border-y border-r border-stone-800 bg-red-500/10"
                : "border-l-4 border-l-yellow-500 border-y border-r border-stone-800 bg-yellow-500/10";

          return (
            <li key={entry.matchId} className={`rounded-xl p-4 sm:p-5 ${cardTone}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>
                    {pickLocalized(locale, entry.game.nameKo, entry.game.nameEn)}
                  </Badge>
                  {entry.expansions.map((expansion) => (
                    <Badge key={expansion.id}>
                      {pickLocalized(locale, expansion.nameKo, expansion.nameEn)}
                    </Badge>
                  ))}
                  {entry.map && (
                    <Badge tone="map">
                      {pickLocalized(locale, entry.map.nameKo, entry.map.nameEn)}
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-stone-500">
                  {formatDate(entry.playedAt)}
                </span>
              </div>
              <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
                {entry.players.map((player, index) => (
                  <li
                    key={`${entry.matchId}-${index}-${player.name}`}
                    className={
                      player.isMe
                        ? "flex items-center gap-1.5 font-medium text-stone-50"
                        : "flex items-center gap-1.5 text-stone-400"
                    }
                  >
                    <span
                      className={
                        player.isWin ? "text-emerald-400" : "text-stone-500"
                      }
                    >
                      {formatTemplate(dict.dashboard.rankTemplate, {
                        n: player.rank,
                      })}
                    </span>
                    <span>{player.name}</span>
                    {player.faction && (
                      <span className="text-xs text-stone-500">
                        (
                        {pickLocalized(
                          locale,
                          player.faction.nameKo,
                          player.faction.nameEn,
                        )}
                        )
                      </span>
                    )}
                    <span>
                      {formatTemplate(dict.dashboard.scoreTemplate, {
                        n: player.score,
                      })}
                    </span>
                    {player.isMe && <Badge>{dict.dashboard.you}</Badge>}
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>

      {hasMore && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            className="rounded-md border border-stone-800 px-4 py-2 text-sm font-medium text-stone-300 transition-colors hover:border-stone-700 hover:text-stone-50"
          >
            {dict.dashboard.loadMore}
          </button>
        </div>
      )}
    </>
  );
}
