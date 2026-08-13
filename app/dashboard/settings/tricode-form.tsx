"use client";

import { useActionState } from "react";
import { updateTricode } from "./actions";
import type { Dictionary } from "@/lib/i18n/dictionary";

export function TricodeForm({
  dict,
  initialTricode,
}: {
  dict: Dictionary["settings"];
  initialTricode: string | null;
}) {
  const [state, action, pending] = useActionState(updateTricode, undefined);

  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <div className="space-y-1.5">
        <label htmlFor="tricode" className="text-sm text-stone-300">
          {dict.tricodeLabel}
        </label>
        <input
          id="tricode"
          name="tricode"
          type="text"
          required
          maxLength={3}
          pattern="[A-Za-z0-9]{3}"
          defaultValue={initialTricode ?? ""}
          placeholder={dict.tricodePlaceholder}
          className="w-24 rounded-md border border-stone-700 bg-stone-950 px-3 py-2 text-center text-sm uppercase tracking-widest text-stone-50 outline-none focus:border-amber-600"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-stone-700 px-3 py-2 text-sm text-stone-200 transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? dict.tricodeSaving : dict.tricodeSave}
      </button>

      <div className="w-full">
        {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
        {state?.success && (
          <p className="text-sm text-emerald-400">{dict.tricodeSaved}</p>
        )}
      </div>
    </form>
  );
}
