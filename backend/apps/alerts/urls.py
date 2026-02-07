from django.urls import path
from .views import AlertRuleListCreate, AlertRuleDetail, AlertEventList, AlertEventAction

urlpatterns = [
    path("rules", AlertRuleListCreate.as_view()),
    path("rules/<str:id>", AlertRuleDetail.as_view()),
    path("events", AlertEventList.as_view()),
    path("events/<str:id>/action", AlertEventAction.as_view()),
]
