// src/pages/ThermalMapPage.tsx
import { useEffect, useMemo, useState } from "react";
import { Card } from "../components/Card";
import L from "leaflet";
import "leaflet.heat/dist/leaflet-heat.js";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  useMap,
  ZoomControl,
  CircleMarker,
  Tooltip,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { fetchWeatherNow } from "../api/weather";
import { geocodeCity } from "../api/geocode";

type MetricKey = "surface_temp" | "heat_captured" | "kw_net" | "soc" | "alarm";

const METRICS: { key: MetricKey; label: string }[] = [
  { key: "surface_temp", label: "Surface Temp" },
  { key: "heat_captured", label: "Heat Captured" },
  { key: "kw_net", label: "kW Net" },
  { key: "soc", label: "PCM SOC" },
  { key: "alarm", label: "Alarm State" },
];

function FitBounds({ fc }: { fc: FeatureCollection }) {
  const map = useMap();
  useEffect(() => {
    try {
      if (!fc?.features?.length) return;
      const layer = L.geoJSON(fc as any);
      const b = layer.getBounds();
      if (b.isValid()) map.fitBounds(b.pad(0.15));
    } catch {}
  }, [fc, map]);
  return null;
}

/**
 * Fix: map “dragging with the page”
 * - Disable interactions by default
 * - Enable only when mouse is inside map
 * - Keep wheel zoom disabled so page scroll stays clean
 */
function ScrollLockMap() {
  const map = useMap();

  useEffect(() => {
    map.scrollWheelZoom.disable();
    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();

    const enable = () => {
      map.dragging.enable();
      map.touchZoom.enable();
      map.doubleClickZoom.enable();
      map.boxZoom.enable();
      map.keyboard.enable();
      map.scrollWheelZoom.disable(); // keep disabled always
    };

    const disable = () => {
      map.dragging.disable();
      map.touchZoom.disable();
      map.doubleClickZoom.disable();
      map.boxZoom.disable();
      map.keyboard.disable();
      map.scrollWheelZoom.disable();
    };

    const container = map.getContainer();
    container.addEventListener("mouseenter", enable);
    container.addEventListener("mouseleave", disable);

    const onTouchStart = () => enable();
    const onTouchEnd = () => setTimeout(disable, 500);

    container.addEventListener("touchstart", onTouchStart, { passive: true });
    container.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      container.removeEventListener("mouseenter", enable);
      container.removeEventListener("mouseleave", disable);
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchend", onTouchEnd);
    };
  }, [map]);

  return null;
}

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

function colorFor(metric: MetricKey, v: number) {
  const t = clamp01(v);
  if (metric === "alarm") {
    if (t > 0.75) return "#e11d48";
    if (t > 0.4) return "#f59e0b";
    return "#10b981";
  }
  if (t < 0.5) return "#10b981";
  if (t < 0.8) return "#f59e0b";
  return "#e11d48";
}

function makeMetricValue(metric: MetricKey, seed: number) {
  const base = (Math.sin(seed * 999) + 1) / 2;
  if (metric === "surface_temp") return 0.35 + 0.6 * base;
  if (metric === "heat_captured") return 0.2 + 0.8 * base;
  if (metric === "kw_net") return 0.1 + 0.9 * base;
  if (metric === "soc") return 0.15 + 0.8 * base;
  return base;
}

function KpiPill({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
      <div className="text-[11px] font-medium text-slate-500">{label}</div>
      <div className="mt-0.5 flex items-baseline gap-1">
        <div className="text-sm font-semibold text-slate-900">{value}</div>
        {unit && <div className="text-[11px] text-slate-500">{unit}</div>}
      </div>
    </div>
  );
}

/** Get midpoint of a LineString (coords are [lon, lat]) */
function midpointOfLine(coords: number[][]) {
  if (!coords || coords.length < 2) return null;

  let total = 0;
  const segs: number[] = [];
  for (let i = 0; i < coords.length - 1; i++) {
    const d = Math.hypot(
      coords[i + 1][0] - coords[i][0],
      coords[i + 1][1] - coords[i][1]
    );
    segs.push(d);
    total += d;
  }

  if (total <= 0) {
    const [lon, lat] = coords[Math.floor(coords.length / 2)];
    return { lon, lat };
  }

  const half = total / 2;
  let acc = 0;
  for (let i = 0; i < segs.length; i++) {
    if (acc + segs[i] >= half) {
      const t = (half - acc) / segs[i];
      return {
        lon: coords[i][0] + (coords[i + 1][0] - coords[i][0]) * t,
        lat: coords[i][1] + (coords[i + 1][1] - coords[i][1]) * t,
      };
    }
    acc += segs[i];
  }

  const [lon, lat] = coords[coords.length - 1];
  return { lon, lat };
}

