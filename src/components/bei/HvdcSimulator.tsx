import { ArrowRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { AnimatedNumber } from "./motion-primitives";
import type { BeiResult } from "@/lib/bei-calculations";

function Column({ title, result, tone }: { title: string; result: BeiResult; tone: string }) {
  return (
    <div className="glass-dark rounded-2xl p-5">
      <div className={`text-[11px] tracking-[0.16em] uppercase ${tone}`}>{title}</div>
      <div className="mt-3 font-display text-4xl font-bold text-bei-cream">
        <AnimatedNumber value={result.beiScore} decimals={1} />
      </div>
      <dl className="mt-4 space-y-1.5 text-sm text-bei-cream/65">
        <div className="flex justify-between">
          <dt>Loss</dt>
          <dd>{result.lossPercent.toFixed(1)}%</dd>
        </div>
        <div className="flex justify-between">
          <dt>Deliverable</dt>
          <dd>{result.deliverableEnergy.toFixed(2)} TWh</dd>
        </div>
        <div className="flex justify-between">
          <dt>Feasibility</dt>
          <dd>{result.feasibilityScore.toFixed(2)}</dd>
        </div>
      </dl>
    </div>
  );
}

export function HvdcSimulator({
  enabled,
  onToggle,
  current,
  simulated,
}: {
  enabled: boolean;
  onToggle: (v: boolean) => void;
  current: BeiResult;
  simulated: BeiResult;
}) {
  const delta = simulated.beiScore - current.beiScore;

  return (
    <div className="glass-dark rounded-3xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-lg font-bold text-bei-cream">
            Simulate: Advanced HVDC Transmission (−50% loss)
          </h3>
          <p className="text-sm text-bei-cream/55">
            Demonstrates policy case for transmission infrastructure investment
          </p>
        </div>
        <Switch checked={enabled} onCheckedChange={onToggle} aria-label="Simulate HVDC" />
      </div>

      {enabled ? (
        <div className="mt-6 grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
          <Column title="Current" result={current} tone="text-bei-cream/55" />
          <div className="flex flex-col items-center gap-2 text-bei-gold">
            <ArrowRight className="size-6" />
            <span className="font-display text-lg font-bold">
              {delta >= 0 ? "+" : ""}
              {delta.toFixed(1)} pts
            </span>
            <span className="text-xs text-bei-cream/50">with improved infrastructure</span>
          </div>
          <Column title="Simulated HVDC" result={simulated} tone="text-bei-gold" />
        </div>
      ) : null}
    </div>
  );
}
