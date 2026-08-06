import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { COUNTRIES } from "@/lib/countries";
import { getLiveIntensity, type LiveIntensity } from "@/lib/energy.functions";

/** Client-side cache TTL — keeps free-tier API quota intact across renders. */
const CACHE_TTL_MS = 5 * 60 * 1000;

const cache = new Map<string, { at: number; value: LiveIntensity }>();

export interface LiveGridState {
  /** Keyed by country name. */
  data: Record<string, LiveIntensity>;
  loading: boolean;
  liveCount: number;
  total: number;
}

const LiveGridContext = createContext<LiveGridState>({
  data: {},
  loading: true,
  liveCount: 0,
  total: COUNTRIES.length,
});

export function LiveGridProvider({ children }: { children: ReactNode }) {
  const fetchLive = useServerFn(getLiveIntensity);
  const [data, setData] = useState<Record<string, LiveIntensity>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const now = Date.now();

    /** Never let a slow/hung upstream call keep the badge in "checking" state. */
    const withTimeout = (p: Promise<LiveIntensity>, ms = 8000) =>
      Promise.race([
        p,
        new Promise<LiveIntensity>((resolve) =>
          setTimeout(() => resolve({ ok: false, message: "Live feed timed out" }), ms),
        ),
      ]);

    void Promise.all(
      COUNTRIES.map(async (country) => {
        const hit = cache.get(country.name);
        if (hit && now - hit.at < CACHE_TTL_MS) {
          if (!cancelled) setData((prev) => ({ ...prev, [country.name]: hit.value }));
          return;
        }
        let value: LiveIntensity;
        try {
          value = await withTimeout(fetchLive({ data: { country: country.name } }));
          if (value.ok) cache.set(country.name, { at: Date.now(), value });
        } catch (error) {
          value = { ok: false, message: (error as Error).message };
        }
        // Settle each country independently so one slow zone can't block the rest.
        if (!cancelled) setData((prev) => ({ ...prev, [country.name]: value }));
      }),
    ).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [fetchLive]);


  const value = useMemo<LiveGridState>(
    () => ({
      data,
      loading,
      liveCount: Object.values(data).filter((d) => d.ok && d.carbonIntensity != null).length,
      total: COUNTRIES.length,
    }),
    [data, loading],
  );

  return <LiveGridContext.Provider value={value}>{children}</LiveGridContext.Provider>;
}

export function useLiveGrid() {
  return useContext(LiveGridContext);
}

/** Live intensity when available, otherwise the country's published figure. */
export function resolveIntensity(
  countryName: string,
  fallback: number,
  data: Record<string, LiveIntensity>,
): { value: number; live: boolean } {
  const entry = data[countryName];
  if (entry?.ok && typeof entry.carbonIntensity === "number")
    return { value: entry.carbonIntensity, live: true };
  return { value: fallback, live: false };
}
