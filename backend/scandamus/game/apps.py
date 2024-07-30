import logging

from django.apps import AppConfig
from django.db.models.signals import post_migrate

logger = logging.getLogger(__name__)

class GameConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'game'

    def ready(self):
        post_migrate.connect(self.reset_incomplete_matches_and_tournaments, sender=self)

    def reset_incomplete_matches_and_tournaments(self, **kwargs):
        from game.models import Match, Tournament
        from django.db.models import Q

        logger.info('Resetting incomplete matches')
        incomplete_matches = Match.objects.filter(
            Q(status='before') | Q(status='ongoing')
        )
        reset_count = 0
        for match in incomplete_matches:
            match.status = 'canceled'
            match.save(update_fields=['status'])
            reset_count += 1
        logger.info(f'{reset_count} incomplete matches have been reset')

        logger.info('Resetting incomplete tournaments')
        incomplete_tournaments = Tournament.objects.filter(
            Q(status='preparing') | Q(status='ongoing')
        )
        reset_count = 0
        for tournament in incomplete_tournaments:
            tournament.status = 'canceled'
            tournament.save(update_fields=['status'])
            reset_count += 1
        logger.info(f'{reset_count} incomplete tournaments have been reset')