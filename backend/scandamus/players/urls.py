from django.urls import path
# ↓ view.pyの全てのviewをimport
# from . import views
# ↓ view.pyから指定したviewをimport（推奨）
from .views import LoginView, UserInfoView, UserLevelView, LogoutView, RegisterView, DeleteUserView, ValidateView, FriendListView, FriendRequestListView, AvatarUploadView, MatchLogView, RecommendedView

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('userinfo/', UserInfoView.as_view(), name='user_info'),
    path('level/', UserLevelView.as_view(), name='user_level'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('validate/', ValidateView.as_view(), name='validate'),
    path('register/', RegisterView.as_view(), name='register'),
    path('delete/<str:username>/', DeleteUserView.as_view(), name='delete_user'),
    # path('getUserProfile', views.getUserProfile.as_view()),
    # # path('api/user/<str:username>/', views.getUserProfile.as_view()),
    # path('api/userProfile/', views.userProfile.as_view()),
    # path('api/register/', views.registerUser.as_view()),
    # path('api/login/', views.loginUser.as_view()),
    # path('api/logout/', views.logoutUser.as_view()),
    # path('check_login/', views.check_login_status.as_view()),
    # path('api/delete/', views.deleteUser.as_view()),
    path('friends/', FriendListView.as_view(), name='friend-list'),
    path('requests/', FriendRequestListView.as_view(), name='friend-request-list'),
    path('avatar/', AvatarUploadView.as_view(), name='avatar_upload'),
    path('matchlog/', MatchLogView.as_view(), name='log-match'),
    path('recommend/', RecommendedView.as_view(), name='recommend'),
]
