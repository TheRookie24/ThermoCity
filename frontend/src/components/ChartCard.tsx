import { ReactNode } from "react";

export function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <div className="mt-3 h-64">{children}</div>
    </div>
  );
}
