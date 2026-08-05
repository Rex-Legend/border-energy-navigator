import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { Globe2, Leaf } from "lucide-react";
import { Hero } from "@/components/bei/Hero";
import { CountrySelector } from "@/components/bei/CountrySelector";
import { ResultsPanel } from "@/components/bei/ResultsPanel";
import { ScenarioSliders, type ScenarioState } from "@/components/bei/ScenarioSliders";
import { TrendToggle } from "@/components/bei/TrendToggle";
import { PolicyInsight } from "@/components/bei/PolicyInsight";
import { BestPairs } from "@/components/bei/BestPairs";
import { ComparisonMode } from "@/components/bei/ComparisonMode";
import { HvdcSimulator } from "@/components/bei/HvdcSimulator";
import { WhitePaper } from "@/components/bei/WhitePaper";
import { Reveal } from "@/components/bei/motion-primitives";
import { calculateBei } from "@/lib/bei-calculations";
import { COUNTRIES, getCountry } from "@/lib/countries";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Border Energy Index — Cross-Border Energy Trade Feasibility" },
      {
        name: "description",
        content:
          "Score cross-border electricity trade between six nations: BEI feasibility, transmission losses, live grid data and AI policy insight for SDG7.",
      },
      { property: "og:title", content: "Border Energy Index — Cross-Border Energy Trade Feasibility" },
      {
        property: "og:description",
        content:
          "Score cross-border electricity trade between six nations: BEI feasibility, transmission losses, live grid data and AI policy insight for SDG7.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const toolRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const [selectedA, setSelectedA] = useState<string | null>("BR");
  const [selectedB, setSelectedB] = useState<string | null>("IN");
  const [committed, setCommitted] = useState<{ a: string; b: string } | null>(null);
  const [scenario, setScenario] = useState<ScenarioState | null>(null);
  const [hvdc, setHvdc] = useState(false);
  const [insight, setInsight] = useState("");

  const handleMapSelect = (id: string) => {
    if (selectedA && !selectedB && id !== selectedA) return setSelectedB(id);
    if (selectedA && selectedB) {
      setSelectedA(id);
      setSelectedB(null);
      return;
    }
    setSelectedA(id);
  };

  const handlePick = (role: "A" | "B", id: string) =>
    role === "A" ? setSelectedA(id) : setSelectedB(id);

  const baseResult = useMemo(() => {
    if (!committed) return null;
    return calculateBei(getCountry(committed.a), getCountry(committed.b));
  }, [committed]);

  const handleCalculate = () => {
    if (!selectedA || !selectedB || selectedA === selectedB) return;
    const pair = { a: selectedA, b: selectedB };
    const fresh = calculateBei(getCountry(pair.a), getCountry(pair.b));
    setCommitted(pair);
    setScenario({
      lossPercent: Number(fresh.lossPercent.toFixed(1)),
      renewableShare: fresh.countryA.renewable,
      priceGapMultiplier: 1,
    });
    setInsight("");
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  const activeResult = useMemo(() => {
    if (!committed || !scenario) return null;
    return calculateBei(getCountry(committed.a), getCountry(committed.b), {
      lossPercent: scenario.lossPercent,
      renewableShare: scenario.renewableShare,
      priceGapMultiplier: scenario.priceGapMultiplier,
    });
  }, [committed, scenario]);

  const hvdcResult = useMemo(() => {
    if (!committed || !scenario) return null;
    return calculateBei(getCountry(committed.a), getCountry(committed.b), {
      lossPercent: scenario.lossPercent / 2,
      renewableShare: scenario.renewableShare,
      priceGapMultiplier: scenario.priceGapMultiplier,
    });
  }, [committed, scenario]);

  const displayResult = hvdc && hvdcResult ? hvdcResult : activeResult;

  const resetScenario = () => {
    if (!baseResult) return;
    setScenario({
      lossPercent: Number(baseResult.lossPercent.toFixed(1)),
      renewableShare: baseResult.countryA.renewable,
      priceGapMultiplier: 1,
    });
  };

  const handleSelectPair = (a: string, b: string) => {
    setSelectedA(a);
    setSelectedB(b);
    const fresh = calculateBei(getCountry(a), getCountry(b));
    setCommitted({ a, b });
    setScenario({
      lossPercent: Number(fresh.lossPercent.toFixed(1)),
      renewableShare: fresh.countryA.renewable,
      priceGapMultiplier: 1,
    });
    setInsight("");
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
  };

  const handleInsight = useCallback((text: string) => setInsight(text), []);

  const indiaInvolved =
    committed?.a === "IN" || committed?.b === "IN" ? COUNTRIES.find((c) => c.id === "IN") : null;

  return (
    <main className="font-sans">
      <Hero onExplore={() => toolRef.current?.scrollIntoView({ behavior: "smooth" })} />

      {/* --- Selector --- */}
      <section ref={toolRef} className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <Reveal>
          <span className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
            Step 01
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold text-balance-tight text-foreground sm:text-4xl">
            Select a trade corridor
          </h2>
        </Reveal>
        <Reveal delay={0.1} className="mt-8">
          <CountrySelector
            selectedA={selectedA}
            selectedB={selectedB}
            onSelect={handleMapSelect}
            onPick={handlePick}
            onCalculate={handleCalculate}
          />
        </Reveal>
      </section>

      {/* --- Results / scenarios / AI --- */}
      <section ref={resultsRef} className="bg-bei-navy py-20 sm:py-28">
        <div className="mx-auto max-w-6xl space-y-14 px-6">
          {displayResult && activeResult && hvdcResult && scenario ? (
            <>
              <Reveal>
                <span className="text-xs font-semibold tracking-[0.2em] text-bei-gold uppercase">
                  Step 02 — Feasibility
                </span>
                <h2 className="mt-3 font-display text-3xl font-bold text-bei-cream sm:text-4xl">
                  Border Energy Index result
                </h2>
              </Reveal>

              <Reveal>
                <ResultsPanel result={displayResult} />
              </Reveal>

              <Reveal>
                <ScenarioSliders
                  state={scenario}
                  onChange={(next) => setScenario((prev) => (prev ? { ...prev, ...next } : prev))}
                  onReset={resetScenario}
                />
              </Reveal>

              <Reveal>
                <HvdcSimulator
                  enabled={hvdc}
                  onToggle={setHvdc}
                  current={activeResult}
                  simulated={hvdcResult}
                />
              </Reveal>

              {indiaInvolved ? (
                <Reveal>
                  <TrendToggle zone="IN" beiScore={displayResult.beiScore} />
                </Reveal>
              ) : null}

              <Reveal>
                <PolicyInsight result={displayResult} onInsight={handleInsight} />
              </Reveal>
            </>
          ) : (
            <div className="py-10 text-center">
              <Globe2 className="mx-auto size-10 text-bei-gold/70" />
              <h2 className="mt-4 font-display text-2xl font-bold text-bei-cream">
                Pick two countries and hit Calculate
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-bei-cream/60">
                Feasibility, transmission losses, scenario sliders and the AI policy insight all
                appear here.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* --- Recommender --- */}
      <section className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <Reveal>
          <BestPairs onSelectPair={handleSelectPair} />
        </Reveal>
      </section>

      {/* --- Comparison --- */}
      <section className="bg-secondary/40 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <ComparisonMode />
          </Reveal>
        </div>
      </section>

      {/* --- White paper --- */}
      <section className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        {displayResult ? (
          <Reveal>
            <WhitePaper result={displayResult} insight={insight} />
          </Reveal>
        ) : (
          <p className="text-sm text-muted-foreground">
            Run a calculation to generate the white paper excerpt.
          </p>
        )}
      </section>

      <footer className="bg-bei-forest-deep py-14">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-bei-gold/40 bg-bei-gold/10 px-4 py-1.5 text-xs font-semibold text-bei-gold">
            <Leaf className="size-3.5" />
            Contributing to SDG7: Affordable and Clean Energy
          </div>
          <p className="font-display text-lg font-bold text-bei-cream">
            Built for IGEN Energathon 2026 — Energy Without Borders for Sustainable Communities
          </p>
          <p className="text-xs text-bei-cream/50">
            Dataset: latest published national figures; India grid intensity via Electricity Maps.
          </p>
        </div>
      </footer>
    </main>
  );
}
