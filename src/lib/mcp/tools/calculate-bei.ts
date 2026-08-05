import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { COUNTRIES } from "@/lib/countries";
import { calculateBei } from "@/lib/bei-calculations";

function find(id: string) {
  const match = COUNTRIES.find(
    (c) => c.id.toLowerCase() === id.toLowerCase() || c.name.toLowerCase() === id.toLowerCase(),
  );
  if (!match) {
    throw new ToolError(
      `Unknown country "${id}". Available: ${COUNTRIES.map((c) => `${c.id} (${c.name})`).join(", ")}`,
    );
  }
  return match;
}

export default defineTool({
  name: "calculate_bei",
  title: "Calculate Border Energy Index",
  description:
    "Compute the Border Energy Index for an exporter/importer country pair, including distance, transmission loss, deliverable energy, price gap and the weighted BEI score.",
  inputSchema: {
    exporter: z.string().describe("Exporting country ISO code or name, e.g. 'DE' or 'Germany'."),
    importer: z.string().describe("Importing country ISO code or name."),
    lossPercent: z.number().optional().describe("Override transmission loss percentage (0-20)."),
    renewableShare: z
      .number()
      .optional()
      .describe("Override renewable share of the exported surplus, percent."),
    priceGapMultiplier: z.number().optional().describe("Multiplier applied to the raw price gap."),
    hvdc: z.boolean().optional().describe("Simulate HVDC infrastructure (halves the loss rate)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ exporter, importer, lossPercent, renewableShare, priceGapMultiplier, hvdc }) => {
    const a = find(exporter);
    const b = find(importer);
    if (a.id === b.id) throw new ToolError("Exporter and importer must be different countries.");

    const result = calculateBei(a, b, {
      ...(lossPercent === undefined ? {} : { lossPercent }),
      ...(renewableShare === undefined ? {} : { renewableShare }),
      ...(priceGapMultiplier === undefined ? {} : { priceGapMultiplier }),
      ...(hvdc ? { lossRateMultiplier: 0.5 } : {}),
    });

    const summary = {
      exporter: a.name,
      importer: b.name,
      beiScore: Number(result.beiScore.toFixed(1)),
      distanceKm: Math.round(result.distanceKm),
      lossPercent: Number(result.lossPercent.toFixed(1)),
      deliverableEnergyTwh: Number(result.deliverableEnergy.toFixed(2)),
      priceGapUsdPerKwh: Number(result.priceGap.toFixed(3)),
      renewableSharePercent: Number(result.renewableShare.toFixed(1)),
      components: {
        feasibility: Number(result.components.feasibility.toFixed(1)),
        volume: Number(result.components.volume.toFixed(1)),
        renewable: Number(result.components.renewable.toFixed(1)),
      },
    };

    return {
      content: [{ type: "text" as const, text: JSON.stringify(summary, null, 2) }],
      structuredContent: summary,
    };
  },
});
