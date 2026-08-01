export type SupportedGameSlug = "dune-imperium" | "seti";

export interface GameCapability {
  hasFactions: boolean;
  factionLabel?: string;
}

/**
 * 게임 slug별로 매치 입력 화면이 어떤 기능을 켜야 하는지 판단한다.
 * 컴포넌트/서버 액션은 `game === "dune-imperium"` 같은 분기 대신 이 함수만
 * 참조한다. null이면 아직 매치 입력을 지원하지 않는 게임이다.
 */
export function getGameCapability(slug: string): GameCapability | null {
  switch (slug as SupportedGameSlug) {
    case "dune-imperium":
      return { hasFactions: true, factionLabel: "리더" };
    case "seti":
      return { hasFactions: false };
    default:
      return null;
  }
}
