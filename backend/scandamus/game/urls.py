from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TournamentViewSet, MatchViewSet, EntryViewSet

router = DefaultRouter()
router.register(r'tournament', TournamentViewSet, basename='tournament')
router.register(r'match', MatchViewSet, basename='match')
router.register(r'entry', EntryViewSet, basename='entry')

urlpatterns = [
    path('', include(router.urls)),
]
