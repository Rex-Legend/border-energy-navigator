import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { Check, ImageDown, Share2 } from "lucide-react";
import { AnimatedNumber } from "./motion-primitives";
import { emissionsAvoidedTonnes, type BeiResult } from "@/lib/bei-calculations";

function ring(score: number) {
  const radius = 74;
  const circumference = 2 * Math.PI * radius;
  return { radius, circumference, offset: circumference * (1 - score / 100) };
}

export function BeiRing({ score }: { score: number }) {
  const { radius, circumference, offset } = ring(score);
  const verdict = score >= 66 ? "Strong case" : score >= 40 ? "Conditional" : "Weak case";

  return (
    <div className="relative grid size-48 place-items-center">
      <svg viewBox="0 0 180 180" className="absolute size-48 -rotate-90">
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          className="text-bei-cream/15"
        />
        <motion.circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="var(--bei-gold)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="text-center">
        <div className="font-display text-5xl font-bold text-bei-cream">
          <AnimatedNumber value={score} decimals={1} />
        </div>
        <div className="text-xs tracking-[0.2em] text-bei-cream/60 uppercase">BEI / 100</div>
        <div className="mt-1 text-xs font-semibold text-bei-gold">{verdict}</div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  decimals,
  prefix,
  suffix,
  hint,
}: {
  label: string;
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  hint?: string;
}) {
  return (
    <div className="glass-dark rounded-2xl p-5">
      <div className="text-[11px] tracking-[0.16em] text-bei-cream/55 uppercase">{label}</div>
      <div className="mt-2 font-display text-2xl font-bold text-bei-cream">
        <AnimatedNumber
          value={value}
          decimals={decimals ?? 0}
          prefix={prefix ?? ""}
          suffix={suffix ?? ""}
        />
      </div>
      {hint ? <div className="mt-1 text-xs text-bei-cream/50">{hint}</div> : null}
    </div>
  );
}

export function ResultsPanel({
  result,
  exporterIntensity,
  importerIntensity,
  intensityIsLive,
}: {
  result: BeiResult;
  exporterIntensity: number;
  importerIntensity: number;
  intensityIsLive: boolean;
}) {
  const captureRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  // Emissions avoided uses live grid intensities where available.
  const tonnes = emissionsAvoidedTonnes(
    result.deliverableEnergy,
    exporterIntensity,
    importerIntensity,
  );

  const share = async () => {
    const url = `${window.location.origin}${window.location.pathname}?a=${encodeURIComponent(
      result.countryA.name,
    )}&b=${encodeURIComponent(result.countryB.name)}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copy this link", url);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const downloadImage = async () => {
    if (!captureRef.current) return;
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(captureRef.current, {
      backgroundColor: "#0A1128",
      scale: 2,
      useCORS: true,
    });
    const link = document.createElement("a");
    link.download = `BEI-${result.countryA.id}-${result.countryB.id}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="space-y-6">
      <div ref={captureRef} className="rounded-3xl bg-bei-navy p-2 sm:p-4">
        <div className="grid gap-8 lg:grid-cols-[auto_1fr] lg:items-center">
          <div className="flex flex-col items-center gap-3">
            <BeiRing score={result.beiScore} />
            <p className="max-w-[16rem] text-center text-sm text-bei-cream/65">
              {result.countryA.flag} {result.countryA.name} → {result.countryB.flag}{" "}
              {result.countryB.name}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Stat label="Distance" value={result.distanceKm} suffix=" km" />
            <Stat
              label="Transmission loss"
              value={result.lossPercent}
              decimals={1}
              suffix="%"
              hint="7% per 1,000 km baseline"
            />
            <Stat
              label="Deliverable energy"
              value={result.deliverableEnergy}
              decimals={2}
              suffix=" TWh"
            />
            <Stat label="Price gap" value={result.priceGap} decimals={3} prefix="$" hint="per kWh" />
            <Stat label="Feasibility score" value={result.feasibilityScore} decimals={2} />
            <Stat
              label="Renewable share"
              value={result.renewableShare}
              decimals={0}
              suffix="%"
              hint="of exported surplus"
            />
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-bei-leaf/30 bg-bei-leaf/10 p-5">
          <div className="text-[11px] tracking-[0.16em] text-bei-cream/60 uppercase">
            Estimated emissions avoided by this trade
          </div>
          <div className="mt-2 font-display text-3xl font-bold text-bei-leaf">
            <AnimatedNumber value={Math.round(tonnes)} decimals={0} suffix=" tCO₂" />
          </div>
          <p className="mt-1 text-xs text-bei-cream/55">
            {result.deliverableEnergy.toFixed(2)} TWh × ({Math.round(importerIntensity)} −{" "}
            {Math.round(exporterIntensity)} gCO₂/kWh) ·{" "}
            {intensityIsLive ? "live grid intensities" : "latest published intensities"}
            {tonnes < 0 ? " · importing grid is already cleaner" : ""}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={share}
          className="inline-flex items-center gap-2 rounded-full border border-bei-cream/25 px-5 py-2.5 text-sm font-semibold text-bei-cream"
        >
          {copied ? <Check className="size-4" /> : <Share2 className="size-4" />}
          {copied ? "Link copied" : "Share this pairing"}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={downloadImage}
          className="inline-flex items-center gap-2 rounded-full bg-bei-gold px-5 py-2.5 text-sm font-semibold text-bei-forest-deep"
        >
          <ImageDown className="size-4" />
          Download as Image
        </motion.button>
      </div>
    </div>
  );
}
