from django.apps import AppConfig
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured

class Providers42Config(AppConfig):
    name = 'providers42'

    def ready(self):
        from allauth.socialaccount.models import SocialApp
        # from django.contrib.sites.models import Site
        from django.db.utils import OperationalError

        provider_name = 'providers42'

        try:
            client_id = settings.UID_42
            client_secret = settings.SECRET_KEY_42
            # site_domain = settings.DOMAIN_NAME
        except AttributeError:
            raise ImproperlyConfigured("Please set UID_42, SECRET_42, and SITE_DOMAIN in your settings")

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
                # site = Site.objects.get(domain=site_domain)
                # app.sites.add(site)
                # app.save()
        except OperationalError:
            # 初回のマイグレーション時にテーブルがないためエラーが発生する可能性があるため無視
            pass
