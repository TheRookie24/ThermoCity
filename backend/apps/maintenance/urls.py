from django.urls import path
from .views import WorkOrderListCreate, WorkOrderDetail

urlpatterns = [
    path("workorders", WorkOrderListCreate.as_view()),
    path("workorders/<str:id>", WorkOrderDetail.as_view()),
]
