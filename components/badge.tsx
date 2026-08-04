export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-stone-700 bg-stone-800/60 px-2.5 py-0.5 text-xs font-medium text-stone-300">
      {children}
    </span>
  );
}
