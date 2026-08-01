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

| 표시명(KR)          | Display name (EN)            | slug                | 매치 설정 영향                                                        |
| ------------------- | ----------------------------- | -------------------- | ---------------------------------------------------------------------- |
| 헬라스 & 엘리시움    | Hellas & Elysium               | hellas-elysium        | 맵 선택지에 HELLAS, ELYSIUM 추가                                        |
| 비너스 넥스트        | Venus Next                     | venus-next             | 기업 5종 추가: Aphrodite, Celectic, Manutech, MSI, Viron                |
| 서곡                | Prelude                        | prelude                | 기업 5종 추가: Cheung Shing Mars, Point Luna, Robinson Industries, Valley Trust, VITOR |
| 개척기지            | Colonies                       | colonies               | 기업 5종 추가: Arklight, Aridor, Polyphemos, Poseidon, Stormcraft. 매치 설정에 "개척기지 뽑기" 단계 추가 |
| 격동                | Turmoil                        | turmoil                | 기업 5종 추가: Lakefront Resorts, Pristar, Septem Tribus, Terralabs, Utopia Invest. 점수 계산에 "의회" 항목 포함 |
| 아마조니스 & 보레알리스 | Amazonis Planitia & Vastitas Borealis | amazonis-borealis | 맵 선택지에 AMAZONIS PLANITIA, VASTITAS BOREALIS 추가                  |
| 유토피아 & 킴메리아  | Utopia Planitia & Terra Cimmeria | utopia-kimmeria     | 맵 선택지에 UTOPIA PLANITIA, TERRA CIMMERIA 추가                        |
| 업적과 기업상        | Awards & Milestones            | awards-milestones      | 확인 필요 — 기본 점수식에 이미 업적/기업상 항목이 있어, 이 확장이 추가 타일만 늘리는 것인지 재확인 필요 |
| 서곡 2              | Prelude 2                      | prelude-2              | 기업 5종 추가: Ecotec, Nirgal Enterprises, Palladin Shipping, Sagitta Frontier Services, Spire |

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
- 동점 처리 규칙은 확인 필요

## TODO / 확인 필요

- Corporate Era, Promos를 `expansions` 카탈로그에 정식 포함할지 여부와 slug 확정
- 업적과 기업상(Awards & Milestones) 확장이 정확히 무엇을 추가하는지 재확인
  (기본 점수식에 이미 업적/기업상 항목이 존재)
- 기업 영문 표기 최종 확인 (카드 실물과 표기가 다를 수 있음)
- "드루이드" 필드의 내부 키 이름과 UI 노출 방식
- 동점 처리 규칙
- 개척기지 뽑기 결과(무역 수입 등)를 점수 계산에 반영할지 여부
- KR/EN 표시명을 어디에 저장할지 (games/expansions 테이블에 로케일 컬럼을
  둘지, 별도 i18n 리소스로 둘지)

게임 규칙이 불확실한 항목은 임의로 추측해서 구현하지 않는다. `CLAUDE.md`
원칙을 따른다.
