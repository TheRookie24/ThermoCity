from django.urls import path
from .views import LoginView, LogoutView, MeView, CreateUserView

urlpatterns = [
    path("login", LoginView.as_view()),
    path("logout", LogoutView.as_view()),
    path("me", MeView.as_view()),
    path("users", CreateUserView.as_view()),
]
