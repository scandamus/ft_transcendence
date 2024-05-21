from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TournamentViewSet, MatchViewSet, EntryViewSet

router = DefaultRouter()
router.register(r'tournament', TournamentViewSet)
router.register(r'match', MatchViewSet)
router.register(r'entry', EntryViewSet)

urlpatterns = [
    path('', include(router.urls)),
#    path('join', JoinGameView.as_view(), name='joinGame')
]
