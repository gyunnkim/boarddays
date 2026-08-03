import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DisplayNameForm } from "./name-form";

export default async function SettingsPage() {
  const supabase = await createClient();

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
        <h1 className="text-2xl font-semibold text-zinc-50">설정</h1>
        <p className="mt-1 text-sm text-zinc-400">
          매치 입력 화면에서 &ldquo;나&rdquo;를 식별하는 데 쓰이는 이름을
          설정하세요. 이 이름은 한 명당 하나만 가질 수 있고, boarddays
          서비스 전체에서 유일해야 합니다.
        </p>
      </div>

      <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
        <h2 className="text-sm font-medium text-zinc-200">내 이름</h2>

        {!profile.display_name && (
          <p className="text-sm text-zinc-500">
            아직 이름을 설정하지 않았습니다. 이름을 설정하기 전에는 매치
            입력 화면에서 &ldquo;나&rdquo;가 자동으로 표시되지 않습니다.
          </p>
        )}

        <DisplayNameForm currentName={profile.display_name} />
      </div>
    </div>
  );
}
