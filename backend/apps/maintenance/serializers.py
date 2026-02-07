from rest_framework import serializers

class WorkOrderIn(serializers.Serializer):
    title = serializers.CharField()
    asset_id = serializers.CharField()
    priority = serializers.ChoiceField(choices=["low", "medium", "high", "critical"], default="medium")
    status = serializers.ChoiceField(choices=["open", "in_progress", "done", "cancelled"], default="open")
    assigned_to = serializers.CharField(required=False, allow_blank=True)
    due_date = serializers.CharField(required=False, allow_blank=True)
    checklist = serializers.ListField(child=serializers.DictField(), required=False, default=list)
    notes = serializers.CharField(required=False, allow_blank=True)
    attachments = serializers.ListField(child=serializers.CharField(), required=False, default=list)
