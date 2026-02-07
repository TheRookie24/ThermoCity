import { Card } from "../components/Card";
import { StatTile } from "../components/StatTile";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const trend = Array.from({ length: 24 }).map((_, i) => ({
  h: `${i}h`,
  v: 12 + 8 * Math.sin((i / 24) * Math.PI),
}));

const alerts = [
  { sev: "Critical", title: "Pump Malfunction", desc: "High vibration; potential bearing failure.", time: "10:30 AM" },
  { sev: "Warning", title: "Sensor Anomaly", desc: "Abnormal readings in Zone 3.", time: "09:15 AM" },
  { sev: "Info", title: "Network Disruption", desc: "Brief telemetry loss from HX-7.", time: "08:40 AM" },
  { sev: "Warning", title: "Flow Rate Deviation", desc: "Unexpected flow drop on Segment 12.", time: "07:55 AM" },
];

function Badge({ sev }: { sev: string }) {
  const map: Record<string, string> = {
    Critical: "bg-rose-50 text-rose-700 border-rose-200",
    Warning: "bg-amber-50 text-amber-700 border-amber-200",
    Info: "bg-slate-50 text-slate-700 border-slate-200",
  };
  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs ${map[sev] || map.Info}`}>
      {sev}
    </span>
  );
}

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      <div className="text-2xl font-semibold text-slate-900">City Overview Dashboard</div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8">
          <Card title="City Thermal Map">
            <div className="h-[360px] rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center text-slate-400">
              Map preview area (use Thermal Map page for full GIS)
            </div>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-4">
          <StatTile label="Heat Captured" value="45.2" unit="MWh" />
          <StatTile label="Net Power" value="18.7" unit="MW" />
          <StatTile label="Energy Generated" value="120.5" unit="GWh" />
          <StatTile label="CO₂ Avoided" value="25.3" unit="tons" />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-7">
          <Card
            title="Thermal Performance Trend"
            right={
              <div className="flex items-center gap-2 text-xs">
                <button className="rounded-md bg-emerald-600 px-2 py-1 text-white">24h</button>
                <button className="rounded-md px-2 py-1 text-slate-600 hover:bg-slate-100">7d</button>
                <button className="rounded-md px-2 py-1 text-slate-600 hover:bg-slate-100">30d</button>
                <button className="rounded-md px-2 py-1 text-slate-600 hover:bg-slate-100">3m</button>
                <button className="rounded-md px-2 py-1 text-slate-600 hover:bg-slate-100">1y</button>
              </div>
            }
          >
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <XAxis dataKey="h" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="v" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-5">
          <Card title="Recent Alerts" right={<a className="text-xs text-emerald-700 hover:underline" href="/alerts">View All</a>}>
            <div className="divide-y divide-slate-100">
              {alerts.map((a, idx) => (
                <div key={idx} className="py-3 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge sev={a.sev} />
                      <div className="text-sm font-semibold text-slate-800">{a.title}</div>
                    </div>
                    <div className="text-xs text-slate-600">{a.desc}</div>
                    <div className="text-[11px] text-slate-400">{a.time}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-xs">
                    <a className="text-emerald-700 hover:underline" href="#">View Asset</a>
                    <a className="text-slate-600 hover:underline" href="#">Workorder</a>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
