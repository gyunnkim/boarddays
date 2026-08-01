"use client";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <p className="text-zinc-300">
        문제가 발생했습니다. 잠시 후 다시 시도해 주세요.
      </p>
      <button
        onClick={() => reset()}
        className="rounded-md border border-zinc-700 px-4 py-2 text-sm text-zinc-200 transition-colors hover:bg-zinc-800"
      >
        다시 시도
      </button>
    </div>
  );
}
