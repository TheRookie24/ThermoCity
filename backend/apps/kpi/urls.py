from django.urls import path
from .views import LatestKPIView, KPIQueryView

urlpatterns = [
    path("latest", LatestKPIView.as_view()),
    path("query", KPIQueryView.as_view()),
]
