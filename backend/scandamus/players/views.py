from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework import viewsets, renderers, status
from .models import Player
from .serializers import PlayerSerializer

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

# from django.http import JsonResponse
# from .models import UserProfile
# from django.contrib.auth.models import User
# from django.views.decorators.csrf import csrf_exempt
# from django.contrib.auth.decorators import login_required
# from django.contrib.auth.hashers import make_password
# from django.contrib.auth import authenticate, login, logout
# from django.views.decorators.http import require_POST
# from django.contrib.auth.password_validation import validate_password
# from django.core.exceptions import ValidationError


# Create your views here.
class PlayersViewSet(viewsets.ModelViewSet):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    renderer_classes = [renderers.JSONRenderer]
    template_name = None
#
#
# def getUserProfile(request, username):
#     try:
#         userProfile = UserProfile.objects.get(user__username=username)
#         data = {
#             "username": userProfile.user.username if userProfile.user else None,
#             "email": userProfile.user.email if userProfile.user else None,
#             "level": userProfile.level,
#             "createdDate": userProfile.createdDate,
#             "playCount": userProfile.playCount,
#             "winCount": userProfile.winCount
#         }
#         return JsonResponse(data)
#     except UserProfile.DoesNotExist:
#         return JsonResponse({"error": "User not found"}, status=404)
#
# @login_required
# def userProfile(request):
#     try:
#         user_profile = UserProfile.objects.get(user=request.user)
#         data = {
#             "username": request.user.username,
#             "email": request.user.email,
#             "level": user_profile.level,
#             "createdDate": user_profile.createdDate.strftime('%Y-%m-%d %H:%M:%S'),
#             "playCount": user_profile.playCount,
#             "winCount": user_profile.winCount
#         }
#         return JsonResponse(data)
#     except UserProfile.DoesNotExist:
#         return JsonResponse({"error": "User profile not found"}, status=404)
#
# def registerUser(request):
#     if request.method == 'POST':
#         try:
#             data = request.POST
#             username = data.get('username')
#             email = data.get('email')
#             password = data.get('password')
#
#             validate_password(password, request.user)
#
#             if User.objects.filter(username=username).exists():
#                 return JsonResponse({'error': 'Username already exists'}, status=400)
#
#             user = User.objects.create(
#                 username=username,
#                 email=email,
#                 password=make_password(password)
#             )
#             user.save()
#
#             return JsonResponse({'message': 'User created successfully'}, status=201)
#         except Exception as e:
#             return JsonResponse({'error': str(e)}, status=500)
#     else:
#         return JsonResponse({'error': 'Invalid request'}, status=400)
#
# def loginUser(request):
#     username = request.POST.get('username')
#     password = request.POST.get('password')
#     user = authenticate(request, username=username, password=password)
#     if user is not None:
#         login(request, user)
#         return JsonResponse({'message': 'Login successful'}, status=200)
#     else:
#         return JsonResponse({'message': 'Invalid username or password'}, status=401)


class LoginView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = []

    def post(self, request):
        serializer = TokenObtainPairSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        access = serializer.validated_data.get("access", None)
        refresh = serializer.validated_data.get("refresh", None)
        if access:
            response = Response(status=status.HTTP_200_OK)
            max_age = 60 * 60 * 12
            response.set_cookie('access', access, httponly=True, max_age=max_age)
            response.set_cookie('refresh', refresh, httponly=True, max_age=max_age)
            return response
        return Response({'errMsg': 'ユーザーの認証に失敗しました'}, status=status.HTTP_401_UNAUTHORIZED)

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


# class CheckLoginStatusAPIView(APIView):
#     authentication_classes = [TokenAuthentication]
#     permission_classes = [IsAuthenticated]
#
#     def get(self, request):
#         return Response({'status': 'logged in', 'user': request.user.username})
#
#
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
