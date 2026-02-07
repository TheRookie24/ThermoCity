import jwt
from datetime import datetime, timezone
from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import LoginSerializer, MeSerializer, UserCreateSerializer
from .permissions import IsAdmin

def _make_token(user: User) -> str:
    now = datetime.now(timezone.utc)
    exp = now + settings.JWT_ACCESS_TTL
    payload = {
        "sub": user.id,
        "username": user.username,
        "exp": exp,
        "iat": now,
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

class LoginView(APIView):
    permission_classes = []

    def post(self, request):
        ser = LoginSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        user = authenticate(username=ser.validated_data["username"], password=ser.validated_data["password"])
        if not user:
            return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        token = _make_token(user)
        resp = Response({"ok": True})
        resp.set_cookie(
            settings.JWT_COOKIE_NAME,
            token,
            httponly=True,
            samesite="Lax",
            secure=False,  # local dev
            max_age=int(settings.JWT_ACCESS_TTL.total_seconds()),
        )
        return resp

class LogoutView(APIView):
    def post(self, request):
        resp = Response({"ok": True})
        resp.delete_cookie(settings.JWT_COOKIE_NAME)
        return resp

class MeView(APIView):
    def get(self, request):
        role = getattr(getattr(request.user, "profile", None), "role", "viewer")
        data = {"id": request.user.id, "username": request.user.username, "role": role}
        return Response(MeSerializer(data).data)

class CreateUserView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        ser = UserCreateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        user = ser.save()
        return Response({"id": user.id, "username": user.username}, status=201)
