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
    <form action={action} className="space-y-2">
      <div className="space-y-1.5">
        <label htmlFor="guest_display_name" className="text-sm text-stone-300">
          {dict.name} *
        </label>
        <input
          id="guest_display_name"
          name="display_name"
          type="text"
          required
          autoComplete="nickname"
          placeholder={dict.namePlaceholder}
          className="w-full rounded-md border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-stone-50 outline-none focus:border-amber-600"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md border border-stone-700 px-3 py-2 text-sm text-stone-200 transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? dict.submitting : dict.submit}
      </button>
      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
    </form>
  );
}
