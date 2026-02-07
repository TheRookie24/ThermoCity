from celery import shared_task
from datetime import datetime, timezone, timedelta
from apps.telemetry.documents import Telemetry
from apps.assets.documents import PCMModule
from .documents import KPI
import math

CP_WATER_KJ_PER_KG_K = 4.186  # approximation

def clamp(x, a, b):
    return max(a, min(b, x))

@shared_task
def compute_kpis():
    # Compute from latest telemetry per segment (last ~5 minutes)
    window_start = datetime.now(timezone.utc) - timedelta(minutes=10)

    # group by segment_id
    segments = Telemetry.objects.filter(scope="segment", ts__gte=window_start).distinct("segment_id")
    for seg_id in segments:
        if not seg_id:
            continue
        latest = Telemetry.objects.filter(scope="segment", segment_id=seg_id).order_by("-ts").first()
        if not latest:
            continue

        temps = latest.temps or {}
        t_in = float(temps.get("inlet", temps.get("t_in", 0.0)) or 0.0)
        t_out = float(temps.get("outlet", temps.get("t_out", 0.0)) or 0.0)
        m_dot = float(latest.flow or 0.0)  # kg/s

        # Q (kW_th) = m_dot * Cp(kJ/kg-K) * dT(K)  => kJ/s = kW
        dT = (t_out - t_in)
        heat_kw = m_dot * CP_WATER_KJ_PER_KG_K * dT if m_dot and dT else 0.0
        if heat_kw < 0:
            heat_kw = 0.0

        kw_gross = float(latest.kw_gross or 0.0)
        parasitic = float(latest.pump_power or 0.0) + float(latest.fan_power or 0.0)
        kw_net = kw_gross - parasitic

        # PCM SOC MVP: map pcm_temp within melt range
        pcm_soc = None
        pcm_temp = latest.pcm_temp
        pcm = PCMModule.objects.filter(segment_id=seg_id).first()
        if pcm and pcm_temp is not None:
            tmin, tmax = float(pcm.melt_temp_min), float(pcm.melt_temp_max)
            pcm_soc = clamp((float(pcm_temp) - tmin) / (tmax - tmin + 1e-6), 0.0, 1.0)
        else:
            # fallback: infer SOC from heat_kw (weak heuristic)
            pcm_soc = clamp(0.5 + 0.05 * math.tanh(heat_kw / 10.0), 0.0, 1.0)

        KPI(
            scope="segment",
            city_id=latest.city_id,
            segment_id=seg_id,
            ts=latest.ts,
            heat_captured_kw=heat_kw,
            pcm_soc=pcm_soc,
            kw_net=kw_net,
            kw_gross=kw_gross,
            parasitic_kw=parasitic,
            temps=temps,
        ).save()

    return {"segments_processed": len(segments)}
