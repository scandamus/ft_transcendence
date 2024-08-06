from django.apps import AppConfig
from django.db.models.signals import post_migrate
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured


def set_social_app42(sender, **kwargs):
    from allauth.socialaccount.models import SocialApp
    from django.db.utils import OperationalError

    provider_name = 'providers42'

    try:
        client_id = settings.UID_42
        client_secret = settings.SECRET_KEY_42
    except AttributeError:
        raise ImproperlyConfigured("Please set UID_42, SECRET_42, and SITE_DOMAIN in .env")
    try:
        if not SocialApp.objects.filter(provider=provider_name).exists():
            app = SocialApp(
                provider=provider_name,
                provider_id=provider_name,
                name=provider_name,
                client_id=client_id,
                secret=client_secret
            )
            app.save()
    except OperationalError:
        pass


class Providers42Config(AppConfig):
    name = 'providers42'

    def ready(self):
        post_migrate.connect(set_social_app42, sender=self)


