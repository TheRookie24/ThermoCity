from rest_framework.views import APIView
from rest_framework.response import Response
from .documents import KPI
from apps.authx.permissions import IsOpsOrAbove

class LatestKPIView(APIView):
    permission_classes = [IsOpsOrAbove]

    def get(self, request):
        scope = request.query_params.get("scope", "segment")
        segment_id = request.query_params.get("segment_id")
        asset_id = request.query_params.get("asset_id")
        qs = KPI.objects.filter(scope=scope)
        if scope == "segment" and segment_id:
            qs = qs.filter(segment_id=segment_id)
        if scope == "asset" and asset_id:
            qs = qs.filter(asset_id=asset_id)
        doc = qs.order_by("-ts").first()
        if not doc:
            return Response({"detail": "No KPI"}, status=404)
        m = doc.to_mongo().to_dict()
        m["id"] = str(m.pop("_id"))
        m["ts"] = doc.ts.isoformat()
        return Response(m)

class KPIQueryView(APIView):
    permission_classes = [IsOpsOrAbove]

    def get(self, request):
        scope = request.query_params.get("scope", "segment")
        segment_id = request.query_params.get("segment_id")
        qs = KPI.objects.filter(scope=scope)
        if segment_id:
            qs = qs.filter(segment_id=segment_id)
        qs = qs.order_by("-ts").limit(2000)
        rows = []
        for d in reversed(list(qs)):
            m = d.to_mongo().to_dict()
            m["id"] = str(m.pop("_id"))
            m["ts"] = d.ts.isoformat()
            rows.append(m)
        return Response(rows)
