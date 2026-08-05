import { lazy, Suspense, useEffect, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { Calculator } from "lucide-react";
import { ConfidenceBadge, LiveBadge, PublishedBadge } from "./badges";
import { COUNTRIES, type Country } from "@/lib/countries";
import { getLiveIntensity, type LiveIntensity } from "@/lib/energy.functions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CountryMap = lazy(() => import("./CountryMap"));

function MapSkeleton() {
  return <div className="h-full w-full animate-pulse rounded-3xl bg-bei-navy/80" />;
}

function CountryCard({
  country,
  role,
  live,
  liveLoading,
}: {
  country: Country;
  role: "A" | "B";
  live?: LiveIntensity | null;
  liveLoading?: boolean;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-3xl p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            Country {role} — {role === "A" ? "Exporter" : "Importer"}
          </div>
          <div className="mt-1 font-display text-2xl font-bold text-foreground">
            {country.flag} {country.name}
          </div>
        </div>
        {country.liveZone ? (
          liveLoading ? (
            <span className="h-5 w-20 animate-pulse rounded-full bg-muted" />
          ) : (
            <LiveBadge timestamp={live?.datetime} />
          )
        ) : (
          <PublishedBadge />
        )}
      </div>

      <dl className="mt-5 grid grid-cols-3 gap-3 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">Price</dt>
          <dd className="font-display text-lg font-bold text-foreground">
            ${country.price.toFixed(3)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Renewable</dt>
          <dd className="font-display text-lg font-bold text-foreground">{country.renewable}%</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Balance</dt>
          <dd className="font-display text-lg font-bold text-foreground">
            {country.surplus > 0 ? "+" : ""}
            {country.surplus} TWh
          </dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <ConfidenceBadge confidence={country.confidence} />
        {country.liveZone && live?.ok && live.carbonIntensity ? (
          <span className="text-xs text-muted-foreground">
            {live.carbonIntensity} gCO₂/kWh live grid intensity
          </span>
        ) : null}
        {country.liveZone && live && !live.ok ? (
          <span className="text-xs text-muted-foreground">{live.message}</span>
        ) : null}
      </div>
    </motion.div>
  );
}

export function CountrySelector({
  selectedA,
  selectedB,
  onSelect,
  onPick,
  onCalculate,
}: {
  selectedA: string | null;
  selectedB: string | null;
  onSelect: (id: string) => void;
  onPick: (role: "A" | "B", id: string) => void;
  onCalculate: () => void;
}) {
  const fetchLive = useServerFn(getLiveIntensity);
  const [live, setLive] = useState<LiveIntensity | null>(null);
  const [liveLoading, setLiveLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchLive({ data: { zone: "IN" } })
      .then((res) => !cancelled && setLive(res))
      .catch((e: Error) => !cancelled && setLive({ ok: false, message: e.message }))
      .finally(() => !cancelled && setLiveLoading(false));
    return () => {
      cancelled = true;
    };
  }, [fetchLive]);

  const countryA = COUNTRIES.find((c) => c.id === selectedA) ?? null;
  const countryB = COUNTRIES.find((c) => c.id === selectedB) ?? null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
      <div className="h-[380px] overflow-hidden rounded-3xl border border-border shadow-sm sm:h-[460px]">
        <ClientOnly fallback={<MapSkeleton />}>
          <Suspense fallback={<MapSkeleton />}>
            <CountryMap selectedA={selectedA} selectedB={selectedB} onSelect={onSelect} />
          </Suspense>
        </ClientOnly>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Click two markers on the map — the first becomes the exporter, the second the importer — or
          use the selectors below.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          {(["A", "B"] as const).map((role) => (
            <div key={role}>
              <label className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                Country {role}
              </label>
              <Select
                value={(role === "A" ? selectedA : selectedB) ?? ""}
                onValueChange={(value) => onPick(role, value)}
              >
                <SelectTrigger className="mt-1.5 w-full bg-card">
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.flag} {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        {countryA ? (
          <CountryCard country={countryA} role="A" live={live} liveLoading={liveLoading} />
        ) : null}
        {countryB ? (
          <CountryCard country={countryB} role="B" live={live} liveLoading={liveLoading} />
        ) : null}

        <motion.button
          whileHover={{ scale: countryA && countryB ? 1.03 : 1 }}
          whileTap={{ scale: 0.98 }}
          disabled={!countryA || !countryB || countryA.id === countryB.id}
          onClick={onCalculate}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Calculator className="size-4" />
          Calculate Feasibility
        </motion.button>
      </div>
    </div>
  );
}
