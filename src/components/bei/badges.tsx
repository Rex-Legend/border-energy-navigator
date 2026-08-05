import type { Confidence } from "@/lib/countries";
import { cn } from "@/lib/utils";

const CONFIDENCE_STYLES: Record<Confidence, string> = {
  High: "bg-bei-leaf/15 text-bei-leaf border-bei-leaf/40",
  Medium: "bg-bei-gold/20 text-bei-amber border-bei-gold/50",
  Low: "bg-destructive/15 text-destructive border-destructive/40",
};

export function ConfidenceBadge({
  confidence,
  className,
}: {
  confidence: Confidence;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide",
        CONFIDENCE_STYLES[confidence],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {confidence} confidence
    </span>
  );
}

export function LiveBadge({ timestamp }: { timestamp?: string | undefined }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-bei-leaf/50 bg-bei-leaf/15 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-bei-leaf">
      <span className="pulse-live size-1.5 rounded-full bg-bei-leaf" />
      LIVE
      {timestamp ? (
        <span className="font-normal opacity-80">
          {new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      ) : null}
    </span>
  );
}

export function PublishedBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-0.5 text-[11px] font-medium tracking-wide text-muted-foreground">
      Latest Published Data
    </span>
  );
}
