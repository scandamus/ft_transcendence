from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Player

# validate_password
# 最小文字数: 8文字 / 数字: 含む / 大文字: 含む / 小文字: 含む / 記号: 含む


class CustomPasswordValidator:
    def __call__(self, password):
        # Minimum length check
        if len(password) < 8:
            raise serializers.ValidationError('Password must be at least 8 characters long.')

        # Check if it contains a digit
        if not any(char.isdigit() for char in password):
            raise serializers.ValidationError('Password must contain at least one digit.')

        # Check if it contains an uppercase letter
        if not any(char.isupper() for char in password):
            raise serializers.ValidationError('Password must contain at least one uppercase letter.')

        # Check if it contains a lowercase letter
        if not any(char.islower() for char in password):
            raise serializers.ValidationError('Password must contain at least one lowercase letter.')

        # Check if it contains a special character
        special_chars = '!@#$%^&*()_+\-=\[\]{};:"\\|,.<>\/?~'
        if not any(char in special_chars for char in password):
            raise serializers.ValidationError('Password must contain at least one special character.')

        return None

    def get_help_text(self):
        return 'Password must be at least 8 characters long and contain at least one digit, one uppercase letter, one lowercase letter, and one special character.'


class UserSerializer(serializers.ModelSerializer):
    username = serializers.CharField(max_length=30, required=True)
    password = serializers.CharField(validators=[CustomPasswordValidator()], write_only=True, required=True)
    class Meta:
        model = User
        fields = ('username', 'password')

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('This username already exists.')
        return value


class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = '__all__'
