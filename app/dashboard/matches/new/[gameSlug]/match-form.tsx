"use client";

import {
  useActionState,
  useId,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { createMatch } from "../../actions";
import type { GameCapability } from "@/lib/domain/capabilities";
import type { Locale } from "@/lib/i18n/config";
import { pickLocalized } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { formatTemplate } from "@/lib/i18n/format";
import { PlayerColorPicker } from "@/components/player-color-picker";

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
  map_group_slug: string | null;
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
  locale,
  dict,
}: {
  game: GameOption;
  expansions: ExpansionOption[];
  factions: FactionOption[];
  maps: MapOption[];
  colonies: ColonyOption[];
  capability: GameCapability;
  myNames: string[];
  defaultExpansionIds: string[];
  locale: Locale;
  dict: Dictionary["matchForm"];
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
    { id: nextRowId() },
  ]);
  const [factionByRow, setFactionByRow] = useState<Record<string, string>>(
    {},
  );
  const [colorByRow, setColorByRow] = useState<Record<string, string>>({});
  const [colorErrorRowIds, setColorErrorRowIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [mapId, setMapId] = useState<string | null>(null);
  const [enabledMapGroups, setEnabledMapGroups] = useState<Set<string>>(
    () => new Set(),
  );
  const [promoFactionsOn, setPromoFactionsOn] = useState(false);
  const [drawnColonyIds, setDrawnColonyIds] = useState<string[]>([]);
  const [scoreValuesByRow, setScoreValuesByRow] = useState<
    Record<string, Record<string, string>>
  >({});

  const availableFactions = factions.filter((f) => {
    if (capability.promoFactions && f.group_slug === capability.promoFactions.groupSlug) {
      return promoFactionsOn;
    }
    return f.expansion_id === null || expansionIds.includes(f.expansion_id);
  });

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

  const factionsEnabled =
    capability.hasFactions &&
    (!capability.factionsRequireExpansionSlug ||
      selectedExpansionSlugs.has(capability.factionsRequireExpansionSlug));

  const activeScoreComponents = (capability.scoreComponents ?? []).filter(
    (c) => !c.requiresExpansionSlug || selectedExpansionSlugs.has(c.requiresExpansionSlug),
  );

  const availableMaps = maps.filter(
    (m) => m.map_group_slug === null || enabledMapGroups.has(m.map_group_slug),
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

  function toggleMapGroup(slug: string) {
    setEnabledMapGroups((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
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
    setColorErrorRowIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setScoreValuesByRow((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function randomizeOrder() {
    setPlayers((prev) => {
      const shuffled = [...prev];
      for (let i = shuffled.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    });
  }

  function updateScoreValue(rowId: string, key: string, value: string) {
    setScoreValuesByRow((prev) => ({
      ...prev,
      [rowId]: { ...prev[rowId], [key]: value },
    }));
  }

  function rowScoreTotal(rowId: string): number {
    return activeScoreComponents.reduce((sum, component) => {
      const raw = scoreValuesByRow[rowId]?.[component.key];
      const value = Number(raw);
      return sum + (Number.isFinite(value) ? value : 0);
    }, 0);
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

  function setPlayerColor(rowId: string, value: string) {
    setColorByRow((prev) => ({ ...prev, [rowId]: value }));
    setColorErrorRowIds((prev) => {
      if (!prev.has(rowId)) return prev;
      const next = new Set(prev);
      next.delete(rowId);
      return next;
    });
  }

  // 색상 값은 hidden input(type="hidden")으로 제출되는데, hidden 타입은 HTML
  // 명세상 constraint validation 대상에서 제외돼 required가 동작하지 않는다.
  // 그래서 색상 누락 여부만 제출 시점에 별도로 검사해 폼 제출을 막는다.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!capability.playerColors) return;
    const missing = players.filter((row) => !colorByRow[row.id]);
    if (missing.length === 0) return;
    event.preventDefault();
    setColorErrorRowIds(new Set(missing.map((row) => row.id)));
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
            label: pickLocalized(
              locale,
              option.group_name_ko ?? key,
              option.group_name_en ?? option.group_name_ko ?? key,
            ),
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
            {pickLocalized(locale, f.name_ko, f.name_en)}
          </option>
        ))}
        {[...groups.entries()].map(([key, group]) => (
          <optgroup key={key} label={group.label}>
            {group.options.map((f) => (
              <option key={f.id} value={f.id}>
                {pickLocalized(locale, f.name_ko, f.name_en)}
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
      onSubmit={handleSubmit}
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
            {dict.expansionsUsed}
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
                {pickLocalized(locale, expansion.name_ko, expansion.name_en)}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {capability.promoFactions && (
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200">
            <input
              type="checkbox"
              checked={promoFactionsOn}
              onChange={() => setPromoFactionsOn((prev) => !prev)}
            />
            {capability.promoFactions.labelKo}
          </label>
          <input
            type="hidden"
            name="include_promo_factions"
            value={promoFactionsOn ? "true" : "false"}
          />
        </div>
      )}

      {capability.hasMapSelection && (
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-zinc-200">
            {dict.map}
          </legend>
          {capability.mapGroups && capability.mapGroups.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {capability.mapGroups.map((group) => (
                <label
                  key={group.slug}
                  className="flex items-center gap-2 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200"
                >
                  <input
                    type="checkbox"
                    checked={enabledMapGroups.has(group.slug)}
                    onChange={() => toggleMapGroup(group.slug)}
                  />
                  {group.labelKo}
                </label>
              ))}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <select
              name="terraforming_mars_map_id"
              value={effectiveMapId ?? ""}
              onChange={(e) => setMapId(e.target.value)}
              required
              className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-400"
            >
              <option value="">{dict.selectMap}</option>
              {availableMaps.map((m) => (
                <option key={m.id} value={m.id}>
                  {pickLocalized(locale, m.name_ko, m.name_en)}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={selectRandomMap}
              className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-200 transition-colors hover:bg-zinc-800"
            >
              {dict.randomSelect}
            </button>
          </div>
        </fieldset>
      )}

      {capability.colonyDraw && coloniesEnabled && (
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-zinc-200">
            {dict.colonies}
          </legend>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={drawColonies}
              disabled={colonies.length === 0}
              className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-200 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {formatTemplate(dict.drawColoniesTemplate, {
                count: players.length + capability.colonyDraw.countOffset,
              })}
            </button>
            {colonies.length === 0 && (
              <span className="text-xs text-zinc-500">
                {dict.noColoniesCatalog}
              </span>
            )}
          </div>
          {effectiveDrawnColonyIds.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {effectiveDrawnColonyIds.map((id) => {
                const colony = colonyById.get(id);
                return (
                  <span
                    key={id}
                    className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-200"
                  >
                    {colony
                      ? pickLocalized(locale, colony.name_ko, colony.name_en)
                      : id}
                  </span>
                );
              })}
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
            {dict.players}
          </legend>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={randomizeOrder}
              disabled={players.length < 2}
              className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-200 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {dict.randomizeOrder}
            </button>
            <button
              type="button"
              onClick={addPlayer}
              className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-200 transition-colors hover:bg-zinc-800"
            >
              {dict.addPlayer}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {players.map((row, index) => {
            const mcInScoreSection =
              capability.hasMegacredits && capability.scoreComponents;

            return (
              <div
                key={row.id}
                className="space-y-3 rounded-lg border border-zinc-800 p-4"
              >
                <input type="hidden" name="player_ids" value={row.id} />

                <div className="flex flex-wrap items-center gap-3">
                  <span className="w-4 shrink-0 text-center text-xs font-medium text-zinc-500">
                    {index + 1}
                  </span>

                  {capability.playerColors && (
                    <div className="shrink-0 space-y-1">
                      <span className="block text-xs text-zinc-400">
                        {dict.color}
                      </span>
                      <PlayerColorPicker
                        name={`player_color_${row.id}`}
                        value={colorByRow[row.id]}
                        options={colorOptionsForRow(row.id)}
                        onChange={(value) => setPlayerColor(row.id, value)}
                        triggerLabel={dict.selectColor}
                        invalid={colorErrorRowIds.has(row.id)}
                      />
                    </div>
                  )}

                  <div className="min-w-[9rem] flex-1 space-y-1">
                    <label
                      htmlFor={`${formId}-name-${row.id}`}
                      className="text-xs text-zinc-400"
                    >
                      {dict.name}
                    </label>
                    <input
                      id={`${formId}-name-${row.id}`}
                      name={`player_name_${row.id}`}
                      type="text"
                      list={nameListId}
                      required
                      defaultValue={index === 0 ? myNames[0] : undefined}
                      placeholder={dict.namePlaceholder}
                      className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-400"
                    />
                  </div>

                  {factionsEnabled && (
                    <div className="min-w-[10rem] flex-1 space-y-1">
                      <label className="text-xs text-zinc-400">
                        {capability.factionLabel ?? "진영"}
                      </label>
                      {renderFactionSelect(row.id)}
                    </div>
                  )}

                  {!capability.scoreComponents && (
                    <div className="w-28 space-y-1">
                      <label
                        htmlFor={`${formId}-score-${row.id}`}
                        className="text-xs text-zinc-400"
                      >
                        {dict.score}
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

                  {capability.hasMegacredits && !mcInScoreSection && (
                    <div className="w-28 space-y-1">
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

                  {players.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePlayer(row.id)}
                      className="ml-auto text-xs text-zinc-500 hover:text-red-400"
                    >
                      {dict.remove}
                    </button>
                  )}
                </div>

                {capability.scoreComponents && (
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
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
                            value={scoreValuesByRow[row.id]?.[component.key] ?? ""}
                            onChange={(e) =>
                              updateScoreValue(
                                row.id,
                                component.key,
                                e.target.value,
                              )
                            }
                            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-400"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <div className="w-24 space-y-1">
                        <span className="block text-xs text-zinc-400">
                          {dict.total}
                        </span>
                        <div className="flex h-[38px] items-center justify-center rounded-md border border-zinc-700 bg-zinc-800/60 px-3 text-sm font-semibold text-zinc-50">
                          {rowScoreTotal(row.id)}
                        </div>
                      </div>

                      {mcInScoreSection && (
                        <div className="w-28 space-y-1">
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
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </fieldset>

      {colorErrorRowIds.size > 0 && (
        <p className="text-sm text-red-400">{dict.colorRequired}</p>
      )}

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? dict.saving : dict.save}
      </button>
    </form>
  );
}
