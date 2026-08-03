import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/(auth)/actions";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { LocaleToggle } from "@/components/locale-toggle";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // proxy.ts가 1차로 보호하지만, 레이아웃에서도 확인해 이중으로 방어한다.
  if (!user) {
    redirect("/login");
  }

  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
        <Link
          href="/dashboard"
          className="text-sm font-semibold tracking-tight text-zinc-50 transition-colors hover:text-zinc-300"
        >
          boarddays
        </Link>
        <div className="flex items-center gap-4">
          <LocaleToggle locale={locale} />
          <Link
            href="/dashboard/settings"
            className="text-sm text-zinc-400 transition-colors hover:text-zinc-100"
          >
            {dict.header.settings}
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm text-zinc-400 transition-colors hover:text-zinc-100"
            >
              {dict.header.logout}
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
