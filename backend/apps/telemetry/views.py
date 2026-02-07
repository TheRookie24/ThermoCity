from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime, timezone
from .documents import Telemetry, parse_ts
from .serializers import TelemetryIngestSerializer
from apps.authx.permissions import IsOpsOrAbove

class TelemetryIngestView(APIView):
    permission_classes = [IsOpsOrAbove]

    def post(self, request):
        ser = TelemetryIngestSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data
        ts = parse_ts(data["timestamp"])

        scope = "segment" if data.get("segment_id") else "asset"
        doc = Telemetry(
            scope=scope,
            city_id=data["city_id"],
            segment_id=data.get("segment_id") or None,
            asset_id=data.get("asset_id") or None,
            ts=ts,
            temps=data.get("temps", {}),
            flow=data.get("flow"),
            pressure=data.get("pressure"),
            kw_gross=data.get("kw_gross"),
            kwh_total=data.get("kwh_total"),
            fan_power=data.get("fan_power"),
            pump_power=data.get("pump_power"),
            pcm_temp=data.get("pcm_temp"),
        ).save()

        out = doc.to_mongo().to_dict()
        out["id"] = str(out.pop("_id"))
        return Response(out, status=201)

class TelemetryQueryView(APIView):
    def get(self, request):
        scope = request.query_params.get("scope", "segment")
        city_id = request.query_params.get("city_id")
        segment_id = request.query_params.get("segment_id")
        asset_id = request.query_params.get("asset_id")
        dt_from = request.query_params.get("from")
        dt_to = request.query_params.get("to")

        qs = Telemetry.objects.filter(scope=scope)
        if city_id:
            qs = qs.filter(city_id=city_id)
        if scope == "segment" and segment_id:
            qs = qs.filter(segment_id=segment_id)
        if scope == "asset" and asset_id:
            qs = qs.filter(asset_id=asset_id)

        if dt_from:
            qs = qs.filter(ts__gte=parse_ts(dt_from))
        if dt_to:
            qs = qs.filter(ts__lte=parse_ts(dt_to))

        qs = qs.order_by("-ts").limit(2000)
        rows = []
        for d in reversed(list(qs)):
            m = d.to_mongo().to_dict()
            m["id"] = str(m.pop("_id"))
            m["ts"] = d.ts.isoformat()
            rows.append(m)
        return Response(rows)
