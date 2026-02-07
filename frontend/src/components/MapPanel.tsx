import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Polyline, Popup } from "react-leaflet";
import { Segment } from "../api/assets";
import { Link } from "react-router-dom";

function colorFor(metric: string, v?: number) {
  if (v == null || Number.isNaN(v)) return "#334155"; // slate-700
  if (metric === "alarm") return v > 0 ? "#b91c1c" : "#15803d";
  // generic gradient-ish
  if (v > 0.8) return "#1d4ed8";
  if (v > 0.5) return "#0284c7";
  if (v > 0.2) return "#0f766e";
  return "#334155";
}

export function MapPanel({
  segments,
  metric,
  metricLookup,
}: {
  segments: Segment[];
  metric: string;
  metricLookup: Record<string, number | undefined>;
}) {
  const center: [number, number] = [28.65, 77.1];

  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden h-[70vh]">
      <MapContainer center={center} zoom={11} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {segments.map((s) => {
          const coords = s.geometry.coordinates.map((c) => [c[1], c[0]] as [number, number]); // lat,lng
          const v = metricLookup[s.id];
          return (
            <Polyline
              key={s.id}
              positions={coords}
              pathOptions={{ color: colorFor(metric, v), weight: 6, opacity: 0.85 }}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold">{s.name}</div>
                  <div className="text-slate-600">Metric: {metric} = {v ?? "—"}</div>
                  <div className="mt-2">
                    <Link className="text-slate-900 underline" to={`/segments/${s.id}`}>Open details</Link>
                  </div>
                </div>
              </Popup>
            </Polyline>
          );
        })}
      </MapContainer>
    </div>
  );
}