/** deterministic pseudo-random in [-1..1] */
function jitter(n: number) {
  const x = Math.sin(n * 9999) * 10000;
  return (x - Math.floor(x)) * 2 - 1;
}

/** Create demo road segments around a city (until backend geometry is wired) */
function generateRoadGridAroundCity(
  cityLabel: string,
  lat: number,
  lon: number,
  segments = 16
): FeatureCollection {
  const feats: Feature<LineString>[] = [];

  const dLat = 0.02;
  const dLon = 0.03;

  for (let i = 0; i < segments; i++) {
    const a = jitter(i + 1);
    const b = jitter(i + 17);

    const lat0 = lat + a * dLat;
    const lon0 = lon + b * dLon;

    const lat1 =
      lat0 +
      (0.008 + Math.abs(jitter(i + 33)) * 0.015) *
        (jitter(i + 99) > 0 ? 1 : -1);
    const lon1 =
      lon0 +
      (0.01 + Math.abs(jitter(i + 55)) * 0.02) *
        (jitter(i + 77) > 0 ? 1 : -1);

    const segNo = String(i + 1).padStart(2, "0");
const safeCity = cityLabel.toUpperCase().replace(/\s+/g, "-");

feats.push({
  type: "Feature",
  properties: {
    id: safeCity + "-SEG-" + segNo,
    name: "Segment " + segNo,
    zone: ["Zone A", "Zone B", "Zone C"][i % 3],
    _city: cityLabel,
  },
  geometry: {
    type: "LineString",
    coordinates: [
      [lon0, lat0],
      [lon1, lat1],
    ],
  },
});

  }

  return { type: "FeatureCollection", features: feats };
}

type HeatPoint = {
  id: string;
  city: string;
  segId: string;
  name: string;
  zone: string;
  lat: number;
  lon: number;
  tempC: number;
  shortwaveWm2: number;
  score: number; // temp + solar/100
  timeISO: string;
};

/**
 * Leaflet heat layer wrapper (works with react-leaflet)
 * points: [lat, lon, intensity 0..1]
 */
function HeatmapLayer({ points }: { points: Array<[number, number, number]> }) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;

    const heat = (L as any).heatLayer(points, {
      radius: 30,
      blur: 22,
      maxZoom: 12,
      // no fixed gradient here -> default looks good (yellow->red)
    });

    heat.addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [map, points]);

  return null;
}

