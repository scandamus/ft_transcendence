from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Player
from django.contrib.auth.password_validation import validate_password

# validate_password
# 最小文字数: 8文字 / 数字: 含む / 大文字: 含む / 小文字: 含む / 記号: 含む


class UserSerializer(serializers.ModelSerializer):
    username = serializers.CharField(max_length=30, unique=True, required=True)
    password = serializers.CharField(validators=[validate_password], write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'password')


class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = '__all__'
