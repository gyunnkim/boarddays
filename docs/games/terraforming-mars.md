# 테라포밍 마스 (Terraforming Mars)

`docs/game-rules.md`에서 참조하는 게임별 상세 문서다.

boarddays는 KR/EN 2개 국어를 지원할 예정이므로, 이 문서의 표시명은 한글/영문을
병기한다. 실제 저장 시에는 slug(내부 식별자)와 로케일별 표시명을 분리해서
관리한다.

## 게임 slug

`terraforming-mars`

## 개요

- 카드 기반 엔진 빌딩 게임. 기업(Corporation)을 선택해 화성을 테라포밍한다.
- 점수 계산식은 아래 [점수 계산](#점수-계산-확정) 절 참고.

## 확장 선택 & 매치 설정 흐름

1. (최초 설정) 사용할 확장팩을 선택한다 (맵 3종은 확장팩 목록에 없다 —
   아래 5번 참고).
2. 매치를 새로 만들 때마다 확장팩 구성을 변경할 수 있다. 단, 기본값은
   직전 매치와 동일한 구성을 유지하며, "매치마다 확장 재선택"이 default
   동작은 아니다 — 사용자가 원할 때만 변경한다.
3. 프로모 기업 추가 버튼으로 프로모 기업 10종 사용 여부를 켜고 끌 수
   있다 (확장팩 선택과 별개, [프로모 기업](#프로모-기업-확장-아님) 참고).
4. 플레이어 명수를 선택한다.
5. 플레이어별로 다음을 입력한다: 색상, 기업, 점수, 메가크레딧(MC).
6. 맵 추가 탭에서 그 판에서 플레이할 맵을 선택한다 (맵 랜덤 선택 버튼
   제공, [맵 옵션](#맵-옵션-확장과-무관) 참고).
7. 개척기지(Colonies) 확장이 선택된 경우, 개척기지 뽑기 버튼으로
   전체 개척기지 중 (플레이어 명수 + 2)개를 뽑는다.

## 확장팩 / 옵션이 매치 설정에 미치는 영향

표는 매치 입력 화면에 표시되는 순서(사용자 확정)대로 정렬되어 있다. 실제
정렬은 `expansions.sort_order` 컬럼 값을 따른다
(`20260801100013_expansion_sort_order.sql`).

맵을 추가하던 세 확장(헬라스 & 엘리시움, 아마조니스 & 보레알리스, 유토피아 &
킴메리아)은 더 이상 "확장팩" 목록에 표시하지 않는다 (사용자 확정, 아래
[맵 옵션](#맵-옵션-확장과-무관) 참고). `expansions` 카탈로그/매치의 "사용
확장팩" 표시에서 제외한다.

| 표시명(KR) | Display name (EN) | slug      | 매치 설정 영향                                                        |
| ---------- | ------------------ | ---------- | ---------------------------------------------------------------------- |
| 비너스 넥스트 | Venus Next      | venus-next | 기업 5종 추가: Aphrodite, Celectic, Manutech, MSI, Viron                |
| 서곡       | Prelude            | prelude    | 기업 5종 추가: Cheung Shing Mars, Point Luna, Robinson Industries, Valley Trust, VITOR |
| 개척기지   | Colonies           | colonies   | 기업 5종 추가: Arklight, Aridor, Polyphemos, Poseidon, Stormcraft. 매치 설정에 "개척기지 뽑기" 단계 추가 (아래 [개척기지 목록](#개척기지-확정) 참고) |
| 격동       | Turmoil            | turmoil    | 기업 5종 추가: Lakefront Resorts, Pristar, Septem Tribus, Terralabs, Utopia Invest. 점수 계산에 "의회" 항목 포함 |
| 서곡 2     | Prelude 2          | prelude-2  | 기업 5종 추가: Ecotec, Nirgal Enterprises, Palladin Shipping, Sagitta Frontier Services, Spire |

"업적과 기업상"(Awards & Milestones)은 정식 확장 카탈로그에서 제외했다
(사용자 확인 완료). 기본 점수 계산식에 이미 업적(Milestones)/기업상(Awards)
항목이 포함되어 있고, 이 확장은 기업이나 맵을 추가하지 않아 매치 설정에
별도로 필요한 것이 없기 때문이다 (`20260801100014_remove_awards_milestones_expansion.sql`).

## 맵 옵션 (확장과 무관)

맵 선택은 "사용 확장팩" 선택과 분리된 별도 UI(맵 추가 탭)에서 이뤄진다.
기본값은 타르시스(THARSIS) 하나뿐이며, 이 탭에서 아래 3개 토글을 켜면
쌍으로 맵이 풀에 추가된다. 이 탭에서 맵을 추가해도 해당 매치의 "사용
확장팩" 목록에는 아무것도 기록하지 않는다 — 헬라스 & 엘리시움, 아마조니스 &
보레알리스, 유토피아 & 킴메리아는 확장팩 엔티티로 취급하지 않는다
(사용자 확정).

| 토글 표시명(KR)         | Toggle display name (EN)              | 추가되는 맵                              |
| ------------------------ | -------------------------------------- | ------------------------------------------ |
| 헬라스 & 엘리시움        | Hellas & Elysium                        | HELLAS, ELYSIUM                            |
| 아마조니스 & 보레알리스   | Amazonis Planitia & Vastitas Borealis   | AMAZONIS PLANITIA, VASTITAS BOREALIS       |
| 유토피아 & 킴메리아       | Utopia Planitia & Terra Cimmeria        | UTOPIA PLANITIA, TERRA CIMMERIA            |

타르시스(THARSIS)는 토글과 무관하게 항상 맵 풀에 포함된다. 맵 랜덤 선택
버튼은 그 시점에 켜져 있는 토글에 따라 결정된 맵 풀(타르시스 + 켜진 토글의
맵들) 안에서만 무작위로 고른다.

## 기본 제공 (확장 없이 항상 선택 가능)

### 기업 (12종)

Credicor, Ecoline, Helion, Interplanetary Cinematics, Inventrix, Mining Guild,
Phoblog, Tharsis Republic, Thorgate, UNMI, Saturn Systems, Teractor

(Saturn Systems, Teractor는 기존에 "대기업 시대(Corporate Era)" 확장 후보로
검토했으나, 별도 확장으로 두지 않고 기본 제공 기업 목록에 바로 포함하기로
확정했다 — 사용자 확정.)

## 프로모 기업 (확장 아님)

아래 10종은 "확장팩"이 아니라 매치 설정 화면의 별도 "프로모 기업 추가"
버튼(토글)으로 켜고 끈다. 이 버튼을 켜면 기업 선택지에 아래 10종이 추가되지만,
`match_expansions`/"사용 확장팩" 표시에는 반영하지 않는다 (사용자 확정).

Arcadian Communities, Recyclon, Splice, Factorum, Mons Insurance, Philares,
Astrodrill Enterprise, Pharmacy Union, Kuiper Cooperative, Tycho Magnetics

프로모 기업 사용 여부를 매치 레코드에 어떻게 저장할지(예: `matches`에 별도
boolean 컬럼)는 구현 시 결정한다 — 단, `match_expansions`를 통해서는 안 된다.

## 개척기지 (확정)

개척기지(Colonies) 확장의 실물 확장 타일 12종을 그대로 카탈로그로 사용한다
(`terraforming_mars_colonies` 테이블, `20260801100015_seed_terraforming_mars_colonies.sql`).
매치에서는 이 12종 중 (플레이어 명수 + 2)개를 무작위로 뽑아 기록한다
(뽑기 결과를 점수 계산에 자동 반영하지는 않는다 — 아래 TODO 참고).

칼리스토(Callisto), 세레스(Ceres), 엔켈라두스(Enceladus), 유로파(Europa),
가니메데(Ganymede), 이오(Io), 루나(Luna), 미란다(Miranda), 플루토(Pluto),
타이탄(Titan), 티타니아(Titania), 트리톤(Triton)

## 매치 입력 필드 (확정)

### 매치 단위

- 사용 확장팩 목록 (매치마다 재선택 가능, 기본값은 직전 매치와 동일).
  헬라스 & 엘리시움, 아마조니스 & 보레알리스, 유토피아 & 킴메리아는 이
  목록에 포함하지 않는다 (아래 맵 항목 참고).
- 맵 (맵 추가 탭에서 직접 선택 또는 랜덤 선택 — [맵 옵션](#맵-옵션-확장과-무관)
  참고. 확장팩 선택과 무관하게 항상 7개 맵 중에서 고른다.)
- 프로모 기업 사용 여부 (프로모 기업 추가 버튼, 확장팩 목록과 별개로 저장)
- 개척기지 목록 (개척기지 확장 포함 시, (플레이어 명수+2)개 드로우 결과)

### 플레이어 단위

- 이름
- 색상: 빨강(Red) / 파랑(Blue) / 노랑(Yellow) / 초록(Green) / 검정(Black)
- 기업 (선택된 확장팩 구성 + 프로모 기업 사용 여부에 따라 선택지가 늘어남)
- 최종 점수
- 메가크레딧(MC)

## 점수 계산 (확정)

최종 점수 = TR + 업적(Milestones) + 기업상(Awards) + 드루이드 + 숲 + 도시 +
카드 점수 + 의회(격동 확장 포함 시에만)

- 드루이드: 카드 위 자원 점수를 가리키는 하우스룰 명칭. 정식 룰 용어가
  아니므로 내부 필드 키는 별도 영문명을 쓰고 표시명만 "드루이드"로 노출하는
  방식을 검토한다 — 확인 필요
- 의회: 격동(Turmoil) 확장이 포함된 매치에서만 점수 계산에 포함한다.
  미포함 매치에서는 입력/계산에서 제외한다.

## 순위 / 승패

- 최종 점수가 가장 높은 플레이어가 승리
- 동점 처리(확정): 최종 점수가 같으면 메가크레딧(MC)이 더 높은 플레이어가
  더 높은 순위를 받는다. 점수와 MC가 모두 같으면 표준 경쟁 순위(1224
  방식)에 따라 공동 순위를 받는다. MC 값이 없는 게임(듄/SETI)에는 이
  타이브레이커가 적용되지 않고 점수만으로 동점을 판단하는 기존 중립 로직이
  그대로 유지된다 (`app/dashboard/matches/actions.ts`의 `assignRanks`).

## TODO / 확인 필요

- (해결됨) Saturn Systems/Teractor는 기본 제공 기업으로, 프로모 10종은
  "프로모 기업 추가" 버튼으로, 맵 3종(헬라스 & 엘리시움/아마조니스 &
  보레알리스/유토피아 & 킴메리아)은 확장팩이 아닌 맵 옵션으로 확정했다
  (사용자 확정, 2026-08-04). 프로모 기업 사용 여부를 저장할 정확한 컬럼
  설계(예: `matches.include_promo_factions` boolean 등)는 구현 시 결정한다.
- 기업 영문 표기 최종 확인 (카드 실물과 표기가 다를 수 있음)
- "드루이드" 필드의 내부 키 이름과 UI 노출 방식: 현재
  `lib/domain/capabilities.ts`에 임시 영문 키 `card_resource_score`로
  구현되어 있다. 정식 룰 용어가 아니므로 이 키 이름 자체는 여전히 확인
  필요 상태다.
- 개척기지 뽑기 결과(무역 수입 등)를 점수 계산에 반영할지 여부 — 현재는
  뽑기 결과를 기록만 하고 점수식에는 반영하지 않는다.
- KR/EN 표시명을 어디에 저장할지 (games/expansions 테이블에 로케일 컬럼을
  둘지, 별도 i18n 리소스로 둘지)

게임 규칙이 불확실한 항목은 임의로 추측해서 구현하지 않는다. `CLAUDE.md`
원칙을 따른다.
