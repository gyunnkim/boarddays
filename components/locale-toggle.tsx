"use client";

import { useTransition } from "react";
import { setLocale } from "@/lib/i18n/actions";
import type { Locale } from "@/lib/i18n/config";

export function LocaleToggle({ locale }: { locale: Locale }) {
  const [isPending, startTransition] = useTransition();

  function handleSelect(next: Locale) {
    if (next === locale || isPending) return;
    startTransition(() => {
      void setLocale(next);
    });
  }

  return (
    <div
      role="group"
      aria-label="언어 선택 / Language selection"
      className="inline-flex items-center overflow-hidden rounded-md border border-zinc-700 text-xs font-medium"
    >
      <button
        type="button"
        aria-pressed={locale === "ko"}
        onClick={() => handleSelect("ko")}
        disabled={isPending}
        className={`px-2.5 py-1.5 transition-colors disabled:cursor-not-allowed ${
          locale === "ko"
            ? "bg-zinc-50 text-zinc-950"
            : "text-zinc-400 hover:text-zinc-100"
        }`}
      >
        KR
      </button>
      <button
        type="button"
        aria-pressed={locale === "en"}
        onClick={() => handleSelect("en")}
        disabled={isPending}
        className={`px-2.5 py-1.5 transition-colors disabled:cursor-not-allowed ${
          locale === "en"
            ? "bg-zinc-50 text-zinc-950"
            : "text-zinc-400 hover:text-zinc-100"
        }`}
      >
        EN
      </button>
    </div>
  );
}
