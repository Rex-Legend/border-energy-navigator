import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { COUNTRIES } from "@/lib/countries";
import { rankAllPairs, pairReason } from "@/lib/bei-calculations";

export default defineTool({
  name: "rank_trade_pairs",
  title: "Rank cross-border trade pairs",
  description:
    "Rank every viable exporter/importer pair in the dataset by Border Energy Index score, with a short feasibility rationale for each.",
  inputSchema: {
    limit: z.number().optional().describe("How many top pairs to return (default 5)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ limit }) => {
    const top = rankAllPairs(COUNTRIES)
      .slice(0, Math.max(1, Math.min(Math.round(limit ?? 5), 30)))
      .map((r, i) => ({
        rank: i + 1,
        exporter: r.countryA.name,
        importer: r.countryB.name,
        beiScore: Number(r.beiScore.toFixed(1)),
        distanceKm: Math.round(r.distanceKm),
        deliverableEnergyTwh: Number(r.deliverableEnergy.toFixed(2)),
        reason: pairReason(r),
      }));
    return {
      content: [{ type: "text" as const, text: JSON.stringify(top, null, 2) }],
      structuredContent: { pairs: top },
    };
  },
});
