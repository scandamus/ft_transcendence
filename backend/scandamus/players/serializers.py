from django.contrib.auth.models import User
from rest_framework import serializers
from django.core.validators import RegexValidator

from .models import Player

# validate_username
# 最小文字数: 3文字 / 最大文字数: 32文字 / 使用可能: 英小文字、数字、アンダースコア(_) / アンダースコアのみは不可

# validate_password
# 最小文字数: 8文字 / 最大文字数: 24文字 / 数字: 含む / 大文字: 含む / 小文字: 含む / 記号: 含む


class CustomUsernameValidator:
    def __call__(self, username):
        errors = []

        # unique check
        if User.objects.filter(username=username).exists():
            errors.append('isExists')

        # len
        if len(username) < 3 or len(username) > 32:
            errors.append('invalidUsernameLenBackend')

        if errors:
            raise serializers.ValidationError(errors)

        return None


# CharacterTypes
usernameCharacterTypesValidator = RegexValidator(
    r'^(?=.*[a-z0-9])[a-z0-9_]+$',
    'invalidUsernameCharacterTypesBackend',
    'invalid_username'
)


class CustomPasswordValidator:
    def __call__(self, password):
        errors = []

        # len
        if len(password) < 8 or len(password) > 24:
            raise serializers.ValidationError('invalidPasswordLenBackend')

        if errors:
            raise serializers.ValidationError(errors)

        return None


# CharacterTypes
passwordCharacterTypesValidator = RegexValidator(
    r'^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@_#$%&!.,+*~\'])[\w@_#$%&!.,+*~\']+$',
    'invalidPasswordCharacterTypesBackend',
    'invalid_password'
)


class UserSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        validators=[CustomUsernameValidator(), usernameCharacterTypesValidator],
        required=True)
    password = serializers.CharField(
        validators=[CustomPasswordValidator(), passwordCharacterTypesValidator],
        write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'password')


class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = '__all__'

