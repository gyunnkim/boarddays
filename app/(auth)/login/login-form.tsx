"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn } from "../actions";
import { GuestLoginButton } from "../guest-button";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/config";
import { LocaleToggle } from "@/components/locale-toggle";

export function LoginForm({
  dict,
  guestDict,
  locale,
}: {
  dict: Dictionary["login"];
  guestDict: Dictionary["guest"];
  locale: Locale;
}) {
  const [state, action, pending] = useActionState(signIn, undefined);

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm space-y-5">
        <div className="flex justify-end">
          <LocaleToggle locale={locale} />
        </div>
        <form
          action={action}
          className="space-y-5 rounded-xl border border-stone-800 bg-stone-900/60 p-8"
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
              {dict.email}
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
            <label htmlFor="password" className="text-sm text-stone-300">
              {dict.password}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-md border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-stone-50 outline-none focus:border-amber-600"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-red-400">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-amber-100 px-3 py-2 text-sm font-medium text-stone-950 transition-colors hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? dict.submitting : dict.submit}
          </button>

          <p className="text-center text-sm text-stone-400">
            {dict.noAccount}{" "}
            <Link
              href="/signup"
              className="text-stone-100 underline underline-offset-4"
            >
              {dict.signupLink}
            </Link>
          </p>
        </form>

        <div className="flex items-center gap-3 text-xs text-stone-500">
          <div className="h-px flex-1 bg-stone-800" />
          {dict.or}
          <div className="h-px flex-1 bg-stone-800" />
        </div>

        <GuestLoginButton dict={guestDict} />
      </div>
    </div>
  );
}