export default function ThermalMapPage() {
  const [zone, setZone] = useState("All Zones");
  const [metric, setMetric] = useState<MetricKey>("surface_temp");
  const [range, setRange] = useState("Last 24 hours");

  const [showCollectors, setShowCollectors] = useState(true);
  const [showPcm, setShowPcm] = useState(true);
  const [showConversion, setShowConversion] = useState(true);

  const [cityInput, setCityInput] = useState("");
  const [cityErr, setCityErr] = useState<string | null>(null);
  const [pinning, setPinning] = useState(false);

  const [pinnedCities, setPinnedCities] = useState<string[]>(["New Delhi, India"]);
  const [dynamicCityFCs, setDynamicCityFCs] = useState<Record<string, FeatureCollection>>(
    {}
  );

  // IMPORTANT CHANGE:
  // store ALL heat points (not only top 20%) so heatmap shows “all possible hotspots”
  const [heatPoints, setHeatPoints] = useState<HeatPoint[]>([]);

  // Combined FC across pinned cities, filtered by zone
  const combinedFc = useMemo(() => {
    const features: Feature<LineString>[] = [];

    for (const cityLabel of pinnedCities) {
      const key = cityLabel.toLowerCase();
      const fc = dynamicCityFCs[key];
      if (!fc) continue;

      for (const f of fc.features as Feature<LineString>[]) {
        const props: any = f.properties || {};
        if (zone !== "All Zones" && props.zone !== zone) continue;
        features.push(f);
      }
    }

    return { type: "FeatureCollection", features } as FeatureCollection;
  }, [pinnedCities, dynamicCityFCs, zone]);

  // add computed per-feature metric values
  const styledFc = useMemo(() => {
    const features = (combinedFc.features || []).map((f, idx) => {
      const seed = idx + 1;
      const val = makeMetricValue(metric, seed);
      return {
        ...f,
        properties: {
          ...(f.properties || {}),
          _metricVal: val,
        },
      } as Feature<LineString>;
    });

    return { ...combinedFc, features } as FeatureCollection;
  }, [combinedFc, metric]);

  const legend = useMemo(() => {
    if (metric === "alarm")
      return [
        { label: "Normal", color: "#10b981" },
        { label: "Warning", color: "#f59e0b" },
        { label: "Critical", color: "#e11d48" },
      ];
    return [
      { label: "Low", color: "#10b981" },
      { label: "Medium", color: "#f59e0b" },
      { label: "High", color: "#e11d48" },
    ];
  }, [metric]);

  // Convert ALL heatPoints to heatmap points
  // Normalize intensity per-city (important so every city shows strong red areas)
  const heatmapTriples = useMemo(() => {
    if (!heatPoints.length) return [];

    // group by city for normalization
    const byCity = new Map<string, HeatPoint[]>();
    for (const p of heatPoints) {
      const arr = byCity.get(p.city) || [];
      arr.push(p);
      byCity.set(p.city, arr);
    }

    const out: Array<[number, number, number]> = [];

    for (const [, pts] of byCity) {
      const scores = pts.map((p) => p.score);
      const min = Math.min(...scores);
      const max = Math.max(...scores);
      const denom = max - min || 1;

      for (const p of pts) {
        // intensity 0..1, but clamp to keep visible
        const intensity = clamp01((p.score - min) / denom);
        // boost slightly so "regions" look stronger
        const boosted = Math.min(1, 0.25 + intensity * 0.9);
        out.push([p.lat, p.lon, boosted]);
      }
    }

    return out;
  }, [heatPoints]);

  async function pinCity(cityText: string) {
    const raw = cityText.trim();
    if (!raw) {
      setCityErr("Enter a city name.");
      return;
    }

    setPinning(true);
    setCityErr(null);

    try {
      const g = await geocodeCity(raw);
      const cityLabel = `${g.name}${g.admin1 ? ", " + g.admin1 : ""}${
        g.country ? ", " + g.country : ""
      }`;
      const cityKey = cityLabel.toLowerCase();

      if (pinnedCities.some((c) => c.toLowerCase() === cityKey)) {
        setCityErr("City already added.");
        return;
      }

      const fc = generateRoadGridAroundCity(cityLabel, g.latitude, g.longitude, 18);

      setDynamicCityFCs((prev) => ({ ...prev, [cityKey]: fc }));
      setPinnedCities((prev) => [...prev, cityLabel]);

      // build heat points for ALL segment midpoints
      const feats = fc.features as Feature<LineString>[];
      const pts: HeatPoint[] = [];

      for (const f of feats) {
        const props: any = f.properties || {};
        const segId = String(props.id || "");
        const geom = f.geometry as LineString;
        const mid = midpointOfLine(geom.coordinates as any);
        if (!mid) continue;

        try {
          const w = await fetchWeatherNow(mid.lat, mid.lon);
          const score = w.tempC + w.shortwaveWm2 / 100;

          pts.push({
            id: `${cityKey}:${segId}`,
            city: cityLabel,
            segId,
            name: props.name || segId,
            zone: props.zone || "-",
            lat: mid.lat,
            lon: mid.lon,
            tempC: w.tempC,
            shortwaveWm2: w.shortwaveWm2,
            score,
            timeISO: w.timeISO,
          });
        } catch {
          // keep going even if a point fails
        }
      }

      setHeatPoints((prev) => {
        // remove old points for this city (if any) then add new
        const keep = prev.filter((p) => p.city !== cityLabel);
        return [...keep, ...pts];
      });

      setCityInput("");
    } catch (e: any) {
      setCityErr(e.message || "Failed to add city.");
    } finally {
      setPinning(false);
    }
  }

  // initial seed so map isn't empty
  useEffect(() => {
    (async () => {
      const initial = "New Delhi, India";
      const key = initial.toLowerCase();
      if (dynamicCityFCs[key]) return;

      try {
        const g = await geocodeCity(initial);
        const fc = generateRoadGridAroundCity(initial, g.latitude, g.longitude, 18);
        setDynamicCityFCs((prev) => ({ ...prev, [key]: fc }));

        // also generate heat points initially
        const feats = fc.features as Feature<LineString>[];
        const pts: HeatPoint[] = [];
        for (const f of feats) {
          const props: any = f.properties || {};
          const segId = String(props.id || "");
          const geom = f.geometry as LineString;
          const mid = midpointOfLine(geom.coordinates as any);
          if (!mid) continue;

          try {
            const w = await fetchWeatherNow(mid.lat, mid.lon);
            const score = w.tempC + w.shortwaveWm2 / 100;
            pts.push({
              id: `${key}:${segId}`,
              city: initial,
              segId,
              name: props.name || segId,
              zone: props.zone || "-",
              lat: mid.lat,
              lon: mid.lon,
              tempC: w.tempC,
              shortwaveWm2: w.shortwaveWm2,
              score,
              timeISO: w.timeISO,
            });
          } catch {}
        }
        setHeatPoints(pts);
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-2xl font-semibold text-slate-900">Thermal Map</div>
          <div className="mt-1 text-sm text-slate-600">
            Heatmap overlay shows continuous “hot regions” based on Temp + Solar load.
          </div>
        </div>

        <div className="flex gap-2">
          <button
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            onClick={() => setHeatPoints([])}
          >
            Clear Heatmap
          </button>

          <button
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            onClick={() => {
              setHeatPoints([]);
              setPinnedCities(["New Delhi, India"]);
              setCityErr(null);
              setCityInput("");
              setDynamicCityFCs({});
            }}
          >
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Panel */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          <Card title="Add City (Geocoder)">
            <div className="space-y-3">
              <div>
                <div className="text-xs font-medium text-slate-500">City name</div>
                <input
                  className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  placeholder="e.g., Patiala, Dubai, Helsinki"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") pinCity(cityInput);
                  }}
                />
              </div>

              {cityErr ? (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {cityErr}
                </div>
              ) : null}

              <button
                className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800 disabled:opacity-50"
                disabled={pinning}
                onClick={() => pinCity(cityInput)}
              >
                {pinning ? "Adding..." : "Add City + Heatmap"}
              </button>

              <div className="text-[11px] text-slate-500">
                Heatmap uses ALL segment midpoints (not only top 20%).
              </div>
            </div>
          </Card>

          <Card title="Pinned Cities">
            <div className="space-y-2">
              {pinnedCities.map((c) => (
                <div
                  key={c}
                  className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                >
                  <div className="truncate text-slate-800">{c}</div>
                  <button
                    className="ml-3 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                    onClick={() => {
                      setPinnedCities((prev) => prev.filter((x) => x !== c));
                      setHeatPoints((prev) => prev.filter((p) => p.city !== c));
                      setDynamicCityFCs((prev) => {
                        const copy = { ...prev };
                        delete copy[c.toLowerCase()];
                        return copy;
                      });
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
              {pinnedCities.length === 0 ? (
                <div className="text-sm text-slate-500">No cities pinned.</div>
              ) : null}
            </div>
          </Card>

          <Card title="Filters">
            <div className="space-y-4">
              <div>
                <div className="text-xs font-medium text-slate-500">Zone</div>
                <select
                  className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                >
                  <option>All Zones</option>
                  <option>Zone A</option>
                  <option>Zone B</option>
                  <option>Zone C</option>
                </select>
              </div>

              <div>
                <div className="text-xs font-medium text-slate-500">Metric</div>
                <select
                  className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={metric}
                  onChange={(e) => setMetric(e.target.value as MetricKey)}
                >
                  {METRICS.map((m) => (
                    <option key={m.key} value={m.key}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="text-xs font-medium text-slate-500">Date Range</div>
                <select
                  className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={range}
                  onChange={(e) => setRange(e.target.value)}
                >
                  <option>Last 1 hour</option>
                  <option>Last 24 hours</option>
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                </select>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs font-semibold text-slate-700">Layers</div>
                <label className="mt-2 flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={showCollectors}
                    onChange={(e) => setShowCollectors(e.target.checked)}
                  />
                  Collectors
                </label>
                <label className="mt-2 flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={showPcm}
                    onChange={(e) => setShowPcm(e.target.checked)}
                  />
                  PCM Modules
                </label>
                <label className="mt-2 flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={showConversion}
                    onChange={(e) => setShowConversion(e.target.checked)}
                  />
                  ORC / TEG Units
                </label>
              </div>
            </div>
          </Card>

          <Card title="Quick KPIs">
            <div className="grid grid-cols-2 gap-3">
              <KpiPill label="Avg Surface" value="38.4" unit="°C" />
              <KpiPill label="Heat Captured" value="12.1" unit="MWh" />
              <KpiPill label="Net Power" value="420" unit="kW" />
              <KpiPill label="PCM SOC" value="63" unit="%" />
            </div>
          </Card>
        </div>

        {/* Map Area */}
        <div className="col-span-12 lg:col-span-9">
          <Card
            title="Map View"
            right={
              <div className="text-xs text-slate-500">
                {pinnedCities.length} cities • {zone} • {range}
              </div>
            }
          >
            <div className="relative h-[640px] rounded-xl border border-slate-200 bg-white">
              <MapContainer
                center={[20.5937, 78.9629]} // India fallback
                zoom={5}
                zoomControl={false}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%" }}
              >
                <ZoomControl position="topright" />
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <ScrollLockMap />
                <FitBounds fc={styledFc} />

                {/* HEATMAP REGIONS (the red blobs) */}
                <HeatmapLayer points={heatmapTriples} />

                {/* Base segments (still visible under heatmap) */}
                <GeoJSON
                  data={styledFc as any}
                  style={(feat: any) => {
                    const props = feat?.properties ?? {};
                    const val =
                      typeof props._metricVal === "number" ? props._metricVal : 0.2;
                    return {
                      color: colorFor(metric, val),
                      weight: 5,
                      opacity: 0.7,
                    };
                  }}
                />

                {/* Optional: show points (handy for debugging) */}
                {heatPoints.map((h) => (
                  <CircleMarker
                    key={h.id}
                    center={[h.lat, h.lon]}
                    radius={4}
                    pathOptions={{ color: "#0f172a", weight: 1, fillOpacity: 0.25 }}
                  >
                    <Tooltip direction="top" offset={[0, -6]} opacity={1}>
                      <div className="text-xs">
                        <div className="font-semibold">{h.city}</div>
                        <div>{h.name}</div>
                        <div>Temp: {h.tempC.toFixed(1)}°C</div>
                        <div>Solar: {Math.round(h.shortwaveWm2)} W/m²</div>
                        <div>Score: {h.score.toFixed(1)}</div>
                        <div className="text-slate-500">{h.timeISO}</div>
                      </div>
                    </Tooltip>
                  </CircleMarker>
                ))}
              </MapContainer>

              {/* Legend */}
              <div className="pointer-events-none absolute bottom-3 right-3 z-[1000] w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="text-xs font-semibold text-slate-800">Legend</div>
                <div className="mt-2 space-y-2">
                  {legend.map((l) => (
                    <div key={l.label} className="flex items-center gap-2">
                      <div className="h-3 w-6 rounded" style={{ background: l.color }} />
                      <div className="text-xs text-slate-600">{l.label}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-2 text-[11px] text-slate-400">
                  Metric: {METRICS.find((m) => m.key === metric)?.label || metric}
                </div>
                <div className="mt-1 text-[11px] text-slate-400">
                  Heatmap: intensity normalized per city (Temp + Solar/100)
                </div>
              </div>

              <div className="pointer-events-none absolute bottom-3 left-3 z-[1000] rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 shadow-sm">
                Layers:{" "}
                <span className="font-medium text-slate-800">
                  {showCollectors ? "Collectors" : ""}
                  {showCollectors && (showPcm || showConversion) ? ", " : ""}
                  {showPcm ? "PCM" : ""}
                  {showPcm && showConversion ? ", " : ""}
                  {showConversion ? "ORC/TEG" : ""}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );

}