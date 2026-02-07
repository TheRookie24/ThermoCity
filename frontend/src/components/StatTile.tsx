import { ReactNode } from "react";

export function StatTile({
  label,
  value,
  unit,
  icon,
  sublabel = "Sparkline trend",
}: {
  label: string;
  value: string;
  unit?: string;
  icon?: ReactNode;
  sublabel?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium text-slate-500">{label}</div>
          <div className="mt-1 flex items-baseline gap-2">
            <div className="text-2xl font-semibold text-slate-900">{value}</div>
            {unit && <div className="text-xs text-slate-500">{unit}</div>}
          </div>
        </div>
        <div className="text-emerald-600">{icon}</div>
      </div>
      <div className="mt-3 h-10 rounded-md bg-slate-50 text-[10px] text-slate-400 flex items-center justify-center">
        ({sublabel})
      </div>
    </div>
  );
}
