# boarddays Claude Code 작업 방식

## 첫 세션

저장소 루트에서 Claude Code를 실행한다.

첫 프롬프트:

> `CLAUDE.md`, `.claude/rules/`, `.claude/agents/`, `.claude/skills/`,
> `docs/`를 모두 읽고 현재 저장소를 분석해줘. 아직 파일을 수정하지 말고
> boarddays의 첫 번째 개발 단계인 Supabase schema, RLS, games,
> expansions, matches, match_players, match_expansions, 필요한 pg_cron의
> 구현 계획을 세워줘.

## 권장 개발 순서

### 1단계 --- DB/도메인

-   Supabase
-   schema
-   RLS
-   games
-   expansions
-   matches
-   match_players
-   match_expansions
-   필요한 pg_cron

### 2단계 --- 인증

-   Supabase Auth
-   로그인
-   보호된 앱 영역
-   사용자 프로필

### 3단계 --- 대시보드

-   게임 카드
-   총 게임
-   승률
-   기본 통계

### 4단계 --- 매치 흐름

-   게임 선택
-   확장팩 선택
-   매치 생성
-   플레이어 입력
-   게임별 기능

### 5단계 --- 전적

-   최신순 리스트
-   상세
-   수정
-   통계

### 6단계 --- 완성

-   테스트
-   접근성
-   반응형
-   보안 리뷰
-   build
-   Vercel 배포

## Skill 사용

-   `/plan-feature`
-   `/implement-feature`
-   `/database-migration`
-   `/expansion-system`
-   `/test`
-   `/review`
-   `/deploy`

## Agent 역할

### database-architect

DB와 RLS.

### frontend-specialist

Next.js와 UI.

### game-domain-specialist

게임/확장팩/Capability.

### reviewer

최종 검토.

## TFMCounter

TFMCounter는 참고용이다.

먼저 boarddays의 요구사항과 현재 코드를 이해한 후 필요한 구현만
선택적으로 참고한다.

기존 프로젝트를 그대로 복사하는 방식으로 개발하지 않는다.
