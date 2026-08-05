import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip } from "react-leaflet";
import { COUNTRIES } from "@/lib/countries";
import "leaflet/dist/leaflet.css";

interface Props {
  selectedA: string | null;
  selectedB: string | null;
  onSelect: (id: string) => void;
}

export default function CountryMap({ selectedA, selectedB, onSelect }: Props) {
  const a = COUNTRIES.find((c) => c.id === selectedA);
  const b = COUNTRIES.find((c) => c.id === selectedB);

  return (
    <MapContainer
      center={[18, 20]}
      zoom={1}
      minZoom={1}
      scrollWheelZoom={false}
      worldCopyJump
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; CARTO'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      {a && b ? (
        <Polyline
          positions={[
            [a.lat, a.lng],
            [b.lat, b.lng],
          ]}
          pathOptions={{
            color: "#FFC93C",
            weight: 3,
            dashArray: "10 12",
            className: "bei-trade-line",
          }}
        />
      ) : null}

      {COUNTRIES.map((country) => {
        const isA = country.id === selectedA;
        const isB = country.id === selectedB;
        const selected = isA || isB;
        return (
          <CircleMarker
            key={country.id}
            center={[country.lat, country.lng]}
            radius={selected ? 12 : 8}
            pathOptions={{
              color: selected ? "#FFC93C" : "#5BC98C",
              fillColor: selected ? "#FFC93C" : "#0B3D2E",
              fillOpacity: selected ? 0.95 : 0.65,
              weight: selected ? 4 : 2,
            }}
            eventHandlers={{ click: () => onSelect(country.id) }}
          >
            <Tooltip direction="top" offset={[0, -8]} opacity={1}>
              <span className="font-semibold">
                {country.flag} {country.name}
              </span>
              {isA ? " — Exporter (A)" : isB ? " — Importer (B)" : ""}
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
