import { useEffect, useMemo, useState } from "react";
import { listSegments, Segment } from "../api/assets";
import { latestKpi } from "../api/kpi";
import { listEvents } from "../api/alerts";
import { MapPanel } from "../components/MapPanel";

export function MapPage() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [metric, setMetric] = useState("kw_net");
  const [lookup, setLookup] = useState<Record<string, number | undefined>>({});

  useEffect(() => {
    listSegments().then(setSegments).catch(() => setSegments([]));
  }, []);

  useEffect(() => {
    (async () => {
      const m: Record<string, number | undefined> = {};
      if (metric === "alarm") {
        const events = await listEvents("open").catch(() => []);
        const set = new Set(events.map((e) => e.segment_id).filter(Boolean) as string[]);
        for (const s of segments) m[s.id] = set.has(s.id) ? 1 : 0;
        setLookup(m);
        return;
      }
      for (const s of segments.slice(0, 80)) {
        const k = await latestKpi(s.id).catch(() => null);
        if (!k) continue;
        if (metric === "kw_net") m[s.id] = k.kw_net ?? undefined;
        if (metric === "soc") m[s.id] = k.pcm_soc ?? undefined;
        if (metric === "heat") m[s.id] = k.heat_captured_kw ?? undefined;
        if (metric === "surface_temp") m[s.id] = (k.temps?.surface as any) ?? undefined;
      }
      setLookup(m);
    })().catch(() => {});
  }, [metric, segments]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-white p-4 shadow-sm flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">GIS Map</div>
          <div className="text-xs text-slate-500">Segments colored by selected metric</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-600">Metric</div>
          <select className="rounded-lg border px-3 py-2 text-sm" value={metric} onChange={(e) => setMetric(e.target.value)}>
            <option value="surface_temp">Surface temp</option>
            <option value="heat">Heat captured</option>
            <option value="kw_net">kW net</option>
            <option value="soc">SOC</option>
            <option value="alarm">Alarm state</option>
          </select>
        </div>
      </div>

      <MapPanel segments={segments} metric={metric} metricLookup={lookup} />
    </div>
  );
}
