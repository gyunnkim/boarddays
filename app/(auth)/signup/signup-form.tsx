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
        className="w-full max-w-sm space-y-5 rounded-xl border border-stone-800 bg-stone-900/60 p-8"
      >
        <div>
          <h1 className="text-xl font-semibold text-stone-50">
            {dict.heading}
          </h1>
          <p className="mt-1 text-sm text-stone-400">
            {dict.subheading}
          </p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm text-stone-300">
            {dict.email} *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-md border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-stone-50 outline-none focus:border-amber-600"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="display_name" className="text-sm text-stone-300">
            {dict.name} *
          </label>
          <input
            id="display_name"
            name="display_name"
            type="text"
            required
            autoComplete="nickname"
            placeholder={dict.namePlaceholder}
            className="w-full rounded-md border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-stone-50 outline-none focus:border-amber-600"
          />
          <p className="text-xs text-stone-500">{dict.nameHint}</p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm text-stone-300">
            {dict.password} *
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            minLength={6}
            className="w-full rounded-md border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-stone-50 outline-none focus:border-amber-600"
          />
          <p className="text-xs text-stone-500">{dict.passwordHint}</p>
        </div>

        {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
        {state?.message && (
          <p className="text-sm text-emerald-400">{state.message}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-amber-100 px-3 py-2 text-sm font-medium text-stone-950 transition-colors hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? dict.submitting : dict.submit}
        </button>

        <p className="text-center text-sm text-stone-400">
          {dict.hasAccount}{" "}
          <Link
            href="/login"
            className="text-stone-100 underline underline-offset-4"
          >
            {dict.loginLink}
          </Link>
        </p>
      </form>
    </div>
  );
}
