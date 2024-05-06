from rest_framework.viewsets import ModelViewSet
from .models import Tournament, Match, Entry
from .serializers import TournamentSerializer, MatchSerializer, EntrySerializer


class TournamentViewSet(ModelViewSet):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer


class MatchViewSet(ModelViewSet):
    queryset = Match.objects.all()
    serializer_class = MatchSerializer


class EntryViewSet(ModelViewSet):
    queryset = Entry.objects.all()
    serializer_class = EntrySerializer
