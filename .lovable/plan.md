# Border Energy Index (BEI) — Cross-Border Energy Trade Feasibility Platform

A single-page interactive platform for "Energy Without Borders" (IGEN Energathon 2026): pick two countries on a world map, compute cross-border trade feasibility, stress-test it with sliders and scenarios, and export a white-paper excerpt with an AI policy insight.

## Visual direction

- Deep forest green `#0B3D2E`, energy gold `#FFC93C`, dark navy `#0A1128` data sections, generous white space — all defined as design tokens, not hardcoded classes.
- Parallax hero (world map outline + floating solar/wind/grid icons at different scroll speeds), scroll-triggered fade-ins, glassmorphism data cards, count-up numbers, hover scale, pulsing LIVE badge.
- Bold modern sans-serif headings, clean body text, fully responsive down to mobile.

## Sections (single page, anchored scroll)

1. Hero — title, SDG7 subtitle, "Explore Trade Feasibility" CTA.
2. World map selector — Leaflet map with 6 markers (Germany, India, Kenya, Brazil, USA, Australia); click two to select A/B, selected markers gold with an animated connecting arc; fallback dropdowns beside the map. Country cards show price, renewable %, surplus/deficit, and a color-coded confidence badge. India shows a pulsing green "LIVE" badge + timestamp; others show "Latest Published Data".
3. Calculation engine — Haversine distance, loss = (km/1000)x7%, deliverable energy, price gap, feasibility score, BEI (40/30/30 weighting) normalized 0–100. Results in glass cards with a circular BEI ring; smooth scroll to results.
4. "Test Different Scenarios" — three live sliders (loss %, renewable share %, price gap multiplier) recalculating everything with animated number transitions, plus reset.
5. 24-hour trend toggle for India — line chart of carbon intensity with a dynamic caption about whether BEI holds above/below 50.
6. AI policy insight — formal 3–4 sentence verdict in a quote card with typing animation, re-run debounced 1s after slider changes.
7. Best pair recommender — BEI across all 15 pairs, top 3 leaderboard cards with medals and one-line reasons.
8. Comparison mode — multi-select 3–6 countries, radar chart (renewable, price, surplus, BEI potential, normalized) plus a bar chart of pair BEI scores color-coded by continent.
9. Scenario simulator — "Advanced HVDC (-50% loss)" toggle with side-by-side Current vs Simulated and highlighted BEI delta.
10. Export — "Generate White Paper Excerpt" preview (headers, data table, AI paragraph) and "Download as PDF".
11. Footer — Energathon 2026 line + SDG7 badge.

## Technical approach

- Stack: React + TanStack Start, Tailwind v4 tokens, framer-motion, recharts, react-leaflet (client-only, dynamically imported so SSR doesn't break), jsPDF for export.
- All calculation logic in a commented `src/lib/bei-calculations.ts` — pure functions, no UI concerns, reused by the pair recommender, sliders, and simulator.
- Country dataset hardcoded in `src/lib/countries.ts` exactly as specified.
- Backend: Lovable Cloud enabled to hold secrets and run server functions. Two server functions:
  - Electricity Maps proxy (latest + 24h history for India) using an `ELECTRICITYMAPS_API_KEY` secret you'll be asked for.
  - AI policy insight, using Lovable AI (`openai/gpt-5.6-sol`) with the exact prompt text and injected values. This uses the built-in Lovable AI key, so no Gemini key is needed — same output contract, one less key to manage. If you'd rather use your own Gemini key, say so and I'll swap it.
- Loading skeletons for both API-backed panels; graceful fallback to published data if Electricity Maps fails.
- Debounced (1s) AI re-run on slider change.

## Notes

- Leaflet CSS is loaded via the root head link (not a CSS `@import`), per this stack's build rules.
- The map, charts, and PDF export are browser-only and gated behind hydration.
