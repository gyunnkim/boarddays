import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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
        <h1 className="text-2xl font-semibold text-stone-50">
          {dict.settings.title}
        </h1>
        <p className="mt-1 text-sm text-stone-400">
          {dict.settings.description}
        </p>
      </div>

      <div className="space-y-3 rounded-xl border border-stone-800 bg-stone-900/60 p-6">
        <h2 className="text-sm font-medium text-stone-200">
          {dict.settings.myNameTitle}
        </h2>

        {profile.display_name ? (
          <p className="w-full max-w-xs rounded-md border border-stone-800 bg-stone-950 px-3 py-2 text-sm text-stone-50">
            {profile.display_name}
          </p>
        ) : (
          <p className="text-sm text-stone-500">{dict.settings.noNameSet}</p>
        )}

        <p className="text-xs text-stone-500">{dict.settings.readonlyHint}</p>
      </div>
    </div>
  );
}
