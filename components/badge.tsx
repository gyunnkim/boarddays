const toneClasses = {
  neutral: "border-stone-700 bg-stone-800/60 text-stone-300",
  map: "border-violet-700/60 bg-violet-500/10 text-violet-300",
} as const;

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: keyof typeof toneClasses;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
