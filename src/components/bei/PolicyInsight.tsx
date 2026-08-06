import { useServerFn } from "@tanstack/react-start";
import { Quote, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getPolicyInsight } from "@/lib/energy.functions";
import type { BeiResult } from "@/lib/bei-calculations";

function Skeleton() {
  return (
    <div className="space-y-3">
      {[100, 96, 88, 60].map((w) => (
        <div
          key={w}
          className="h-3.5 animate-pulse rounded-full bg-bei-cream/15"
          style={{ width: `${w}%` }}
        />
      ))}
    </div>
  );
}

/** Types out text one character at a time. */
function useTypewriter(text: string, speed = 14) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    setShown("");
    if (!text) return;
    let i = 0;
    const id = setInterval(() => {
      i += 2;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return shown;
}

export function PolicyInsight({
  result,
  onInsight,
}: {
  result: BeiResult;
  onInsight?: (text: string) => void;
}) {

  const fetchInsight = useServerFn(getPolicyInsight);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const {
    countryA,
    countryB,
    distanceKm,
    lossPercent,
    deliverableEnergy,
    priceGap,
    renewableShare,
    beiScore,
  } = result;

  useEffect(() => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);

    // Debounce: only fire 1s after the user stops adjusting sliders.
    const timer = setTimeout(async () => {
      try {
        const response = await fetchInsight({
          data: {
            countryA: countryA.name,
            countryB: countryB.name,
            surplusA: countryA.surplus,
            surplusB: countryB.surplus,
            distance: distanceKm,
            lossPercent,
            deliverableEnergy,
            priceGap,
            renewableShare,
            beiScore,
          },
        });
        if (id !== requestId.current) return;
        if (response.ok && response.text) {
          setText(response.text);
          onInsight?.(response.text);
        }
        else setError(response.message ?? "No insight returned.");
      } catch (e) {
        if (id === requestId.current) setError((e as Error).message);
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    fetchInsight,
    onInsight,
    countryA,
    countryB,
    distanceKm,
    lossPercent,
    deliverableEnergy,
    priceGap,
    renewableShare,
    beiScore,
  ]);

  const typed = useTypewriter(text);

  return (
    <div className="glass-dark relative overflow-hidden rounded-3xl p-8">
      <Quote className="absolute -top-3 -left-3 size-24 text-bei-gold/10" />
      <div className="relative">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-bei-gold uppercase">
          <Sparkles className="size-4" />
          AI Policy Insight
        </div>

        <div className="mt-5 min-h-[7rem]">
          {loading ? (
            <Skeleton />
          ) : error ? (
            <p className="text-sm text-bei-cream/60">{error}</p>
          ) : (
            <p className="font-display text-lg leading-relaxed text-bei-cream/90">
              {typed}
              <span className="ml-0.5 inline-block h-5 w-0.5 animate-pulse bg-bei-gold align-middle" />
            </p>
          )}
        </div>

        <p className="mt-5 text-xs text-bei-cream/45">
          Generated for the SDG7 policy white paper — refreshed automatically when
          scenario inputs change.
        </p>
      </div>
    </div>
  );
}
