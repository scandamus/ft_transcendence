from django.contrib.auth.models import User
from rest_framework import serializers
from django.utils.translation import gettext as _
from django.core.validators import RegexValidator
from .models import Player

# validate_username
# 最小文字数: 3文字 / 最大文字数: 15文字 / 使用可能: アルファベット(大文字小文字)、数字、アンダースコア(_) / アンダースコアのみは不可

# validate_password
# 最小文字数: 8文字 / 最大文字数: 24文字 / 数字: 含む / 大文字: 含む / 小文字: 含む / 記号: 含む


class CustomUsernameValidator:
    def __call__(self, username):
        # unique check
        if User.objects.filter(username=username).exists():
            raise serializers.ValidationError('This username already exists.')

        # len
        if len(username) < 3 or len(username) > 15:
            raise serializers.ValidationError('Username must be between 3 and 15 characters long.')

        # 文字種
        alphanumeric_validator = RegexValidator(
            r'^(?=.*[a-zA-Z0-9])[\w_]+$',
            _('Enter a valid username. This value may contain only letters, numbers, and underscores.'),
            'invalid_username'
        )
        alphanumeric_validator(username)

        return None

    def get_help_text(self):
        return 'Username must be between 3 and 30 characters long and contain only letters, numbers, and underscores.'


class CustomPasswordValidator:
    def __call__(self, password):
        # len
        if len(password) < 8 or len(password) > 24:
            raise serializers.ValidationError('Password must be between 8 and 64 characters long.')

        # 文字種
        alphanumeric_validator = RegexValidator(
            r'^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@_#$%&!.,+*~\'])[\w@_#$%&!.,+*~\']+$',
            _('Enter a valid password. This value may contain at least one digit, one uppercase letter, one lowercase letter, and one special character.'),
            'invalid_username'
        )
        alphanumeric_validator(password)

        return None

    def get_help_text(self):
        return 'Password must be between 8 and 64 characters long and contain at least one digit, one uppercase letter, one lowercase letter, and one special character.'


class UserSerializer(serializers.ModelSerializer):
    username = serializers.CharField(validators=[CustomUsernameValidator()], required=True)
    password = serializers.CharField(validators=[CustomPasswordValidator()], write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'password')


class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = '__all__'

