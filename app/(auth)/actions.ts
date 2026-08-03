"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp(credentials);

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

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

/**
 * 회원가입/로그인 없이 익명(게스트) 세션으로 입장한다.
 * Supabase Auth의 익명 로그인은 실제 auth.users row와 세션을 만들기
 * 때문에 `auth.uid()` 기반 RLS 정책을 그대로 재사용할 수 있다.
 * (Supabase 프로젝트 설정에서 Anonymous sign-ins가 활성화되어 있어야
 * 동작한다: Authentication > Settings > User Signups.)
 */
export async function signInAsGuest(): Promise<AuthFormState> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInAnonymously();

  if (error) {
    return {
      error: "게스트로 입장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }

  redirect("/dashboard");
}
