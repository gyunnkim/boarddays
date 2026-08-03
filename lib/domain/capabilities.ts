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

export interface GameCapability {
  hasFactions: boolean;
  factionLabel?: string;
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
  /** 있으면 조건을 만족하는 확장팩이 선택된 매치에서 개척기지 뽑기 UI를 켠다. */
  colonyDraw?: ColonyDrawConfig;
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
        hasFactions: false,
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
        colonyDraw: { expansionSlug: "colonies", countOffset: 2 },
      };
    default:
      return null;
  }
}
