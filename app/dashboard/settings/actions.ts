"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type UpdateDisplayNameState =
  | { error?: string; success?: boolean }
  | undefined;

export async function updateDisplayName(
  _state: UpdateDisplayNameState,
  formData: FormData,
): Promise<UpdateDisplayNameState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const nameRaw = formData.get("display_name");
  const name = typeof nameRaw === "string" ? nameRaw.trim() : "";
  if (!name) {
    return { error: "이름을 입력해 주세요." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: name })
    .eq("id", user.id);

  if (error) {
    if (error.code === "23505") {
      return { error: "이미 사용 중인 이름입니다." };
    }
    return { error: "이름을 저장하지 못했습니다." };
  }

  revalidatePath("/dashboard/settings");
  return { success: true };
}
