from rest_framework.viewsets import ModelViewSet, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Tournament, Match, Entry
from .serializers import TournamentSerializer, MatchSerializer, EntrySerializer
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import permissions, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from scandamus.authentication import InternalNetworkAuthentication
from .tournament_match import report_match_result
from django.db.models import Q

import logging

logger = logging.getLogger(__name__)

class TournamentViewSet(ModelViewSet):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['get'], url_path='result')
    def result(self, request, pk=None):
        tournament = self.get_object()
        entried_players = Entry.objects.filter(tournament=tournament).select_related('player')
        player_avatars = []
        for entry in entried_players:
            player = entry.player
            player_avatars.append({
                "player_id": player.id,
                "avatar_url": player.avatar.url if player.avatar else None
            })
        player_avatar_map = {player['player_id']: player['avatar_url'] for player in player_avatars}
        return Response({
            "name": tournament.name,
            "start": tournament.start,
            "result": tournament.result_json,
            "player_avatar_map": player_avatar_map
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
                queryset = Tournament.objects.filter(Q(status=status) | Q(status='preparing')).order_by('start')
            elif status == 'finished': # finishedは降順
                queryset = Tournament.objects.filter(status=status).order_by('-start')
            else:
                queryset = Tournament.objects.filter(status=status).order_by('start')
        else:
            queryset = Tournament.objects.all().order_by('start')
        # 新しいもの10件表示
        return queryset[:10]

    def list(self, request, *args, **kwargs):
        status = self.kwargs.get('status')
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)

        if status == 'upcoming':
            start_dates = queryset.values_list('start', flat=True)
            return Response({
                'list': serializer.data,
                'start_dates': start_dates
            })

        return Response({
            'list': serializer.data
        })

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
        if num_matches == 2 and match.tournament.bye_player is None: # 準決勝
            self.set_all_players_status(match, 'tournament_room')
        elif match.round > 0:
            loser = match.player2 if match.winner == match.player1 else match.player1
            loser.status = 'waiting'
            loser.save()
            match.winner.status = 'tournament_room'
            match.winner.save()
        elif match.round in [-1, -3, -6]: # 決勝or3位決定戦
            self.reset_all_players_status(match)
        elif match.round == -5: # 3人順決勝の2戦目
            loser = match.player2 if match.winner == match.player1 else match.player1
            loser.status = 'waiting'
            loser.save()

    def set_all_players_status(self, match, status):
        players = [match.player1, match.player2, match.player3, match.player4]
        for player in players:
            if player:
                player.status = status
                player.current_match = None
                player.save(update_fields=['status', 'current_match'])

    def reset_all_players_status(self, match):
        self.set_all_players_status(match, 'waiting')
    
    def is_all_matches_finished(self, tournament, current_round):
        matches = tournament.matches.filter(round=current_round)
        number_of_finished_matches = len(matches)
        logger.info(f'number of matches_finished for round:{current_round} = {number_of_finished_matches}')
        return all(match.status == 'after' for match in matches)

class EntryViewSet(ModelViewSet):
    queryset = Entry.objects.all()
    serializer_class = EntrySerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
