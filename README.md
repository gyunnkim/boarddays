# boarddays

보드게임 전적을 기록하고 관리하는 웹 서비스.

지원 게임: 듄: 임페리움 · SETI · 테라포밍 마스

## 구현된 기능

- **인증**: 이메일/비밀번호 회원가입·로그인·로그아웃 (Supabase Auth)
- **대시보드**: 총 게임 횟수, 전체 승률, 게임별 플레이 횟수/승률 카드
- **게임 카탈로그**: 3개 게임 + 확장팩 목록을 DB에 시드 (표시명 KR/EN 이중 언어)
- **데이터 격리**: 모든 사용자 소유 데이터(matches, match_players,
  match_expansions)에 RLS 적용 — 다른 사용자의 데이터는 조회/수정 불가
- **라우트 보호**: 미인증 상태로 `/dashboard` 접근 시 `/login`으로 리다이렉트
  (proxy.ts + 레이아웃 이중 확인)

아직 구현되지 않은 기능(다음 단계):

- 매치 생성/입력 플로우 (게임 선택 → 확장팩 선택 → 플레이어 입력)
- 전적(History) 상세 화면
- 테라포밍 마스 기업/맵/개척기지 등 게임별 세부 데이터

## 기술 스택

Next.js (App Router) · TypeScript · Tailwind CSS · Supabase (Postgres, Auth) · Vercel

## 개발 시작하기

```bash
npm install
cp .env.example .env.local   # Supabase 프로젝트 URL/키 입력
npm run dev
```

- `.env.local`을 채우기 전에는 인증/DB 관련 페이지가 정상 동작하지 않는다.
- 스키마/RLS는 `supabase/migrations/`에 순서대로 정의되어 있다. Supabase
  프로젝트에 연결한 뒤 `supabase db push` 또는 SQL 편집기로 적용한다.
- 검증: `npm run typecheck`, `npm run lint`, `npm run build`

## 문서

- 프로젝트 규칙: `CLAUDE.md`
- 요구사항/아키텍처/DB 설계/게임별 상세: `docs/`
