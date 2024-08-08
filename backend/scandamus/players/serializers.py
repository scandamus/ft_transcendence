from django.contrib.auth.models import User
from rest_framework import serializers
from django.core.validators import RegexValidator

from .models import Player, FriendRequest
from game.models import Match

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
        required=True,
        error_messages={'blank': 'invalidUsernameBlank'}
    )
    password = serializers.CharField(
        validators=[CustomPasswordValidator(), passwordCharacterTypesValidator],
        write_only=True, required=True,
        error_messages={'blank': 'invalidPasswordBlank'}
    )

    class Meta:
        model = User
        fields = ('username', 'password')


class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = '__all__'

class FriendSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = Player
        fields = ['username', 'avatar', 'online']

    def get_avatar(self, obj):
        return obj.avatar.url if obj.avatar else ''

class FriendRequestSerializer(serializers.ModelSerializer):
    from_user = serializers.CharField(source='from_user.user.username')
    to_user = serializers.CharField(source='to_user.user.username')
    from_user_avatar = serializers.SerializerMethodField()

    class Meta:
        model = FriendRequest
        fields = ['id', 'from_user', 'to_user', 'from_user_avatar', 'created_at']

    def get_from_user_avatar(self, obj):
        player = Player.objects.get(user=obj.from_user.user)
        return player.avatar.url if player.avatar else ''

class PlayerInfoSerializer(serializers.Serializer):
    username = serializers.CharField()
    avatar = serializers.URLField()
    score = serializers.IntegerField()

class MatchLogSerializer(serializers.ModelSerializer):
    ID = serializers.ReadOnlyField(source='id')
    my_score = serializers.SerializerMethodField()
    is_win = serializers.SerializerMethodField()
    players = serializers.SerializerMethodField()

    class Meta:
        model = Match
        fields = ['ID', 'last_updated', 'my_score', 'is_win', 'players']

    def get_my_score(self, obj):
        user = self.context['request'].user
        if obj.player1 and obj.player1.user == user:
            return obj.score1
        elif obj.player2 and obj.player2.user == user:
            return obj.score2
        elif obj.player3 and obj.player3.user == user:
            return obj.score3
        elif obj.player4 and obj.player4.user == user:
            return obj.score4
        return None

    def get_is_win(self, obj):
        user = self.context['request'].user
        if obj.winner:
            return obj.winner.user == user
        return False

    def get_players(self, obj):
        players_info = [
            {'username': obj.player1.user.username if obj.player1 else '--------', 'avatar': obj.player1.avatar.url if obj.player1 and obj.player1.avatar else None, 'score': obj.score1, 'is_win': obj.winner == obj.player1},
            {'username': obj.player2.user.username if obj.player2 else '--------', 'avatar': obj.player2.avatar.url if obj.player2 and obj.player2.avatar else None, 'score': obj.score2, 'is_win': obj.winner == obj.player2}
        ]
        if obj.player3:
            players_info.append(
                {'username': obj.player3.user.username, 'avatar': obj.player3.avatar.url if obj.player3.avatar else None, 'score': obj.score3, 'is_win': obj.winner == obj.player3})
        if obj.player4:
            players_info.append(
                {'username': obj.player4.user.username, 'avatar': obj.player4.avatar.url if obj.player4.avatar else None, 'score': obj.score4, 'is_win': obj.winner == obj.player4})

        # ログインユーザー以外の全プレイヤー情報を取得
        user = self.context['request'].user
        players = []
        for player_info in players_info:
            if player_info['username'] != user.username and player_info['username']:
                players.append(
                    {'username': player_info['username'], 'avatar': player_info['avatar'], 'score': player_info['score'], 'is_win': player_info['is_win']})
        return players

class RecommendedSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = Player
        fields = ['username', 'avatar']

    def get_username(self, obj):
        user = self.context['request'].user
        return user.username

    def get_avatar(self, obj):
        return obj.avatar.url if obj.avatar else None
