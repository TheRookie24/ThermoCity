from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.authx.urls")),
    path("api/assets/", include("apps.assets.urls")),
    path("api/telemetry/", include("apps.telemetry.urls")),
    path("api/kpi/", include("apps.kpi.urls")),
    path("api/alerts/", include("apps.alerts.urls")),
    path("api/maintenance/", include("apps.maintenance.urls")),
    path("api/reports/", include("apps.reports.urls")),
]
