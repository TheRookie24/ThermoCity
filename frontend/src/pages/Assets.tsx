import { useEffect, useState } from "react";
import { listCities, listZones, listSegments, createDoc, City, Zone, Segment } from "../api/assets";
import { DataTable } from "../components/DataTable";

export function Assets() {
  const [cities, setCities] = useState<City[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [cityName, setCityName] = useState("");
  const [cityCode, setCityCode] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("");

  useEffect(() => {
    (async () => {
      const cs = await listCities();
      setCities(cs);
      setSelectedCity(cs[0]?.id || "");
    })().catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedCity) return;
    listZones(selectedCity).then(setZones).catch(() => setZones([]));
    listSegments({ city_id: selectedCity }).then(setSegments).catch(() => setSegments([]));
  }, [selectedCity]);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="text-sm font-semibold">Asset Registry</div>
        <div className="text-xs text-slate-500 mt-1">CRUD is available via the API; this page exposes core reads + a simple create.</div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div>
            <div className="text-xs text-slate-600">City</div>
            <select className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
              {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <div className="text-xs text-slate-600">Create City (admin/engineer/ops)</div>
            <div className="mt-1 flex gap-2">
              <input className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Name" value={cityName} onChange={(e) => setCityName(e.target.value)} />
              <input className="w-28 rounded-lg border px-3 py-2 text-sm" placeholder="Code" value={cityCode} onChange={(e) => setCityCode(e.target.value)} />
              <button
                className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800"
                onClick={async () => {
                  const doc = await createDoc("cities", { name: cityName, code: cityCode });
                  setCityName(""); setCityCode("");
                  const cs = await listCities();
                  setCities(cs);
                  setSelectedCity(doc.id);
                }}
              >
                Add
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-500 flex items-end">
            Tip: Use `/api/assets/{kind}` for full CRUD across cities/zones/roads/segments/collectors/pcm/conversion/sensors.
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <div className="text-sm font-semibold">Zones</div>
          <DataTable
            headers={["Name", "City ID"]}
            rows={zones.map((z) => [z.name, <span className="font-mono text-xs">{z.city_id}</span>])}
          />
        </div>
        <div className="space-y-2">
          <div className="text-sm font-semibold">Segments</div>
          <DataTable
            headers={["Name", "Segment ID", "Active"]}
            rows={segments.map((s) => [
              s.name,
              <span className="font-mono text-xs">{s.id}</span>,
              s.is_active ? "Yes" : "No",
            ])}
          />
        </div>
      </div>
    </div>
  );
}
