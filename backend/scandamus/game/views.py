from rest_framework.viewsets import ModelViewSet, generics
from .models import Tournament, Match, Entry
from .serializers import TournamentSerializer, MatchSerializer, EntrySerializer
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import permissions
from rest_framework.permissions import AllowAny
from scandamus.authentication import InternalNetworkAuthentication

class TournamentViewSet(ModelViewSet):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

class TournamentListView(generics.ListAPIView):
    serializer_class = TournamentSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        status = self.kwargs.get('status')
        if status:
            return Tournament.objects.filter(status=status).order_by('start')
        return Tournament.objects.all().order_by('start')

# コンテナ内部からのみのルーティングとなるため認証なし
class MatchViewSet(ModelViewSet):
    queryset = Match.objects.all()
    serializer_class = MatchSerializer
    authentication_classes = [InternalNetworkAuthentication] #[JWTAuthentication]
    permission_classes =[AllowAny] #[permissions.IsAuthenticated]

class EntryViewSet(ModelViewSet):
    queryset = Entry.objects.all()
    serializer_class = EntrySerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
