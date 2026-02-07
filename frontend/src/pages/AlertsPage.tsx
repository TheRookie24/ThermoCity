import { useMemo, useState } from "react";
import { Card } from "../components/Card";

type Severity = "Critical" | "Warning" | "Info";
type Status = "Open" | "Acknowledged" | "Closed";

type AlertRow = {
  id: string;
  severity: Severity;
  title: string;
  asset: string;
  zone: string;
  status: Status;
  createdAt: string;
};

const demoAlerts: AlertRow[] = [
  {
    id: "AL-1042",
    severity: "Critical",
    title: "Pump Malfunction",
    asset: "Collector HX-07",
    zone: "Zone B",
    status: "Open",
    createdAt: "2026-02-07 10:30",
  },
  {
    id: "AL-1038",
    severity: "Warning",
    title: "Sensor Anomaly",
    asset: "Segment 03",
    zone: "Zone A",
    status: "Acknowledged",
    createdAt: "2026-02-07 09:15",
  },
  {
    id: "AL-1033",
    severity: "Info",
    title: "Network Disruption",
    asset: "Gateway NW-2",
    zone: "Zone C",
    status: "Open",
    createdAt: "2026-02-07 08:40",
  },
  {
    id: "AL-1029",
    severity: "Warning",
    title: "Flow Rate Deviation",
    asset: "Segment 12",
    zone: "Zone B",
    status: "Open",
    createdAt: "2026-02-07 07:55",
  },
  {
    id: "AL-1018",
    severity: "Info",
    title: "PCM SOC Low (Expected)",
    asset: "PCM Module P-4",
    zone: "Zone A",
    status: "Closed",
    createdAt: "2026-02-06 21:10",
  },
];

function Pill({ children, className }: { children: string; className: string }) {
  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${className}`}>
      {children}
    </span>
  );
}

function SeverityPill({ sev }: { sev: Severity }) {
  const map: Record<Severity, string> = {
    Critical: "border-rose-200 bg-rose-50 text-rose-700",
    Warning: "border-amber-200 bg-amber-50 text-amber-700",
    Info: "border-slate-200 bg-slate-50 text-slate-700",
  };
  return <Pill className={map[sev]}>{sev}</Pill>;
}

function StatusPill({ st }: { st: Status }) {
  const map: Record<Status, string> = {
    Open: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Acknowledged: "border-sky-200 bg-sky-50 text-sky-700",
    Closed: "border-slate-200 bg-slate-50 text-slate-600",
  };
  return <Pill className={map[st]}>{st}</Pill>;
}

export default function AlertsPage() {
  const [tab, setTab] = useState<"All" | "Open" | "Acknowledged" | "Closed">(
    "All"
  );
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let rows = demoAlerts.slice();
    if (tab !== "All") rows = rows.filter((r) => r.status === tab);
    if (q.trim()) {
      const s = q.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.id.toLowerCase().includes(s) ||
          r.title.toLowerCase().includes(s) ||
          r.asset.toLowerCase().includes(s) ||
          r.zone.toLowerCase().includes(s)
      );
    }
    return rows;
  }, [tab, q]);

  const selected = useMemo(
    () => demoAlerts.find((a) => a.id === selectedId) || null,
    [selectedId]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-2xl font-semibold text-slate-900">
            Alerts & Workorders
          </div>
          <div className="mt-1 text-sm text-slate-600">
            Triage alerts, acknowledge/close events, and create work orders.
          </div>
        </div>

        <div className="flex gap-2">
          <button className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
            Export Excel
          </button>
          <button className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
            Export PDF
          </button>
          <button className="rounded-md bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700">
            Create Workorder
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Table */}
        <div className="col-span-12 lg:col-span-8">
          <Card
            title="Alert Events"
            right={
              <div className="flex items-center gap-2">
                <div className="flex rounded-lg border border-slate-200 bg-white p-1 text-xs">
                  {(["All", "Open", "Acknowledged", "Closed"] as const).map(
                    (t) => (
                      <button
                        key={t}
                        className={`rounded-md px-2 py-1 transition-colors ${
                          tab === t
                            ? "bg-emerald-600 text-white"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                        onClick={() => setTab(t)}
                      >
                        {t}
                      </button>
                    )
                  )}
                </div>
                <input
                  className="w-56 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  placeholder="Search alerts..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
            }
          >
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Severity</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Asset</th>
                    <th className="px-4 py-3">Zone</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filtered.map((r) => (
                    <tr
                      key={r.id}
                      className={`cursor-pointer hover:bg-slate-50 ${
                        selectedId === r.id ? "bg-emerald-50/40" : ""
                      }`}
                      onClick={() => setSelectedId(r.id)}
                    >
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {r.id}
                      </td>
                      <td className="px-4 py-3">
                        <SeverityPill sev={r.severity} />
                      </td>
                      <td className="px-4 py-3 text-slate-800">{r.title}</td>
                      <td className="px-4 py-3 text-slate-700">{r.asset}</td>
                      <td className="px-4 py-3 text-slate-600">{r.zone}</td>
                      <td className="px-4 py-3">
                        <StatusPill st={r.status} />
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {r.createdAt}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-12 text-center text-slate-500"
                      >
                        No alerts match the current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Detail Panel */}
        <div className="col-span-12 lg:col-span-4">
          <Card title="Selected Alert">
            {!selected ? (
              <div className="flex h-[340px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                <div className="text-sm font-semibold text-slate-800">
                  No alert selected
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  Select a row to view details and actions.
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs text-slate-500">{selected.id}</div>
                    <div className="mt-1 text-lg font-semibold text-slate-900">
                      {selected.title}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <SeverityPill sev={selected.severity} />
                    <StatusPill st={selected.status} />
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-xs text-slate-500">Asset</div>
                      <div className="font-medium text-slate-800">
                        {selected.asset}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Zone</div>
                      <div className="font-medium text-slate-800">
                        {selected.zone}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Created</div>
                      <div className="font-medium text-slate-800">
                        {selected.createdAt}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Owner</div>
                      <div className="font-medium text-slate-800">Ops Team</div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium text-slate-500">
                    Notes
                  </div>
                  <textarea
                    className="mt-1 h-24 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                    placeholder="Add a note for this alert..."
                  />
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    Close
                  </button>
                  <button className="flex-1 rounded-md bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700">
                    Acknowledge
                  </button>
                </div>

                <div className="text-[11px] text-slate-500">
                  (UI-only actions; wire to API later)
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
