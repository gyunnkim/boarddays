"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type PlayerNameActionState = { error?: string } | undefined;

export async function addPlayerName(
  _state: PlayerNameActionState,
  formData: FormData,
): Promise<PlayerNameActionState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const nameRaw = formData.get("name");
  const name = typeof nameRaw === "string" ? nameRaw.trim() : "";
  if (!name) {
    return { error: "이름을 입력해 주세요." };
  }

  const { error } = await supabase
    .from("player_names")
    .insert({ user_id: user.id, name });

  if (error) {
    if (error.code === "23505") {
      return { error: "이미 등록된 이름입니다." };
    }
    return { error: "이름을 저장하지 못했습니다." };
  }

  revalidatePath("/dashboard/settings");
}

export async function deletePlayerName(formData: FormData): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;

  await supabase
    .from("player_names")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/dashboard/settings");
}
