"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type AuthFormState = { error?: string; message?: string } | undefined;

function readCredentials(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email ||
    !password
  ) {
    return null;
  }

  return { email, password };
}

/**
 * 회원가입/게스트 입장 시 이름은 그 시점에 한 번만 입력받는다(이후
 * 설정 화면에서 수정 불가). 공백만 입력된 경우도 미입력으로 취급한다.
 */
function readDisplayName(formData: FormData): string | null {
  const raw = formData.get("display_name");
  const name = typeof raw === "string" ? raw.trim() : "";
  return name || null;
}

/**
 * 가입/게스트 입장 전에 이름 중복 여부를 미리 확인한다. 최종 무결성은
 * profiles_display_name_key unique 제약과 handle_new_user 트리거가
 * 보장하므로, 이 확인은 사용자에게 더 이른 시점에 친절한 에러 메시지를
 * 보여주기 위한 것일 뿐이다.
 */
async function checkDisplayNameAvailable(
  supabase: Awaited<ReturnType<typeof createClient>>,
  displayName: string,
): Promise<string | null> {
  const { data: available, error } = await supabase.rpc(
    "is_display_name_available",
    { p_display_name: displayName },
  );

  if (error) {
    return "이름 확인에 실패했습니다. 잠시 후 다시 시도해 주세요.";
  }
  if (!available) {
    return "이미 사용 중인 이름입니다.";
  }
  return null;
}

export async function signIn(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const credentials = readCredentials(formData);
  if (!credentials) {
    return { error: "이메일과 비밀번호를 입력해 주세요." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(credentials);

  if (error) {
    return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }

  redirect("/dashboard");
}

export async function signUp(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const credentials = readCredentials(formData);
  if (!credentials) {
    return { error: "이메일과 비밀번호를 입력해 주세요." };
  }
  if (credentials.password.length < 6) {
    return { error: "비밀번호는 6자 이상이어야 합니다." };
  }
  const displayName = readDisplayName(formData);
  if (!displayName) {
    return { error: "이름을 입력해 주세요." };
  }

  const supabase = await createClient();

  const nameError = await checkDisplayNameAvailable(supabase, displayName);
  if (nameError) {
    return { error: nameError };
  }

  const { data, error } = await supabase.auth.signUp({
    ...credentials,
    options: { data: { display_name: displayName } },
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.session) {
    return {
      message: "가입 확인 이메일을 보냈습니다. 메일함을 확인해 주세요.",
    };
  }

  redirect("/dashboard");
}

/**
 * 게스트(익명) 계정은 매치를 기록할 수 없으므로(매치는 항상 회원 소유),
 * 로그아웃 시 계정 자체를 지워도 전적 데이터 유실 위험이 없다. Supabase는
 * 별도 타임박스를 설정하지 않는 한 익명 세션의 refresh token을 자동
 * 만료시키지 않아 auth.users에 계속 쌓이므로, 로그아웃 시점에 정리한다.
 *
 * service-role 삭제가 실패해도(키 미설정, admin API 에러 등) 로그아웃
 * 자체는 항상 정상적으로 진행돼야 한다 — 로그아웃 버튼이 먹통이 되면 안
 * 된다.
 */
export async function signOut() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.is_anonymous) {
    try {
      const adminClient = createAdminClient();
      if (!adminClient) {
        console.error(
          "게스트 계정 삭제 실패: SUPABASE_SERVICE_ROLE_KEY가 설정되어 있지 않습니다.",
        );
      } else {
        const { error } = await adminClient.auth.admin.deleteUser(user.id);
        if (error) {
          console.error("게스트 계정 삭제 실패:", error.message);
        }
      }
    } catch (err) {
      // service-role 삭제가 어떤 이유로든 실패해도 로그아웃 자체는 반드시
      // 진행되어야 한다 (로그아웃 버튼이 먹통이 되면 안 된다).
      console.error("게스트 계정 삭제 중 예외 발생:", err);
    }
  }

  await supabase.auth.signOut();
  redirect("/login");
}

/**
 * 회원가입/로그인 없이 익명(게스트) 세션으로 입장한다.
 * Supabase Auth의 익명 로그인은 실제 auth.users row와 세션을 만들기
 * 때문에 `auth.uid()` 기반 RLS 정책을 그대로 재사용할 수 있다.
 * (Supabase 프로젝트 설정에서 Anonymous sign-ins가 활성화되어 있어야
 * 동작한다: Authentication > Settings > User Signups.)
 *
 * 이름은 게스트 입장 시점에 한 번만 입력받는다(이후 설정 화면에서 수정
 * 불가). signUp과 마찬가지로 signInAnonymously의 options.data로 넘겨
 * handle_new_user 트리거가 profiles.display_name을 원자적으로 채우게
 * 한다.
 */
export async function signInAsGuest(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const displayName = readDisplayName(formData);
  if (!displayName) {
    return { error: "이름을 입력해 주세요." };
  }

  const supabase = await createClient();

  const nameError = await checkDisplayNameAvailable(supabase, displayName);
  if (nameError) {
    return { error: nameError };
  }

  const { error } = await supabase.auth.signInAnonymously({
    options: { data: { display_name: displayName } },
  });

  if (error) {
    return {
      error: "게스트로 입장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }

  redirect("/dashboard");
}
