import { ReactNode } from "react";

export function DataTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: ReactNode[][];
}) {
  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b">
          <tr>
            {headers.map((h) => (
              <th key={h} className="text-left font-semibold text-slate-700 px-3 py-2">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b last:border-b-0">
              {r.map((c, j) => (
                <td key={j} className="px-3 py-2 text-slate-800">
                  {c}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td className="px-3 py-6 text-slate-500" colSpan={headers.length}>
                No data
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
