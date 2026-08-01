"use client";

import { useActionState, useRef } from "react";
import { addPlayerName } from "./actions";

export function AddNameForm() {
  const [state, action, pending] = useActionState(addPlayerName, undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <form
      action={async (formData) => {
        await action(formData);
        if (inputRef.current) inputRef.current.value = "";
      }}
      className="space-y-2"
    >
      <div className="flex gap-2">
        <input
          ref={inputRef}
          name="name"
          type="text"
          required
          placeholder="예: 김보드"
          className="w-full max-w-xs rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-400"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md border border-zinc-700 px-3 py-2 text-sm text-zinc-200 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "추가 중..." : "이름 추가"}
        </button>
      </div>
      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
    </form>
  );
}
