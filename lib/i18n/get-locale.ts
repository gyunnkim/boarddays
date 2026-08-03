import "server-only";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE_NAME, isLocale, type Locale } from "./config";

/**
 * Server Component/Server Action에서 현재 요청의 로케일을 읽는다.
 * 쿠키가 없거나 지원하지 않는 값이면 기본 로케일(ko)로 처리한다.
 */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}
