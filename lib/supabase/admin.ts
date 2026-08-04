import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

/**
 * service-role key로 인증하는 관리자용 Supabase 클라이언트.
 *
 * RLS를 완전히 우회하므로 절대 브라우저로 전달하지 않는다. Server
 * Action/Route Handler 안에서, 이미 서버에서 세션을 확인한 뒤에만
 * 좁은 범위(예: `auth.admin.deleteUser`)로 사용한다.
 *
 * `@supabase/ssr`의 쿠키 기반 클라이언트와 달리 세션을 유지하지 않으므로
 * 요청마다 새로 만들어 쓰고 재사용하지 않는다.
 *
 * `SUPABASE_SERVICE_ROLE_KEY`가 설정돼 있지 않은 환경(예: 아직 이 환경
 * 변수를 등록하지 않은 배포 환경)에서는 null을 반환한다 — 호출하는 쪽에서
 * 반드시 null을 처리해야 한다.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
