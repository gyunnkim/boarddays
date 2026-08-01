# boarddays 요구사항

## 서비스

사용자가 자신의 보드게임 전적을 기록하고 관리하는 웹 서비스.

## 기술

-   Next.js App Router
-   TypeScript
-   Tailwind CSS
-   Supabase Auth
-   Supabase PostgreSQL
-   Vercel

## 게임

### 듄: 임페리움

-   익스의 부상
-   불멸

### SETI

-   우주기관

### 테라포밍 마스

-   헬라스 & 엘리시움
-   비너스 넥스트
-   서곡
-   개척기지
-   격동
-   아마조니스 & 보레알리스
-   유토피아 & 킴메리아
-   업적과 기업상
-   서곡 2

## 흐름

대시보드 → 게임 선택 → 확장팩 선택 → 매치 입력 → 결과 저장 → 전적 확인

확장팩 선택은 새 매치의 필수 단계다.

## 대시보드

-   총 게임 횟수
-   승률
-   게임별 카드

## 매치

날짜는 시스템이 자동 저장한다.

확장팩은 이전 단계에서 선택한 값을 사용한다.

플레이어별: - 이름 - 점수 - 기업/진영 - 승패 - 순위

## 전적

최신순으로: - 확장팩 - 내 점수 - 순위 - 승패

를 확인할 수 있어야 한다.

## 첫 구현 목표

1.  Supabase schema
2.  Auth/profile
3.  games
4.  expansions
5.  matches
6.  match_players
7.  match_expansions
8.  RLS
9.  필요한 경우 pg_cron

전체 UI보다 먼저 도메인 모델과 DB 계약을 확립한다.
