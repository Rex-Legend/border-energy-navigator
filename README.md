# Energy Bridge

Build "Border Energy Index (BEI)" — an interactive Cross-Border Energy Trade 
Feasibility platform for "Energy Without Borders," a global SDG7 energy 
policy initiative, built for IGEN Energathon 2026.

=== VISUAL THEME ===
- Modern sustainability/climate-tech aesthetic: deep forest green (#0B3D2E), 
  bright energy yellow/gold (#FFC93C) accent, clean white space, dark navy 
  (#0A1128) for data sections
- Hero section with PARALLAX scrolling — background layers (world map 
  outline, floating solar panel/wind turbine/power line icons) move at 
  different speeds on scroll
- Smooth scroll-triggered fade-in animations per section
- Glassmorphism cards (frosted glass, soft shadows) for all data panels
- Animated counting numbers when results load (BEI score, kWh values count 
  up from 0)
- Micro-interactions: hover scale on buttons, pulsing "LIVE" badges
- Fully responsive, mobile-friendly
- Bold modern sans-serif headings, clean readable body text

=== PAGE STRUCTURE ===

1. HERO SECTION (parallax)
   - Title: "Border Energy Index"
   - Subtitle: "Mapping Energy Without Borders — SDG7 Cross-Border Trade 
     Feasibility"
   - CTA: "Explore Trade Feasibility" (smooth scroll to tool)

2. INTERACTIVE WORLD MAP SELECTOR
   - Use Leaflet.js for a clickable world map instead of plain dropdowns
   - Preloaded markers for 6 countries: Germany, India, Kenya, Brazil, USA, 
     Australia
   - User clicks two markers to select Country A and Country B (selected 
     markers highlight in gold, with a connecting line drawn between them 
     that animates on selection)
   - Fallback dropdown selectors beside the map for accessibility/mobile

   PRELOADED DATA (hardcoded JSON):
   Germany: price 0.37, renewable 46%, lat 51.16, long 10.45, surplus +15 TWh, confidence High
   India: price 0.088, renewable 23%, lat 20.59, long 78.96, surplus -20 TWh, confidence Medium, LIVE via Electricity Maps API
   Kenya: price 0.14, renewable 90%, lat -0.02, long 37.90, surplus +5 TWh, confidence Medium
   Brazil: price 0.213, renewable 84%, lat -14.24, long -51.93, surplus +30 TWh, confidence High
   USA: price 0.17, renewable 21%, lat 37.09, long -95.71, surplus -10 TWh, confidence High
   Australia: price 0.28, renewable 35%, lat -25.27, long 133.78, surplus +8 TWh, confidence Medium

   SPECIAL CASE: India's carbon intensity and renewable % should fetch live 
   from Electricity Maps API (GET https://api.electricitymap.org/v3/
   carbon-intensity/latest?zone=ZONE_CODE, header "auth-token": stored as 
   env variable ELECTRICITYMAPS_API_KEY). Show a pulsing green "LIVE" badge 
   with timestamp on India's card. All other countries show "Latest 
   Published Data" label instead.

   CONFIDENCE BADGES: Each country card shows a small color-coded badge — 
   green "High confidence" / yellow "Medium confidence" / red "Low 
   confidence" — based on the confidence field in the dataset.

3. CALCULATION ENGINE (triggered on "Calculate" button)
   - Haversine formula for distance_km between selected countries
   - Transmission loss% = (distance_km / 1000) × 7%
   - Deliverable Energy = Surplus_A × (1 - loss%)
   - Price Gap = Price_B - Price_A
   - Feasibility Score = (Price_Gap × Deliverable_Energy) - (distance_km × 0.001)
   - Border Energy Index (BEI) = 40% feasibility + 30% deliverable energy 
     volume + 30% renewable share of surplus, normalized to 0-100
   - Results shown in animated glass cards with a circular progress ring 
     for the BEI score, smooth scroll to results on calculate

4. "WHAT-IF" SENSITIVITY SLIDERS
   - Below the results, add three interactive sliders:
     a) Transmission Loss % (range 0-20%, default = calculated value)
     b) Renewable Share of Surplus % (range 0-100%, default = dataset value)
     c) Price Gap Multiplier (range 0.5x-2x, default 1x)
   - As user drags any slider, the BEI score and all dependent numbers 
     recalculate LIVE with smooth number transition animation (no page 
     reload, no button click needed)
   - Label this section "Test Different Scenarios" with a small reset 
     button to restore original calculated values

