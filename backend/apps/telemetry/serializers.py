from rest_framework import serializers

class TelemetryIngestSerializer(serializers.Serializer):
    city_id = serializers.CharField()
    segment_id = serializers.CharField(required=False, allow_blank=True)
    asset_id = serializers.CharField(required=False, allow_blank=True)
    timestamp = serializers.CharField()

    temps = serializers.DictField(required=True)
    flow = serializers.FloatField(required=False, allow_null=True)
    pressure = serializers.FloatField(required=False, allow_null=True)
    kw_gross = serializers.FloatField(required=False, allow_null=True)
    kwh_total = serializers.FloatField(required=False, allow_null=True)
    fan_power = serializers.FloatField(required=False, allow_null=True)
    pump_power = serializers.FloatField(required=False, allow_null=True)
    pcm_temp = serializers.FloatField(required=False, allow_null=True)

    def validate(self, attrs):
        if not attrs.get("segment_id") and not attrs.get("asset_id"):
            raise serializers.ValidationError("Either segment_id or asset_id required")
        return attrs
