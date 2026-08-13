/**
 * 로그인/회원가입/게스트 입장 직후 발급된 JWT로 즉시 PostgREST에 쿼리하면
 * 드물게 `PGRST303 (JWT issued at future)` / `PGRST301 (JWT expired)` 같은
 * 오류가 발생할 수 있다. Auth 토큰 발급 서버와 PostgREST(및 그 사이의
 * 엣지/리전) 사이의 클럭 오차 때문에 토큰의 `iat`/`exp`가 PostgREST 쪽
 * 시계 기준으로 아주 잠깐 어긋나 보이는 경우로, 실제로는 유효한 세션이며
 * 짧은 시간 후 재요청하면 정상 동작한다.
 *
 * 이 오류는 "데이터가 없음"이 아니라 "일시적으로 검증에 실패함"이므로,
 * 빈 화면/에러 화면으로 조용히 넘기지 않고 짧게 재시도해 실제 데이터를
 * 보여준다. 프로덕션(Vercel)에서 관측되는 클럭 오차가 로컬보다 클 수
 * 있으므로, 재시도 횟수와 간격을 점진적으로 늘린다(지수 백오프).
 */

const TRANSIENT_AUTH_ERROR_CODES = new Set(["PGRST303", "PGRST301"]);

interface PostgrestLikeError {
  code?: string | null;
}

interface PostgrestLikeResult<T> {
  data: T | null;
  error: PostgrestLikeError | null;
}

function findTransientAuthError(
  results: readonly PostgrestLikeResult<unknown>[],
): PostgrestLikeError | null {
  for (const result of results) {
    if (
      result.error?.code &&
      TRANSIENT_AUTH_ERROR_CODES.has(result.error.code)
    ) {
      return result.error;
    }
  }
  return null;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 여러 Supabase 쿼리를 병렬로 실행하고, 그 중 하나라도 일시적인 JWT
 * 타이밍 오류(PGRST303/PGRST301)로 실패하면 지수 백오프로 대기 후 전체를
 * 다시 실행한다. 그 외의 오류는 그대로 반환한다(재시도하지 않음).
 *
 * 재시도가 실제로 발생했다는 사실은 프로덕션에서 이 클럭 오차 문제가
 * 얼마나 자주/얼마나 오래 발생하는지 나중에 로그로 확인할 수 있도록
 * `console.warn`으로 남긴다(사용자에게는 노출되지 않는다).
 */
export async function runWithAuthRetry<
  T extends readonly PostgrestLikeResult<unknown>[],
>(run: () => Promise<T>, maxRetries = 3, baseDelayMs = 300): Promise<T> {
  let results = await run();

  let attempt = 0;
  let transientError = findTransientAuthError(results);
  while (transientError && attempt < maxRetries) {
    attempt += 1;
    console.warn(
      `[with-retry] transient auth error ${transientError.code}, retrying (${attempt}/${maxRetries})`,
    );
    await delay(baseDelayMs * attempt);
    results = await run();
    transientError = findTransientAuthError(results);
  }

  return results;
}
