export type SupportedGameSlug = "dune-imperium" | "seti" | "terraforming-mars";

export interface PlayerColorOption {
  value: string;
  labelKo: string;
}

export interface ScoreComponentConfig {
  key: string;
  labelKo: string;
  /**
   * 있으면 이 확장팩 slug가 매치에 선택된 경우에만 이 점수 항목을 입력받는다.
   * 없으면 항상 입력받는다.
   */
  requiresExpansionSlug?: string;
}

export interface ColonyDrawConfig {
  /** 이 확장팩 slug가 매치에 선택된 경우에만 개척기지 뽑기 UI를 켠다. */
  expansionSlug: string;
  /** 뽑는 개수 = 플레이어 명수 + countOffset. */
  countOffset: number;
}

export interface MapGroupOption {
  /**
   * 매치 입력 화면 "맵 추가" 탭의 토글 식별자. `expansions` 테이블과 무관한
   * 독립 slug로, 이 값을 가진 맵 카탈로그 행(예: terraforming_mars_maps의
   * map_group_slug)을 켜고 끈다.
   */
  slug: string;
  labelKo: string;
}

export interface PromoFactionsConfig {
  /** "프로모 기업 추가" 토글 버튼에 표시할 라벨. */
  labelKo: string;
  /**
   * 이 값을 group_slug로 가진 진영(player_factions) 행은 토글이 켜져 있을
   * 때만 선택지에 노출된다. 확장팩이 아니므로 match_expansions에는 반영하지
   * 않고, matches의 별도 boolean 컬럼(예: include_promo_factions)에 온/오프
   * 여부를 저장한다.
   */
  groupSlug: string;
}

export interface GameCapability {
  hasFactions: boolean;
  factionLabel?: string;
  /**
   * 있으면 hasFactions가 true여도 이 확장팩 slug가 매치에 선택된 경우에만
   * 진영 선택 UI를 표시하고 필수값으로 요구한다 (예: SETI의 기관은
   * 우주기관 확장 전용이라 기본판에는 진영 자체가 존재하지 않는다). 없으면
   * hasFactions만으로 항상 켠다 (듄/테라포밍 마스처럼 확장 없이도 선택 가능한
   * 진영이 있는 경우).
   */
  factionsRequireExpansionSlug?: string;
  /** 있으면 플레이어별 색상 선택 UI를 켠다 (예: 테라포밍 마스). */
  playerColors?: PlayerColorOption[];
  /** 있으면 플레이어별 메가크레딧(자원) 입력 필드를 켠다. */
  hasMegacredits?: boolean;
  megacreditsLabel?: string;
  /**
   * 있으면 플레이어별 "최종 점수" 단일 입력 대신 여기 정의된 각 항목을
   * 입력받아 서버에서 합산한 값을 최종 점수로 저장한다.
   */
  scoreComponents?: ScoreComponentConfig[];
  /** 있으면 매치 단위로 맵을 선택(직접 선택 또는 랜덤 선택)하는 UI를 켠다. */
  hasMapSelection?: boolean;
  /**
   * 있으면 hasMapSelection UI를 "맵 추가" 탭으로 표시하고, 여기 정의된 각
   * 항목을 토글로 켜고 끌 수 있게 한다. 토글과 무관한 기본 맵은 항상 풀에
   * 포함되고, 각 토글을 켜면 해당 slug의 맵이 풀에 추가된다. 맵 랜덤 선택은
   * 그 시점에 켜진 토글로 결정된 풀 안에서만 동작한다.
   */
  mapGroups?: MapGroupOption[];
  /** 있으면 조건을 만족하는 확장팩이 선택된 매치에서 개척기지 뽑기 UI를 켠다. */
  colonyDraw?: ColonyDrawConfig;
  /**
   * 있으면 "프로모 기업 추가" 토글 UI를 켠다. hasFactions가 true인 게임에서만
   * 의미가 있다.
   */
  promoFactions?: PromoFactionsConfig;
}

/**
 * 게임 slug별로 매치 입력 화면이 어떤 기능을 켜야 하는지 판단한다.
 * 컴포넌트/서버 액션은 `game === "dune-imperium"` 같은 분기 대신 이 함수만
 * 참조한다. null이면 아직 매치 입력을 지원하지 않는 게임이다.
 */
export function getGameCapability(slug: string): GameCapability | null {
  switch (slug as SupportedGameSlug) {
    case "dune-imperium":
      return {
        hasFactions: true,
        factionLabel: "리더",
        playerColors: [
          { value: "red", labelKo: "빨강" },
          { value: "yellow", labelKo: "노랑" },
          { value: "blue", labelKo: "파랑" },
          { value: "green", labelKo: "초록" },
        ],
      };
    case "seti":
      return {
        hasFactions: true,
        factionLabel: "기관",
        factionsRequireExpansionSlug: "space-agencies",
        playerColors: [
          { value: "beige", labelKo: "베이지" },
          { value: "brown", labelKo: "갈색" },
          { value: "green", labelKo: "초록색" },
          { value: "purple", labelKo: "보라색" },
        ],
      };
    case "terraforming-mars":
      return {
        hasFactions: true,
        factionLabel: "기업",
        playerColors: [
          { value: "red", labelKo: "빨강" },
          { value: "blue", labelKo: "파랑" },
          { value: "yellow", labelKo: "노랑" },
          { value: "green", labelKo: "초록" },
          { value: "black", labelKo: "검정" },
        ],
        hasMegacredits: true,
        megacreditsLabel: "메가크레딧(MC)",
        scoreComponents: [
          { key: "tr_score", labelKo: "TR" },
          { key: "milestones_score", labelKo: "업적" },
          { key: "awards_score", labelKo: "기업상" },
          // "드루이드": 카드 위 자원 점수를 가리키는 하우스룰 명칭. 정식 룰
          // 용어가 아니라 내부 키 이름(card_resource_score)은 확정된 것이
          // 아니다 — 확인 필요 (docs/games/terraforming-mars.md 참고).
          { key: "card_resource_score", labelKo: "드루이드" },
          { key: "forest_score", labelKo: "숲" },
          { key: "city_score", labelKo: "도시" },
          { key: "card_points_score", labelKo: "카드 점수" },
          {
            key: "council_score",
            labelKo: "의회",
            requiresExpansionSlug: "turmoil",
          },
        ],
        hasMapSelection: true,
        // 헬라스&엘리시움/아마조니스&보레알리스/유토피아&킴메리아는 확장팩
        // 엔티티가 아니라 맵 추가 탭의 토글이다(사용자 확정,
        // docs/games/terraforming-mars.md "맵 옵션(확장과 무관)" 참고). slug는
        // terraforming_mars_maps.map_group_slug와 일치해야 한다.
        mapGroups: [
          { slug: "hellas-elysium", labelKo: "헬라스 & 엘리시움" },
          { slug: "amazonis-borealis", labelKo: "아마조니스 & 보레알리스" },
          { slug: "utopia-kimmeria", labelKo: "유토피아 & 킴메리아" },
        ],
        colonyDraw: { expansionSlug: "colonies", countOffset: 2 },
        // 프로모 기업 10종은 확장팩이 아니다(사용자 확정). groupSlug는
        // player_factions.group_slug='promo'와 일치해야 한다.
        promoFactions: { labelKo: "프로모 기업 추가", groupSlug: "promo" },
      };
    default:
      return null;
  }
}
