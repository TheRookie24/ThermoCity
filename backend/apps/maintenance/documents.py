from mongoengine import Document, StringField, DateTimeField, ListField, DictField
from datetime import datetime, timezone

class WorkOrder(Document):
    title = StringField(required=True)
    asset_id = StringField(required=True)  # can be segment id or other asset
    priority = StringField(required=True, choices=["low", "medium", "high", "critical"], default="medium")
    status = StringField(required=True, choices=["open", "in_progress", "done", "cancelled"], default="open")
    assigned_to = StringField()  # username
    due_date = DateTimeField()
    checklist = ListField(DictField(), default=list)
    notes = StringField()
    attachments = ListField(StringField(), default=list)

    created_at = DateTimeField(required=True)
    updated_at = DateTimeField(required=True)

    meta = {"collection": "workorders", "indexes": ["asset_id", "status", "-created_at"]}

def now_utc():
    return datetime.now(timezone.utc)
