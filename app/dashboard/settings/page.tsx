import { createClient } from "@/lib/supabase/server";
import { deletePlayerName } from "./actions";
import { AddNameForm } from "./name-form";

export default async function SettingsPage() {
  const supabase = await createClient();

  const { data: names, error } = await supabase
    .from("player_names")
    .select("id, name")
    .order("created_at");

  if (error) {
    throw new Error("이름 목록을 불러오지 못했습니다.");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-50">설정</h1>
        <p className="mt-1 text-sm text-zinc-400">
          매치 입력 시 선택할 수 있는 내 이름을 등록하세요.
        </p>
      </div>

      <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
        <h2 className="text-sm font-medium text-zinc-200">내 이름</h2>

        {names.length > 0 ? (
          <ul className="space-y-2">
            {names.map((n) => (
              <li
                key={n.id}
                className="flex items-center justify-between rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-50"
              >
                {n.name}
                <form action={deletePlayerName}>
                  <input type="hidden" name="id" value={n.id} />
                  <button
                    type="submit"
                    className="text-xs text-zinc-500 hover:text-red-400"
                  >
                    삭제
                  </button>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500">
            아직 등록된 이름이 없습니다. 이름을 등록하면 매치 입력 화면에서
            바로 선택할 수 있어요.
          </p>
        )}

        <AddNameForm />
      </div>
    </div>
  );
}
