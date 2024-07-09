from django.urls import path
# ↓ view.pyの全てのviewをimport
# from . import views
# ↓ view.pyから指定したviewをimport（推奨）
from ..views import LoginView, UserInfoView, LogoutView, RegisterView, DeleteUserView, ValidateView, AvatarUploadView, MatchLogView, RecommendedView

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('userinfo/', UserInfoView.as_view(), name='user_info'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('validate/', ValidateView.as_view(), name='validate'),
    path('register/', RegisterView.as_view(), name='register'),
    path('delete/<str:username>/', DeleteUserView.as_view(), name='delete_user'),
    path('avatar/', AvatarUploadView.as_view(), name='avatar_upload'),
    path('matchlog/', MatchLogView.as_view(), name='log-match'),
    path('recommend/', RecommendedView.as_view(), name='recommend'),
]
