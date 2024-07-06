from django.core.management.base import BaseCommand
from players.models import Player
import random

class Command(BaseCommand):
    help = 'Generate random friends for players'

    def handle(self, *args, **options):
        players = Player.objects.exclude(user__is_superuser=True).all()

        for player in players:
            potential_friends = Player.objects.exclude(id=player.id).filter(user__is_superuser=False).order_by('?')[:5]
            player.friends.set(potential_friends)
