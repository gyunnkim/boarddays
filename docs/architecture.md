# boarddays 아키텍처

## 기본 데이터 흐름

Browser → Next.js App Router → Server Component / Server Action / Route
Handler → Domain Logic → Supabase → PostgreSQL

## 인증

Browser → Supabase Auth → authenticated session → Server → 현재 사용자
확인 → RLS

사용자 ID를 클라이언트에서 전달받아 권한을 결정하지 않는다.

## 주요 기능 흐름

Dashboard → Game Selection → Expansion Gate → Match Entry → Match Result
→ Match History

## 도메인 경계

### 게임 카탈로그

지원 게임과 확장팩을 정의한다.

### 게임 도메인

게임별 입력과 capability를 정의한다.

### Match

한 번의 플레이를 나타낸다.

### Match Player

한 매치에서 각 플레이어의 결과를 나타낸다.

### Match Expansion

특정 매치에서 실제로 사용한 확장팩을 나타낸다.

## 원칙

일반 UI는 특정 게임의 규칙을 알지 않아야 한다.

가능한 구조:

Game Configuration → Capabilities → Generic Match UI → Game-specific
Result Data

## 서버/클라이언트

Server Component: - 데이터 조회 - 보호된 정보 접근 - 초기 화면

Client Component: - 사용자 상호작용 - 로컬 상태 - 브라우저 API

민감한 데이터 접근과 mutation은 서버에서 처리한다.
