export type Locale = "ko" | "en";

export const DEFAULT_LOCALE: Locale = "ko";
export const LOCALE_COOKIE_NAME = "boarddays_locale";

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "ko" || value === "en";
}

/**
 * DB의 이중 언어 컬럼(name_ko/name_en) 중 현재 로케일에 맞는 값을 고른다.
 */
export function pickLocalized(
  locale: Locale,
  ko: string,
  en: string | null | undefined,
): string {
  if (locale === "en" && en) return en;
  return ko;
}