5. HISTORICAL TREND TOGGLE (for India's live data only)
   - A toggle switch: "Show 24-Hour Trend"
   - When enabled, fetch https://api.electricitymap.org/v3/carbon-intensity/
     history?zone=ZONE_CODE and render a small line chart (recharts) 
     showing carbon intensity over the past 24 hours
   - Caption below: "Even accounting for daily grid variability, this 
     pairing's feasibility holds" (dynamically show if BEI stays above/
     below 50 across the trend range)

6. AI POLICY INSIGHT (Gemini integration)
   - Call Gemini API (gemini-2.0-flash) after calculation with this prompt, 
     injecting live calculated values:

   "You are an energy policy analyst contributing to a UN-facing white 
   paper on SDG7 titled 'Energy Without Borders.' Given this cross-border 
   energy trade feasibility data between {countryA} and {countryB}: 
   surplus/deficit {surplusA}/{surplusB} TWh, distance {distance}km, 
   transmission loss {lossPercent}%, deliverable energy {deliverableEnergy} 
   TWh, price gap ${priceGap}/kWh, renewable share {renewableShare}%, BEI 
   score {beiScore}/100 — write a formal 3-4 sentence policy insight: (1) 
   feasibility verdict citing BEI score and primary driver, (2) main 
   barrier or enabler, (3) one specific actionable policy recommendation. 
   Under 80 words, flowing prose, no bullet points."

   - Display in a styled quote-card with typing animation
   - Re-run automatically whenever sliders change (debounced, so it doesn't 
     spam the API on every drag — only fires 1 second after user stops 
     adjusting)
   - Gemini API key stored as env variable, not hardcoded

7. BEST PAIR RECOMMENDER
   - Button: "Find Best Trade Opportunity Across All Pairs"
   - Runs BEI calculation across all possible pairs in the 6-country dataset
   - Top 3 shown in leaderboard cards with medal icons (), BEI score, 
     and one-line reason

8. COMPARISON MODE (multi-select, 3+ countries)
   - Checkbox multi-select allowing user to pick 3-6 countries at once
   - Renders a RADAR CHART (recharts) comparing all selected countries 
     across: renewable share, price, surplus/deficit, BEI potential — all 
     normalized to 0-100 scale
   - Also show a simple bar chart comparing BEI scores of all pairs formed 
     from the selection, color-coded by continent

9. SCENARIO SIMULATOR
   - Toggle: "Simulate: Advanced HVDC Transmission (-50% loss)"
   - When enabled, recalculates ALL current results using half the normal 
     transmission loss rate, showing a side-by-side "Current vs Simulated" 
     comparison with the BEI score difference highlighted (e.g., "+18 
     points with improved infrastructure")
   - Add a short caption: "Demonstrates policy case for transmission 
     infrastructure investment"

10. EXPORT / WHITE PAPER SECTION
    - Button: "Generate White Paper Excerpt" — compiles calculated data + 
      AI insight into a clean formatted document preview (styled like a 
      formal white paper excerpt with headers, data table, and the AI 
      insight paragraph)
    - "Download as PDF" button (use browser print-to-PDF or jsPDF library)

11. FOOTER
    - "Built for IGEN Energathon 2026 — Energy Without Borders for 
      Sustainable Communities"
    - SDG7 icon + "Contributing to SDG7: Affordable and Clean Energy"

=== TECHNICAL NOTES ===
- React + Tailwind CSS
- recharts for bar/radar/line charts
- Leaflet.js (react-leaflet) for the interactive map
- framer-motion for parallax, fade-ins, and number-counting animations
- Debounce slider-triggered Gemini calls (1 second delay after last change)
- Calculation logic in a separate, clearly commented utils file
- Both GEMINI_API_KEY and ELECTRICITYMAPS_API_KEY should be requested as 
  environment variables/secrets, never hardcoded in visible code
- Loading skeleton animations while API calls (Gemini, Electricity Maps) 
  are in progress

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://border-energy-navigator.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e1d1e411-f22a-4098-aeb6-5078eeac82d7).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
