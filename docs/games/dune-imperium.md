# 듄: 임페리움 (Dune: Imperium)

`docs/game-rules.md`에서 참조하는 게임별 상세 문서다.

## 게임 slug

`dune-imperium`

## 개요

- 덱빌딩 + 워커플레이스먼트 게임
- 게임 종료 시 승점(VP)을 비교해 가장 높은 플레이어가 승리
- 동점 처리, 정확한 종료 조건 등 세부 규칙은 확인 필요

## 확장팩

| 표시명     | slug          | 비고               |
| ---------- | ------------- | ------------------ |
| 익스의 부상 | rise-of-ix    | 세부 capability 확인 필요 |
| 불멸       | immortality   | 세부 capability 확인 필요 |

slug는 안정적으로 유지하고, 화면 표시명(한글)과 분리해서 관리한다.

## 매치 입력 필드 (확정)

- 플레이어 이름
- 색상: 빨강(Red) / 노랑(Yellow) / 파랑(Blue) / 초록(Green)
- 리더 (가문당 2명 중 1명 선택, 확장팩에 따라 선택지 추가 — 아래 [리더
  목록](#리더-목록-확정) 참고)
- 최종 점수 (VP)
- 순위
- 승패

## 리더 목록 (확정)

가문(House)마다 리더 2명이 있고, 매치 입력 시 그중 1명을 선택한다. 한 매치
내에서 같은 리더를 두 플레이어가 선택할 수 없다(리더는 유일).

### 기본판

| 가문 | slug | 리더 (KR) | 리더 (EN) | slug |
| --- | --- | --- | --- | --- |
| 아트레이드 | atreides | 폴 아트레이드 | Paul Atreides | paul-atreides |
| 아트레이드 | atreides | 레토 아트레이드 공작 | Duke Leto Atreides | duke-leto-atreides |
| 하코넨 | harkonnen | 블라디미르 하코넨 남작 | Baron Vladimir Harkonnen | baron-vladimir-harkonnen |
| 하코넨 | harkonnen | 글로서 "더 비스트" 라반 | Glossu "the Beast" Rabban | glossu-rabban |
| 소르발드 | thorvald | 멤논 소르발드 공작 | Earl Memnon Thorvald | earl-memnon-thorvald |
| 소르발드 | thorvald | 아리아나 소르발드 백작부인 | Countess Ariana Thorvald | countess-ariana-thorvald |
| 리체스 | richese | 헬레나 리체스 | Helena Richese | helena-richese |
| 리체스 | richese | 일반 리체스 백작 | Count Ilban Richese | count-ilban-richese |

### 익스의 부상 (rise-of-ix) 확장 추가

| 가문 | slug | 리더 (KR) | 리더 (EN) | slug |
| --- | --- | --- | --- | --- |
| 버니우스 | vernius | 테시아 버니우스 | Tessia Vernius | tessia-vernius |
| 버니우스 | vernius | 롬버 버니우스 대공 | Prince Rhombur Vernius | prince-rhombur-vernius |
| 에카즈 | ecaz | 일레사 에카즈 | Ilesa Ecaz | ilesa-ecaz |
| 에카즈 | ecaz | 아먼드 에카즈 대공 | Archduke Armand Ecaz | archduke-armand-ecaz |
| 모리타니 | moritani | 유나 모리타니 "공주" | "Princess" Yuna Moritani | princess-yuna-moritani |
| 모리타니 | moritani | 헌드로 모리타니 자작 | Viscount Hundro Moritani | viscount-hundro-moritani |

## Capability

- `hasFactions: true`, `factionLabel: "리더"` — 리더는 게임 공통
  `player_factions` 카탈로그 테이블에 저장되고, 매치에서 선택된 확장팩에
  따라 선택 가능한 리더 목록이 늘어난다 (`lib/domain/capabilities.ts` 참고).
- `playerColors`: 빨강/노랑/파랑/초록 4색. 한 매치 내에서 색상은 유일해야
  한다 (`app/dashboard/matches/actions.ts`).

## TODO / 확인 필요

- 불멸(immortality) 확장팩이 매치 입력에 추가하는 필드
- 5인 플레이, 솔로 모드 지원 여부
- 동점 처리 규칙

게임 규칙이 불확실한 항목은 임의로 추측해서 구현하지 않는다. `CLAUDE.md` 원칙을 따른다.
