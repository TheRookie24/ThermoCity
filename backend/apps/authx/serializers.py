from django.contrib.auth.models import User
from rest_framework import serializers
from .models import UserProfile

class MeSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    username = serializers.CharField()
    role = serializers.CharField()

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

class UserCreateSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(min_length=6)
    role = serializers.ChoiceField(choices=UserProfile.ROLE_CHOICES)

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"],
        )
        UserProfile.objects.create(user=user, role=validated_data["role"])
        return user
