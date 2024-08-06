from django.conf import settings
from allauth.socialaccount.providers.base import ProviderAccount
from allauth.socialaccount.providers.oauth2.provider import OAuth2Provider

class FortyTwoAccount(ProviderAccount):
    def get_profile_url(self):
        return self.account.extra_data.get('url')

    def get_avatar_url(self):
        return self.account.extra_data.get('image')

    def to_str(self):
        dflt = super(FortyTwoAccount, self).to_str()
        return self.account.extra_data.get('name', dflt)

class FortyTwoProvider(OAuth2Provider):
    id = 'providers42'
    name = 'providers42'
    account_class = FortyTwoAccount

    def get_auth_params(self):
        # トークン取得のためのパラメータを指定
        return {
            'client_id': settings.UID_42,
            'secret_key': settings.SECRET_KEY_42,
            'redirect_uri': self.fortytwo_callback,
            'response_type': 'code',
            'scope': 'public'
        }

provider_classes = [FortyTwoProvider]
