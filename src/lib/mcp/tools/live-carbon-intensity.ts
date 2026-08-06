import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { countryZoneConfig } from "@/lib/countries";

type RuntimeGlobals = typeof globalThis & {
  process?: { env?: Record<string, string | undefined> };
};

const COUNTRY_NAMES = Object.keys(countryZoneConfig) as [string, ...string[]];

export default defineTool({
  name: "live_carbon_intensity",
  title: "Live grid carbon intensity",
  description:
    "Fetch the latest live grid carbon intensity (gCO2/kWh) for one of the six tracked countries.",
  inputSchema: {
    country: z.enum(COUNTRY_NAMES).describe("Country name, e.g. 'India', 'Germany'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: false, openWorldHint: true },
  handler: async ({ country }) => {
    const config = countryZoneConfig[country];
    if (!config) throw new ToolError(`Unknown country "${country}".`);
    const key = (globalThis as RuntimeGlobals).process?.env?.[config.keyEnv];
    if (!key) throw new ToolError(`Live grid data is not configured for ${country}.`);

    const res = await fetch(
      `https://api.electricitymap.org/v3/carbon-intensity/latest?zone=${encodeURIComponent(config.zone)}`,
      { headers: { "auth-token": key } },
    );
    if (!res.ok)
      throw new ToolError(`Electricity Maps returned ${res.status} for zone "${config.zone}".`);
    const json = (await res.json()) as {
      carbonIntensity?: number;
      datetime?: string;
      updatedAt?: string;
    };
    const payload = {
      country,
      zone: config.zone,
      carbonIntensity: json.carbonIntensity ?? null,
      datetime: json.datetime ?? json.updatedAt ?? null,
    };
    return {
      content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
