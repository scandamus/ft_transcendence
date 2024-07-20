from rest_framework import serializers
from django.core.validators import RegexValidator
from .models import Tournament, Match, Entry
from players.models import Player
from decimal import Decimal, ROUND_DOWN

# validate_tournamentname
# 最小文字数: 3文字 / 最大文字数: 50文字 / 使用可能: 半角英小文字,半角数字,ひらがな,カタカナ,漢字、記号(@_#$%&!.+*~)

# validate_nickname
# 最小文字数: 3文字 / 最大文字数: 20文字 / 使用可能: 半角英小文字,半角数字,ひらがな,カタカナ,漢字、記号(@_#$%&!.+*~)

class CustomTournamentnameValidator:
    def __call__(self, name):
        errors = []

        # len
        if len(name) < 3 or len(name) > 50:
            errors.append('invalidTournamentnameLenBackend')

        if errors:
            raise serializers.ValidationError(errors)

        return None

# CharacterTypes
tournamentnameCharacterTypesValidator = RegexValidator(
    r'^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\w@_#$%&!.+*~]+$',
    'invalidTournamentnameCharacterTypesBackend',
    'invalid_tournamentname'
)

class CustomNicknameValidator:
    def __call__(self, nickname):
        errors = []
        
        # len
        if len(nickname) < 3 or len(nickname) > 20:
            errors.append('invalidNicknameLenBackend')

        if errors:
            raise serializers.ValidationError(errors)

        return None


# CharacterTypes
nicknameCharacterTypesValidator = RegexValidator(
    r'^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\w@_#$%&!.+*~]+$',
    'invalidNicknameCharacterTypesBackend',
    'invalid_nickname'
)

class TournamentSerializer(serializers.ModelSerializer):
    name = serializers.CharField(
        validators=[CustomTournamentnameValidator(), tournamentnameCharacterTypesValidator],
        required=True,
        error_messages={'blank': 'invalidTournamentnameBlank'}
    )
    current_participants = serializers.SerializerMethodField()
    nickname = serializers.SerializerMethodField()
    matches = serializers.PrimaryKeyRelatedField(
        queryset=Match.objects.all(),
        many=True,
        required=False,
        default=list
    )

    class Meta:
        model = Tournament
        fields = '__all__'

    def get_current_participants(self, obj):
        return Entry.objects.filter(tournament=obj).count()
    
    def get_nickname(self, obj):
        request = self.context.get('request', None)
        if request and request.user.is_authenticated:
            player = request.user.player
            try:
                entry = Entry.objects.get(tournament=obj, player=player)
                return entry.nickname
            except Entry.DoesNotExist:
                return ''
        return ''

class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = '__all__'
    
    def update(self, instance, validated_data):
        old_status = instance.status
        new_status = validated_data.get('status', instance.status)

        instance = super().update(instance, validated_data)

        if old_status != 'after' and new_status == 'after':
            self.set_players_to_waiting(instance)
            self.calc_players_level(instance)

        instance.save()
        return instance

    def set_players_to_waiting(self, match):
        players = [match.player1, match.player2, match.player3, match.player4]
        for player in players:
            if player:
                player.status = 'waiting'
                player.current_match = None
                player.save()

    def calc_players_level(self, match):
        players = [match.player1, match.player2, match.player3, match.player4]
        scores = [match.score1, match.score2, match.score3, match.score4]
        max_score_index = scores.index(max(scores))
        winning_player = players[max_score_index]

        # todo: Tournamentを考慮する場合の処理
        win_count_decimal = Decimal(winning_player.win_count)
        multiplier = Decimal('0.2')
        winning_player.level = (win_count_decimal * multiplier).quantize(Decimal('0.0'), rounding=ROUND_DOWN)
        winning_player.save()


class EntrySerializer(serializers.ModelSerializer):
    nickname = serializers.CharField(
        validators=[CustomNicknameValidator(), nicknameCharacterTypesValidator],
        required=True,
        error_messages={'blank': 'invalidNicknameBlank'}
    )

    class Meta:
        model = Entry
        fields = ['nickname']
