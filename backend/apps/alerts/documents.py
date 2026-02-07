from mongoengine import Document, StringField, DateTimeField, FloatField, DictField
from datetime import datetime, timezone

class AlertRule(Document):
    metric = StringField(required=True)  # e.g., kw_net, heat_captured_kw, pcm_soc, temp_surface
    operator = StringField(required=True, choices=[">", ">=", "<", "<=", "=="])
    threshold = FloatField(required=True)
    severity = StringField(required=True, choices=["low", "medium", "high", "critical"])
    scope = StringField(required=True, choices=["city", "zone", "segment", "asset_type"])
    city_id = StringField()
    zone_id = StringField()
    asset_type = StringField()
    meta = {"collection": "alert_rules"}

class AlertEvent(Document):
    rule_id = StringField(required=True)
    metric = StringField(required=True)
    severity = StringField(required=True)
    scope = StringField(required=True, choices=["segment", "city", "zone"])
    city_id = StringField()
    zone_id = StringField()
    segment_id = StringField()

    status = StringField(required=True, choices=["open", "acknowledged", "closed"], default="open")
    opened_at = DateTimeField(required=True)
    acknowledged_at = DateTimeField()
    closed_at = DateTimeField()
    actor = StringField()
    notes = StringField()
    value = FloatField()

    meta = {"collection": "alert_events", "indexes": ["status", "city_id", "segment_id", "-opened_at"]}

def now_utc():
    return datetime.now(timezone.utc)
