"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp } from "../actions";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/config";
import { LocaleToggle } from "@/components/locale-toggle";

export function SignupForm({
  dict,
  locale,
}: {
  dict: Dictionary["signup"];
  locale: Locale;
}) {
  const [state, action, pending] = useActionState(signUp, undefined);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-16">
      <div className="flex w-full max-w-sm justify-end">
        <LocaleToggle locale={locale} />
      </div>
      <form
        action={action}
        className="w-full max-w-sm space-y-5 rounded-xl border border-zinc-800 bg-zinc-900/60 p-8"
      >
        <div>
          <h1 className="text-xl font-semibold text-zinc-50">
            {dict.heading}
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            {dict.subheading}
          </p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm text-zinc-300">
            {dict.email}
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
            {dict.password}
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
          <p className="text-xs text-zinc-500">{dict.passwordHint}</p>
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
          {pending ? dict.submitting : dict.submit}
        </button>

        <p className="text-center text-sm text-zinc-400">
          {dict.hasAccount}{" "}
          <Link
            href="/login"
            className="text-zinc-100 underline underline-offset-4"
          >
            {dict.loginLink}
          </Link>
        </p>
      </form>
    </div>
  );
}
