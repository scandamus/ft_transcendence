from rest_framework.viewsets import ModelViewSet, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Tournament, Match, Entry
from .serializers import TournamentSerializer, MatchSerializer, EntrySerializer
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import permissions, status
from rest_framework.permissions import AllowAny
from scandamus.authentication import InternalNetworkAuthentication
from .tasks import report_match_result
from django.db.models import Q

class TournamentViewSet(ModelViewSet):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['get'], url_path='result')
    def result(self, request, pk=None):
        tournament = self.get_object()
        return Response({
            "result": tournament.result_json
            },
            status=status.HTTP_200_OK
        )

class TournamentListView(generics.ListAPIView):
    serializer_class = TournamentSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        status = self.kwargs.get('status')
        if status:
            if status == 'ongoing': # frontendでは'preparing'も含める
                return Tournament.objects.filter(Q(status=status) | Q(status='preparing')).order_by('start')
            return Tournament.objects.filter(status=status).order_by('start')
        return Tournament.objects.all().order_by('start')

# コンテナ内部からのみのルーティングとなるため認証なし
class MatchViewSet(ModelViewSet):
    queryset = Match.objects.all()
    serializer_class = MatchSerializer
    authentication_classes = [InternalNetworkAuthentication] #[JWTAuthentication]
    permission_classes =[AllowAny] #[permissions.IsAuthenticated]

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        instance.set_winner()
        instance.save()

        if instance.tournament and instance.round:
#            score1 = instance.score1
#            score2 = instance.score2
#            status = instance.status

            if instance.tournament.status == 'ongoing':
                self.update_player_status_after_match(instance)
#                self.set_all_players_status(instance, 'tournament_room')
                if self.is_all_matches_finished(instance.tournament, instance.round):
                    report_match_result(instance.id)
        elif instance.status == 'after': # トーナメントマッチ以外はリセット
            self.reset_all_players_status(instance)

        return Response(serializer.data)
    
    def perform_update(self, serializer):
        serializer.save()

    def update_player_status_after_match(self, match):
        num_matches = match.tournament.matches.filter(round=match.round).count()
        if num_matches == 2: # 準決勝
            self.set_all_players_status('tournament_room')
        elif match.round > 0:
            loser = match.player1 if match.winner == match.player1 else match.player2
            loser.status = 'waiting'
            loser.save()
            match.winner.status = 'tournament_room'
            match.winner.save()
        elif match.round in [-1, -3]: # 決勝or3位決定戦
            self.reset_all_players_status(self, match)

    def set_all_players_status(self, match, status):
        players = [match.player1, match.player2, match.player3, match.player4]
        for player in players:
            if player:
                player.status = status
                player.current_match = None
                player.save()

    def reset_all_players_status(self, match):
        self.set_all_players_status(match, 'waiting')
    
    def is_all_matches_finished(self, tournament, current_round):
        matches = tournament.matches.filter(round=current_round)
        return all(match.status == 'after' for match in matches)

class EntryViewSet(ModelViewSet):
    queryset = Entry.objects.all()
    serializer_class = EntrySerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
