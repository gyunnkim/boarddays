import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DisplayNameForm } from "./name-form";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export default async function SettingsPage() {
  const supabase = await createClient();
  const locale = await getLocale();
  const dict = getDictionary(locale);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  if (error) {
    throw new Error("이름 정보를 불러오지 못했습니다.");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-50">
          {dict.settings.title}
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          {dict.settings.description}
        </p>
      </div>

      <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
        <h2 className="text-sm font-medium text-zinc-200">
          {dict.settings.myNameTitle}
        </h2>

        {!profile.display_name && (
          <p className="text-sm text-zinc-500">{dict.settings.noNameSet}</p>
        )}

        <DisplayNameForm currentName={profile.display_name} dict={dict.settings} />
      </div>
    </div>
  );
}
