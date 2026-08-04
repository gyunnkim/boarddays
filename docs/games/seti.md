# SETI: Search for Extraterrestrial Intelligence

`docs/game-rules.md`에서 참조하는 게임별 상세 문서다.

## 게임 slug

`seti`

## 개요

- 우주 탐사/과학 테마의 포인트 기반 전략 게임
- 게임 종료 시 점수를 비교해 가장 높은 플레이어가 승리
- 정확한 종료 조건, 동점 처리 등 세부 규칙은 확인 필요

## 확장팩

| 표시명   | slug            | 비고               |
| -------- | --------------- | ------------------ |
| 우주기관 | space-agencies  | 영문 정식 명칭 및 세부 capability 확인 필요 |

slug는 안정적으로 유지하고, 화면 표시명(한글)과 분리해서 관리한다.

## 매치 입력 필드 (초안)

- 플레이어 이름
- 색상 (확정): 베이지(Beige) / 갈색(Brown) / 초록색(Green) / 보라색(Purple)
- 기관 (확정, 우주기관 확장 선택 시에만 노출·필수): 아래 [비대칭 기관](#비대칭-기관-확정) 참고
- 최종 점수
- 순위
- 승패

## 비대칭 기관 (확정)

우주기관(Space Agencies) 확장을 선택하면 테라포밍 마스의 기업(Corporation),
듄: 임페리움의 리더와 같은 개념의 플레이어별 비대칭 "기관"을 선택한다.
기본판(우주기관 미선택)에는 기관이 존재하지 않으므로, 우주기관 확장을
선택하지 않은 매치에서는 기관 선택 UI 자체가 나타나지 않는다.

11개 기관 전부 우주기관 확장 전용이며, 그룹(가문 등) 구분 없이 평면
목록이다.

| 표시명(KR)              | Display name (EN)      | slug                       |
| ------------------------ | ----------------------- | --------------------------- |
| 오비탈 다이나믹스        | Orbital Dynamics         | orbital-dynamics             |
| 펜윅 리서치 센터         | Fenwick Research Center  | fenwick-research-center      |
| 스트라투스 코어          | Stratus Core             | stratus-core                 |
| 딥 스카이 서베이         | Deep Sky Survey          | deep-sky-survey              |
| 튜링 시스템              | Turing Systems           | turing-systems                |
| 센티넬 프로브 네트워크   | Sentinel Probe Network   | sentinel-probe-network        |
| 코스모스 스트래티지 그룹 | Cosmos Strategy Group    | cosmos-strategy-group         |
| 미션 릴레이              | Mission Relay             | mission-relay                 |
| 제노랩                   | XENOLAB                   | xenolab                       |
| 퓨처스팬 인스티튜트      | Future Span Institute    | future-span-institute         |
| 헬리온 어셈블리          | Helion Assembly           | helion-assembly               |

## Capability (확정)

`lib/domain/capabilities.ts`의 `getGameCapability("seti")`에 구현되어 있다.

- `playerColors`(베이지/갈색/초록색/보라색, 한 매치 내 유일)
- `hasFactions: true`, `factionLabel: "기관"`
- `factionsRequireExpansionSlug: "space-agencies"` — 우주기관 확장이 매치에
  선택된 경우에만 기관 선택 UI를 노출하고 필수값으로 요구한다. 위 11개
  기관은 `player_factions` 테이블에 시드되어 있다 (듄 리더/테라포밍 마스
  기업과 동일한 테이블/구조 재사용, 스키마 변경 없음).

## TODO / 확인 필요

- 우주기관 확장팩의 정확한 영문명과 메커니즘
- 기본판 대비 추가/변경되는 점수 항목, 점수 구성 요소(트랙별 점수 등)를
  매치 입력에 반영할지 여부
- 동점 처리 규칙

게임 규칙이 불확실한 항목은 임의로 추측해서 구현하지 않는다. `CLAUDE.md` 원칙을 따른다.
