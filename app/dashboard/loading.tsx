export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-32 rounded bg-zinc-800" />
        <div className="h-4 w-64 rounded bg-zinc-900" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="h-24 rounded-xl border border-zinc-800 bg-zinc-900/60" />
        <div className="h-24 rounded-xl border border-zinc-800 bg-zinc-900/60" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="h-28 rounded-xl border border-zinc-800 bg-zinc-900/60" />
        <div className="h-28 rounded-xl border border-zinc-800 bg-zinc-900/60" />
        <div className="h-28 rounded-xl border border-zinc-800 bg-zinc-900/60" />
      </div>
    </div>
  );
}
