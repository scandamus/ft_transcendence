from django.urls import path, include
from rest_framework.routers import DefaultRouter
from ..views import TournamentViewSet, TournamentListView

router = DefaultRouter()
router.register(r'tournaments', TournamentViewSet, basename='tournament')

urlpatterns = [
    path('list/<str:status>/', TournamentListView.as_view(), name='tournaments-list'),
    path('', include(router.urls)),
    path('<int:pk>/result/', TournamentViewSet.as_view({'get': 'result'}), name='tournament-result')
]
