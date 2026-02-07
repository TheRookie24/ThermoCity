from mongoengine import (
    Document, EmbeddedDocument,
    StringField, FloatField, IntField, DateTimeField,
    EmbeddedDocumentField, ListField, ReferenceField, DictField, BooleanField
)
from datetime import datetime, timezone

class GeoPoint(EmbeddedDocument):
    type = StringField(default="Point")
    coordinates = ListField(FloatField(), min_length=2, max_length=2)  # [lng, lat]

class GeoLineString(EmbeddedDocument):
    type = StringField(default="LineString")
    coordinates = ListField(ListField(FloatField(), min_length=2, max_length=2))  # [[lng,lat],...]

class City(Document):
    name = StringField(required=True, unique=True)
    code = StringField(required=True, unique=True)
    meta = {"collection": "cities"}

class Zone(Document):
    city_id = StringField(required=True)
    name = StringField(required=True)
    meta = {"collection": "zones", "indexes": ["city_id"]}

class Road(Document):
    city_id = StringField(required=True)
    zone_id = StringField(required=True)
    name = StringField(required=True)
    meta = {"collection": "roads", "indexes": ["city_id", "zone_id"]}

class RoadSegment(Document):
    city_id = StringField(required=True)
    zone_id = StringField(required=True)
    road_id = StringField(required=True)
    name = StringField(required=True)
    geometry = EmbeddedDocumentField(GeoLineString, required=True)
    is_active = BooleanField(default=True)
    meta = {"collection": "road_segments", "indexes": ["city_id", "zone_id", "road_id"]}

class Collector(Document):
    city_id = StringField(required=True)
    segment_id = StringField(required=True)
    type = StringField(required=True, choices=["pipe_grid", "thermal_plate", "heat_pipe"])
    meta = {"collection": "collectors", "indexes": ["city_id", "segment_id"]}

class PCMModule(Document):
    city_id = StringField(required=True)
    segment_id = StringField(required=True)
    capacity_kwh_th = FloatField(required=True)
    melt_temp_min = FloatField(required=True)
    melt_temp_max = FloatField(required=True)
    location = EmbeddedDocumentField(GeoPoint, required=True)
    meta = {"collection": "pcm_modules", "indexes": ["city_id", "segment_id"]}

class ConversionUnit(Document):
    city_id = StringField(required=True)
    segment_id = StringField(required=True)
    type = StringField(required=True, choices=["ORC", "TEG"])
    rated_kw = FloatField(required=True)
    meta = {"collection": "conversion_units", "indexes": ["city_id", "segment_id"]}

class Sensor(Document):
    city_id = StringField(required=True)
    linked_asset_type = StringField(required=True, choices=["segment", "pcm", "conversion", "collector"])
    linked_asset_id = StringField(required=True)
    type = StringField(required=True)  # e.g., temp_surface, flow, pressure, power_kw
    unit = StringField(required=True)
    calibration = DictField(default=dict)
    meta = {"collection": "sensors", "indexes": ["city_id", "linked_asset_type", "linked_asset_id"]}

def now_utc():
    return datetime.now(timezone.utc)
