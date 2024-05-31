from django.conrtrib.auth import auhenticate
from rest_framework.viewsets import ModelViewSet
from rest_framework.simplejwt.tokens import RefreshToken
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
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

class JoinGameView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        game_id = request.data.get('game_id')
        game_token = issue_game_token(user, game_id)
        return Response({"game_token": game_token})
    
def issue_game_token(user, game_id):
    refresh = RefreshToken.for_user(user)
    refresh['game_id'] = game_id
    return str(refresh.access_token)