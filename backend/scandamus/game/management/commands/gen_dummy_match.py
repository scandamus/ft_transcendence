# matches/management/commands/create_dummy_matches.py

from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model
from players.models import Player
from game.models import Match
import random

class Command(BaseCommand):
    help = 'Create dummy match data'

    def handle(self, *args, **options):
        # User = get_user_model()

        # Create dummy matches for 'pong' game
        for _ in range(10):
            player1 = random.choice(Player.objects.exclude(user__is_superuser=True))
            player2 = random.choice(Player.objects.exclude(user__is_superuser=True).exclude(id=player1.id))
            score1 = 10 if random.random() < 0.5 else random.randint(0, 9)
            score2 = 10 if random.random() < 0.5 else random.randint(0, 9)

            Match.objects.create(
                game_name='pong',
                player1=player1,
                player2=player2,
                score1=score1,
                score2=score2,
                status='after'
            )

        # Create dummy matches for 'pong4' game
        for _ in range(10):
            players = random.sample(list(Player.objects.exclude(user__is_superuser=True)), 4)
            scores = [10 if random.random() < 0.5 else random.randint(0, 9) for _ in range(4)]

            Match.objects.create(
                game_name='pong4',
                player1=players[0],
                player2=players[1],
                player3=players[2],
                player4=players[3],
                score1=scores[0],
                score2=scores[1],
                score3=scores[2],
                score4=scores[3],
                status='after'
            )

        self.stdout.write(self.style.SUCCESS('Successfully created dummy match data.'))
