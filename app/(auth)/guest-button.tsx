"use client";

import { useActionState } from "react";
import { signInAsGuest } from "./actions";
import type { Dictionary } from "@/lib/i18n/dictionary";

/**
 * 회원가입/로그인 없이 익명 세션으로 바로 입장하는 버튼.
 */
export function GuestLoginButton({ dict }: { dict: Dictionary["guest"] }) {
  const [state, action, pending] = useActionState(
    signInAsGuest,
    undefined,
  );

  return (
    <form action={action} className="space-y-1.5">
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md border border-zinc-700 px-3 py-2 text-sm text-zinc-200 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? dict.submitting : dict.submit}
      </button>
      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
    </form>
  );
}
