import { useEffect, useState } from "react";
import { createWorkOrder, listWorkOrders, WorkOrder } from "../api/maintenance";
import { DataTable } from "../components/DataTable";

export function Maintenance() {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [title, setTitle] = useState("");
  const [assetId, setAssetId] = useState("");
  const [priority, setPriority] = useState("medium");

  const load = () => listWorkOrders().then(setOrders).catch(() => setOrders([]));

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="text-sm font-semibold">Maintenance Work Orders</div>
        <div className="text-xs text-slate-500">Create and track work items (asset maintenance history via filtering)</div>

        <div className="mt-4 grid gap-2 md:grid-cols-4">
          <input className="rounded-lg border px-3 py-2 text-sm" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input className="rounded-lg border px-3 py-2 text-sm" placeholder="Asset ID (segment or asset)" value={assetId} onChange={(e) => setAssetId(e.target.value)} />
          <select className="rounded-lg border px-3 py-2 text-sm" value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
            <option value="critical">critical</option>
          </select>
          <button
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800"
            onClick={async () => {
              await createWorkOrder({ title, asset_id: assetId, priority, status: "open" });
              setTitle(""); setAssetId(""); setPriority("medium");
              load();
            }}
          >
            Create
          </button>
        </div>
      </div>

      <DataTable
        headers={["Created", "Title", "Asset ID", "Priority", "Status"]}
        rows={orders.map((o) => [
          <span className="font-mono text-xs">{o.created_at}</span>,
          o.title,
          <span className="font-mono text-xs">{o.asset_id}</span>,
          o.priority,
          o.status,
        ])}
      />
    </div>
  );
}
