"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type UpdateTricodeState =
  | { error?: string; success?: boolean }
  | undefined;

const TRICODE_PATTERN = /^[A-Z0-9]{3}$/;

function normalizeTricode(raw: FormDataEntryValue | null): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim().toUpperCase();
  return trimmed || null;
}

/**
 * 트라이코드(영문 대문자/숫자 3글자)를 설정하거나 변경한다. 이름
 * (display_name)과 달리 트라이코드는 이 화면에서 언제든 다시 정할 수
 * 있다 — 같은 이름을 쓰는 다른 사용자와의 조합 충돌을 사용자가 직접
 * 해소할 수 있어야 하기 때문이다.
 *
 * 최종 무결성은 profiles_display_name_tricode_key unique 제약(이름 +
 * 트라이코드 조합)이 보장한다. 여기서는 사용자에게 보여줄 에러 메시지를
 * 만들기 위해 unique_violation(23505)을 확인한다.
 */
export async function updateTricode(
  _state: UpdateTricodeState,
  formData: FormData,
): Promise<UpdateTricodeState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const tricode = normalizeTricode(formData.get("tricode"));
  if (!tricode || !TRICODE_PATTERN.test(tricode)) {
    return {
      error: "트라이코드는 영문 대문자 또는 숫자로 이뤄진 3글자여야 합니다.",
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("display_name, tricode")
    .eq("id", user.id)
    .single();

  if (profileError) {
    return { error: "내 이름 정보를 불러오지 못했습니다." };
  }

  if (!profile.display_name) {
    return { error: "이름이 아직 설정되지 않아 트라이코드를 정할 수 없습니다." };
  }

  // 지금 쓰고 있는 트라이코드로 다시 저장하는 경우(변경 없음)는 당연히
  // 허용해야 하므로, 자기 자신과의 "충돌"은 무시한다.
  if (tricode !== profile.tricode) {
    const { data: available, error: availabilityError } = await supabase.rpc(
      "is_display_name_tricode_available",
      { p_display_name: profile.display_name, p_tricode: tricode },
    );

    // 사전 확인 자체가 실패해도(RPC 오류) 최종 무결성은 아래 update의
    // unique 제약이 보장하므로 여기서는 조용히 넘어가고 실제 저장을
    // 시도한다.
    if (!availabilityError && available === false) {
      return {
        error: `이미 "${profile.display_name}#${tricode}" 조합을 사용 중인 계정이 있습니다. 다른 트라이코드를 선택해 주세요.`,
      };
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({ tricode })
    .eq("id", user.id);

  if (error) {
    if (error.code === "23505") {
      return {
        error: `이미 "${profile.display_name}#${tricode}" 조합을 사용 중인 계정이 있습니다. 다른 트라이코드를 선택해 주세요.`,
      };
    }
    return { error: "트라이코드를 저장하지 못했습니다." };
  }

  revalidatePath("/dashboard/settings");
  return { success: true };
}
