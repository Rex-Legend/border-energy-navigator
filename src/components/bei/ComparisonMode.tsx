import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Checkbox } from "@/components/ui/checkbox";
import { calculateBei, normalisedProfile } from "@/lib/bei-calculations";
import { CONTINENT_COLORS, COUNTRIES } from "@/lib/countries";

const METRICS = ["Renewable share", "Price level", "Export capacity", "BEI potential"] as const;

const SERIES_COLORS = ["#FFC93C", "#5BC98C", "#6BB6E6", "#E8974A", "#9C8CE0", "#4FC3B0"];

export function ComparisonMode() {
  const [selected, setSelected] = useState<string[]>(["DE", "BR", "KE"]);

  const chosen = COUNTRIES.filter((c) => selected.includes(c.id));

  const radarData = useMemo(() => {
    const profiles = chosen.map((c) => normalisedProfile(c, COUNTRIES));
    return METRICS.map((metric) => {
      const row: Record<string, string | number> = { metric };
      profiles.forEach((p) => {
        row[p.country] = Math.round(p[metric]);
      });
      return row;
    });
  }, [chosen]);

  const barData = useMemo(() => {
    const rows: { label: string; bei: number; continent: string }[] = [];
    for (const a of chosen) {
      for (const b of chosen) {
        if (a.id === b.id || a.surplus <= 0) continue;
        rows.push({
          label: `${a.id}→${b.id}`,
          bei: Number(calculateBei(a, b).beiScore.toFixed(1)),
          continent: a.continent,
        });
      }
    }
    return rows.sort((x, y) => y.bei - x.bei);
  }, [chosen]);

  const toggle = (id: string) =>
    setSelected((prev) => {
      if (prev.includes(id)) return prev.length > 3 ? prev.filter((x) => x !== id) : prev;
      return prev.length < 6 ? [...prev, id] : prev;
    });

  return (
    <div>
      <h3 className="font-display text-2xl font-bold text-foreground">Compare 3–6 Countries</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Normalised profiles plus every pair BEI formed from your selection.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        {COUNTRIES.map((country) => (
          <label
            key={country.id}
            className="glass flex cursor-pointer items-center gap-2.5 rounded-full px-4 py-2 text-sm font-medium transition-transform hover:scale-105"
          >
            <Checkbox
              checked={selected.includes(country.id)}
              onCheckedChange={() => toggle(country.id)}
            />
            <span>
              {country.flag} {country.name}
            </span>
          </label>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-3xl p-6">
          <h4 className="text-sm font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Country profiles
          </h4>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="72%">
                <PolarGrid stroke="rgba(11,61,46,0.15)" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: "#4a5a52" }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#8a978f" }} />
                {chosen.map((country, index) => (
                  <Radar
                    key={country.id}
                    name={country.name}
                    dataKey={country.name}
                    stroke={SERIES_COLORS[index % SERIES_COLORS.length]}
                    fill={SERIES_COLORS[index % SERIES_COLORS.length]}
                    fillOpacity={0.18}
                    strokeWidth={2}
                  />
                ))}
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid rgba(11,61,46,0.15)",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-3xl p-6">
          <h4 className="text-sm font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Pair BEI scores (by exporter continent)
          </h4>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid stroke="rgba(11,61,46,0.1)" vertical={false} />
                <XAxis dataKey="label" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 100]} fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: "rgba(11,61,46,0.05)" }}
                  contentStyle={{ borderRadius: 12, border: "1px solid rgba(11,61,46,0.15)" }}
                />
                <Bar dataKey="bei" radius={[6, 6, 0, 0]}>
                  {barData.map((row) => (
                    <Cell
                      key={row.label}
                      fill={CONTINENT_COLORS[row.continent] ?? "var(--color-bei-forest)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
