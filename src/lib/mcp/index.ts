import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listCountries from "./tools/list-countries";
import calculateBeiTool from "./tools/calculate-bei";
import rankTradePairs from "./tools/rank-trade-pairs";
import liveCarbonIntensity from "./tools/live-carbon-intensity";

const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";

export default defineMcp({
  name: "energy-bridge",
  title: "Energy Bridge",
  version: "0.1.0",
  instructions:
    "Tools for the Border Energy Index (BEI), a cross-border energy trade feasibility platform. Use `list_countries` to see the dataset, `calculate_bei` to score an exporter/importer pair (with optional what-if overrides and an HVDC scenario), `rank_trade_pairs` to find the most feasible corridors, and `live_carbon_intensity` for live grid carbon data.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listCountries, calculateBeiTool, rankTradePairs, liveCarbonIntensity],
});
