/**
 * 로그인/회원가입/게스트 입장 직후 발급된 JWT로 즉시 PostgREST에 쿼리하면
 * 드물게 `PGRST303 (JWT issued at future)` 오류가 발생한다. Auth 토큰
 * 발급 서버와 PostgREST 사이의 미세한 클럭 오차 때문에 토큰의 `iat`가
 * PostgREST 쪽 시계 기준으로 아주 잠깐 "미래"로 보이는 경우로, 실제로는
 * 유효한 세션이며 아주 짧은 시간(수백ms) 후 재요청하면 정상 동작한다.
 *
 * 이 오류는 "데이터가 없음"이 아니라 "일시적으로 검증에 실패함"이므로,
 * 빈 화면으로 조용히 넘기지 않고 짧게 재시도해 실제 데이터를 보여준다.
 */

const TRANSIENT_AUTH_ERROR_CODES = new Set(["PGRST303"]);

interface PostgrestLikeError {
  code?: string | null;
}

interface PostgrestLikeResult<T> {
  data: T | null;
  error: PostgrestLikeError | null;
}

function hasTransientAuthError(
  results: readonly PostgrestLikeResult<unknown>[],
): boolean {
  return results.some(
    (result) =>
      !!result.error?.code && TRANSIENT_AUTH_ERROR_CODES.has(result.error.code),
  );
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 여러 Supabase 쿼리를 병렬로 실행하고, 그 중 하나라도 일시적인 JWT
 * 타이밍 오류(PGRST303)로 실패하면 짧게 대기 후 전체를 다시 실행한다.
 * 그 외의 오류는 그대로 반환한다(재시도하지 않음).
 */
export async function runWithAuthRetry<
  T extends readonly PostgrestLikeResult<unknown>[],
>(run: () => Promise<T>, maxRetries = 2, delayMs = 400): Promise<T> {
  let results = await run();

  let attempt = 0;
  while (hasTransientAuthError(results) && attempt < maxRetries) {
    await delay(delayMs);
    results = await run();
    attempt += 1;
  }

  return results;
}
