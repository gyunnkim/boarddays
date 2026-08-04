"use client";

import { useEffect, useId, useRef, useState } from "react";
import { PlayerColorSwatch } from "@/components/player-color-swatch";
import type { PlayerColorOption } from "@/lib/domain/capabilities";

/**
 * 이름 입력란 앞의 정사각형 색상 스와치 버튼을 클릭하면 선택 가능한 색상을
 * 작은 스와치 그리드로 펼쳐 보여주는 드롭다운. 실제 제출값은 name={name}인
 * hidden input이 담당하므로, 서버 액션(app/dashboard/matches/actions.ts)이
 * formData.get(`player_color_${id}`)로 읽는 방식은 그대로 유지된다.
 */
export function PlayerColorPicker({
  name,
  value,
  options,
  onChange,
  triggerLabel,
  invalid,
}: {
  name: string;
  value: string | undefined;
  options: PlayerColorOption[];
  onChange: (value: string) => void;
  /** 색상이 선택되지 않았을 때 버튼/옵션 목록에 붙는 접근성 라벨(예: "색상 선택"). */
  triggerLabel: string;
  /** true면 제출 시도 후 값이 비어 있었음을 시각적으로 표시한다. */
  invalid?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstOptionRef = useRef<HTMLButtonElement>(null);
  const listboxId = useId();

  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;
    firstOptionRef.current?.focus();

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <input type="hidden" name={name} value={value ?? ""} />
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        title={selected ? selected.labelKo : triggerLabel}
        className={`inline-flex shrink-0 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 ${
          invalid ? "ring-2 ring-red-500" : ""
        }`}
      >
        <PlayerColorSwatch color={value} />
        <span className="sr-only">
          {selected ? selected.labelKo : triggerLabel}
        </span>
      </button>

      {open && (
        <div
          id={listboxId}
          role="listbox"
          aria-label={triggerLabel}
          className="absolute left-0 top-full z-20 mt-2 w-48 max-w-[calc(100vw-2rem)] rounded-md border border-zinc-700 bg-zinc-950 p-2 shadow-lg shadow-black/40"
        >
          <div className="grid grid-cols-4 gap-2">
            {options.map((option, index) => (
              <button
                key={option.value}
                ref={index === 0 ? firstOptionRef : undefined}
                type="button"
                role="option"
                aria-selected={option.value === value}
                title={option.labelKo}
                aria-label={option.labelKo}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
                className={`flex flex-col items-center gap-1 rounded-md p-1 text-[10px] leading-tight text-zinc-300 hover:bg-zinc-800 ${
                  option.value === value ? "bg-zinc-800 ring-1 ring-zinc-400" : ""
                }`}
              >
                <PlayerColorSwatch color={option.value} />
                <span className="w-full truncate text-center">
                  {option.labelKo}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
