/**
 * Border Energy Index (BEI) calculation engine.
 *
 * Pure functions only — no React, no DOM, no network. Every UI surface
 * (results panel, what-if sliders, HVDC simulator, best-pair recommender and
 * comparison charts) calls into this file so a single formula change
 * propagates everywhere.
 */

import type { Country } from "./countries";

/** Earth mean radius in kilometres. */
const EARTH_RADIUS_KM = 6371;

/** Base transmission loss: 7% for every 1000 km of line. */
export const BASE_LOSS_PER_1000KM = 7;

/**
 * Practical ceiling on transmission loss. Raw distance-based loss can exceed
 * 100% on intercontinental spans, which is physically meaningless; real
 * corridors are capped by HVDC engineering limits, so we cap at 20% — the
 * same range offered by the what-if slider.
 */
export const MAX_LOSS_PERCENT = 20;

/** Normalisation bounds used to map the raw feasibility score onto 0-100. */
const FEASIBILITY_MIN = -20;
const FEASIBILITY_MAX = 10;

/** Deliverable volume (TWh) that counts as a "full score" volume. */
const VOLUME_REFERENCE_TWH = 30;

const toRad = (deg: number) => (deg * Math.PI) / 180;

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/** Great-circle distance between two lat/long points (Haversine formula). */
export function haversineDistanceKm(
  latA: number,
  lngA: number,
  latB: number,
  lngB: number,
): number {
  const dLat = toRad(latB - latA);
  const dLng = toRad(lngB - lngA);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(latA)) * Math.cos(toRad(latB)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

/** Transmission loss percentage implied purely by distance. */
export function transmissionLossPercent(distanceKm: number, lossPer1000km = BASE_LOSS_PER_1000KM) {
  return (distanceKm / 1000) * lossPer1000km;
}

export interface BeiOverrides {
  /** Override the transmission loss percentage (what-if slider a). */
  lossPercent?: number;
  /** Override the renewable share of the exported surplus (slider b). */
  renewableShare?: number;
  /** Multiply the raw price gap (slider c). */
  priceGapMultiplier?: number;
  /** Multiplier on the base loss rate — 0.5 for the HVDC scenario. */
  lossRateMultiplier?: number;
}

export interface BeiResult {
  countryA: Country;
  countryB: Country;
  distanceKm: number;
  /** Loss rate actually used, in percent. */
  lossPercent: number;
  /** Loss rate implied by distance alone, in percent. */
  baseLossPercent: number;
  deliverableEnergy: number;
  priceGap: number;
  feasibilityScore: number;
  renewableShare: number;
  beiScore: number;
  components: {
    feasibility: number;
    volume: number;
    renewable: number;
  };
}

/**
 * Full BEI computation for an ordered pair (A exports to B).
 *
 * Steps:
 *  1. distance          — Haversine
 *  2. loss %            — (distance / 1000) x 7%   (override-able)
 *  3. deliverable       — surplus_A x (1 - loss%)
 *  4. price gap         — price_B - price_A        (x multiplier)
 *  5. feasibility       — (gap x deliverable) - (distance x 0.001)
 *  6. BEI               — 40% feasibility + 30% volume + 30% renewable share
 */
export function calculateBei(
  countryA: Country,
  countryB: Country,
  overrides: BeiOverrides = {},
): BeiResult {
  const distanceKm = haversineDistanceKm(countryA.lat, countryA.lng, countryB.lat, countryB.lng);

  const baseLossPercent = clamp(
    transmissionLossPercent(distanceKm, BASE_LOSS_PER_1000KM * (overrides.lossRateMultiplier ?? 1)),
    0,
    MAX_LOSS_PERCENT,
  );
  const lossPercent = clamp(overrides.lossPercent ?? baseLossPercent, 0, MAX_LOSS_PERCENT);

  const deliverableEnergy = countryA.surplus * (1 - lossPercent / 100);
  const priceGap = (countryB.price - countryA.price) * (overrides.priceGapMultiplier ?? 1);
  const feasibilityScore = priceGap * deliverableEnergy - distanceKm * 0.001;
  const renewableShare = clamp(overrides.renewableShare ?? countryA.renewable, 0, 100);

  // --- Normalise each component onto 0-100 -------------------------------
  const feasibilityNorm =
    (clamp(feasibilityScore, FEASIBILITY_MIN, FEASIBILITY_MAX) - FEASIBILITY_MIN) /
    (FEASIBILITY_MAX - FEASIBILITY_MIN);
  const volumeNorm = clamp(deliverableEnergy / VOLUME_REFERENCE_TWH, 0, 1);
  const renewableNorm = renewableShare / 100;

  const beiScore = clamp(
    (0.4 * feasibilityNorm + 0.3 * volumeNorm + 0.3 * renewableNorm) * 100,
    0,
    100,
  );

  return {
    countryA,
    countryB,
    distanceKm,
    lossPercent,
    baseLossPercent,
    deliverableEnergy,
    priceGap,
    feasibilityScore,
    renewableShare,
    beiScore,
    components: {
      feasibility: feasibilityNorm * 100,
      volume: volumeNorm * 100,
      renewable: renewableNorm * 100,
    },
  };
}

/** Every ordered pair from the dataset, ranked by BEI descending. */
export function rankAllPairs(countries: Country[]): BeiResult[] {
  const results: BeiResult[] = [];
  for (const a of countries) {
    for (const b of countries) {
      if (a.id === b.id) continue;
      // Only exporters (positive surplus) can meaningfully sell power.
      if (a.surplus <= 0) continue;
      results.push(calculateBei(a, b));
    }
  }
  return results.sort((x, y) => y.beiScore - x.beiScore);
}

/** Short human explanation of what drives a pair's score. */
export function pairReason(result: BeiResult): string {
  const { countryA, countryB, priceGap, deliverableEnergy, distanceKm } = result;
  if (priceGap > 0.15)
    return `Wide $${priceGap.toFixed(3)}/kWh price gap makes ${countryB.name} a premium buyer.`;
  if (deliverableEnergy > 15)
    return `${deliverableEnergy.toFixed(1)} TWh still lands after losses over ${Math.round(distanceKm).toLocaleString()} km.`;
  if (countryA.renewable > 70)
    return `${countryA.renewable}% renewable surplus keeps the exported mix nearly carbon-free.`;
  return `Balanced pairing: ${Math.round(distanceKm).toLocaleString()} km with a $${priceGap.toFixed(3)}/kWh margin.`;
}

/** Normalised 0-100 metrics used by the comparison radar chart. */
export function normalisedProfile(country: Country, all: Country[]) {
  const maxPrice = Math.max(...all.map((c) => c.price));
  const maxSurplus = Math.max(...all.map((c) => Math.abs(c.surplus)));
  const bestPair = rankAllPairs(all).find((r) => r.countryA.id === country.id);
  return {
    country: country.name,
    "Renewable share": country.renewable,
    "Price level": (country.price / maxPrice) * 100,
    "Export capacity": clamp(((country.surplus + maxSurplus) / (2 * maxSurplus)) * 100, 0, 100),
    "BEI potential": bestPair ? bestPair.beiScore : 0,
  };
}

// ---------------------------------------------------------------------------
// Additional calculations (emissions avoided, multi-hop relay, trade window)
// ---------------------------------------------------------------------------

/**
 * Estimated CO2 avoided (tonnes) if the trade happens.
 *
 *   tonnes = deliverableEnergy (TWh) x (CI_importer - CI_exporter) (gCO2/kWh) x 1000
 *
 * 1 TWh at 1 gCO2/kWh equals 1e9 g, i.e. 1,000 tonnes. A negative result means
 * the importing grid is already cleaner than the exporting grid.
 */
export function emissionsAvoidedTonnes(
  deliverableEnergyTwh: number,
  exporterIntensity: number,
  importerIntensity: number,
): number {
  return deliverableEnergyTwh * (importerIntensity - exporterIntensity) * 1000;
}

export interface RelayPath {
  via: Country;
  /** Combined BEI of the A->C and C->B legs (mean of the two leg scores). */
  score: number;
  legOne: BeiResult;
  legTwo: BeiResult;
}

/**
 * Multi-hop trade path search. Evaluates every A -> C -> B relay across the
 * dataset and returns the best intermediate country, if any relay beats the
 * direct corridor. Relay score is the mean of the two leg BEI scores, so a hop
 * only wins when both legs are individually workable.
 */
export function bestRelayPath(
  countryA: Country,
  countryB: Country,
  all: Country[],
): RelayPath | null {
  let best: RelayPath | null = null;
  for (const via of all) {
    if (via.id === countryA.id || via.id === countryB.id) continue;
    const legOne = calculateBei(countryA, via);
    const legTwo = calculateBei(via, countryB);
    const score = (legOne.beiScore + legTwo.beiScore) / 2;
    if (!best || score > best.score) best = { via, score, legOne, legTwo };
  }
  return best;
}

export interface TradeWindow {
  startTime: string;
  endTime: string;
  averageIntensity: number;
}

/**
 * Time-of-day feasibility: finds the contiguous window (default 3 points) in
 * the last 24h with the lowest average exporting-country carbon intensity —
 * the moment the corridor would have been at its cleanest and most feasible.
 */
export function bestTradeWindow(
  points: { time: string; carbonIntensity: number }[],
  windowSize = 3,
): TradeWindow | null {
  if (points.length < windowSize) return null;
  let bestIndex = 0;
  let bestAvg = Infinity;
  for (let i = 0; i + windowSize <= points.length; i += 1) {
    const slice = points.slice(i, i + windowSize);
    const avg = slice.reduce((sum, p) => sum + p.carbonIntensity, 0) / windowSize;
    if (avg < bestAvg) {
      bestAvg = avg;
      bestIndex = i;
    }
  }
  return {
    startTime: points[bestIndex]!.time,
    endTime: points[bestIndex + windowSize - 1]!.time,
    averageIntensity: bestAvg,
  };
}
