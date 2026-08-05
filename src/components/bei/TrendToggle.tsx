import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Switch } from "@/components/ui/switch";
import { getIntensityHistory, type HistoryPoint } from "@/lib/energy.functions";

export function TrendToggle({ zone, beiScore }: { zone: string; beiScore: number }) {
  const fetchHistory = useServerFn(getIntensityHistory);
  const [enabled, setEnabled] = useState(false);
  const [points, setPoints] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || points.length) return;
    let cancelled = false;
    setLoading(true);
    fetchHistory({ data: { zone } })
      .then((res) => {
        if (cancelled) return;
        setPoints(res.points);
        if (!res.ok) setMessage(res.message ?? "Trend data unavailable.");
        else if (!res.points.length) setMessage("No trend data returned for this zone.");
      })
      .catch((e: Error) => !cancelled && setMessage(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [enabled, zone, points.length, fetchHistory]);

  const holds = beiScore >= 50;

  return (
    <div className="glass-dark rounded-3xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-lg font-bold text-bei-cream">Show 24-Hour Trend</h3>
          <p className="text-sm text-bei-cream/55">
            Live grid carbon intensity for India ({zone})
          </p>
        </div>
        <Switch checked={enabled} onCheckedChange={setEnabled} aria-label="Show 24-hour trend" />
      </div>

      {enabled ? (
        <div className="mt-6">
          {loading ? (
            <div className="h-56 animate-pulse rounded-2xl bg-bei-cream/10" />
          ) : points.length ? (
            <>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                    <XAxis
                      dataKey="time"
                      stroke="rgba(255,255,255,0.45)"
                      fontSize={11}
                      tickLine={false}
                      minTickGap={24}
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.45)"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#0A1128",
                        border: "1px solid rgba(255,201,60,0.4)",
                        borderRadius: 12,
                        color: "#F7F5EE",
                      }}
                      formatter={(v: number) => [`${v} gCO₂/kWh`, "Carbon intensity"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="carbonIntensity"
                      stroke="#FFC93C"
                      strokeWidth={2.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-4 text-sm text-bei-cream/65">
                {holds
                  ? "Even accounting for daily grid variability, this pairing’s feasibility holds — BEI stays above 50 across the trend range."
                  : "Across the trend range the BEI stays below 50 — daily grid variability alone does not rescue this pairing."}
              </p>
            </>
          ) : (
            <p className="text-sm text-bei-cream/55">{message ?? "No data."}</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
