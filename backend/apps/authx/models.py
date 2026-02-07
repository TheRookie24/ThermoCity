from django.conf import settings
from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    ROLE_ADMIN = "admin"
    ROLE_ENGINEER = "engineer"
    ROLE_OPS = "ops"
    ROLE_VIEWER = "viewer"

    ROLE_CHOICES = [
        (ROLE_ADMIN, "Admin"),
        (ROLE_ENGINEER, "Engineer"),
        (ROLE_OPS, "Ops"),
        (ROLE_VIEWER, "Viewer"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_VIEWER)

    def __str__(self):
        return f"{self.user.username} ({self.role})"
