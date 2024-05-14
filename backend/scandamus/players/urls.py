from django.urls import path
# ↓ view.pyの全てのviewをimport
# from . import views
# ↓ view.pyから指定したviewをimport（推奨）
from .views import LoginView

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    # path('getPlayerProfile', views.getPlayerProfile.as_view()),
    # # path('api/user/<str:username>/', views.getPlayerProfile.as_view()),
    # path('api/PlayerProfile/', views.PlayerProfile.as_view()),
    # path('api/register/', views.registerUser.as_view()),
    # path('api/login/', views.loginUser.as_view()),
    # path('api/logout/', views.logoutUser.as_view()),
    # path('check_login/', views.check_login_status.as_view()),
    # path('api/delete/', views.deleteUser.as_view()),
]
