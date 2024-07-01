from rest_framework import serializers
from .models import Tournament, Match, Entry
from players.models import Player


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

        instance.save()
        return instance

    def set_players_to_waiting(self, match):
        players = [match.player1, match.player2, match.player3, match.player4]
        for player in players:
            if player:
                player.status = 'waiting'
                player.current_match = None
                player.save()

class EntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Entry
        fields = '__all__'
