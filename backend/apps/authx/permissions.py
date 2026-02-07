# backend/apps/authx/permissions.py
from __future__ import annotations

from rest_framework.permissions import BasePermission, SAFE_METHODS

ROLE_ORDER = {
    "viewer": 10,
    "ops": 20,
    "engineer": 30,
    "admin": 40,
}


def _get_role(user) -> str:
    if not user or not getattr(user, "is_authenticated", False):
        return "viewer"

    # profile.role or user.role supported
    if hasattr(user, "profile") and getattr(user.profile, "role", None):
        return str(user.profile.role)
    if getattr(user, "role", None):
        return str(user.role)
    return "viewer"


def _role_at_least(user, minimum: str) -> bool:
    role = _get_role(user)
    return ROLE_ORDER.get(role, 0) >= ROLE_ORDER.get(minimum, 9999)


class IsAuthenticatedAndRole(BasePermission):
    """
    Generic RBAC permission.

    View may define:
      - allowed_roles = ["admin","engineer"]
      - allow_read_only_roles = ["viewer"]
    """

    message = "You do not have permission to perform this action."

    def has_permission(self, request, view) -> bool:
        user = request.user
        if not user or not user.is_authenticated:
            return False

        role = _get_role(user)
        allowed_roles = getattr(view, "allowed_roles", None) or []
        allow_read_only_roles = getattr(view, "allow_read_only_roles", None) or []

        if allowed_roles:
            if role in allowed_roles:
                return True
            if request.method in SAFE_METHODS and role in allow_read_only_roles:
                return True
            return False

        # Default behavior: viewers are read-only
        if role == "viewer" and request.method not in SAFE_METHODS:
            return False

        return True


class IsViewerOrAbove(BasePermission):
    def has_permission(self, request, view) -> bool:
        return bool(request.user and request.user.is_authenticated)


class IsOpsOrAbove(BasePermission):
    def has_permission(self, request, view) -> bool:
        return bool(request.user and request.user.is_authenticated and _role_at_least(request.user, "ops"))


class IsEngineerOrAbove(BasePermission):
    def has_permission(self, request, view) -> bool:
        return bool(
            request.user and request.user.is_authenticated and _role_at_least(request.user, "engineer")
        )


class IsAdmin(BasePermission):
    def has_permission(self, request, view) -> bool:
        return bool(request.user and request.user.is_authenticated and _get_role(request.user) == "admin")
