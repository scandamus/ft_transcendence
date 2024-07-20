import logging

from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q

from rest_framework import viewsets, renderers, status, generics
from .models import Player, FriendRequest
from game.models import Match
from django.contrib.auth.models import User
from .serializers import PlayerSerializer, UserSerializer, FriendRequestSerializer, FriendSerializer, MatchLogSerializer, RecommendedSerializer

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import permissions
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.parsers import MultiPartParser, JSONParser
import random

# from django.http import JsonResponse
# from django.views.decorators.csrf import csrf_exempt
# from django.contrib.auth.decorators import login_required
# from django.contrib.auth.hashers import make_password
# from django.contrib.auth import authenticate, login, logout
# from django.views.decorators.http import require_POST
# from django.core.exceptions import ValidationError

logger = logging.getLogger(__name__)

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

class DeleteUserView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        username = request.data.get('username')
        logger.info(f'DeleteUserView in for {username}')
        try:
            user = User.objects.get(username=username)
            user.delete()
            logger.info(f'User deleted: {username}')
            response = Response({'message': 'User deleted successfully'}, status=status.HTTP_200_OK)
            logger.info(f'Delete response: {response.data}, headers: {response.headers}')
            return response
        except User.DoesNotExist:
            response = Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
            logger.info(f'Delete response: {response.data}, headers: {response.headers}')
            return response
        
    def delete(self, request, username=None):
        logger.info(f'DeleteUserView in for {username}')
        try:
            user = User.objects.get(username=username)
            user.delete()
            logger.info(f'User deleted: {username}')
            return Response({'message': 'User deleted successfully'}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            logger.error(f'User {username} not found')
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

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
            'lang': player.lang,
        }
        return Response(data)


class UserLevelView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, format=None):
        user = request.user
        player = Player.objects.get(user=user)

        data = {
            'is_authenticated': user.is_authenticated,
            'level': "{:.1f}".format(player.level),
            'win_count': player.win_count,
            'loss_count': player.play_count - player.win_count,
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
    serializer_class = FriendSerializer # PlayerSerializer
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
            return Response({"error": "No avatar file provided"}, status=status.HTTP_400_BAD_REQUEST)

class LangUpdateView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [JSONParser]

    def put(self, request, format=None):
        user = request.user
        try:
            player = Player.objects.get(user=user)
        except Player.DoesNotExist:
            return Response({"Player doesn't exist for user: {user.username}"}, status=status.HTTP_404_NOT_FOUND)
        new_lang = request.data.get("lang")
        if new_lang and new_lang in dict(player._meta.get_field('lang').choices):
            player.lang = new_lang
            player.save()
            return Response({'message': 'Language updated successfully'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid language choice'}, status=status.HTTP_400_BAD_REQUEST)

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
        ).order_by('-id')[:5]
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
        sent_requests = FriendRequest.objects.filter(from_user=player).values_list('to_user', flat=True)
        matches = Match.objects.filter(
            Q(player1=player) | Q(player2=player) | Q(player3=player) | Q(player4=player)
        ).order_by('-id')[:30]
        opponents = {
            opponent for match in matches
            for opponent in [match.player1, match.player2, match.player3, match.player4]
            if opponent is not None and opponent != player and opponent not in current_friends and opponent.id not in sent_requests
        }
        opponents = list(opponents)
        random.shuffle(opponents)
        serializer = RecommendedSerializer(opponents[:5], many=True, context={'request': request})
        return Response(serializer.data)
