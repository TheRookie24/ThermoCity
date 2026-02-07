export function AlertBadge({ severity }: { severity: string }) {
  const cls =
    severity === "critical"
      ? "bg-red-50 text-red-700 border-red-200"
      : severity === "high"
      ? "bg-orange-50 text-orange-700 border-orange-200"
      : severity === "medium"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-slate-50 text-slate-700 border-slate-200";
  return <span className={`px-2 py-0.5 text-xs rounded border ${cls}`}>{severity}</span>;
}
