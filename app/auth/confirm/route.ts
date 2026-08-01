import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Supabase 이메일 확인/매직링크 링크가 도착하는 지점.
 * Supabase 대시보드의 "Confirm signup" 템플릿을
 * `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email` 로
 * 바꿔야 이 라우트로 들어온다 (기본 템플릿은 Supabase Auth 서버로 직접
 * 연결되는 구식 링크를 쓴다).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/dashboard";

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });

    if (!error) {
      redirect(next);
    }
  }

  redirect("/login");
}
