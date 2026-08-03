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

1. (최초 설정) 사용할 확장팩을 선택한다.
2. 매치를 새로 만들 때마다 확장팩 구성을 변경할 수 있다. 단, 기본값은
   직전 매치와 동일한 구성을 유지하며, "매치마다 확장 재선택"이 default
   동작은 아니다 — 사용자가 원할 때만 변경한다.
3. 플레이어 명수를 선택한다.
4. 플레이어별로 다음을 입력한다: 색상, 기업, 점수, 메가크레딧(MC).
5. 그 판에서 플레이할 맵을 선택한다 (맵 랜덤 선택 버튼 제공).
6. 개척기지(Colonies) 확장이 선택된 경우, 개척기지 뽑기 버튼으로
   전체 개척기지 중 (플레이어 명수 + 2)개를 뽑는다.

## 확장팩 / 옵션이 매치 설정에 미치는 영향

표는 매치 입력 화면에 표시되는 순서(사용자 확정)대로 정렬되어 있다. 실제
정렬은 `expansions.sort_order` 컬럼 값을 따른다
(`20260801100013_expansion_sort_order.sql`).

| 표시명(KR)          | Display name (EN)            | slug                | 매치 설정 영향                                                        |
| ------------------- | ----------------------------- | -------------------- | ---------------------------------------------------------------------- |
| 헬라스 & 엘리시움    | Hellas & Elysium               | hellas-elysium        | 맵 선택지에 HELLAS, ELYSIUM 추가                                        |
| 비너스 넥스트        | Venus Next                     | venus-next             | 기업 5종 추가: Aphrodite, Celectic, Manutech, MSI, Viron                |
| 서곡                | Prelude                        | prelude                | 기업 5종 추가: Cheung Shing Mars, Point Luna, Robinson Industries, Valley Trust, VITOR |
| 개척기지            | Colonies                       | colonies               | 기업 5종 추가: Arklight, Aridor, Polyphemos, Poseidon, Stormcraft. 매치 설정에 "개척기지 뽑기" 단계 추가 (아래 [개척기지 목록](#개척기지-확정) 참고) |
| 격동                | Turmoil                        | turmoil                | 기업 5종 추가: Lakefront Resorts, Pristar, Septem Tribus, Terralabs, Utopia Invest. 점수 계산에 "의회" 항목 포함 |
| 서곡 2              | Prelude 2                      | prelude-2              | 기업 5종 추가: Ecotec, Nirgal Enterprises, Palladin Shipping, Sagitta Frontier Services, Spire |
| 아마조니스 & 보레알리스 | Amazonis Planitia & Vastitas Borealis | amazonis-borealis | 맵 선택지에 AMAZONIS PLANITIA, VASTITAS BOREALIS 추가                  |
| 유토피아 & 킴메리아  | Utopia Planitia & Terra Cimmeria | utopia-kimmeria     | 맵 선택지에 UTOPIA PLANITIA, TERRA CIMMERIA 추가                        |

"업적과 기업상"(Awards & Milestones)은 정식 확장 카탈로그에서 제외했다
(사용자 확인 완료). 기본 점수 계산식에 이미 업적(Milestones)/기업상(Awards)
항목이 포함되어 있고, 이 확장은 기업이나 맵을 추가하지 않아 매치 설정에
별도로 필요한 것이 없기 때문이다 (`20260801100014_remove_awards_milestones_expansion.sql`).

### 확장 카탈로그에 아직 없는 추가 옵션 (확인 필요)

아래 두 항목은 기존 `CLAUDE.md`, `docs/requirements.md`, `docs/game-rules.md`의
확장팩 목록에 없다. 매치 설정(기업 풀)에는 필요하므로, `expansions` 테이블에
정식 확장으로 추가할지 별도 "옵션" 개념으로 분리할지 확인이 필요하다.

| 표시명(KR)   | Display name (EN) | slug (가안)  | 매치 설정 영향                                                                                       |
| ------------ | ------------------ | -------------- | ------------------------------------------------------------------------------------------------------ |
| 대기업 시대   | Corporate Era       | corporate-era   | 기업 2종 추가: Saturn Systems, Teractor                                                                 |
| 프로모션 기업 | Promos              | promos          | 기업 10종 추가: Arcadian Communities, Recyclon, Splice, Factorum, Mons Insurance, Philares, Astrodrill Enterprise, Pharmacy Union, Kuiper Cooperative, Tycho Magnetics |

## 기본 제공 (확장 없이 항상 선택 가능)

### 맵

- THARSIS

### 기업 (10종)

Credicor, Ecoline, Helion, Interplanetary Cinematics, Inventrix, Mining Guild,
Phoblog, Tharsis Republic, Thorgate, UNMI

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

- 사용 확장팩 목록 (매치마다 재선택 가능, 기본값은 직전 매치와 동일)
- 맵 (직접 선택 또는 랜덤 선택)
- 개척기지 목록 (개척기지 확장 포함 시, (플레이어 명수+2)개 드로우 결과)

### 플레이어 단위

- 이름
- 색상: 빨강(Red) / 파랑(Blue) / 노랑(Yellow) / 초록(Green) / 검정(Black)
- 기업 (선택된 확장팩 구성에 따라 선택지가 늘어남)
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

- Corporate Era, Promos를 `expansions` 카탈로그에 정식 포함할지 여부와 slug 확정
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
