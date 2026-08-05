import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";

type RuntimeGlobals = typeof globalThis & {
  process?: { env?: Record<string, string | undefined> };
};

function apiKey(): string {
  const key = (globalThis as RuntimeGlobals).process?.env?.["ELECTRICITYMAPS_API_KEY"];
  if (!key) throw new ToolError("Live grid data is not configured for this app.");
  return key;
}

export default defineTool({
  name: "live_carbon_intensity",
  title: "Live grid carbon intensity",
  description:
    "Fetch the latest live grid carbon intensity (gCO2/kWh) for an Electricity Maps zone code, e.g. 'IN-SO'.",
  inputSchema: {
    zone: z.string().describe("Electricity Maps zone code, e.g. 'IN-SO', 'DE', 'BR'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: false, openWorldHint: true },
  handler: async ({ zone }) => {
    const res = await fetch(
      `https://api.electricitymap.org/v3/carbon-intensity/latest?zone=${encodeURIComponent(zone)}`,
      { headers: { "auth-token": apiKey() } },
    );
    if (!res.ok) throw new ToolError(`Electricity Maps returned ${res.status} for zone "${zone}".`);
    const json = (await res.json()) as {
      carbonIntensity?: number;
      datetime?: string;
      updatedAt?: string;
    };
    const payload = {
      zone,
      carbonIntensity: json.carbonIntensity ?? null,
      datetime: json.datetime ?? json.updatedAt ?? null,
    };
    return {
      content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
