from rest_framework import serializers
from .models import Tournament, Match, Entry
from players.models import Player
from decimal import Decimal, ROUND_DOWN

class TournamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tournament
        fields = '__all__'


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
    class Meta:
        model = Entry
        fields = '__all__'
