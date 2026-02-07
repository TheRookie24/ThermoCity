import { useEffect, useState } from "react";
import { listEvents, actionEvent, AlertEvent } from "../api/alerts";
import { DataTable } from "../components/DataTable";
import { AlertBadge } from "../components/AlertBadge";

export function Alerts() {
  const [status, setStatus] = useState("open");
  const [events, setEvents] = useState<AlertEvent[]>([]);
  const [note, setNote] = useState("");

  const load = () => listEvents(status).then(setEvents).catch(() => setEvents([]));

  useEffect(() => { load(); }, [status]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-white p-4 shadow-sm flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">Alerts</div>
          <div className="text-xs text-slate-500">Acknowledge or close with notes</div>
        </div>
        <select className="rounded-lg border px-3 py-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="open">Open</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="text-xs text-slate-600">Notes (optional)</div>
        <input className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a brief action note…" />
      </div>

      <DataTable
        headers={["Opened", "Severity", "Metric", "Value", "Segment", "Status", "Action"]}
        rows={events.map((e) => [
          <span className="font-mono text-xs">{e.opened_at}</span>,
          <AlertBadge severity={e.severity} />,
          e.metric,
          String(e.value ?? "—"),
          <span className="font-mono text-xs">{e.segment_id ?? "—"}</span>,
          e.status,
          <div className="flex gap-2">
            {e.status === "open" ? (
              <button
                className="px-3 py-1.5 rounded border text-sm hover:bg-slate-50"
                onClick={async () => {
                  await actionEvent(e.id, "acknowledged", note).catch(() => {});
                  load();
                }}
              >
                Acknowledge
              </button>
            ) : null}
            {e.status !== "closed" ? (
              <button
                className="px-3 py-1.5 rounded bg-slate-900 text-white text-sm hover:bg-slate-800"
                onClick={async () => {
                  await actionEvent(e.id, "closed", note).catch(() => {});
                  load();
                }}
              >
                Close
              </button>
            ) : null}
          </div>,
        ])}
      />
    </div>
  );
}
