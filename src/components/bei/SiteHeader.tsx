import { Activity } from "lucide-react";
import { useLiveGrid } from "./LiveGridProvider";

export function SiteHeader() {
  const { liveCount, total, loading } = useLiveGrid();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-bei-cream/10 bg-bei-forest-deep/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <span className="font-display text-sm font-bold tracking-tight text-bei-cream">
          Border Energy Index
        </span>
        <span
          className="inline-flex items-center gap-2 rounded-full border border-bei-leaf/50 bg-bei-leaf/15 px-3 py-1 text-[11px] font-semibold text-bei-leaf"
          title="Countries returning live grid data on the last fetch"
        >
          {loading ? (
            <Activity className="size-3 animate-pulse" />
          ) : (
            <span className="pulse-live size-1.5 rounded-full bg-bei-leaf" />
          )}
          {loading ? "checking zones…" : `${liveCount}/${total} zones live`}
        </span>
      </div>
    </header>
  );
}
