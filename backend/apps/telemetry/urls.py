from django.urls import path
from .views import TelemetryIngestView, TelemetryQueryView

urlpatterns = [
    path("ingest", TelemetryIngestView.as_view()),
    path("query", TelemetryQueryView.as_view()),
]
