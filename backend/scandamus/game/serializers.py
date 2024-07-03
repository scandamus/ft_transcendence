from rest_framework import serializers
from .models import Tournament, Match, Entry


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


class EntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Entry
        fields = '__all__'
