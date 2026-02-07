from mongoengine import Document, StringField, DateTimeField, FloatField, DictField, IntField
from datetime import datetime, timezone

class Telemetry(Document):
    scope = StringField(required=True, choices=["segment", "asset"])
    city_id = StringField(required=True)
    segment_id = StringField()
    asset_id = StringField()

    ts = DateTimeField(required=True)
    # payload fields
    temps = DictField()         # surface/subsurface/inlet/outlet
    flow = FloatField()         # kg/s (assumption)
    pressure = FloatField()     # kPa (assumption)
    kw_gross = FloatField()
    kwh_total = FloatField()
    fan_power = FloatField()
    pump_power = FloatField()
    pcm_temp = FloatField()

    meta = {
        "collection": "telemetry",
        "indexes": [
            {"fields": ["ts"], "expireAfterSeconds": 60 * 60 * 24 * 14},  # 14 days retention
            "city_id",
            "segment_id",
            "asset_id",
            "scope",
        ],
    }

def parse_ts(v):
    if isinstance(v, (int, float)):
        return datetime.fromtimestamp(v, tz=timezone.utc)
    if isinstance(v, str):
        # ISO 8601
        try:
            dt = datetime.fromisoformat(v.replace("Z", "+00:00"))
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt.astimezone(timezone.utc)
        except Exception:
            pass
    raise ValueError("Invalid timestamp")
