import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { queryTelemetry } from "../api/telemetry";
import { queryKpi } from "../api/kpi";
import { ChartCard } from "../components/ChartCard";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export function SegmentDetail() {
  const { id } = useParams();
  const [tele, setTele] = useState<any[]>([]);
  const [kpi, setKpi] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    queryTelemetry(id)
      .then((rows) =>
        rows.map((r) => ({
          ts: r.ts.slice(11, 19),
          surface: r.temps?.surface ?? 0,
          subsurface: r.temps?.subsurface ?? 0,
          inlet: r.temps?.inlet ?? 0,
          outlet: r.temps?.outlet ?? 0,
          flow: r.flow ?? 0,
          pressure: r.pressure ?? 0,
          kw_gross: r.kw_gross ?? 0,
        }))
      )
      .then(setTele)
      .catch(() => setTele([]));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    queryKpi(id)
      .then((rows) =>
        rows.map((r) => ({
          ts: r.ts.slice(11, 19),
          kw_net: r.kw_net ?? 0,
          heat: r.heat_captured_kw ?? 0,
          soc: r.pcm_soc ?? 0,
        }))
      )
      .then(setKpi)
      .catch(() => setKpi([]));
  }, [id]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="text-sm font-semibold">Road Segment Detail</div>
        <div className="mt-1 text-xs text-slate-500 font-mono">segment_id: {id}</div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Temperatures (°C)">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={tele}>
              <XAxis dataKey="ts" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="surface" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="subsurface" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="inlet" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="outlet" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Flow / Pressure">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={tele}>
              <XAxis dataKey="ts" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="flow" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="pressure" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Power (kW gross)">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={tele}>
              <XAxis dataKey="ts" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="kw_gross" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="KPI: kW net / Heat / SOC">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={kpi}>
              <XAxis dataKey="ts" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="kw_net" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="heat" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="soc" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
