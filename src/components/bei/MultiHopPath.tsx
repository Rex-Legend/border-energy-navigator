import { motion } from "framer-motion";
import { useState } from "react";
import { Route as RouteIcon } from "lucide-react";
import { bestRelayPath, type BeiResult, type RelayPath } from "@/lib/bei-calculations";
import type { Country } from "@/lib/countries";

/**
 * Multi-hop suggestion. Only offered when the direct corridor scores below 50.
 */
export function MultiHopPath({ result, countries }: { result: BeiResult; countries: Country[] }) {
  const [path, setPath] = useState<RelayPath | null | "none">(null);

  if (result.beiScore >= 50) return null;

  const search = () => {
    const best = bestRelayPath(result.countryA, result.countryB, countries);
    setPath(best && best.score > result.beiScore ? best : "none");
  };

  return (
    <div className="glass-dark rounded-3xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-lg font-bold text-bei-cream">Multi-hop trade path</h3>
          <p className="text-sm text-bei-cream/55">
            This direct corridor scores below 50 — a relay country may improve it.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={search}
          className="inline-flex items-center gap-2 rounded-full bg-bei-gold px-5 py-2.5 text-sm font-semibold text-bei-forest-deep"
        >
          <RouteIcon className="size-4" />
          Suggest better path
        </motion.button>
      </div>

      {path === "none" ? (
        <p className="mt-5 text-sm text-bei-cream/65">
          No 3-country relay beats the direct corridor for this pairing.
        </p>
      ) : path ? (
        <div className="mt-5 rounded-2xl border border-bei-gold/30 bg-bei-gold/10 p-5">
          <p className="font-display text-lg font-bold text-bei-cream">
            Direct: {result.beiScore.toFixed(1)} vs via {path.via.flag} {path.via.name}:{" "}
            {path.score.toFixed(1)}
          </p>
          <p className="mt-2 text-sm text-bei-cream/65">
            {result.countryA.name} → {path.via.name} scores {path.legOne.beiScore.toFixed(1)}, and{" "}
            {path.via.name} → {result.countryB.name} scores {path.legTwo.beiScore.toFixed(1)}.
          </p>
        </div>
      ) : null}
    </div>
  );
}
