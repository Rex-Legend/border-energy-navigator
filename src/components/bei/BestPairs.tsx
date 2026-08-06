import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { useState } from "react";
import { AnimatedNumber } from "./motion-primitives";
import { COUNTRIES, type Country } from "@/lib/countries";
import { pairReason, rankAllPairs, type BeiResult } from "@/lib/bei-calculations";

const MEDALS = ["🥇", "🥈", "🥉"];

export function BestPairs({
  onSelectPair,
  countries,
}: {
  onSelectPair: (a: string, b: string) => void;
  countries?: Country[];
}) {
  const pool = countries ?? COUNTRIES;
  const [top, setTop] = useState<BeiResult[] | null>(null);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-2xl font-bold text-foreground">
            Best Trade Opportunities
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Scores every viable exporter-importer pair in the dataset.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setTop(rankAllPairs(pool).slice(0, 3))}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          <Trophy className="size-4" />
          Find Best Trade Opportunity Across All Pairs
        </motion.button>
      </div>

      {top ? (
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {top.map((result, index) => (
            <motion.button
              key={`${result.countryA.id}-${result.countryB.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.12, duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => onSelectPair(result.countryA.id, result.countryB.id)}
              className="glass rounded-3xl p-6 text-left"
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl">{MEDALS[index]}</span>
                <span className="font-display text-3xl font-bold text-primary">
                  <AnimatedNumber value={result.beiScore} decimals={1} />
                </span>
              </div>
              <div className="mt-4 font-display text-lg font-bold text-foreground">
                {result.countryA.flag} {result.countryA.name} → {result.countryB.flag}{" "}
                {result.countryB.name}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{pairReason(result)}</p>
              <span className="mt-4 inline-block text-xs font-semibold text-accent-foreground/70">
                Load this pair →
              </span>
            </motion.button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
