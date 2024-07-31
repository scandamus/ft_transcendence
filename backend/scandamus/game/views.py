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
        logger.info(f"Fetched Match instance: {instance.id}, data: {instance}")
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)
    
    def perform_update(self, serializer):
        serializer.save()
        logger.info(f'//-- serializer.save() on: MatchViewSet perform_update')


class EntryViewSet(ModelViewSet):
    queryset = Entry.objects.all()
    serializer_class = EntrySerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
