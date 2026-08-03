/**
 * 아주 단순한 `{key}` 플레이스홀더 치환 헬퍼.
 *
 * Dictionary는 Server/Client Component 경계를 모두 넘나들며 쓰이기 때문에
 * (props로 전달되는 경우 포함) 값으로 함수를 담을 수 없다 — React Server
 * Components는 함수를 직렬화할 수 없다. 그래서 보간이 필요한 문구는
 * "{key}" 형태의 템플릿 문자열로 저장하고, 이 순수 함수로 값을 채운다.
 */
export function formatTemplate(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_match, key: string) =>
    key in values ? String(values[key]) : `{${key}}`,
  );
}
