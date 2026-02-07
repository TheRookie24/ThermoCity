from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from mongoengine.errors import DoesNotExist
from datetime import datetime, timezone
from dateutil.parser import isoparse
from .documents import WorkOrder, now_utc
from .serializers import WorkOrderIn
from apps.authx.permissions import IsOpsOrAbove

def to_dict(doc: WorkOrder):
    d = doc.to_mongo().to_dict()
    d["id"] = str(d.pop("_id"))
    for k in ["created_at", "updated_at", "due_date"]:
        if getattr(doc, k, None):
            d[k] = getattr(doc, k).isoformat()
    return d

class WorkOrderListCreate(APIView):
    permission_classes = [IsOpsOrAbove]

    def get(self, request):
        asset_id = request.query_params.get("asset_id")
        qs = WorkOrder.objects
        if asset_id:
            qs = qs.filter(asset_id=asset_id)
        qs = qs.order_by("-created_at").limit(500)
        return Response([to_dict(x) for x in qs])

    def post(self, request):
        ser = WorkOrderIn(data=request.data)
        ser.is_valid(raise_exception=True)
        v = ser.validated_data
        due = None
        if v.get("due_date"):
            try:
                due = isoparse(v["due_date"])
                if due.tzinfo is None:
                    due = due.replace(tzinfo=timezone.utc)
                due = due.astimezone(timezone.utc)
            except Exception:
                due = None
        t = now_utc()
        doc = WorkOrder(
            title=v["title"],
            asset_id=v["asset_id"],
            priority=v["priority"],
            status=v["status"],
            assigned_to=v.get("assigned_to", ""),
            due_date=due,
            checklist=v.get("checklist", []),
            notes=v.get("notes", ""),
            attachments=v.get("attachments", []),
            created_at=t,
            updated_at=t,
        ).save()
        return Response(to_dict(doc), status=201)

class WorkOrderDetail(APIView):
    permission_classes = [IsOpsOrAbove]

    def put(self, request, id: str):
        ser = WorkOrderIn(data=request.data)
        ser.is_valid(raise_exception=True)
        try:
            doc = WorkOrder.objects.get(id=id)
        except DoesNotExist:
            return Response({"detail": "Not found"}, status=404)
        v = ser.validated_data
        for k in ["title", "asset_id", "priority", "status", "assigned_to", "checklist", "notes", "attachments"]:
            setattr(doc, k, v.get(k, getattr(doc, k)))
        if v.get("due_date"):
            try:
                from dateutil.parser import isoparse
                due = isoparse(v["due_date"])
                if due.tzinfo is None:
                    due = due.replace(tzinfo=timezone.utc)
                doc.due_date = due.astimezone(timezone.utc)
            except Exception:
                pass
        doc.updated_at = now_utc()
        doc.save()
        return Response(to_dict(doc))

    def delete(self, request, id: str):
        try:
            doc = WorkOrder.objects.get(id=id)
        except DoesNotExist:
            return Response({"detail": "Not found"}, status=404)
        doc.delete()
        return Response(status=204)
