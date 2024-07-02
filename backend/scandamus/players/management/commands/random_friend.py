from django.core.management.base import BaseCommand
from players.models import Player
import random

class Command(BaseCommand):
    help = 'Generate random friends for players'

    def handle(self, *args, **options):
        players = Player.objects.exclude(user__is_superuser=True).all()

        for player in players:
            random_friends_query = Player.objects.exclude(id=player.id)
            if hasattr(player, 'user') and player.user.is_superuser:
                random_friends_query = random_friends_query.exclude(user__is_superuser=True)
            random_friends = random_friends_query.order_by('?')[:random.randint(0, 10)]
            player.friends.set(random_friends)
        print(f'random_friendsss.')
