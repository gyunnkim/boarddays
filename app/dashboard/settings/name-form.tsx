"use client";

import { useActionState } from "react";
import { updateDisplayName } from "./actions";

export function DisplayNameForm({
  currentName,
}: {
  currentName: string | null;
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
          placeholder="예: 김보드"
          className="w-full max-w-xs rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-400"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md border border-zinc-700 px-3 py-2 text-sm text-zinc-200 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "저장 중..." : "저장"}
        </button>
      </div>
      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-emerald-400">이름을 저장했습니다.</p>
      )}
    </form>
  );
}
