import { defineTool } from "@lovable.dev/mcp-js";
import { COUNTRIES } from "@/lib/countries";

export default defineTool({
  name: "list_countries",
  title: "List countries",
  description:
    "List every country in the Border Energy Index dataset with its price, renewable share, surplus, coordinates and data confidence.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const rows = COUNTRIES.map((c) => ({
      id: c.id,
      name: c.name,
      continent: c.continent,
      priceUsdPerKwh: c.price,
      renewablePercent: c.renewable,
      surplusTwh: c.surplus,
      confidence: c.confidence,
      liveZone: c.liveZone ?? null,
    }));
    return {
      content: [{ type: "text" as const, text: JSON.stringify(rows, null, 2) }],
      structuredContent: { countries: rows },
    };
  },
});
