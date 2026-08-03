"use client";

import { useActionState, useId, useMemo, useState } from "react";
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

interface MapOption {
  id: string;
  expansion_id: string | null;
  slug: string;
  name_ko: string;
  name_en: string;
}

interface ColonyOption {
  id: string;
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
  maps,
  colonies,
  capability,
  myNames,
  defaultExpansionIds,
}: {
  game: GameOption;
  expansions: ExpansionOption[];
  factions: FactionOption[];
  maps: MapOption[];
  colonies: ColonyOption[];
  capability: GameCapability;
  myNames: string[];
  defaultExpansionIds: string[];
}) {
  const [state, action, pending] = useActionState(createMatch, undefined);
  const formId = useId();
  const nameListId = `${formId}-my-names`;

  const [expansionIds, setExpansionIds] = useState<string[]>(
    () => defaultExpansionIds,
  );
  const [players, setPlayers] = useState<PlayerRow[]>(() => [
    { id: nextRowId() },
    { id: nextRowId() },
  ]);
  const [factionByRow, setFactionByRow] = useState<Record<string, string>>(
    {},
  );
  const [colorByRow, setColorByRow] = useState<Record<string, string>>({});
  const [mapId, setMapId] = useState<string | null>(null);
  const [drawnColonyIds, setDrawnColonyIds] = useState<string[]>([]);

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

  const selectedExpansionSlugs = useMemo(
    () =>
      new Set(
        expansions
          .filter((e) => expansionIds.includes(e.id))
          .map((e) => e.slug),
      ),
    [expansions, expansionIds],
  );

  const activeScoreComponents = (capability.scoreComponents ?? []).filter(
    (c) => !c.requiresExpansionSlug || selectedExpansionSlugs.has(c.requiresExpansionSlug),
  );

  const availableMaps = maps.filter(
    (m) => m.expansion_id === null || expansionIds.includes(m.expansion_id),
  );
  const effectiveMapId = availableMaps.some((m) => m.id === mapId)
    ? mapId
    : null;

  const colonyExpansion = capability.colonyDraw
    ? expansions.find((e) => e.slug === capability.colonyDraw!.expansionSlug)
    : undefined;
  const coloniesEnabled = Boolean(
    colonyExpansion && expansionIds.includes(colonyExpansion.id),
  );
  const effectiveDrawnColonyIds = coloniesEnabled ? drawnColonyIds : [];
  const colonyById = new Map(colonies.map((c) => [c.id, c]));

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
    setColorByRow((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function selectRandomMap() {
    if (availableMaps.length === 0) return;
    const random =
      availableMaps[Math.floor(Math.random() * availableMaps.length)];
    setMapId(random.id);
  }

  function drawColonies() {
    if (colonies.length === 0 || !capability.colonyDraw) return;
    const count = Math.min(
      colonies.length,
      players.length + capability.colonyDraw.countOffset,
    );
    const shuffled = [...colonies].sort(() => Math.random() - 0.5);
    setDrawnColonyIds(shuffled.slice(0, count).map((c) => c.id));
  }

  function factionOptionsForRow(rowId: string) {
    const takenByOthers = new Set(
      Object.entries(effectiveFactionByRow)
        .filter(([otherId]) => otherId !== rowId)
        .map(([, factionId]) => factionId),
    );
    return availableFactions.filter((f) => !takenByOthers.has(f.id));
  }

  function colorOptionsForRow(rowId: string) {
    if (!capability.playerColors) return [];
    const takenByOthers = new Set(
      Object.entries(colorByRow)
        .filter(([otherId]) => otherId !== rowId)
        .map(([, color]) => color),
    );
    return capability.playerColors.filter((c) => !takenByOthers.has(c.value));
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
      {myNames.length > 0 && (
        <datalist id={nameListId}>
          {myNames.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      )}

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

      {capability.hasMapSelection && (
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-zinc-200">맵</legend>
          <div className="flex flex-wrap items-center gap-3">
            <select
              name="terraforming_mars_map_id"
              value={effectiveMapId ?? ""}
              onChange={(e) => setMapId(e.target.value)}
              required
              className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-400"
            >
              <option value="">맵 선택</option>
              {availableMaps.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name_ko}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={selectRandomMap}
              className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-200 transition-colors hover:bg-zinc-800"
            >
              랜덤 선택
            </button>
          </div>
        </fieldset>
      )}

      {capability.colonyDraw && coloniesEnabled && (
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-zinc-200">
            개척기지
          </legend>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={drawColonies}
              disabled={colonies.length === 0}
              className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-200 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              개척기지 뽑기 ({players.length + capability.colonyDraw.countOffset}개)
            </button>
            {colonies.length === 0 && (
              <span className="text-xs text-zinc-500">
                등록된 개척기지 카탈로그가 아직 없습니다.
              </span>
            )}
          </div>
          {effectiveDrawnColonyIds.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {effectiveDrawnColonyIds.map((id) => (
                <span
                  key={id}
                  className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-200"
                >
                  {colonyById.get(id)?.name_ko ?? id}
                </span>
              ))}
            </div>
          )}
          {effectiveDrawnColonyIds.map((id) => (
            <input key={id} type="hidden" name="colony_ids" value={id} />
          ))}
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
              className="space-y-3 rounded-lg border border-zinc-800 p-4"
            >
              <input type="hidden" name="player_ids" value={row.id} />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
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
                    list={nameListId}
                    required
                    defaultValue={index === 0 ? myNames[0] : undefined}
                    placeholder="이름을 선택하거나 입력하세요"
                    className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-400"
                  />
                </div>

                {capability.playerColors && (
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-400">색상</label>
                    <select
                      name={`player_color_${row.id}`}
                      value={colorByRow[row.id] ?? ""}
                      onChange={(e) =>
                        setColorByRow((prev) => ({
                          ...prev,
                          [row.id]: e.target.value,
                        }))
                      }
                      required
                      className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-400"
                    >
                      <option value="">색상 선택</option>
                      {colorOptionsForRow(row.id).map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.labelKo}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {capability.hasFactions && (
                  <div className="lg:col-span-2 space-y-1">
                    <label className="text-xs text-zinc-400">
                      {capability.factionLabel ?? "진영"}
                    </label>
                    {renderFactionSelect(row.id)}
                  </div>
                )}

                {capability.hasMegacredits && (
                  <div className="space-y-1">
                    <label
                      htmlFor={`${formId}-mc-${row.id}`}
                      className="text-xs text-zinc-400"
                    >
                      {capability.megacreditsLabel ?? "메가크레딧"}
                    </label>
                    <input
                      id={`${formId}-mc-${row.id}`}
                      name={`player_mc_${row.id}`}
                      type="number"
                      step="1"
                      required
                      className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-400"
                    />
                  </div>
                )}

                {!capability.scoreComponents && (
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
                )}

                {players.length > 1 && (
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removePlayer(row.id)}
                      className="ml-auto text-xs text-zinc-500 hover:text-red-400"
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>

              {capability.scoreComponents && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {activeScoreComponents.map((component) => (
                    <div key={component.key} className="space-y-1">
                      <label
                        htmlFor={`${formId}-${component.key}-${row.id}`}
                        className="text-xs text-zinc-400"
                      >
                        {component.labelKo}
                      </label>
                      <input
                        id={`${formId}-${component.key}-${row.id}`}
                        name={`player_score_${component.key}_${row.id}`}
                        type="number"
                        step="1"
                        required
                        className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-400"
                      />
                    </div>
                  ))}
                </div>
              )}
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
