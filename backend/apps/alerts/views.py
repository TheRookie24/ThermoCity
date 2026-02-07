from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from mongoengine.errors import DoesNotExist
from .documents import AlertRule, AlertEvent
from .serializers import AlertRuleIn, AlertEventActionIn
from apps.authx.permissions import IsEngineerOrAbove, IsOpsOrAbove

def to_dict(doc):
    d = doc.to_mongo().to_dict()
    d["id"] = str(d.pop("_id"))
    for k in ["opened_at", "acknowledged_at", "closed_at"]:
        if d.get(k):
            d[k] = getattr(doc, k).isoformat()
    return d

class AlertRuleListCreate(APIView):
    permission_classes = [IsEngineerOrAbove]

    def get(self, request):
        return Response([to_dict(x) for x in AlertRule.objects.limit(500)])

    def post(self, request):
        ser = AlertRuleIn(data=request.data)
        ser.is_valid(raise_exception=True)
        doc = AlertRule(**ser.validated_data).save()
        return Response(to_dict(doc), status=201)

class AlertRuleDetail(APIView):
    permission_classes = [IsEngineerOrAbove]

    def put(self, request, id: str):
        ser = AlertRuleIn(data=request.data)
        ser.is_valid(raise_exception=True)
        try:
            doc = AlertRule.objects.get(id=id)
        except DoesNotExist:
            return Response({"detail": "Not found"}, status=404)
        for k, v in ser.validated_data.items():
            setattr(doc, k, v)
        doc.save()
        return Response(to_dict(doc))

    def delete(self, request, id: str):
        try:
            doc = AlertRule.objects.get(id=id)
        except DoesNotExist:
            return Response({"detail": "Not found"}, status=404)
        doc.delete()
        return Response(status=204)

class AlertEventList(APIView):
    permission_classes = [IsOpsOrAbove]

    def get(self, request):
        status_q = request.query_params.get("status")
        qs = AlertEvent.objects
        if status_q:
            qs = qs.filter(status=status_q)
        qs = qs.order_by("-opened_at").limit(500)
        return Response([to_dict(x) for x in qs])

class AlertEventAction(APIView):
    permission_classes = [IsOpsOrAbove]

    def post(self, request, id: str):
        ser = AlertEventActionIn(data=request.data)
        ser.is_valid(raise_exception=True)
        try:
            ev = AlertEvent.objects.get(id=id)
        except DoesNotExist:
            return Response({"detail": "Not found"}, status=404)

        role = getattr(getattr(request.user, "profile", None), "role", "viewer")
        actor = f"{request.user.username}:{role}"

        if ser.validated_data["status"] == "acknowledged":
            ev.status = "acknowledged"
            from .documents import now_utc
            ev.acknowledged_at = now_utc()
        else:
            ev.status = "closed"
            from .documents import now_utc
            ev.closed_at = now_utc()

        ev.actor = actor
        ev.notes = ser.validated_data.get("notes", "")
        ev.save()
        return Response(to_dict(ev))
