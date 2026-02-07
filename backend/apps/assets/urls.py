from django.urls import path
from .views import MongoCrudListCreate, MongoCrudDetail

urlpatterns = [
    path("<str:kind>", MongoCrudListCreate.as_view()),
    path("<str:kind>/<str:id>", MongoCrudDetail.as_view()),
]
