from rest_framework import serializers

class AlertRuleIn(serializers.Serializer):
    metric = serializers.CharField()
    operator = serializers.ChoiceField(choices=[">", ">=", "<", "<=", "=="])
    threshold = serializers.FloatField()
    severity = serializers.ChoiceField(choices=["low", "medium", "high", "critical"])
    scope = serializers.ChoiceField(choices=["city", "zone", "segment", "asset_type"])
    city_id = serializers.CharField(required=False, allow_blank=True)
    zone_id = serializers.CharField(required=False, allow_blank=True)
    asset_type = serializers.CharField(required=False, allow_blank=True)

class AlertEventActionIn(serializers.Serializer):
    status = serializers.ChoiceField(choices=["acknowledged", "closed"])
    notes = serializers.CharField(required=False, allow_blank=True)
