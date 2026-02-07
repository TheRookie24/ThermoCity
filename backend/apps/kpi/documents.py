from mongoengine import Document, StringField, DateTimeField, FloatField, DictField
from datetime import datetime, timezone

class KPI(Document):
    scope = StringField(required=True, choices=["segment", "asset"])
    city_id = StringField(required=True)
    segment_id = StringField()
    asset_id = StringField()

    ts = DateTimeField(required=True)
    heat_captured_kw = FloatField()     # kW thermal equivalent (approx)
    pcm_soc = FloatField()              # 0..1
    kw_net = FloatField()               # kW
    kw_gross = FloatField()
    parasitic_kw = FloatField()
    temps = DictField()

    meta = {
        "collection": "kpi",
        "indexes": ["city_id", "segment_id", "asset_id", "scope", "-ts"],
    }

def now_utc():
    return datetime.now(timezone.utc)
