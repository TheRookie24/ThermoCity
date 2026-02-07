from rest_framework import serializers
from .documents import City, Zone, Road, RoadSegment, Collector, PCMModule, ConversionUnit, Sensor

def _doc_to_dict(doc):
    d = doc.to_mongo().to_dict()
    d["id"] = str(d.pop("_id"))
    return d

class MongoDocSerializer(serializers.Serializer):
    def to_representation(self, instance):
        return _doc_to_dict(instance)

class CityIn(serializers.Serializer):
    name = serializers.CharField()
    code = serializers.CharField()

class ZoneIn(serializers.Serializer):
    city_id = serializers.CharField()
    name = serializers.CharField()

class RoadIn(serializers.Serializer):
    city_id = serializers.CharField()
    zone_id = serializers.CharField()
    name = serializers.CharField()

class RoadSegmentIn(serializers.Serializer):
    city_id = serializers.CharField()
    zone_id = serializers.CharField()
    road_id = serializers.CharField()
    name = serializers.CharField()
    geometry = serializers.DictField()
    is_active = serializers.BooleanField(required=False, default=True)

class CollectorIn(serializers.Serializer):
    city_id = serializers.CharField()
    segment_id = serializers.CharField()
    type = serializers.ChoiceField(choices=["pipe_grid", "thermal_plate", "heat_pipe"])

class PCMModuleIn(serializers.Serializer):
    city_id = serializers.CharField()
    segment_id = serializers.CharField()
    capacity_kwh_th = serializers.FloatField()
    melt_temp_min = serializers.FloatField()
    melt_temp_max = serializers.FloatField()
    location = serializers.DictField()

class ConversionUnitIn(serializers.Serializer):
    city_id = serializers.CharField()
    segment_id = serializers.CharField()
    type = serializers.ChoiceField(choices=["ORC", "TEG"])
    rated_kw = serializers.FloatField()

class SensorIn(serializers.Serializer):
    city_id = serializers.CharField()
    linked_asset_type = serializers.ChoiceField(choices=["segment", "pcm", "conversion", "collector"])
    linked_asset_id = serializers.CharField()
    type = serializers.CharField()
    unit = serializers.CharField()
    calibration = serializers.DictField(required=False, default=dict)

MODEL_MAP = {
    "cities": (City, CityIn),
    "zones": (Zone, ZoneIn),
    "roads": (Road, RoadIn),
    "segments": (RoadSegment, RoadSegmentIn),
    "collectors": (Collector, CollectorIn),
    "pcm": (PCMModule, PCMModuleIn),
    "conversion": (ConversionUnit, ConversionUnitIn),
    "sensors": (Sensor, SensorIn),
}
