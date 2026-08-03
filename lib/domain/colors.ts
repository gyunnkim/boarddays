/**
 * 게임별 플레이어 색상(capabilities.ts의 playerColors)이 실제 화면에서
 * 어떤 색으로 보여야 하는지 매핑한다. capability 쪽은 "이 게임에 어떤 색상이
 * 있는지"만 알고, 실제 hex 값은 표시 전용 관심사라 이 모듈로 분리한다.
 */
export const PLAYER_COLOR_HEX: Record<string, string> = {
  red: "#dc2626",
  blue: "#2563eb",
  yellow: "#eab308",
  green: "#16a34a",
  black: "#52525b",
  beige: "#d9c8a0",
  brown: "#8a5a2b",
  purple: "#9333ea",
};
