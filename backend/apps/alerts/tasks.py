from celery import shared_task
from apps.alerts.documents import AlertRule, AlertEvent, now_utc
from apps.kpi.documents import KPI
from apps.telemetry.documents import Telemetry

def op_eval(op, a, b):
    if op == ">": return a > b
    if op == ">=": return a >= b
    if op == "<": return a < b
    if op == "<=": return a <= b
    if op == "==": return a == b
    return False

@shared_task
def evaluate_alerts():
    rules = list(AlertRule.objects.limit(500))
    for r in rules:
        # Evaluate using latest KPI per segment (MVP)
        if r.scope in ["segment", "city", "zone"]:
            qs = KPI.objects.filter(scope="segment").order_by("-ts")
            if r.city_id:
                qs = qs.filter(city_id=r.city_id)

            # evaluate up to N latest segments
            seg_ids = qs.distinct("segment_id")[:50]
            for seg_id in seg_ids:
                latest = KPI.objects.filter(scope="segment", segment_id=seg_id).order_by("-ts").first()
                if not latest:
                    continue
                val = None
                if hasattr(latest, r.metric):
                    val = getattr(latest, r.metric)
                else:
                    # try temps map for temp metrics
                    if r.metric.startswith("temp_"):
                        key = r.metric.replace("temp_", "")
                        val = (latest.temps or {}).get(key)
                if val is None:
                    continue
                try:
                    val = float(val)
                except Exception:
                    continue

                if op_eval(r.operator, val, float(r.threshold)):
                    # if there's already an open event for this rule+segment, skip
                    exists = AlertEvent.objects.filter(rule_id=str(r.id), segment_id=seg_id, status__in=["open", "acknowledged"]).first()
                    if exists:
                        continue
                    AlertEvent(
                        rule_id=str(r.id),
                        metric=r.metric,
                        severity=r.severity,
                        scope="segment",
                        city_id=latest.city_id,
                        zone_id=None,
                        segment_id=seg_id,
                        status="open",
                        opened_at=now_utc(),
                        value=val,
                    ).save()
    return {"rules": len(rules)}
