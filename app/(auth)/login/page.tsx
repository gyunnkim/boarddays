"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn } from "../actions";
import { GuestLoginButton } from "../guest-button";

export default function LoginPage() {
  const [state, action, pending] = useActionState(signIn, undefined);

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm space-y-5">
        <form
          action={action}
          className="space-y-5 rounded-xl border border-zinc-800 bg-zinc-900/60 p-8"
        >
          <div>
            <h1 className="text-xl font-semibold text-zinc-50">로그인</h1>
            <p className="mt-1 text-sm text-zinc-400">
              boarddays에 로그인하세요.
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
              autoComplete="current-password"
              className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-400"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-red-400">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "로그인 중..." : "로그인"}
          </button>

          <p className="text-center text-sm text-zinc-400">
            계정이 없으신가요?{" "}
            <Link
              href="/signup"
              className="text-zinc-100 underline underline-offset-4"
            >
              회원가입
            </Link>
          </p>
        </form>

        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <div className="h-px flex-1 bg-zinc-800" />
          또는
          <div className="h-px flex-1 bg-zinc-800" />
        </div>

        <GuestLoginButton />
      </div>
    </div>
  );
}
