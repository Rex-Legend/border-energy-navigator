import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Globe2 } from "lucide-react";
import { Hero } from "@/components/bei/Hero";
import { Abstract } from "@/components/bei/Abstract";
import { SiteHeader } from "@/components/bei/SiteHeader";
import { LiveGridProvider, resolveIntensity, useLiveGrid } from "@/components/bei/LiveGridProvider";
import { ContinentFilter } from "@/components/bei/ContinentFilter";
import { CountrySelector } from "@/components/bei/CountrySelector";
import { ResultsPanel } from "@/components/bei/ResultsPanel";
import { ScenarioSliders, type ScenarioState } from "@/components/bei/ScenarioSliders";
import { TrendToggle } from "@/components/bei/TrendToggle";
import { PolicyInsight } from "@/components/bei/PolicyInsight";
import { BestPairs } from "@/components/bei/BestPairs";
import { ComparisonMode } from "@/components/bei/ComparisonMode";
import { HvdcSimulator } from "@/components/bei/HvdcSimulator";
import { MultiHopPath } from "@/components/bei/MultiHopPath";
import { WhitePaper } from "@/components/bei/WhitePaper";
import { Reveal } from "@/components/bei/motion-primitives";
import { calculateBei } from "@/lib/bei-calculations";
import { CONTINENTS, COUNTRIES, getCountry } from "@/lib/countries";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Border Energy Index — Cross-Border Energy Trade Feasibility" },
      {
        name: "description",
        content:
          "Score cross-border electricity trade between six nations: BEI feasibility, transmission losses, live grid data and AI policy insight for SDG7.",
      },
      {
        property: "og:title",
        content: "Border Energy Index — Cross-Border Energy Trade Feasibility",
      },
      {
        property: "og:description",
        content:
          "Score cross-border electricity trade between six nations: BEI feasibility, transmission losses, live grid data and AI policy insight for SDG7.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: IndexPage,
});

function IndexPage() {
  return (
    <LiveGridProvider>
      <SiteHeader />
      <Index />
    </LiveGridProvider>
  );
}

function Index() {
  const toolRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const { data: liveData } = useLiveGrid();

  const [continents, setContinents] = useState<string[]>([...CONTINENTS]);
  const [selectedA, setSelectedA] = useState<string | null>("BR");
  const [selectedB, setSelectedB] = useState<string | null>("IN");
  const [committed, setCommitted] = useState<{ a: string; b: string } | null>(null);
  const [scenario, setScenario] = useState<ScenarioState | null>(null);
  const [hvdc, setHvdc] = useState(false);
  const [insight, setInsight] = useState("");

  const visibleCountries = useMemo(
    () => COUNTRIES.filter((c) => continents.includes(c.continent)),
    [continents],
  );

  const commitPair = useCallback((a: string, b: string) => {
    const fresh = calculateBei(getCountry(a), getCountry(b));
    setSelectedA(a);
    setSelectedB(b);
    setCommitted({ a, b });
    setScenario({
      lossPercent: Number(fresh.lossPercent.toFixed(1)),
      renewableShare: fresh.countryA.renewable,
      priceGapMultiplier: 1,
    });
    setInsight("");
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  }, []);

  // --- Shared link: ?a=India&b=Kenya auto-selects and scrolls to results ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const a = params.get("a");
    const b = params.get("b");
    if (!a || !b) return;
    const match = (value: string) =>
      COUNTRIES.find(
        (c) => c.name.toLowerCase() === value.toLowerCase() || c.id.toLowerCase() === value.toLowerCase(),
      );
    const ca = match(a);
    const cb = match(b);
    if (ca && cb && ca.id !== cb.id) commitPair(ca.id, cb.id);
  }, [commitPair]);

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
    commitPair(selectedA, selectedB);
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

  const handleInsight = useCallback((text: string) => setInsight(text), []);

  const intensities = displayResult
    ? {
        exporter: resolveIntensity(
          displayResult.countryA.name,
          displayResult.countryA.baseIntensity,
          liveData,
        ),
        importer: resolveIntensity(
          displayResult.countryB.name,
          displayResult.countryB.baseIntensity,
          liveData,
        ),
      }
    : null;

  return (
    <main className="font-sans">
      <Hero onExplore={() => toolRef.current?.scrollIntoView({ behavior: "smooth" })} />

      <Abstract />

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
        <Reveal delay={0.05} className="mt-6">
          <ContinentFilter active={continents} onChange={setContinents} />
        </Reveal>
        <Reveal delay={0.1} className="mt-8">
          <CountrySelector
            selectedA={selectedA}
            selectedB={selectedB}
            onSelect={handleMapSelect}
            onPick={handlePick}
            onCalculate={handleCalculate}
            countries={visibleCountries}
          />
        </Reveal>
      </section>

      {/* --- Results / scenarios / AI --- */}
      <section ref={resultsRef} className="bg-bei-navy py-20 sm:py-28">
        <div className="mx-auto max-w-6xl space-y-14 px-6">
          {displayResult && activeResult && hvdcResult && scenario && intensities ? (
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
                <ResultsPanel
                  result={displayResult}
                  exporterIntensity={intensities.exporter.value}
                  importerIntensity={intensities.importer.value}
                  intensityIsLive={intensities.exporter.live && intensities.importer.live}
                />
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

              <Reveal>
                <MultiHopPath result={displayResult} countries={COUNTRIES} />
              </Reveal>

              <Reveal>
                <TrendToggle
                  countryName={displayResult.countryA.name}
                  zone={displayResult.countryA.liveZone}
                  beiScore={displayResult.beiScore}
                />
              </Reveal>

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
          <BestPairs onSelectPair={commitPair} countries={visibleCountries} />
        </Reveal>
      </section>

      {/* --- Comparison --- */}
      <section className="bg-secondary/40 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <ComparisonMode countries={visibleCountries} />
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

      <footer className="bg-bei-forest-deep py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-6 text-center">
          <p className="font-display text-lg font-bold text-bei-cream">Border Energy Index</p>
          <p className="text-sm text-bei-cream/60">
            Cross-Border Renewable Energy Trade Feasibility Analysis
          </p>
        </div>
      </footer>
    </main>
  );
}
