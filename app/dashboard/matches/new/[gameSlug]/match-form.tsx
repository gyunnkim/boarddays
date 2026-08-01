"use client";

import { useActionState, useId, useState } from "react";
import { createMatch } from "../../actions";
import type { GameCapability } from "@/lib/domain/capabilities";

interface GameOption {
  id: string;
  slug: string;
  name_ko: string;
  name_en: string;
}

interface ExpansionOption {
  id: string;
  slug: string;
  name_ko: string;
  name_en: string;
}

interface FactionOption {
  id: string;
  expansion_id: string | null;
  group_slug: string | null;
  group_name_ko: string | null;
  group_name_en: string | null;
  slug: string;
  name_ko: string;
  name_en: string;
}

interface PlayerRow {
  id: string;
}

let rowCounter = 0;
function nextRowId() {
  rowCounter += 1;
  return `row-${rowCounter}`;
}

export function MatchForm({
  game,
  expansions,
  factions,
  capability,
}: {
  game: GameOption;
  expansions: ExpansionOption[];
  factions: FactionOption[];
  capability: GameCapability;
}) {
  const [state, action, pending] = useActionState(createMatch, undefined);
  const formId = useId();

  const [expansionIds, setExpansionIds] = useState<string[]>([]);
  const [players, setPlayers] = useState<PlayerRow[]>(() => [
    { id: nextRowId() },
    { id: nextRowId() },
  ]);
  const [meId, setMeId] = useState(players[0].id);
  const [factionByRow, setFactionByRow] = useState<Record<string, string>>(
    {},
  );

  const availableFactions = factions.filter(
    (f) => f.expansion_id === null || expansionIds.includes(f.expansion_id),
  );

  // 확장팩 선택이 바뀌어 더 이상 선택 불가능해진 값은 렌더링 시점에 걸러낸다
  // (effect에서 setState로 동기화하지 않고 파생값으로 계산).
  const effectiveFactionByRow: Record<string, string> = {};
  for (const [rowId, factionId] of Object.entries(factionByRow)) {
    if (availableFactions.some((f) => f.id === factionId)) {
      effectiveFactionByRow[rowId] = factionId;
    }
  }

  function toggleExpansion(id: string) {
    setExpansionIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function addPlayer() {
    setPlayers((prev) => [...prev, { id: nextRowId() }]);
  }

  function removePlayer(id: string) {
    setPlayers((prev) => {
      const next = prev.filter((p) => p.id !== id);
      if (next.length === 0) return prev;
      return next;
    });
    setFactionByRow((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setMeId((prev) => {
      if (prev !== id) return prev;
      const remaining = players.filter((p) => p.id !== id);
      return remaining[0]?.id ?? prev;
    });
  }

  function factionOptionsForRow(rowId: string) {
    const takenByOthers = new Set(
      Object.entries(effectiveFactionByRow)
        .filter(([otherId]) => otherId !== rowId)
        .map(([, factionId]) => factionId),
    );
    return availableFactions.filter((f) => !takenByOthers.has(f.id));
  }

  function renderFactionSelect(rowId: string) {
    const options = factionOptionsForRow(rowId);
    const groups = new Map<string, { label: string; options: FactionOption[] }>();
    const ungrouped: FactionOption[] = [];

    for (const option of options) {
      if (option.group_slug) {
        const key = option.group_slug;
        if (!groups.has(key)) {
          groups.set(key, {
            label: option.group_name_ko ?? key,
            options: [],
          });
        }
        groups.get(key)!.options.push(option);
      } else {
        ungrouped.push(option);
      }
    }

    return (
      <select
        name={`player_faction_${rowId}`}
        value={effectiveFactionByRow[rowId] ?? ""}
        onChange={(e) =>
          setFactionByRow((prev) => ({ ...prev, [rowId]: e.target.value }))
        }
        required
        className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-400"
      >
        <option value="">{capability.factionLabel ?? "선택"} 선택</option>
        {ungrouped.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name_ko}
          </option>
        ))}
        {[...groups.entries()].map(([key, group]) => (
          <optgroup key={key} label={group.label}>
            {group.options.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name_ko}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    );
  }

  return (
    <form
      action={action}
      className="space-y-8 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6"
    >
      <input type="hidden" name="game_id" value={game.id} />
      <input type="hidden" name="is_me" value={meId} />

      {expansions.length > 0 && (
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-zinc-200">
            사용한 확장팩
          </legend>
          <div className="flex flex-wrap gap-3">
            {expansions.map((expansion) => (
              <label
                key={expansion.id}
                className="flex items-center gap-2 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200"
              >
                <input
                  type="checkbox"
                  name="expansion_ids"
                  value={expansion.id}
                  checked={expansionIds.includes(expansion.id)}
                  onChange={() => toggleExpansion(expansion.id)}
                />
                {expansion.name_ko}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset className="space-y-4">
        <div className="flex items-center justify-between">
          <legend className="text-sm font-medium text-zinc-200">
            플레이어
          </legend>
          <button
            type="button"
            onClick={addPlayer}
            className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-200 transition-colors hover:bg-zinc-800"
          >
            + 플레이어 추가
          </button>
        </div>

        <div className="space-y-4">
          {players.map((row, index) => (
            <div
              key={row.id}
              className="grid grid-cols-1 gap-3 rounded-lg border border-zinc-800 p-4 sm:grid-cols-2 lg:grid-cols-5"
            >
              <input type="hidden" name="player_ids" value={row.id} />

              <div className="lg:col-span-2 space-y-1">
                <label
                  htmlFor={`${formId}-name-${row.id}`}
                  className="text-xs text-zinc-400"
                >
                  이름
                </label>
                <input
                  id={`${formId}-name-${row.id}`}
                  name={`player_name_${row.id}`}
                  type="text"
                  required
                  defaultValue={index === 0 ? "나" : undefined}
                  className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-400"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor={`${formId}-score-${row.id}`}
                  className="text-xs text-zinc-400"
                >
                  점수
                </label>
                <input
                  id={`${formId}-score-${row.id}`}
                  name={`player_score_${row.id}`}
                  type="number"
                  step="1"
                  required
                  className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-400"
                />
              </div>

              {capability.hasFactions && (
                <div className="lg:col-span-2 space-y-1">
                  <label className="text-xs text-zinc-400">
                    {capability.factionLabel ?? "진영"}
                  </label>
                  {renderFactionSelect(row.id)}
                </div>
              )}

              <div className="flex items-end gap-4">
                <label className="flex items-center gap-2 text-sm text-zinc-200">
                  <input type="radio" name="is_me_radio" checked={meId === row.id} onChange={() => setMeId(row.id)} />
                  나
                </label>
                {players.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePlayer(row.id)}
                    className="ml-auto text-xs text-zinc-500 hover:text-red-400"
                  >
                    삭제
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </fieldset>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "저장 중..." : "매치 저장"}
      </button>
    </form>
  );
}
