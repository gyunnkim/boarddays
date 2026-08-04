# boarddays

보드게임 전적을 기록하고 관리하는 웹 서비스.

지원 게임: 듄: 임페리움 · SETI · 테라포밍 마스

## 구현된 기능

- **인증**: 이메일/비밀번호 회원가입·로그인·로그아웃, 게스트(비회원) 익명 세션 입장 (Supabase Auth)
- **대시보드**: 총 게임 횟수, 전체 승률, 게임별 플레이 횟수/승률 카드 — 카드를 클릭하면 아래
  전적 기록이 해당 게임으로 필터링됨
- **전적 기록**: 매치별 사용 확장팩 badge, 참여 플레이어 전원의 순위/이름/점수/승패를 카드로 표시
  (내 결과에 따라 카드 강조 색이 달라짐)
- **매치 입력**: 게임/확장팩 선택 → 플레이어 입력(이름, 색상, 진영, 점수) → 저장까지 하나의
  공용 폼(`match-form.tsx`)에서 게임별 UI를 하드코딩 없이 capability(`lib/domain/capabilities.ts`)
  기반으로 처리
  - 플레이어 색상: 이름 앞 정사각형 스와치 버튼을 클릭하면 사용 가능한 색상(듄 4색 · SETI 4색 ·
    테라포밍 마스 5색)이 팝오버 그리드로 펼쳐져 선택하는 방식, "순서 정하기" 버튼으로 플레이어
    순서 무작위 재배치
  - 테라포밍 마스 전용: 맵 선택(직접/랜덤), 개척기지 뽑기, 점수 항목별 입력 + 실시간 총점 계산,
    메가크레딧(MC) 입력, 동점 시 MC 타이브레이커
  - SETI 전용: 우주기관 확장 선택 시에만 비대칭 기관 11종(오비탈 다이나믹스, 펜윅 리서치
    센터 등, `docs/games/seti.md` 참고) 선택 UI 노출
- **게임 카탈로그**: 3개 게임 + 확장팩 목록을 DB에 시드 (표시명 KR/EN 이중 언어)
- **다국어(i18n)**: KR/EN 전환 토글, 화면 전체 문구 로케일 분리
- **설정**: 표시 이름(display name) 변경, 이름 유일성(unique) 제약
- **데이터 격리**: 사용자 소유 테이블(matches, match_players, match_expansions 등) 전체에 RLS 적용
- **라우트 보호**: 미인증 상태로 `/dashboard` 접근 시 `/login`으로 리다이렉트 (proxy + 레이아웃
  이중 확인)

아직 구현되지 않은 기능(다음 단계):

- 전적 상세(개별 매치) 화면 — 현재는 대시보드에 인라인 카드로만 표시되고 별도 상세 페이지는 없음
- 전적 기록 수정/삭제

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

- 프로젝트 규칙: `CLAUDE.md`, `.claude/rules/`
- 요구사항/아키텍처/DB 설계/게임별 상세: `docs/`
