from django.urls import path
from .views import PdfReportView, XlsxReportView, DownloadReportView

urlpatterns = [
    path("pdf", PdfReportView.as_view()),
    path("xlsx", XlsxReportView.as_view()),
    path("download/<str:filename>", DownloadReportView.as_view()),
]
