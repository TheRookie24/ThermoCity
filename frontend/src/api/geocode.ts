export type GeocodeResult = {
  name: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
};

export async function geocodeCity(query: string): Promise<GeocodeResult> {
  const q = query.trim();
  if (!q) throw new Error("City name is empty.");

  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", q);
  url.searchParams.set("count", "1");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Geocoding failed (HTTP ${res.status}).`);

  const data = await res.json();
  const r = data?.results?.[0];
  if (!r) throw new Error(`City not found: "${q}"`);

  return {
    name: r.name,
    country: r.country,
    admin1: r.admin1,
    latitude: r.latitude,
    longitude: r.longitude,
  };
}
