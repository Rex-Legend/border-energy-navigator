/**
 * Static country dataset for the Border Energy Index.
 * Browser-safe (no Leaflet / no server imports) so both the SSR route and the
 * lazily-loaded map component can import it.
 */

export type Confidence = "High" | "Medium" | "Low";

export interface Country {
  id: string;
  name: string;
  flag: string;
  continent: string;
  /** Retail electricity price in USD per kWh */
  price: number;
  /** Renewable share of generation, percent */
  renewable: number;
  lat: number;
  lng: number;
  /** Annual surplus (+) or deficit (-) in TWh */
  surplus: number;
  confidence: Confidence;
  /** Electricity Maps zone code — only set for countries with live data */
  liveZone?: string;
}

export const COUNTRIES: Country[] = [
  {
    id: "DE",
    name: "Germany",
    flag: "🇩🇪",
    continent: "Europe",
    price: 0.37,
    renewable: 46,
    lat: 51.16,
    lng: 10.45,
    surplus: 15,
    confidence: "High",
  },
  {
    id: "IN",
    name: "India",
    flag: "🇮🇳",
    continent: "Asia",
    price: 0.088,
    renewable: 23,
    lat: 20.59,
    lng: 78.96,
    surplus: -20,
    confidence: "Medium",
    liveZone: "IN",
  },
  {
    id: "KE",
    name: "Kenya",
    flag: "🇰🇪",
    continent: "Africa",
    price: 0.14,
    renewable: 90,
    lat: -0.02,
    lng: 37.9,
    surplus: 5,
    confidence: "Medium",
  },
  {
    id: "BR",
    name: "Brazil",
    flag: "🇧🇷",
    continent: "South America",
    price: 0.213,
    renewable: 84,
    lat: -14.24,
    lng: -51.93,
    surplus: 30,
    confidence: "High",
  },
  {
    id: "US",
    name: "USA",
    flag: "🇺🇸",
    continent: "North America",
    price: 0.17,
    renewable: 21,
    lat: 37.09,
    lng: -95.71,
    surplus: -10,
    confidence: "High",
  },
  {
    id: "AU",
    name: "Australia",
    flag: "🇦🇺",
    continent: "Oceania",
    price: 0.28,
    renewable: 35,
    lat: -25.27,
    lng: 133.78,
    surplus: 8,
    confidence: "Medium",
  },
];

export const CONTINENT_COLORS: Record<string, string> = {
  Europe: "var(--color-bei-gold)",
  Asia: "var(--color-bei-leaf)",
  Africa: "var(--color-bei-sky)",
  "South America": "var(--color-bei-forest)",
  "North America": "var(--color-bei-amber)",
  Oceania: "var(--color-bei-teal)",
};

export function getCountry(id: string): Country {
  const found = COUNTRIES.find((c) => c.id === id);
  if (!found) throw new Error(`Unknown country: ${id}`);
  return found;
}
