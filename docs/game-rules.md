# boarddays 게임 도메인 규칙

## 목적

게임과 확장팩이 늘어나도 일반적인 Match UI를 매번 뜯어고치지 않도록 게임
도메인을 데이터/Capability 중심으로 관리한다.

## 기본 구조

Game → Expansions → Capabilities → Match Input → Match Result → History

## 듄: 임페리움

확장팩: - 익스의 부상 - 불멸

추후 게임별 입력/결과 차이를 Capability로 정의한다.

## SETI

확장팩: - 우주기관

추후 게임별 입력/결과 차이를 Capability로 정의한다.

## 테라포밍 마스

확장팩: - 헬라스 & 엘리시움 - 비너스 넥스트 - 서곡 - 개척기지 - 격동 -
아마조니스 & 보레알리스 - 유토피아 & 킴메리아 - 업적과 기업상 - 서곡 2

## 확장팩 Capability 예시

개척기지가 선택된 경우: - 개척기지 관련 기능 활성화

선택되지 않은 경우: - 관련 기능 비활성화

## 새 게임 추가

1.  게임 catalog
2.  확장팩 catalog
3.  stable slug
4.  capability
5.  match input
6.  match result
7.  history
8.  statistics
9.  test

## 새 확장팩 추가

1.  expansion catalog
2.  game 연결
3.  capability
4.  match 연결
5.  UI
6.  history
7.  test

게임 규칙 자체가 불확실한 경우 임의로 추측하여 구현하지 않는다. 필요한
규칙을 사용자에게 확인한다.
