"use client";

import {
  useActionState,
  useEffect,
  useId,
  useMemo,
  useRef,
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

// 매치 하나를 기록하는 데 2~3시간이 걸릴 수 있어, 최초 세팅(확장팩/이름/
// 색깔/순서/맵 등)이 점수 입력 전에 새로고침이나 세션 만료로 날아가지
// 않도록 게임별로 localStorage에 임시 저장한다. 서버에 보내지 않는
// 브라우저 로컬 임시 저장일 뿐이라 민감 정보 취급은 하지 않는다.
const DRAFT_VERSION = 1;

function draftStorageKey(gameSlug: string) {
  return `boarddays:match-draft:v${DRAFT_VERSION}:${gameSlug}`;
}

interface DraftState {
  expansionIds: string[];
  players: PlayerRow[];
  factionByRow: Record<string, string>;
  colorByRow: Record<string, string>;
  mapId: string | null;
  enabledMapGroups: string[];
  promoFactionsOn: boolean;
  drawnColonyIds: string[];
  scoreValuesByRow: Record<string, Record<string, string>>;
  nameByRow: Record<string, string>;
  tricodeByRow: Record<string, string>;
  scoreByRow: Record<string, string>;
  mcByRow: Record<string, string>;
}

function createDefaultDraft(
  defaultExpansionIds: string[],
  myNames: string[],
  myTricode: string | null,
): DraftState {
  const initialPlayers: PlayerRow[] = [
    { id: nextRowId() },
    { id: nextRowId() },
    { id: nextRowId() },
  ];
  return {
    expansionIds: defaultExpansionIds,
    players: initialPlayers,
    factionByRow: {},
    colorByRow: {},
    mapId: null,
    enabledMapGroups: [],
    promoFactionsOn: false,
    drawnColonyIds: [],
    scoreValuesByRow: {},
    nameByRow: { [initialPlayers[0].id]: myNames[0] ?? "" },
    tricodeByRow: { [initialPlayers[0].id]: myTricode ?? "" },
    scoreByRow: {},
    mcByRow: {},
  };
}

function readDraft(gameSlug: string): DraftState | null {
  try {
    const raw = window.localStorage.getItem(draftStorageKey(gameSlug));
    if (!raw) return null;
    return JSON.parse(raw) as DraftState;
  } catch {
    return null;
  }
}

function writeDraft(gameSlug: string, draft: DraftState) {
  try {
    window.localStorage.setItem(draftStorageKey(gameSlug), JSON.stringify(draft));
  } catch {
    // 저장 실패(프라이빗 모드, 용량 초과 등)는 임시 저장 기능을 잃을 뿐
    // 매치 입력 자체를 막을 이유는 아니라 조용히 무시한다.
  }
}

function clearDraft(gameSlug: string) {
  try {
    window.localStorage.removeItem(draftStorageKey(gameSlug));
  } catch {
    // no-op
  }
}

export function MatchForm({
  game,
  expansions,
  factions,
  maps,
  colonies,
  capability,
  myNames,
  myTricode,
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
  myTricode: string | null;
  defaultExpansionIds: string[];
  locale: Locale;
  dict: Dictionary["matchForm"];
}) {
  const [state, action, pending] = useActionState(createMatch, undefined);
  const formId = useId();
  const nameListId = `${formId}-my-names`;

  const [draft, setDraft] = useState<DraftState>(() =>
    createDefaultDraft(defaultExpansionIds, myNames, myTricode),
  );
  const {
    expansionIds,
    players,
    factionByRow,
    colorByRow,
    mapId,
    enabledMapGroups,
    promoFactionsOn,
    drawnColonyIds,
    scoreValuesByRow,
    nameByRow,
    tricodeByRow,
    scoreByRow,
    mcByRow,
  } = draft;

  const [colorErrorRowIds, setColorErrorRowIds] = useState<Set<string>>(
    () => new Set(),
  );

  // 복원 완료 전에 초기 상태를 그대로 저장해 버리면 복원해야 할 임시
  // 저장 내용을 덮어써 버리므로, 복원 effect가 끝날 때까지 저장을 미룬다.
  const draftRestored = useRef(false);

  useEffect(() => {
    const stored = readDraft(game.slug);
    if (stored) {
      // 마운트 시 localStorage에 남아 있던 임시 저장을 한 번 복원한다.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraft(stored);

      const maxRestoredId = stored.players.reduce((max, row) => {
        const num = Number(row.id.replace("row-", ""));
        return Number.isFinite(num) ? Math.max(max, num) : max;
      }, 0);
      rowCounter = Math.max(rowCounter, maxRestoredId);
    }
    draftRestored.current = true;
  }, [game.slug]);

  useEffect(() => {
    if (!draftRestored.current) return;
    writeDraft(game.slug, draft);
  }, [game.slug, draft]);

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
    (m) => m.map_group_slug === null || enabledMapGroups.includes(m.map_group_slug),
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
    setDraft((prev) => ({
      ...prev,
      expansionIds: prev.expansionIds.includes(id)
        ? prev.expansionIds.filter((x) => x !== id)
        : [...prev.expansionIds, id],
    }));
  }

  function toggleMapGroup(slug: string) {
    setDraft((prev) => ({
      ...prev,
      enabledMapGroups: prev.enabledMapGroups.includes(slug)
        ? prev.enabledMapGroups.filter((x) => x !== slug)
        : [...prev.enabledMapGroups, slug],
    }));
  }

  function addPlayer() {
    setDraft((prev) => ({
      ...prev,
      players: [...prev.players, { id: nextRowId() }],
    }));
  }

  function removePlayer(id: string) {
    setDraft((prev) => {
      const nextPlayers = prev.players.filter((p) => p.id !== id);
      if (nextPlayers.length === 0) return prev;

      const dropId = <T,>(record: Record<string, T>) => {
        if (!(id in record)) return record;
        const next = { ...record };
        delete next[id];
        return next;
      };

      return {
        ...prev,
        players: nextPlayers,
        factionByRow: dropId(prev.factionByRow),
        colorByRow: dropId(prev.colorByRow),
        scoreValuesByRow: dropId(prev.scoreValuesByRow),
        nameByRow: dropId(prev.nameByRow),
        tricodeByRow: dropId(prev.tricodeByRow),
        scoreByRow: dropId(prev.scoreByRow),
        mcByRow: dropId(prev.mcByRow),
      };
    });
    setColorErrorRowIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  function randomizeOrder() {
    setDraft((prev) => {
      const shuffled = [...prev.players];
      for (let i = shuffled.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return { ...prev, players: shuffled };
    });
  }

  function updateScoreValue(rowId: string, key: string, value: string) {
    setDraft((prev) => ({
      ...prev,
      scoreValuesByRow: {
        ...prev.scoreValuesByRow,
        [rowId]: { ...prev.scoreValuesByRow[rowId], [key]: value },
      },
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
    setDraft((prev) => ({ ...prev, mapId: random.id }));
  }

  function drawColonies() {
    if (colonies.length === 0 || !capability.colonyDraw) return;
    const count = Math.min(
      colonies.length,
      players.length + capability.colonyDraw.countOffset,
    );
    const shuffled = [...colonies].sort(() => Math.random() - 0.5);
    setDraft((prev) => ({
      ...prev,
      drawnColonyIds: shuffled.slice(0, count).map((c) => c.id),
    }));
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
    setDraft((prev) => ({
      ...prev,
      colorByRow: { ...prev.colorByRow, [rowId]: value },
    }));
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
    if (capability.playerColors) {
      const missing = players.filter((row) => !colorByRow[row.id]);
      if (missing.length > 0) {
        event.preventDefault();
        setColorErrorRowIds(new Set(missing.map((row) => row.id)));
        return;
      }
    }
    // 이 시점부터는 폼이 실제로 제출되어 성공 시 대시보드로 리다이렉트되므로
    // (리다이렉트 후에는 이 컴포넌트가 언마운트돼 별도로 지울 기회가 없다)
    // 임시 저장을 미리 비운다.
    clearDraft(game.slug);
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
          setDraft((prev) => ({
            ...prev,
            factionByRow: { ...prev.factionByRow, [rowId]: e.target.value },
          }))
        }
        required
        className="w-full rounded-md border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-stone-50 outline-none focus:border-amber-600"
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
      className="space-y-8 rounded-xl border border-stone-800 bg-stone-900/60 p-6"
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
          <legend className="text-sm font-medium text-stone-200">
            {dict.expansionsUsed}
          </legend>
          <div className="flex flex-wrap gap-3">
            {expansions.map((expansion) => (
              <label
                key={expansion.id}
                className="flex items-center gap-2 rounded-md border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-stone-200"
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
          <label className="flex items-center gap-2 rounded-md border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-stone-200">
            <input
              type="checkbox"
              checked={promoFactionsOn}
              onChange={() =>
                setDraft((prev) => ({
                  ...prev,
                  promoFactionsOn: !prev.promoFactionsOn,
                }))
              }
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
          <legend className="text-sm font-medium text-stone-200">
            {dict.map}
          </legend>
          {capability.mapGroups && capability.mapGroups.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {capability.mapGroups.map((group) => (
                <label
                  key={group.slug}
                  className="flex items-center gap-2 rounded-md border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-stone-200"
                >
                  <input
                    type="checkbox"
                    checked={enabledMapGroups.includes(group.slug)}
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
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, mapId: e.target.value }))
              }
              required
              className="rounded-md border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-stone-50 outline-none focus:border-amber-600"
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
              className="rounded-md border border-stone-700 px-3 py-1.5 text-xs text-stone-200 transition-colors hover:bg-stone-800"
            >
              {dict.randomSelect}
            </button>
          </div>
        </fieldset>
      )}

      {capability.colonyDraw && coloniesEnabled && (
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-stone-200">
            {dict.colonies}
          </legend>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={drawColonies}
              disabled={colonies.length === 0}
              className="rounded-md border border-stone-700 px-3 py-1.5 text-xs text-stone-200 transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {formatTemplate(dict.drawColoniesTemplate, {
                count: players.length + capability.colonyDraw.countOffset,
              })}
            </button>
            {colonies.length === 0 && (
              <span className="text-xs text-stone-500">
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
                    className="rounded-md border border-stone-700 bg-stone-950 px-3 py-1.5 text-xs text-stone-200"
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
          <legend className="text-sm font-medium text-stone-200">
            {dict.players}
          </legend>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={randomizeOrder}
              disabled={players.length < 2}
              className="rounded-md border border-stone-700 px-3 py-1.5 text-xs text-stone-200 transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {dict.randomizeOrder}
            </button>
            <button
              type="button"
              onClick={addPlayer}
              className="rounded-md border border-stone-700 px-3 py-1.5 text-xs text-stone-200 transition-colors hover:bg-stone-800"
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
                className="space-y-3 rounded-lg border border-stone-800 p-4"
              >
                <input type="hidden" name="player_ids" value={row.id} />

                <div className="flex flex-wrap items-center gap-3">
                  <span className="w-4 shrink-0 text-center text-xs font-medium text-stone-500">
                    {index + 1}
                  </span>

                  {capability.playerColors && (
                    <div className="shrink-0 space-y-1">
                      <span className="block text-xs text-stone-400">
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
                      className="text-xs text-stone-400"
                    >
                      {dict.name}
                    </label>
                    <input
                      id={`${formId}-name-${row.id}`}
                      name={`player_name_${row.id}`}
                      type="text"
                      list={nameListId}
                      required
                      value={nameByRow[row.id] ?? ""}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          nameByRow: {
                            ...prev.nameByRow,
                            [row.id]: e.target.value,
                          },
                        }))
                      }
                      placeholder={dict.namePlaceholder}
                      className="w-full rounded-md border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-stone-50 outline-none focus:border-amber-600"
                    />
                  </div>

                  <div className="w-24 shrink-0 space-y-1">
                    <label
                      htmlFor={`${formId}-tricode-${row.id}`}
                      className="text-xs text-stone-400"
                    >
                      {dict.tricode}
                    </label>
                    <input
                      id={`${formId}-tricode-${row.id}`}
                      name={`player_tricode_${row.id}`}
                      type="text"
                      maxLength={3}
                      pattern="[A-Za-z0-9]{3}"
                      value={tricodeByRow[row.id] ?? ""}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          tricodeByRow: {
                            ...prev.tricodeByRow,
                            [row.id]: e.target.value,
                          },
                        }))
                      }
                      placeholder={dict.tricodePlaceholder}
                      className="w-full rounded-md border border-stone-700 bg-stone-950 px-3 py-2 text-center text-sm uppercase tracking-widest text-stone-50 outline-none focus:border-amber-600"
                    />
                  </div>

                  {factionsEnabled && (
                    <div className="min-w-[10rem] flex-1 space-y-1">
                      <label className="text-xs text-stone-400">
                        {capability.factionLabel ?? "진영"}
                      </label>
                      {renderFactionSelect(row.id)}
                    </div>
                  )}

                  {!capability.scoreComponents && (
                    <div className="w-28 space-y-1">
                      <label
                        htmlFor={`${formId}-score-${row.id}`}
                        className="text-xs text-stone-400"
                      >
                        {dict.score}
                      </label>
                      <input
                        id={`${formId}-score-${row.id}`}
                        name={`player_score_${row.id}`}
                        type="number"
                        step="1"
                        required
                        value={scoreByRow[row.id] ?? ""}
                        onChange={(e) =>
                          setDraft((prev) => ({
                            ...prev,
                            scoreByRow: {
                              ...prev.scoreByRow,
                              [row.id]: e.target.value,
                            },
                          }))
                        }
                        className="w-full rounded-md border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-stone-50 outline-none focus:border-amber-600"
                      />
                    </div>
                  )}

                  {capability.hasMegacredits && !mcInScoreSection && (
                    <div className="w-28 space-y-1">
                      <label
                        htmlFor={`${formId}-mc-${row.id}`}
                        className="text-xs text-stone-400"
                      >
                        {capability.megacreditsLabel ?? "메가크레딧"}
                      </label>
                      <input
                        id={`${formId}-mc-${row.id}`}
                        name={`player_mc_${row.id}`}
                        type="number"
                        step="1"
                        required
                        value={mcByRow[row.id] ?? ""}
                        onChange={(e) =>
                          setDraft((prev) => ({
                            ...prev,
                            mcByRow: {
                              ...prev.mcByRow,
                              [row.id]: e.target.value,
                            },
                          }))
                        }
                        className="w-full rounded-md border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-stone-50 outline-none focus:border-amber-600"
                      />
                    </div>
                  )}

                  {players.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePlayer(row.id)}
                      className="ml-auto text-xs text-stone-500 hover:text-red-400"
                    >
                      {dict.remove}
                    </button>
                  )}
                </div>

                {capability.scoreComponents && (
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="grid min-w-full grid-cols-2 gap-3 sm:min-w-0 sm:flex-1 sm:grid-cols-4">
                      {activeScoreComponents.map((component) => (
                        <div key={component.key} className="space-y-1">
                          <label
                            htmlFor={`${formId}-${component.key}-${row.id}`}
                            className="text-xs text-stone-400"
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
                            className="w-full rounded-md border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-stone-50 outline-none focus:border-amber-600"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex shrink-0 gap-3">
                      <div className="w-24 space-y-1">
                        <span className="block text-xs text-stone-400">
                          {dict.total}
                        </span>
                        <div className="flex h-[38px] items-center justify-center rounded-md border border-stone-700 bg-stone-800/60 px-3 text-sm font-semibold text-stone-50">
                          {rowScoreTotal(row.id)}
                        </div>
                      </div>

                      {mcInScoreSection && (
                        <div className="w-28 space-y-1">
                          <label
                            htmlFor={`${formId}-mc-${row.id}`}
                            className="text-xs text-stone-400"
                          >
                            {capability.megacreditsLabel ?? "메가크레딧"}
                          </label>
                          <input
                            id={`${formId}-mc-${row.id}`}
                            name={`player_mc_${row.id}`}
                            type="number"
                            step="1"
                            required
                            value={mcByRow[row.id] ?? ""}
                            onChange={(e) =>
                              setDraft((prev) => ({
                                ...prev,
                                mcByRow: {
                                  ...prev.mcByRow,
                                  [row.id]: e.target.value,
                                },
                              }))
                            }
                            className="w-full rounded-md border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-stone-50 outline-none focus:border-amber-600"
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
        className="w-full rounded-md bg-amber-100 px-3 py-2 text-sm font-medium text-stone-950 transition-colors hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? dict.saving : dict.save}
      </button>
    </form>
  );
}
