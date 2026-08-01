"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp } from "../actions";

export default function SignupPage() {
  const [state, action, pending] = useActionState(signUp, undefined);

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <form
        action={action}
        className="w-full max-w-sm space-y-5 rounded-xl border border-zinc-800 bg-zinc-900/60 p-8"
      >
        <div>
          <h1 className="text-xl font-semibold text-zinc-50">회원가입</h1>
          <p className="mt-1 text-sm text-zinc-400">
            boarddays 계정을 만드세요.
          </p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm text-zinc-300">
            이메일
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-400"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm text-zinc-300">
            비밀번호
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            minLength={6}
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-400"
          />
          <p className="text-xs text-zinc-500">6자 이상 입력해 주세요.</p>
        </div>

        {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
        {state?.message && (
          <p className="text-sm text-emerald-400">{state.message}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "가입 중..." : "회원가입"}
        </button>

        <p className="text-center text-sm text-zinc-400">
          이미 계정이 있으신가요?{" "}
          <Link
            href="/login"
            className="text-zinc-100 underline underline-offset-4"
          >
            로그인
          </Link>
        </p>
      </form>
    </div>
  );
}
