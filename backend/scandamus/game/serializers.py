import logging
from rest_framework import serializers
from django.core.validators import RegexValidator
from .models import Tournament, Match, Entry
from players.models import Player
from django.conf import settings
from datetime import datetime, timedelta, timezone
from channels.db import database_sync_to_async
from .tournament_match import report_match_result

logger = logging.getLogger(__name__)

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
    r'^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\u3005\w@_#$%&!.+*~]+$',
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
@database_sync_to_async
def get_existing_tournaments():
    return Tournament.objects.all()

async def async_validate_start_time(start_time):
    errors = []

    now = datetime.now(timezone.utc)
    if start_time <= now + timedelta(minutes=int(settings.CREATE_TOURNAMENT_TIMELIMIT_MIN)):
        errors.append('startTimeInvalidBackend')

    existing_tournaments = await database_sync_to_async(list)(Tournament.objects.filter(status='upcoming'))
    for tournament in existing_tournaments:
        tournament_start = tournament.start
        if abs((start_time - tournament_start).total_seconds()) < 6 * 3600:
            errors.append('intervalErrorBackend')
            break

    if errors:
        raise serializers.ValidationError(errors)
    return None


class TournamentSerializer(serializers.ModelSerializer):
    name = serializers.CharField(
        validators=[CustomTournamentnameValidator(), tournamentnameCharacterTypesValidator],
        required=True,
        error_messages={'blank': 'invalidTournamentnameBlank'}
    )
    start = serializers.DateTimeField(
        # validators=[async_validate_start_time]
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
        instance.set_winner()
        # instance.save() update(), 及びset_winner()内で保存済み
        logger.info(f'//-- Match save() on: MatchSerializer update')

        if instance.tournament and instance.round:
            if instance.tournament.status == 'ongoing':
                self.update_player_status_after_match(instance)
                if self.is_all_matches_finished(instance.tournament, instance.round):
                    logger.info(f"All matches finished for tournament: {instance.tournament.id}, round: {instance.round}")
                    report_match_result(instance.id)
        elif old_status != 'after' and new_status == 'after': # トーナメントマッチ以外はリセット
            self.reset_all_players_status(instance)

        return instance

    def update_player_status_after_match(self, match):
        num_matches = match.tournament.matches.filter(round=match.round).count()
        if num_matches == 2 and match.tournament.bye_player is None: # 準決勝
            self.set_all_players_status(match, 'tournament_room')
        elif match.round > 0:
            loser = match.player2 if match.winner == match.player1 else match.player1
            loser.status = 'waiting'
            loser.save(update_fields=['status'])
            logger.info(f'//-- Player save() on: update_player_status_after_match 1')
            match.winner.status = 'tournament_room'
            match.winner.save(update_fields=['status'])
            logger.info(f'//-- Player save() on: update_player_status_after_match 2')
        elif match.round in [-1, -3, -6]: # 決勝or3位決定戦
            self.reset_all_players_status(match)
        elif match.round == -4: # 3人準決勝の1戦目（両者控室）
            self.set_all_players_status(match, 'tournament_room')
        elif match.round == -5: # 3人順決勝の2戦目
            loser = match.player2 if match.winner == match.player1 else match.player1
            loser.status = 'waiting'
            loser.save(update_fields=['status'])
            logger.info(f'//-- Player save() on: update_player_status_after_match 3')

    def set_all_players_status(self, match, status):
        players = [match.player1, match.player2, match.player3, match.player4]
        for player in players:
            if player:
                player.status = status
                player.current_match = None
                player.save(update_fields=['status', 'current_match'])
                logger.info(f'//-- Player save() on: set_players_to_waiting')

    def reset_all_players_status(self, match):
        self.set_all_players_status(match, 'waiting')
    
    def is_all_matches_finished(self, tournament, current_round):
        matches = tournament.matches.filter(round=current_round)
        number_of_finished_matches = len(matches)
        logger.info(f'number of matches_finished for round:{current_round} = {number_of_finished_matches}')
        return all(match.status == 'after' for match in matches)
    
class EntrySerializer(serializers.ModelSerializer):
    nickname = serializers.CharField(
        validators=[CustomNicknameValidator(), nicknameCharacterTypesValidator],
        required=True,
        error_messages={'blank': 'invalidNicknameBlank'}
    )

    class Meta:
        model = Entry
        fields = ['nickname']
