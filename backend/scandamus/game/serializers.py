from rest_framework import serializers
from .models import Tournament, Match, Entry
from players.models import Player


class TournamentSerializer(serializers.ModelSerializer):
    current_participants = serializers.SerializerMethodField()
    nickname = serializers.SerializerMethodField()
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
