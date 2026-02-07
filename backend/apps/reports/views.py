import os
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
from apps.authx.permissions import IsOpsOrAbove
from apps.telemetry.documents import parse_ts
from .services import generate_pdf, generate_xlsx

class PdfReportView(APIView):
    permission_classes = [IsOpsOrAbove]

    def post(self, request):
        city_id = request.data.get("city_id")
        dt_from = request.data.get("from")
        dt_to = request.data.get("to")
        if not city_id or not dt_from or not dt_to:
            return Response({"detail": "city_id, from, to required"}, status=400)
        f = parse_ts(dt_from)
        t = parse_ts(dt_to)
        fn = generate_pdf(city_id, f, t)
        return Response({"file": fn, "url": f"/api/reports/download/{fn}"})

class XlsxReportView(APIView):
    permission_classes = [IsOpsOrAbove]

    def post(self, request):
        city_id = request.data.get("city_id")
        dt_from = request.data.get("from")
        dt_to = request.data.get("to")
        if not city_id or not dt_from or not dt_to:
            return Response({"detail": "city_id, from, to required"}, status=400)
        f = parse_ts(dt_from)
        t = parse_ts(dt_to)
        fn = generate_xlsx(city_id, f, t)
        return Response({"file": fn, "url": f"/api/reports/download/{fn}"})

class DownloadReportView(APIView):
    permission_classes = [IsOpsOrAbove]

    def get(self, request, filename: str):
        path = os.path.join(settings.REPORTS_DIR, filename)
        if not os.path.exists(path):
            return Response({"detail": "Not found"}, status=404)
        # simple file streaming
        from django.http import FileResponse
        content_type = "application/pdf" if filename.lower().endswith(".pdf") else "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        return FileResponse(open(path, "rb"), content_type=content_type)
