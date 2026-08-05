import { RotateCcw } from "lucide-react";
import { Slider } from "@/components/ui/slider";

export interface ScenarioState {
  lossPercent: number;
  renewableShare: number;
  priceGapMultiplier: number;
}

function Control({
  label,
  value,
  display,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="glass-dark rounded-2xl p-5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-bei-cream/80">{label}</span>
        <span className="font-display text-lg font-bold text-bei-gold">{display}</span>
      </div>
      <Slider
        className="mt-5"
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0] ?? value)}
        aria-label={label}
      />
    </div>
  );
}

export function ScenarioSliders({
  state,
  onChange,
  onReset,
}: {
  state: ScenarioState;
  onChange: (next: Partial<ScenarioState>) => void;
  onReset: () => void;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-2xl font-bold text-bei-cream">
            Test Different Scenarios
          </h3>
          <p className="mt-1 text-sm text-bei-cream/60">
            Every number above recalculates live as you drag.
          </p>
        </div>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-full border border-bei-cream/20 px-4 py-2 text-xs font-semibold text-bei-cream/80 transition-transform hover:scale-105 hover:border-bei-gold/60 hover:text-bei-gold"
        >
          <RotateCcw className="size-3.5" />
          Reset
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Control
          label="Transmission loss"
          value={state.lossPercent}
          display={`${state.lossPercent.toFixed(1)}%`}
          min={0}
          max={20}
          step={0.1}
          onChange={(v) => onChange({ lossPercent: v })}
        />
        <Control
          label="Renewable share of surplus"
          value={state.renewableShare}
          display={`${state.renewableShare.toFixed(0)}%`}
          min={0}
          max={100}
          step={1}
          onChange={(v) => onChange({ renewableShare: v })}
        />
        <Control
          label="Price gap multiplier"
          value={state.priceGapMultiplier}
          display={`${state.priceGapMultiplier.toFixed(2)}x`}
          min={0.5}
          max={2}
          step={0.05}
          onChange={(v) => onChange({ priceGapMultiplier: v })}
        />
      </div>
    </div>
  );
}
