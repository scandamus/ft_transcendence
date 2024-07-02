from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q

from rest_framework import viewsets, renderers, status, generics
from .models import Player, FriendRequest
from game.models import Match
from django.contrib.auth.models import User
from .serializers import PlayerSerializer, UserSerializer, FriendRequestSerializer, UsernameSerializer, MatchLogSerializer, RecommendedSerializer

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import permissions
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.parsers import MultiPartParser

# from django.http import JsonResponse
# from django.views.decorators.csrf import csrf_exempt
# from django.contrib.auth.decorators import login_required
# from django.contrib.auth.hashers import make_password
# from django.contrib.auth import authenticate, login, logout
# from django.views.decorators.http import require_POST
# from django.core.exceptions import ValidationError


# Create your views here.
class PlayersViewSet(viewsets.ModelViewSet):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    renderer_classes = [renderers.JSONRenderer]
    template_name = None


class ValidateView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            return Response({"message": "Validation successful"}, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RegisterView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            validated_data = serializer.validated_data
            # パスワードをハッシュ化して保存
            hashed_password = make_password(validated_data['password'])
            new_user = User.objects.create(username=validated_data['username'], password=hashed_password)
            new_user.save()
            return Response({'message': 'User created successfully.'}, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = TokenObtainPairSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            access = serializer.validated_data.get("access", None)
            refresh = serializer.validated_data.get("refresh", None)
            if access and refresh:
                return Response({
                    'access_token': access,
                    'refresh_token': refresh
                }, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Invalid token data'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            RefreshToken(refresh_token)
            return Response(status=status.HTTP_200_OK)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)

# @login_required
# @require_POST
# def logoutUser(request):
#     logout(request)
#     return JsonResponse({'message': 'Logout successful'}, status=200)
#
# @login_required
# def deleteUser(request):
#     if request.method == 'POST':
#         try:
#             user = User.objects.get(username=request.user.username)
#             username = user.username
#             user.delete()
#             logout(request)
#             return JsonResponse({'message': f'User {username} deleted successfully'}, status=200)
#         except User.DoesNotExist:
#             return JsonResponse({'error': 'User not found'}, status=404)
#
# def check_login_status(request):
#     if request.user.is_authenticated:
#         return JsonResponse({'is_loggedin': True})
#     else:
#         return JsonResponse({'is_loggedin': False})


class UserInfoView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, format=None):
        user = request.user
        player = Player.objects.get(user=user)

        data = {
            'is_authenticated': user.is_authenticated,
            'username': user.username,
            'avatar': player.avatar.url if player.avatar else '',
        }
        return Response(data)


# class CustomAuthToken(ObtainAuthToken):
#     def post(self, request, *args, **kwargs):
#         serializer = self.serializer_class(data=request.data,
#                                            context={'request': request})
#         serializer.is_valid(raise_exception=True)
#         user = serializer.validated_data['user']
#         token, created = Token.objects.get_or_create(user=user)
#         return Response({
#             'token': token.key,
#             'user_id': user.pk,
#             'username': user.username
#         })

class FriendListView(generics.ListAPIView):
    serializer_class = UsernameSerializer # PlayerSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        player = Player.objects.get(user=user)
        return player.friends.all()
    
class FriendRequestListView(generics.ListAPIView):
    serializer_class = FriendRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        player = Player.objects.get(user=user)
        return FriendRequest.objects.filter(to_user=player)

class AvatarUploadView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser]

    def put(self, request, format=None):
        user = request.user
        player = Player.objects.get(user=user)
        avatar_file = request.FILES.get('avatar')

        if avatar_file:
            player.avatar = avatar_file
            player.save()
            return Response({"newAvatar": player.avatar.url})
        else:
            return Response({"error": "No avatar file provided"}, status=400)

class MatchLogView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, format=None):
        user = request.user
        try:
            player = Player.objects.get(user=user)
        except Player.DoesNotExist:
            return Response({'detail': 'Player not found'}, status=404)
        matches = Match.objects.filter(
            (Q(player1=player) | Q(player2=player) | Q(player3=player) | Q(player4=player)) & Q(tournament__isnull=True)
        )[:10]
        serializer = MatchLogSerializer(matches, many=True, context={'request': request})
        return Response(serializer.data)

class RecommendedView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, format=None):
        user = request.user
        try:
            player = Player.objects.get(user=user)
        except Player.DoesNotExist:
            return Response({'detail': 'Player not found'}, status=404)
        current_friends = player.friends.all()
        matches = Match.objects.filter(
            Q(player1=player) | Q(player2=player) | Q(player3=player) | Q(player4=player)
        )[:20]
        opponents = set()
        for match in matches:
            if match.player1 != player and match.player1 not in current_friends:
                opponents.add(match.player1)
            if match.player2 != player and match.player2 not in current_friends:
                opponents.add(match.player2)
            if match.player3 and match.player3 != player and match.player3 not in current_friends:
                opponents.add(match.player3)
            if match.player4 and match.player4 != player and match.player4 not in current_friends:
                opponents.add(match.player4)

            # 最大10人まで取得
            if len(opponents) >= 10:
                break
        serializer = RecommendedSerializer(opponents, many=True, context={'request': request})
        return Response(serializer.data)
