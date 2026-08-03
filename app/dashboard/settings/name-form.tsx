"use client";

import { useActionState } from "react";
import { updateDisplayName } from "./actions";
import type { Dictionary } from "@/lib/i18n/dictionary";

export function DisplayNameForm({
  currentName,
  dict,
}: {
  currentName: string | null;
  dict: Dictionary["settings"];
}) {
  const [state, action, pending] = useActionState(
    updateDisplayName,
    undefined,
  );

  return (
    <form action={action} className="space-y-2">
      <div className="flex gap-2">
        <input
          name="display_name"
          type="text"
          required
          defaultValue={currentName ?? ""}
          placeholder={dict.namePlaceholder}
          className="w-full max-w-xs rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-400"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md border border-zinc-700 px-3 py-2 text-sm text-zinc-200 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? dict.saving : dict.save}
        </button>
      </div>
      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-emerald-400">{dict.saved}</p>
      )}
    </form>
  );
}
