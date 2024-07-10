from django.apps import AppConfig
from django.db.models.signals import post_migrate

class PlayersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'players'

    def ready(self):
        post_migrate.connect(reset_online_status, sender=self)


def reset_online_status(sender, **kwargs):
    from .models import Player
    import logging
    logger = logging.getLogger(__name__)
    logger.info("Resetting all player online statuses to False.")
    Player.objects.update(online=False)