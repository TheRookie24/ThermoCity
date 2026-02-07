import os
from datetime import datetime, timezone
from django.conf import settings
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from openpyxl import Workbook
from apps.telemetry.documents import Telemetry, parse_ts
from apps.kpi.documents import KPI
from apps.alerts.documents import AlertEvent

def _safe_name(s: str) -> str:
    return "".join(ch for ch in s if ch.isalnum() or ch in ("-", "_")).strip("_")[:60] or "report"

def generate_pdf(city_id: str, dt_from, dt_to) -> str:
    ts = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    fn = f"city_{_safe_name(city_id)}_{ts}.pdf"
    path = os.path.join(settings.REPORTS_DIR, fn)

    c = canvas.Canvas(path, pagesize=A4)
    w, h = A4

    c.setFont("Helvetica-Bold", 14)
    c.drawString(40, h - 50, "Thermal Infrastructure Monitoring Platform")
    c.setFont("Helvetica", 11)
    c.drawString(40, h - 70, f"City ID: {city_id}")
    c.drawString(40, h - 85, f"Range: {dt_from.isoformat()} to {dt_to.isoformat()}")

    # KPIs summary
    kpis = KPI.objects.filter(scope="segment", city_id=city_id, ts__gte=dt_from, ts__lte=dt_to).limit(5000)
    total_kwh_est = 0.0
    avg_kw_net = []
    avg_soc = []
    for k in kpis:
        if k.kw_net is not None:
            avg_kw_net.append(float(k.kw_net))
        if k.pcm_soc is not None:
            avg_soc.append(float(k.pcm_soc))
        # approximate energy over samples: treat each sample as 1 minute
        if k.kw_net is not None:
            total_kwh_est += float(k.kw_net) / 60.0

    alarms = AlertEvent.objects.filter(city_id=city_id, opened_at__gte=dt_from, opened_at__lte=dt_to).order_by("-opened_at").limit(100)

    y = h - 120
    c.setFont("Helvetica-Bold", 12)
    c.drawString(40, y, "Summary")
    y -= 18
    c.setFont("Helvetica", 10)
    c.drawString(40, y, f"Estimated kWh generated (from KPI samples): {total_kwh_est:.2f}")
    y -= 14
    c.drawString(40, y, f"Avg kW net: {(sum(avg_kw_net)/len(avg_kw_net)) if avg_kw_net else 0.0:.2f}")
    y -= 14
    c.drawString(40, y, f"Avg PCM SOC: {(sum(avg_soc)/len(avg_soc)) if avg_soc else 0.0:.2f}")
    y -= 20

    c.setFont("Helvetica-Bold", 12)
    c.drawString(40, y, "Alerts (most recent)")
    y -= 16
    c.setFont("Helvetica", 9)
    for ev in alarms:
        line = f"{ev.opened_at.isoformat()} | {ev.severity.upper()} | {ev.metric}={ev.value} | segment={ev.segment_id} | status={ev.status}"
        c.drawString(40, y, line[:110])
        y -= 12
        if y < 60:
            c.showPage()
            y = h - 60
            c.setFont("Helvetica", 9)

    c.showPage()
    c.save()
    return fn

def generate_xlsx(city_id: str, dt_from, dt_to) -> str:
    ts = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    fn = f"city_{_safe_name(city_id)}_{ts}.xlsx"
    path = os.path.join(settings.REPORTS_DIR, fn)

    wb = Workbook()
    ws1 = wb.active
    ws1.title = "Telemetry"
    ws1.append(["ts", "scope", "segment_id", "asset_id", "temps", "flow", "pressure", "kw_gross", "kwh_total", "pump_power", "fan_power", "pcm_temp"])

    telem = Telemetry.objects.filter(city_id=city_id, ts__gte=dt_from, ts__lte=dt_to).order_by("ts").limit(50000)
    for t in telem:
        ws1.append([
            t.ts.isoformat(),
            t.scope,
            t.segment_id,
            t.asset_id,
            str(t.temps or {}),
            t.flow,
            t.pressure,
            t.kw_gross,
            t.kwh_total,
            t.pump_power,
            t.fan_power,
            t.pcm_temp,
        ])

    ws2 = wb.create_sheet("KPI")
    ws2.append(["ts", "segment_id", "heat_captured_kw", "kw_gross", "parasitic_kw", "kw_net", "pcm_soc", "temps"])
    kpis = KPI.objects.filter(city_id=city_id, ts__gte=dt_from, ts__lte=dt_to).order_by("ts").limit(50000)
    for k in kpis:
        ws2.append([
            k.ts.isoformat(),
            k.segment_id,
            k.heat_captured_kw,
            k.kw_gross,
            k.parasitic_kw,
            k.kw_net,
            k.pcm_soc,
            str(k.temps or {}),
        ])

    wb.save(path)
    return fn
