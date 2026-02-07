import React from "react";
import { Page } from "../components/infra/Page";
import { Panel } from "../components/infra/Panel";
import { KpiCard } from "../components/infra/KpiCard";
import { Button } from "../components/infra/Button";
import { StatusPill } from "../components/infra/StatusPill";

export default function Dashboard() {
  return (
    <Page
      title="City Overview"
      subtitle="Real-time thermal capture, PCM storage performance, and generation health."
      rightSlot={
        <div className="flex items-center gap-2">
          <Button compact variant="ghost">Last 24h</Button>
          <Button compact variant="secondary">Export</Button>
        </div>
      }
    >
      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard title="Thermal Energy Captured" value="—" meta="MWh (selected window)" />
        <KpiCard title="Electricity Generated" value="—" meta="MWh (selected window)" />
        <KpiCard title="CO₂ Avoided" value="—" meta="tCO₂e (computed)" />
        <KpiCard title="Active Alerts" value="—" meta="Open events" tone="warn" />
      </div>

      <div className="mt-6 grid grid-cols-12 gap-4">
        {/* Primary chart area */}
        <div className="col-span-8">
          <Panel
            title="System Performance"
            rightSlot={
              <div className="flex items-center gap-2">
                <StatusPill status="ok" />
                <Button compact variant="ghost">Thermal</Button>
                <Button compact variant="ghost">PCM</Button>
                <Button compact variant="ghost">Generation</Button>
              </div>
            }
          >
            <div className="h-[320px] rounded-lg border border-infra-border bg-infra-surface/30" />
            <div className="mt-3 text-xs text-infra-faint">
              Chart placeholder (keep your existing Recharts; this panel gives the enterprise framing).
            </div>
          </Panel>
        </div>

        {/* Alerts summary */}
        <div className="col-span-4">
          <Panel title="Recent Alerts">
            <div className="space-y-2">
              <AlertRow severity="warning" title="PCM temperature approaching threshold" meta="Zone A • Segment R-12 • 14:32" />
              <AlertRow severity="critical" title="Telemetry drop (sensor offline)" meta="Zone C • Segment R-07 • 14:11" />
              <AlertRow severity="warning" title="Generation efficiency deviation" meta="Zone B • ORC-02 • 13:58" />
            </div>
            <div className="mt-4">
              <Button className="w-full" variant="secondary">View all alerts</Button>
            </div>
          </Panel>
        </div>
      </div>

      {/* Assets table area */}
      <div className="mt-6">
        <Panel title="Underperforming Assets">
          <div className="overflow-auto rounded-lg border border-infra-border">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-xs uppercase tracking-wide text-infra-muted">
                <tr>
                  <th className="text-left px-4 py-3">Asset</th>
                  <th className="text-left px-4 py-3">Type</th>
                  <th className="text-left px-4 py-3">Zone</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Energy Today</th>
                  <th className="text-left px-4 py-3">Last Service</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-infra-border">
                <Row asset="R-12" type="Road Segment" zone="A" status="warning" energy="—" service="—" />
                <Row asset="PCM-03" type="PCM Unit" zone="B" status="ok" energy="—" service="—" />
                <Row asset="ORC-02" type="Conversion Unit" zone="B" status="critical" energy="—" service="—" />
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </Page>
  );
}

function AlertRow({
  severity,
  title,
  meta,
}: {
  severity: "warning" | "critical" | "info";
  title: string;
  meta: string;
}) {
  const left =
    severity === "critical"
      ? "border-l-infra-danger"
      : severity === "warning"
      ? "border-l-infra-warn"
      : "border-l-infra-accent/60";

  return (
    <div className={["border border-infra-border bg-infra-surface/30 rounded-lg p-3 border-l-4", left].join(" ")}>
      <div className="text-sm text-infra-text">{title}</div>
      <div className="mt-1 text-xs text-infra-faint">{meta}</div>
    </div>
  );
}

function Row({
  asset,
  type,
  zone,
  status,
  energy,
  service,
}: {
  asset: string;
  type: string;
  zone: string;
  status: "ok" | "warning" | "critical";
  energy: string;
  service: string;
}) {
  const dot =
    status === "critical" ? "bg-infra-danger" : status === "warning" ? "bg-infra-warn" : "bg-infra-success";

  return (
    <tr className="hover:bg-white/5 transition-colors duration-150">
      <td className="px-4 py-3 text-infra-text">{asset}</td>
      <td className="px-4 py-3 text-infra-muted">{type}</td>
      <td className="px-4 py-3 text-infra-muted">{zone}</td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-2 text-xs px-2.5 py-1 rounded-full border border-infra-border bg-white/5">
          <span className={["h-2 w-2 rounded-full", dot].join(" ")} />
          <span className="text-infra-text capitalize">{status}</span>
        </span>
      </td>
      <td className="px-4 py-3 text-right tabular-nums text-infra-text">{energy}</td>
      <td className="px-4 py-3 text-infra-muted">{service}</td>
    </tr>
  );
}
