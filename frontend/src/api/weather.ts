export type WeatherNow = {
  tempC: number;
  shortwaveWm2: number;
  timeISO: string;
};

function pickNowIndex(times: string[]): number {
  const now = Date.now();
  let best = 0;
  let bestDiff = Infinity;
  for (let i = 0; i < times.length; i++) {
    const t = Date.parse(times[i]);
    const d = Math.abs(t - now);
    if (d < bestDiff) {
      bestDiff = d;
      best = i;
    }
  }
  return best;
}

/**
 * Open-Meteo Forecast API (no key). Fetches hourly temperature_2m & shortwave_radiation,
 * then returns the closest hour to "now".
 */
export async function fetchWeatherNow(lat: number, lon: number): Promise<WeatherNow> {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${encodeURIComponent(lat)}` +
    `&longitude=${encodeURIComponent(lon)}` +
    `&hourly=temperature_2m,shortwave_radiation` +
    `&forecast_days=1` +
    `&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather HTTP ${res.status}`);
  const j = await res.json();

  const times: string[] = j?.hourly?.time || [];
  const temps: number[] = j?.hourly?.temperature_2m || [];
  const sw: number[] = j?.hourly?.shortwave_radiation || [];

  if (!times.length || temps.length !== times.length || sw.length !== times.length) {
    throw new Error("Weather payload missing hourly arrays");
  }

  const idx = pickNowIndex(times);
  return { tempC: temps[idx], shortwaveWm2: sw[idx], timeISO: times[idx] };
}
