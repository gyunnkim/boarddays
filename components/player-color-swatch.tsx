import { PLAYER_COLOR_HEX } from "@/lib/domain/colors";

/**
 * 플레이어 색상을 작은 큐브 모양 스와치로 보여준다. 실물 큐브 이미지 에셋이
 * 없어 CSS 그라디언트로 입체감을 낸다 — 실제 이미지 에셋이 생기면 이 컴포넌트만
 * 교체하면 된다.
 */
export function PlayerColorSwatch({ color }: { color?: string | null }) {
  const hex = color ? PLAYER_COLOR_HEX[color] : undefined;

  if (!hex) {
    return (
      <span
        aria-hidden
        className="h-8 w-8 shrink-0 rounded-md border border-dashed border-zinc-700 bg-zinc-900"
      />
    );
  }

  return (
    <span
      aria-hidden
      className="h-8 w-8 shrink-0 rounded-md border border-white/10 shadow-inner"
      style={{
        background: `linear-gradient(145deg, ${hex}, color-mix(in srgb, ${hex} 55%, black))`,
      }}
    />
  );
}
