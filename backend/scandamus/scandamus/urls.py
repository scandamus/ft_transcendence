from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .health_check import health_check

urlpatterns = [
    path('admin/', admin.site.urls),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/players/', include('players.urls.players')),
    path('api/friends/', include('players.urls.friends')),
    path('api/tournaments/', include('game.urls.tournaments')),
    path('api-internal/game/', include('game.urls.game')),
    path('health/', health_check),
    path('api/test/', include('players.urls.test')), # for test use only
]
