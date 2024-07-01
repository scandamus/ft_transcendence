import logging

from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework import viewsets, renderers, status, generics
from .models import Player, FriendRequest
from django.contrib.auth.models import User
from .serializers import PlayerSerializer, UserSerializer, FriendRequestSerializer, UsernameSerializer

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

class UserListView(generics.ListAPIView):
    serializer_class = UserSerializer

    def get_queryset(self):
        queryset = (
            User.objects.all()
            .filter(is_superuser=False)
            .exclude(id=self.request.user.id)
        )
        return queryset

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