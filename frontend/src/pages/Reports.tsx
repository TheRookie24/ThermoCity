import { useEffect, useState } from "react";
import { listCities, City } from "../api/assets";
import { createPdf, createXlsx, absoluteDownloadUrl } from "../api/reports";

export function Reports() {
  const [cities, setCities] = useState<City[]>([]);
  const [city, setCity] = useState<string>("");
  const [from, setFrom] = useState<string>(new Date(Date.now() - 6 * 3600 * 1000).toISOString());
  const [to, setTo] = useState<string>(new Date().toISOString());
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [xlsxUrl, setXlsxUrl] = useState<string>("");

  useEffect(() => {
    listCities()
      .then((cs) => {
        setCities(cs);
        setCity(cs[0]?.id || "");
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="text-sm font-semibold">Reporting & Exports</div>
        <div className="text-xs text-slate-500">Generate professional PDF summary and XLSX export for a city and date range.</div>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <div>
            <div className="text-xs text-slate-600">City</div>
            <select className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" value={city} onChange={(e) => setCity(e.target.value)}>
              {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <div className="text-xs text-slate-600">From (ISO)</div>
            <input className="mt-1 w-full rounded-lg border px-3 py-2 text-sm font-mono" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <div className="text-xs text-slate-600">To (ISO)</div>
            <input className="mt-1 w-full rounded-lg border px-3 py-2 text-sm font-mono" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="flex items-end gap-2">
            <button
              className="w-full rounded-lg bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800"
              onClick={async () => {
                const r = await createPdf(city, from, to);
                setPdfUrl(absoluteDownloadUrl(r.url));
              }}
            >
              Generate PDF
            </button>
            <button
              className="w-full rounded-lg border px-3 py-2 text-sm hover:bg-slate-50"
              onClick={async () => {
                const r = await createXlsx(city, from, to);
                setXlsxUrl(absoluteDownloadUrl(r.url));
              }}
            >
              Export XLSX
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold">PDF</div>
          <div className="mt-2 text-xs text-slate-500">Download link appears after generation.</div>
          {pdfUrl ? (
            <a className="mt-3 inline-block underline text-slate-900" href={pdfUrl} target="_blank" rel="noreferrer">
              Download PDF
            </a>
          ) : (
            <div className="mt-3 text-sm text-slate-600">—</div>
          )}
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold">XLSX</div>
          <div className="mt-2 text-xs text-slate-500">Includes Telemetry + KPI sheets.</div>
          {xlsxUrl ? (
            <a className="mt-3 inline-block underline text-slate-900" href={xlsxUrl} target="_blank" rel="noreferrer">
              Download XLSX
            </a>
          ) : (
            <div className="mt-3 text-sm text-slate-600">—</div>
          )}
        </div>
      </div>
    </div>
  );
}
