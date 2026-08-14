"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";
import { parsePlayerHandle } from "@/lib/domain/match-history";
import type { Dictionary } from "@/lib/i18n/dictionary";

/**
 * 대시보드 최상단에 노출되는 "이름#트라이코드" 플레이어 검색창. 다른
 * 필터(게임/맵/기업)는 그대로 유지한 채 player 쿼리 파라미터만 갱신한다.
 */
export function PlayerSearchBar({ dict }: { dict: Dictionary["dashboard"] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  const currentPlayerRaw = searchParams.get("player") ?? "";
  const isInvalid =
    Boolean(currentPlayerRaw) && parsePlayerHandle(currentPlayerRaw) === null;

  function buildHref(playerValue: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (playerValue) {
      params.set("player", playerValue);
    } else {
      params.delete("player");
    }
    const query = params.toString();
    return query ? `/dashboard?${query}` : "/dashboard";
  }

  function submit() {
    const value = inputRef.current?.value.trim() ?? "";
    router.push(buildHref(value || null));
  }

  return (
    <div>
      <form
        className="flex items-center gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <div className="relative max-w-md flex-1">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-stone-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          <input
            ref={inputRef}
            type="text"
            defaultValue={currentPlayerRaw}
            placeholder={dict.playerFilterPlaceholder}
            aria-label={dict.playerFilterLabel}
            className="w-full rounded-md border border-stone-800 bg-stone-900 py-2 pl-9 pr-3 text-sm text-stone-200 placeholder:text-stone-600 focus:border-stone-600 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          aria-label={dict.playerFilterApply}
          className="rounded-md border border-stone-800 bg-stone-900 px-3 py-2 text-stone-300 transition-colors hover:border-stone-700 hover:text-stone-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        {currentPlayerRaw && (
          <button
            type="button"
            onClick={() => {
              if (inputRef.current) inputRef.current.value = "";
              router.push(buildHref(null));
            }}
            className="text-xs text-stone-500 hover:text-stone-300"
          >
            {dict.playerFilterClear}
          </button>
        )}
      </form>

      {isInvalid && (
        <p className="mt-1.5 text-xs text-red-400">
          {dict.playerFilterInvalidHint}
        </p>
      )}
    </div>
  );
}
