"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { isLocale, LOCALE_COOKIE_NAME } from "./config";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/**
 * KR/EN 토글 버튼에서 호출하는 Server Action. 로케일 쿠키를 갱신하고
 * 현재 트리를 재검증해 서버 컴포넌트가 새 로케일로 다시 렌더링되게 한다.
 */
export async function setLocale(nextLocale: string) {
  if (!isLocale(nextLocale)) return;

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE_NAME, nextLocale, {
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
    sameSite: "lax",
  });

  revalidatePath("/", "layout");
}
