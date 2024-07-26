from django.urls import path
# ↓ view.pyの全てのviewをimport
# from . import views
# ↓ view.pyから指定したviewをimport（推奨）
from ..views import FriendListView, FriendRequestListView

urlpatterns = [
    path('friends/', FriendListView.as_view(), name='friend-list'),
    path('requests/', FriendRequestListView.as_view(), name='friend-request-list'),
]
