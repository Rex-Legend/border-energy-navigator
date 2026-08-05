import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, Sun, Wind, Zap } from "lucide-react";
import { useRef } from "react";

export function Hero({ onExplore }: { onExplore: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const mapY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const iconsY = useTransform(scrollYProgress, [0, 1], ["0%", "70%"]);
  const gridY = useTransform(scrollYProgress, [0, 1], ["0%", "45%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "120%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-bei-forest-deep"
    >
      {/* Layer 1 — atmospheric wash */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_20%_0%,color-mix(in_oklab,var(--bei-forest)_85%,transparent),transparent_70%)]" />

      {/* Layer 2 — grid lines */}
      <motion.div
        style={{ y: gridY }}
        aria-hidden
        className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(color-mix(in_oklab,var(--bei-gold)_45%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_oklab,var(--bei-gold)_45%,transparent)_1px,transparent_1px)] [background-size:72px_72px]"
      />

      {/* Layer 3 — world map outline */}
      <motion.div style={{ y: mapY }} aria-hidden className="absolute inset-0 flex items-center">
        <svg
          viewBox="0 0 1000 500"
          className="h-auto w-full opacity-25"
          fill="none"
          stroke="var(--bei-gold)"
          strokeWidth="1.1"
        >
          <path d="M120 180c30-40 90-70 150-60s90 60 140 55 70-45 120-40 80 50 130 45 60-40 110-35" />
          <path d="M80 250c60-25 120 10 180 5s100-45 160-30 90 65 150 60 90-55 150-45 110 50 170 35" />
          <path d="M140 330c50-30 110 5 170-5s110-50 170-35 80 60 140 55 100-45 160-30" />
          <ellipse cx="500" cy="250" rx="430" ry="200" strokeDasharray="6 10" />
          <ellipse cx="500" cy="250" rx="300" ry="200" strokeDasharray="6 10" />
        </svg>
      </motion.div>

      {/* Layer 4 — floating energy icons */}
      <motion.div style={{ y: iconsY }} aria-hidden className="absolute inset-0">
        <Sun className="float-slow absolute top-[18%] left-[12%] size-12 text-bei-gold/70" />
        <Wind
          className="float-slow absolute top-[62%] left-[22%] size-10 text-bei-gold/50"
          style={{ animationDelay: "1.4s" }}
        />
        <Zap
          className="float-slow absolute top-[28%] right-[16%] size-11 text-bei-gold/60"
          style={{ animationDelay: "0.7s" }}
        />
        <Sun
          className="float-slow absolute bottom-[16%] right-[26%] size-9 text-bei-gold/40"
          style={{ animationDelay: "2.1s" }}
        />
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 mx-auto max-w-3xl px-6 text-center"
      >
        <motion.span
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full border border-bei-gold/40 bg-bei-gold/10 px-4 py-1.5 text-xs font-semibold tracking-[0.18em] text-bei-gold uppercase"
        >
          IGEN Energathon 2026
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-6 font-display text-5xl leading-[1.05] font-bold text-balance-tight text-bei-cream sm:text-6xl md:text-7xl"
        >
          Border Energy Index
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mx-auto mt-6 max-w-xl text-base text-balance-tight text-bei-cream/75 sm:text-lg"
        >
          Mapping Energy Without Borders — SDG7 Cross-Border Trade Feasibility
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={onExplore}
          className="mt-10 inline-flex items-center gap-2 rounded-full bg-bei-gold px-7 py-3.5 text-sm font-semibold text-bei-forest-deep shadow-lg shadow-black/30"
        >
          Explore Trade Feasibility
          <ArrowDown className="size-4" />
        </motion.button>
      </motion.div>

      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background" />
    </section>
  );
}
