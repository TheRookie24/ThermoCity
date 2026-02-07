import jwt
from django.conf import settings
from django.contrib.auth.models import User
from rest_framework.authentication import BaseAuthentication
from rest_framework import exceptions

class CookieJWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        token = request.COOKIES.get(settings.JWT_COOKIE_NAME)
        if not token:
            return None
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed("Token expired")
        except jwt.InvalidTokenError:
            raise exceptions.AuthenticationFailed("Invalid token")

        user_id = payload.get("sub")
        if not user_id:
            raise exceptions.AuthenticationFailed("Invalid token payload")

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise exceptions.AuthenticationFailed("User not found")

        return (user, None)
